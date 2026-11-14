"""Test suite for ASTRA REST API endpoints.

Covers:
- All 7 PRD Section 12.3 endpoints
- Anonymous browser_id mission isolation
- Blocking emergency event validation and resolution
- Idempotency and 4xx validation errors
- Persistence in SQLite across requests
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.db.models import MissionEvent
from app.main import app

# Shared in-memory test SQLite engine with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield


def test_health_check_endpoint():
    """Verify /api/health returns healthy operational status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ASTRA" in data["service"]


def test_mission_creation_and_browser_id_isolation():
    """Verify mission creation and session isolation between different browser IDs."""
    headers_student_a = {"X-Browser-Id": "student_alpha_123"}
    headers_student_b = {"X-Browser-Id": "student_beta_456"}

    # Student A creates an Explorer mission
    payload_a = {
        "difficulty_mode": "EXPLORER",
        "label": "Alpha Lunar Base",
        "seed": "TEST_SEED_ALPHA",
    }
    res_a = client.post("/api/missions", json=payload_a, headers=headers_student_a)
    assert res_a.status_code == 201
    mission_a = res_a.json()
    assert mission_a["label"] == "Alpha Lunar Base"
    assert mission_a["current_day"] == 1
    assert len(mission_a["crew"]) == 4
    assert mission_a["systems"]["oxygen_level"] > 0.0

    # Student B creates a Commander mission
    payload_b = {
        "difficulty_mode": "COMMANDER",
        "label": "Beta Lunar Outpost",
        "seed": "TEST_SEED_BETA",
    }
    res_b = client.post("/api/missions", json=payload_b, headers=headers_student_b)
    assert res_b.status_code == 201
    mission_b = res_b.json()
    assert mission_b["label"] == "Beta Lunar Outpost"

    # Student A lists missions: sees only Alpha
    list_a = client.get("/api/missions", headers=headers_student_a).json()
    assert len(list_a) == 1
    assert list_a[0]["id"] == mission_a["id"]

    # Student B lists missions: sees only Beta
    list_b = client.get("/api/missions", headers=headers_student_b).json()
    assert len(list_b) == 1
    assert list_b[0]["id"] == mission_b["id"]


def test_get_mission_detail():
    """Verify /api/missions/{id} returns complete telemetry and crew."""
    headers = {"X-Browser-Id": "student_gamma"}
    create_res = client.post(
        "/api/missions",
        json={"difficulty_mode": "EXPLORER", "label": "Gamma Base"},
        headers=headers,
    )
    mission_id = create_res.json()["id"]

    detail_res = client.get(f"/api/missions/{mission_id}", headers=headers)
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["id"] == mission_id
    assert len(data["crew"]) == 4
    assert len(data["history"]) == 1
    assert data["history"][0]["day_number"] == 1


def test_advance_day_and_idempotency_validation():
    """Verify advancing day, state mutation, and rejection of stale expected_day."""
    headers = {"X-Browser-Id": "student_delta"}
    create_res = client.post(
        "/api/missions",
        json={"difficulty_mode": "EXPLORER", "label": "Delta Outpost"},
        headers=headers,
    )
    mission_id = create_res.json()["id"]

    advance_payload = {
        "expected_day": 1,
        "power_allocations": {
            "life_support": 12.0,
            "water_recycling": 8.0,
            "greenhouse": 10.0,
            "radiation_shelter": 0.0,
        },
        "water_allocations": {
            "crew_share": 4.0,
            "greenhouse_share": 2.0,
            "electrolysis_share": 1.0,
        },
        "oxygen_mode": "NOMINAL",
        "greenhouse_active": True,
        "storm_shelter_posture": False,
        "crew_rest_posture": False,
    }

    # Step from Day 1 to Day 2
    step_res = client.post(
        f"/api/missions/{mission_id}/advance-day",
        json=advance_payload,
        headers=headers,
    )
    assert step_res.status_code == 200
    step_data = step_res.json()
    assert step_data["day_number"] == 2
    assert "oxygen_delta" in step_data["deltas"]
    assert len(step_data["crew"]) == 4

    # Idempotency check: sending expected_day=1 again must fail with 409 Conflict
    stale_res = client.post(
        f"/api/missions/{mission_id}/advance-day",
        json=advance_payload,
        headers=headers,
    )
    assert stale_res.status_code == 409
    assert "Day mismatch" in stale_res.json()["detail"]


def test_blocking_emergency_event_and_resolution():
    """Verify that an unresolved emergency blocks advance-day, and resolving it unblocks advancement."""
    headers = {"X-Browser-Id": "student_emergency_test"}
    create_res = client.post(
        "/api/missions",
        json={"difficulty_mode": "COMMANDER", "label": "Emergency Test Base"},
        headers=headers,
    )
    mission_id = create_res.json()["id"]

    # Manually inject a pending emergency into the database for this mission
    db = TestingSessionLocal()
    import json

    options_data = [
        {
            "option_id": "OPT_SHELTER",
            "title": "Shelter Lockdown",
            "description": "Move to shelter",
            "trade_offs_summary": "Energy cost",
            "energy_cost": 10.0,
            "water_cost": 0.0,
            "food_cost": 0.0,
            "stress_impact": 5.0,
            "health_impact": 0.0,
        }
    ]
    evt = MissionEvent(
        id="evt_test_solar",
        mission_id=mission_id,
        day_number=1,
        event_type="ENVIRONMENTAL",
        event_code="SOLAR_PARTICLE_EVENT",
        severity="SEVERE",
        title="Severe Solar Particle Storm",
        description="High radiation surge detected.",
        affected_systems=json.dumps(["Radiation Safety"]),
        requires_decision=True,
        options_json=json.dumps(options_data),
        resolution_status="PENDING",
    )
    db.add(evt)
    db.commit()
    db.close()

    advance_payload = {
        "expected_day": 1,
        "power_allocations": {"life_support": 12.0, "water_recycling": 8.0, "greenhouse": 10.0, "radiation_shelter": 0.0},
        "water_allocations": {"crew_share": 4.0, "greenhouse_share": 2.0, "electrolysis_share": 1.0},
        "oxygen_mode": "NOMINAL",
        "greenhouse_active": True,
        "storm_shelter_posture": False,
        "crew_rest_posture": False,
    }

    # Attempting to advance day must fail with 409 Conflict due to unresolved emergency
    blocked_res = client.post(
        f"/api/missions/{mission_id}/advance-day",
        json=advance_payload,
        headers=headers,
    )
    assert blocked_res.status_code == 409
    assert "requires a commander decision" in blocked_res.json()["detail"]

    # Resolve the emergency
    resolve_res = client.post(
        f"/api/missions/{mission_id}/events/evt_test_solar/resolve",
        json={"chosen_option_id": "OPT_SHELTER"},
        headers=headers,
    )
    assert resolve_res.status_code == 200
    resolve_data = resolve_res.json()
    assert resolve_data["resolution_status"] == "RESOLVED"
    assert resolve_data["chosen_option_id"] == "OPT_SHELTER"

    # Now advance-day succeeds
    unblocked_res = client.post(
        f"/api/missions/{mission_id}/advance-day",
        json=advance_payload,
        headers=headers,
    )
    assert unblocked_res.status_code == 200
    assert unblocked_res.json()["day_number"] == 2


def test_mission_report_endpoint():
    """Verify /api/missions/{id}/report returns structured debrief and charts history."""
    headers = {"X-Browser-Id": "student_report_test"}
    create_res = client.post(
        "/api/missions",
        json={"difficulty_mode": "EXPLORER", "label": "Report Test Base"},
        headers=headers,
    )
    mission_id = create_res.json()["id"]

    report_res = client.get(f"/api/missions/{mission_id}/report", headers=headers)
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert report_data["mission_id"] == mission_id
    assert report_data["outcome_status"] == "IN_PROGRESS"
    assert len(report_data["telemetry_history"]) >= 1
    assert len(report_data["crew"]) == 4
    assert len(report_data["educational_takeaways"]) > 0
