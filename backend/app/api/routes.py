"""ASTRA REST API Endpoints.

Implements all PRD Section 12.3 endpoints with:
- Strict Pydantic validation
- Anonymous browser_id session filtering via X-Browser-Id header
- Blocking emergency event validation
- Idempotency checks on advance-day
- Pure-Python engine coordination and atomic DB persistence
"""

import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..db.models import CrewMember, DailySnapshot, Mission, MissionEvent, ScoreBreakdown
from ..engine.education import EDUCATIONAL_CATALOG
from ..engine.scoring import calculate_score
from ..engine.simulator import (
    create_initial_crew,
    create_initial_systems,
    step_simulation,
)
from ..engine.types import (
    AstronautState,
    AstronautStatus,
    DifficultyMode,
    EngineeringDecisions,
    MissionStatus,
    PowerAllocations,
    SubsystemMode,
    SystemLevels,
    WaterAllocations,
)
from ..schemas.mission import (
    AdvanceDayRequest,
    AdvanceDayResponse,
    CreateMissionRequest,
    CrewMemberSchema,
    DailySnapshotSchema,
    EducationalFeedbackSchema,
    EventOptionSchema,
    MissionDetailResponse,
    MissionEventSchema,
    MissionReportResponse,
    MissionSummaryResponse,
    ResolveEventRequest,
    ResolveEventResponse,
    ScoreBreakdownSchema,
    SystemLevelsSchema,
)

router = APIRouter(prefix="/api", tags=["missions"])


def get_browser_id(x_browser_id: Optional[str] = Header(None, alias="X-Browser-Id")) -> str:
    """Extract browser_id from X-Browser-Id header or provide default."""
    if not x_browser_id or not x_browser_id.strip():
        return "anonymous-default"
    return x_browser_id.strip()


def _crew_to_schema(crew_member: CrewMember) -> CrewMemberSchema:
    return CrewMemberSchema(
        astronaut_id=crew_member.astronaut_id,
        name=crew_member.astronaut_name,
        role=crew_member.role_title,
        health=crew_member.health,
        stress=crew_member.stress,
        cumulative_radiation=crew_member.cumulative_radiation,
        survival_status=crew_member.survival_status,
    )


def _snapshot_to_schema(snap: DailySnapshot) -> DailySnapshotSchema:
    return DailySnapshotSchema(
        day_number=snap.day_number,
        oxygen_level=snap.oxygen_level,
        water_level=snap.water_level,
        energy_generated=snap.energy_generated,
        battery_level=snap.battery_level,
        food_level=snap.food_level,
        greenhouse_progress=snap.greenhouse_progress,
        radiation_daily_dose=snap.radiation_daily_dose,
        state_checksum=snap.state_checksum,
    )


def _event_to_schema(evt: MissionEvent) -> MissionEventSchema:
    options: List[EventOptionSchema] = []
    if evt.options_json:
        try:
            raw_opts = json.loads(evt.options_json)
            options = [EventOptionSchema(**opt) for opt in raw_opts]
        except Exception:
            options = []

    affected: List[str] = []
    if evt.affected_systems:
        try:
            affected = json.loads(evt.affected_systems)
        except Exception:
            affected = []

    return MissionEventSchema(
        event_id=evt.id,
        day_number=evt.day_number,
        category=evt.event_type,
        event_code=evt.event_code,
        title=evt.title,
        description=evt.description,
        severity=evt.severity,
        affected_systems=affected,
        requires_decision=evt.requires_decision,
        options=options,
        resolution_status=evt.resolution_status,
        chosen_option_id=evt.chosen_option_code,
        outcome_summary=evt.outcome_summary,
    )


# ==============================================================================
# 1. List Missions
# ==============================================================================
@router.get("/missions", response_model=List[MissionSummaryResponse])
def list_missions(
    status_filter: Optional[str] = Query(None, alias="status"),
    browser_id: str = Depends(get_browser_id),
    db: Session = Depends(get_db),
):
    """List saved missions filtered by student's browser ID."""
    query = db.query(Mission).filter(Mission.browser_id == browser_id)
    if status_filter:
        query = query.filter(Mission.status == status_filter.upper())

    missions = query.order_by(Mission.updated_at.desc()).all()
    return [
        MissionSummaryResponse(
            id=m.id,
            label=m.label,
            difficulty_mode=m.difficulty_mode,
            current_day=m.current_day,
            status=m.status,
            total_score=m.total_score,
            created_at=m.created_at,
            updated_at=m.updated_at,
        )
        for m in missions
    ]


# ==============================================================================
# 2. Create Mission
# ==============================================================================
@router.post("/missions", response_model=MissionDetailResponse, status_code=status.HTTP_201_CREATED)
def create_mission(
    payload: CreateMissionRequest,
    browser_id: str = Depends(get_browser_id),
    db: Session = Depends(get_db),
):
    """Create and initialize a new 90-day mission for the student."""
    label = payload.label.strip() if payload.label and payload.label.strip() else "Lunar Outpost Alpha"
    seed = payload.seed.strip() if payload.seed and payload.seed.strip() else f"seed_{uuid.uuid4().hex[:10]}"

    mission_id = str(uuid.uuid4())
    mode = payload.difficulty_mode

    # Initialize Day 1 state from engine
    initial_systems = create_initial_systems(mode)
    initial_crew = create_initial_crew()

    mission = Mission(
        id=mission_id,
        browser_id=browser_id,
        label=label,
        difficulty_mode=mode.value,
        seed=seed,
        status="IN_PROGRESS",
        current_day=1,
    )
    db.add(mission)

    # Add crew members
    for cm in initial_crew:
        db.add(
            CrewMember(
                mission_id=mission_id,
                astronaut_id=cm.astronaut_id,
                astronaut_name=cm.name,
                role_title=cm.role,
                health=cm.health,
                stress=cm.stress,
                cumulative_radiation=cm.cumulative_radiation,
                survival_status=cm.survival_status.value,
            )
        )

    # Create Day 1 initial snapshot
    day1_snap = DailySnapshot(
        mission_id=mission_id,
        day_number=1,
        oxygen_level=initial_systems.oxygen_level,
        water_level=initial_systems.water_level,
        energy_generated=initial_systems.solar_generation,
        battery_level=initial_systems.battery_level,
        food_level=initial_systems.food_level,
        greenhouse_progress=initial_systems.greenhouse_progress,
        radiation_daily_dose=initial_systems.radiation_daily_dose,
        submitted_allocations_summary=json.dumps({"initial": True}),
        educational_feedback_keys=json.dumps(["O2_RECOVERY_FACT", "ENERGY_BALANCE_FACT"]),
        state_checksum="day1_init",
    )
    db.add(day1_snap)
    db.commit()
    db.refresh(mission)

    # Return full mission detail
    crew_list = db.query(CrewMember).filter(CrewMember.mission_id == mission_id).all()
    feedback_schemas = [
        EducationalFeedbackSchema(
            feedback_id=k,
            title=EDUCATIONAL_CATALOG[k].title,
            fact_summary=EDUCATIONAL_CATALOG[k].fact_summary,
            concept_area=EDUCATIONAL_CATALOG[k].concept_area,
        )
        for k in ["O2_RECOVERY_FACT", "ENERGY_BALANCE_FACT"]
        if k in EDUCATIONAL_CATALOG
    ]

    return MissionDetailResponse(
        id=mission.id,
        label=mission.label,
        difficulty_mode=mission.difficulty_mode,
        seed=mission.seed,
        status=mission.status,
        current_day=mission.current_day,
        failure_reason=None,
        systems=SystemLevelsSchema(
            oxygen_level=initial_systems.oxygen_level,
            water_level=initial_systems.water_level,
            battery_level=initial_systems.battery_level,
            food_level=initial_systems.food_level,
            greenhouse_progress=initial_systems.greenhouse_progress,
            radiation_daily_dose=initial_systems.radiation_daily_dose,
            solar_generation=initial_systems.solar_generation,
            total_energy_load=initial_systems.total_energy_load,
        ),
        crew=[_crew_to_schema(c) for c in crew_list],
        active_event=None,
        educational_feedback=feedback_schemas,
        history=[_snapshot_to_schema(day1_snap)],
        score_breakdown=None,
    )


# ==============================================================================
# 3. Get Mission Details
# ==============================================================================
@router.get("/missions/{mission_id}", response_model=MissionDetailResponse)
def get_mission_detail(
    mission_id: str,
    browser_id: str = Depends(get_browser_id),
    db: Session = Depends(get_db),
):
    """Retrieve full mission state and telemetry history."""
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    crew_list = db.query(CrewMember).filter(CrewMember.mission_id == mission_id).all()
    snapshots = (
        db.query(DailySnapshot)
        .filter(DailySnapshot.mission_id == mission_id)
        .order_by(DailySnapshot.day_number.asc())
        .all()
    )
    latest_snap = snapshots[-1] if snapshots else None

    # Check for active unresolved emergency event
    active_event = (
        db.query(MissionEvent)
        .filter(
            MissionEvent.mission_id == mission_id,
            MissionEvent.resolution_status == "PENDING",
            MissionEvent.requires_decision == True,
        )
        .first()
    )

    # Reconstruct current system levels
    if latest_snap:
        systems = SystemLevelsSchema(
            oxygen_level=latest_snap.oxygen_level,
            water_level=latest_snap.water_level,
            battery_level=latest_snap.battery_level,
            food_level=latest_snap.food_level,
            greenhouse_progress=latest_snap.greenhouse_progress,
            radiation_daily_dose=latest_snap.radiation_daily_dose,
            solar_generation=latest_snap.energy_generated,
            total_energy_load=45.0,
        )
    else:
        init_sys = create_initial_systems(DifficultyMode(mission.difficulty_mode))
        systems = SystemLevelsSchema(**init_sys.__dict__)

    # Educational feedback from latest snapshot
    feedback_schemas: List[EducationalFeedbackSchema] = []
    if latest_snap and latest_snap.educational_feedback_keys:
        try:
            keys = json.loads(latest_snap.educational_feedback_keys)
            for k in keys:
                if k in EDUCATIONAL_CATALOG:
                    item = EDUCATIONAL_CATALOG[k]
                    feedback_schemas.append(
                        EducationalFeedbackSchema(
                            feedback_id=k,
                            title=item.title,
                            fact_summary=item.fact_summary,
                            concept_area=item.concept_area,
                        )
                    )
        except Exception:
            pass

    score_schema = None
    if mission.score_breakdown:
        sb = mission.score_breakdown
        score_schema = ScoreBreakdownSchema(
            crew_survival_score=sb.crew_survival_score,
            duration_score=sb.duration_score,
            resource_stewardship_score=sb.resource_stewardship_score,
            radiation_safety_score=sb.radiation_safety_score,
            decision_quality_score=sb.decision_quality_score,
            difficulty_multiplier_applied=sb.difficulty_multiplier_applied,
            total_score=sb.total_score,
        )

    return MissionDetailResponse(
        id=mission.id,
        label=mission.label,
        difficulty_mode=mission.difficulty_mode,
        seed=mission.seed,
        status=mission.status,
        current_day=mission.current_day,
        failure_reason=mission.failure_reason,
        systems=systems,
        crew=[_crew_to_schema(c) for c in crew_list],
        active_event=_event_to_schema(active_event) if active_event else None,
        educational_feedback=feedback_schemas,
        history=[_snapshot_to_schema(s) for s in snapshots],
        score_breakdown=score_schema,
    )


# ==============================================================================
# 4. Advance Day
# ==============================================================================
@router.post("/missions/{mission_id}/advance-day", response_model=AdvanceDayResponse)
def advance_day(
    mission_id: str,
    payload: AdvanceDayRequest,
    browser_id: str = Depends(get_browser_id),
    db: Session = Depends(get_db),
):
    """Advance simulation by exactly one day with blocking event and idempotency checks."""
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot advance day: mission is already {mission.status}.",
        )

    # Check for blocking pending emergency event
    pending_event = (
        db.query(MissionEvent)
        .filter(
            MissionEvent.mission_id == mission_id,
            MissionEvent.resolution_status == "PENDING",
            MissionEvent.requires_decision == True,
        )
        .first()
    )
    if pending_event:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Cannot advance day: emergency event '{pending_event.title}' on Day {pending_event.day_number} "
                "requires a commander decision on the Emergency Decisions screen before advancing."
            ),
        )

    # Idempotency check: verify payload expected_day matches current_day
    if payload.expected_day != mission.current_day:
        raise HTTPException(
            status_code=409,
            detail=f"Day mismatch: current active day is {mission.current_day}, but request specified Day {payload.expected_day}.",
        )

    # Load latest snapshot and crew state
    snapshots = (
        db.query(DailySnapshot)
        .filter(DailySnapshot.mission_id == mission_id)
        .order_by(DailySnapshot.day_number.asc())
        .all()
    )
    if not snapshots:
        raise HTTPException(status_code=500, detail="Corrupted mission state: missing snapshots.")

    latest_snap = snapshots[-1]
    prev_systems = SystemLevels(
        oxygen_level=latest_snap.oxygen_level,
        water_level=latest_snap.water_level,
        battery_level=latest_snap.battery_level,
        food_level=latest_snap.food_level,
        greenhouse_progress=latest_snap.greenhouse_progress,
        radiation_daily_dose=latest_snap.radiation_daily_dose,
        solar_generation=latest_snap.energy_generated,
        total_energy_load=45.0,
    )

    crew_db = db.query(CrewMember).filter(CrewMember.mission_id == mission_id).all()
    prev_crew = [
        AstronautState(
            astronaut_id=c.astronaut_id,
            name=c.astronaut_name,
            role=c.role_title,
            health=c.health,
            stress=c.stress,
            cumulative_radiation=c.cumulative_radiation,
            survival_status=AstronautStatus(c.survival_status),
        )
        for c in crew_db
    ]

    # Convert request allocations to engine dataclass
    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(
            life_support=payload.power_allocations.life_support,
            water_recycling=payload.power_allocations.water_recycling,
            greenhouse=payload.power_allocations.greenhouse,
            radiation_shelter=payload.power_allocations.radiation_shelter,
        ),
        water_allocations=WaterAllocations(
            crew_share=payload.water_allocations.crew_share,
            greenhouse_share=payload.water_allocations.greenhouse_share,
            electrolysis_share=payload.water_allocations.electrolysis_share,
        ),
        oxygen_mode=payload.oxygen_mode,
        greenhouse_active=payload.greenhouse_active,
        storm_shelter_posture=payload.storm_shelter_posture,
        crew_rest_posture=payload.crew_rest_posture,
        repair_target=payload.repair_target,
    )

    # Step the deterministic simulation engine
    result = step_simulation(
        seed=mission.seed,
        current_day=mission.current_day,
        mode=DifficultyMode(mission.difficulty_mode),
        prev_systems=prev_systems,
        prev_crew=prev_crew,
        decisions=decisions,
    )

    # Persist updated crew states
    for c_state in result.crew:
        c_db = next((c for c in crew_db if c.astronaut_id == c_state.astronaut_id), None)
        if c_db:
            c_db.health = c_state.health
            c_db.stress = c_state.stress
            c_db.cumulative_radiation = c_state.cumulative_radiation
            c_db.survival_status = c_state.survival_status.value

    # Persist new DailySnapshot
    feedback_keys = [fb.feedback_id for fb in result.educational_feedback]
    new_snap = DailySnapshot(
        mission_id=mission_id,
        day_number=result.day_number,
        oxygen_level=result.system_levels.oxygen_level,
        water_level=result.system_levels.water_level,
        energy_generated=result.system_levels.solar_generation,
        battery_level=result.system_levels.battery_level,
        food_level=result.system_levels.food_level,
        greenhouse_progress=result.system_levels.greenhouse_progress,
        radiation_daily_dose=result.system_levels.radiation_daily_dose,
        submitted_allocations_summary=json.dumps(payload.model_dump()),
        educational_feedback_keys=json.dumps(feedback_keys),
        state_checksum=result.state_checksum,
    )
    db.add(new_snap)

    # If an event was generated, persist to mission_events
    active_event_schema = None
    if result.active_event:
        options_json = json.dumps([opt.__dict__ for opt in result.active_event.options])
        affected_json = json.dumps(result.active_event.affected_systems)

        # Ensure event primary key is unique per mission
        event_db_id = f"{mission_id[:8]}_{result.active_event.event_id}"
        result.active_event.event_id = event_db_id

        db_event = MissionEvent(
            id=event_db_id,
            mission_id=mission_id,
            day_number=result.active_event.day_number,
            event_type=result.active_event.category.value,
            event_code=result.active_event.event_code,
            severity=result.active_event.severity.value,
            title=result.active_event.title,
            description=result.active_event.description,
            affected_systems=affected_json,
            requires_decision=result.active_event.requires_decision,
            options_json=options_json,
            resolution_status=result.active_event.resolution_status.value,
            outcome_summary=result.active_event.outcome_summary,
        )
        db.add(db_event)
        active_event_schema = _event_to_schema(db_event)

    # Update Mission
    mission.current_day = result.day_number
    mission.status = result.mission_status.value
    if result.failure_reason:
        mission.failure_reason = result.failure_reason

    # If mission finished, persist score breakdown
    score_schema = None
    if result.score_breakdown:
        sb = result.score_breakdown
        mission.total_score = sb.total_score

        db_sb = db.query(ScoreBreakdown).filter(ScoreBreakdown.mission_id == mission_id).first()
        if not db_sb:
            db_sb = ScoreBreakdown(mission_id=mission_id)
            db.add(db_sb)

        db_sb.crew_survival_score = sb.crew_survival_score
        db_sb.duration_score = sb.duration_score
        db_sb.resource_stewardship_score = sb.resource_stewardship_score
        db_sb.radiation_safety_score = sb.radiation_safety_score
        db_sb.decision_quality_score = sb.decision_quality_score
        db_sb.difficulty_multiplier_applied = sb.difficulty_multiplier_applied
        db_sb.total_score = sb.total_score

        score_schema = ScoreBreakdownSchema(
            crew_survival_score=sb.crew_survival_score,
            duration_score=sb.duration_score,
            resource_stewardship_score=sb.resource_stewardship_score,
            radiation_safety_score=sb.radiation_safety_score,
            decision_quality_score=sb.decision_quality_score,
            difficulty_multiplier_applied=sb.difficulty_multiplier_applied,
            total_score=sb.total_score,
        )

    db.commit()

    feedback_schemas = [
        EducationalFeedbackSchema(
            feedback_id=fb.feedback_id,
            title=fb.title,
            fact_summary=fb.fact_summary,
            concept_area=fb.concept_area,
        )
        for fb in result.educational_feedback
    ]

    return AdvanceDayResponse(
        day_number=result.day_number,
        mission_status=result.mission_status.value,
        system_levels=SystemLevelsSchema(**result.system_levels.__dict__),
        crew=[_crew_to_schema(c) for c in crew_db],
        deltas={
            "oxygen_delta": result.deltas.oxygen_delta,
            "water_delta": result.deltas.water_delta,
            "battery_delta": result.deltas.battery_delta,
            "food_delta": result.deltas.food_delta,
            "radiation_absorbed": result.deltas.radiation_absorbed,
            "crew_health_deltas": result.deltas.crew_health_deltas,
            "crew_stress_deltas": result.deltas.crew_stress_deltas,
        },
        active_event=active_event_schema,
        educational_feedback=feedback_schemas,
        failure_reason=result.failure_reason,
        score_breakdown=score_schema,
        state_checksum=result.state_checksum,
    )


# ==============================================================================
# 5. Resolve Event
# ==============================================================================
@router.post("/missions/{mission_id}/events/{event_id}/resolve", response_model=ResolveEventResponse)
def resolve_event(
    mission_id: str,
    event_id: str,
    payload: ResolveEventRequest,
    browser_id: str = Depends(get_browser_id),
    db: Session = Depends(get_db),
):
    """Submit player's emergency response to resolve a pending event and unblock day advance."""
    event = (
        db.query(MissionEvent)
        .filter(MissionEvent.id == event_id, MissionEvent.mission_id == mission_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.resolution_status == "RESOLVED":
        return ResolveEventResponse(
            event_id=event.id,
            resolution_status="RESOLVED",
            chosen_option_id=event.chosen_option_code or payload.chosen_option_id,
            outcome_summary=event.outcome_summary or "Event previously resolved.",
            updated_mission_status="IN_PROGRESS",
            educational_feedback=[],
        )

    # Match chosen option
    chosen_opt = None
    if event.options_json:
        try:
            opts = json.loads(event.options_json)
            for o in opts:
                if o.get("option_id") == payload.chosen_option_id:
                    chosen_opt = o
                    break
        except Exception:
            pass

    if not chosen_opt:
        raise HTTPException(status_code=400, detail=f"Invalid option_id '{payload.chosen_option_id}' for this event.")

    # Mark resolved and record outcome
    event.resolution_status = "RESOLVED"
    event.chosen_option_code = payload.chosen_option_id
    event.outcome_summary = f"Mitigation executed: {chosen_opt.get('title')}. {chosen_opt.get('trade_offs_summary')}"

    # Apply immediate consequence to latest snapshot and crew
    latest_snap = (
        db.query(DailySnapshot)
        .filter(DailySnapshot.mission_id == mission_id)
        .order_by(DailySnapshot.day_number.desc())
        .first()
    )
    if latest_snap:
        energy_cost = chosen_opt.get("energy_cost", 0.0)
        water_cost = chosen_opt.get("water_cost", 0.0)
        if energy_cost > 0.0:
            latest_snap.battery_level = max(latest_snap.battery_level - energy_cost, 0.0)
        if water_cost > 0.0:
            latest_snap.water_level = max(latest_snap.water_level - water_cost, 0.0)

    # Apply stress/health adjustments to crew
    stress_impact = chosen_opt.get("stress_impact", 0.0)
    health_impact = chosen_opt.get("health_impact", 0.0)
    if stress_impact != 0.0 or health_impact != 0.0:
        crew_members = db.query(CrewMember).filter(CrewMember.mission_id == mission_id).all()
        for cm in crew_members:
            cm.stress = min(max(cm.stress + stress_impact, 0.0), 100.0)
            cm.health = min(max(cm.health + health_impact, 0.0), 100.0)

    db.commit()

    # Determine educational takeaway
    feedback_schemas: List[EducationalFeedbackSchema] = []
    if event.event_code == "SOLAR_PARTICLE_EVENT" and "SOLAR_EVENT_FACT" in EDUCATIONAL_CATALOG:
        fb = EDUCATIONAL_CATALOG["SOLAR_EVENT_FACT"]
        feedback_schemas.append(
            EducationalFeedbackSchema(
                feedback_id=fb.feedback_id,
                title=fb.title,
                fact_summary=fb.fact_summary,
                concept_area=fb.concept_area,
            )
        )
    elif "EQUIPMENT_WEAR_FACT" in EDUCATIONAL_CATALOG:
        fb = EDUCATIONAL_CATALOG["EQUIPMENT_WEAR_FACT"]
        feedback_schemas.append(
            EducationalFeedbackSchema(
                feedback_id=fb.feedback_id,
                title=fb.title,
                fact_summary=fb.fact_summary,
                concept_area=fb.concept_area,
            )
        )

    return ResolveEventResponse(
        event_id=event.id,
        resolution_status=event.resolution_status,
        chosen_option_id=event.chosen_option_code,
        outcome_summary=event.outcome_summary,
        updated_mission_status="IN_PROGRESS",
        educational_feedback=feedback_schemas,
    )


# ==============================================================================
# 6. Mission Report & Final Score
# ==============================================================================
@router.get("/missions/{mission_id}/report", response_model=MissionReportResponse)
def get_mission_report(
    mission_id: str,
    browser_id: str = Depends(get_browser_id),
    db: Session = Depends(get_db),
):
    """Retrieve full mission report, turning points, and final score analysis."""
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    crew_list = db.query(CrewMember).filter(CrewMember.mission_id == mission_id).all()
    snapshots = (
        db.query(DailySnapshot)
        .filter(DailySnapshot.mission_id == mission_id)
        .order_by(DailySnapshot.day_number.asc())
        .all()
    )
    events = (
        db.query(MissionEvent)
        .filter(MissionEvent.mission_id == mission_id)
        .order_by(MissionEvent.day_number.asc())
        .all()
    )

    score_schema = None
    if mission.score_breakdown:
        sb = mission.score_breakdown
        score_schema = ScoreBreakdownSchema(
            crew_survival_score=sb.crew_survival_score,
            duration_score=sb.duration_score,
            resource_stewardship_score=sb.resource_stewardship_score,
            radiation_safety_score=sb.radiation_safety_score,
            decision_quality_score=sb.decision_quality_score,
            difficulty_multiplier_applied=sb.difficulty_multiplier_applied,
            total_score=sb.total_score,
        )

    # Identify key turning points
    turning_points: List[dict] = []
    for evt in events:
        if evt.severity in ("MODERATE", "SEVERE"):
            turning_points.append(
                {
                    "day": evt.day_number,
                    "event_title": evt.title,
                    "severity": evt.severity,
                    "resolution": evt.outcome_summary or "Resolved",
                }
            )

    # Curate educational takeaways
    takeaways = [
        EducationalFeedbackSchema(
            feedback_id=k,
            title=v.title,
            fact_summary=v.fact_summary,
            concept_area=v.concept_area,
        )
        for k, v in list(EDUCATIONAL_CATALOG.items())[:4]
    ]

    return MissionReportResponse(
        mission_id=mission.id,
        label=mission.label,
        difficulty_mode=mission.difficulty_mode,
        outcome_status=mission.status,
        days_survived=mission.current_day,
        failure_reason=mission.failure_reason,
        score_breakdown=score_schema,
        crew=[_crew_to_schema(c) for c in crew_list],
        telemetry_history=[_snapshot_to_schema(s) for s in snapshots],
        events_log=[_event_to_schema(e) for e in events],
        key_turning_points=turning_points,
        educational_takeaways=takeaways,
    )


# ==============================================================================
# 7. Health Check
# ==============================================================================
@router.get("/health", tags=["system"])
def health_check():
    """Service health check for Render deployment monitoring."""
    return {
        "status": "healthy",
        "service": "ASTRA Mission Trainer",
        "version": "1.0",
        "competition": "2026 NASA Space Apps Challenge",
    }
