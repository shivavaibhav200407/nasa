import sys
import os
import json
import uuid
import httpx

# Add backend to sys.path
sys.path.insert(0, os.path.abspath('backend'))

from app.db.database import SessionLocal
from app.db.models import MissionEvent

# 1. Create a real mission via API
client = httpx.Client(base_url="http://127.0.0.1:8000")
res = client.post(
    "/api/missions",
    json={"difficulty_mode": "EXPLORER", "label": "Outpost Solar Anomaly Deck", "seed": "SCREENSHOT_EVT_SEED"},
    headers={"X-Browser-Id": "docs_screenshot_bot"}
)
mission = res.json()
mission_id = mission["id"]

# 2. Add an active emergency event
db = SessionLocal()

options = [
    {
        "option_id": "opt_shelter",
        "title": "Order Crew into Regolith Radiation Shelter",
        "description": "Route +10 kW auxiliary power to active regolith bunker life-support modules and seal blast doors.",
        "trade_offs_summary": "Absorbs 80% solar particle flux; increases battery discharge rate by 10 kW.",
        "energy_cost": 10.0,
        "water_cost": 0.0,
        "food_cost": 0.0,
        "stress_impact": 5.0,
        "health_impact": 0.0,
        "educational_hint": "Regolith bulk mass attenuates up to 80% of ionising radiation and secondary bremsstrahlung."
    },
    {
        "option_id": "opt_hull",
        "title": "Maintain Nominal Outpost Deck Operations",
        "description": "Rely strictly on standard habitat multi-layer insulation and aluminium-lithium pressure vessel hull.",
        "trade_offs_summary": "Zero additional power draw; exposes crew to elevated biological dose rates.",
        "energy_cost": 0.0,
        "water_cost": 0.0,
        "food_cost": 0.0,
        "stress_impact": 15.0,
        "health_impact": -12.0,
        "educational_hint": "Prolonged exposure during solar proton events elevates lifetime cancer risks."
    }
]

evt = MissionEvent(
    id=str(uuid.uuid4()),
    mission_id=mission_id,
    day_number=1,
    event_type="ENVIRONMENTAL",
    event_code="EVT_CME",
    title="Coronal Mass Ejection: Solar Particle Influx",
    description="Deep space solar monitors register a massive X-class coronal eruption. High-energy proton bombardment is arriving in lunar orbit within 30 minutes.",
    severity="CRITICAL",
    affected_systems=json.dumps(["radiation", "power"]),
    requires_decision=True,
    options_json=json.dumps(options),
    resolution_status="PENDING",
)
db.add(evt)
db.commit()
db.close()

print(f"EVENT_MISSION_ID:{mission_id}")
