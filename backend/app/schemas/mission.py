"""Pydantic Schemas for ASTRA REST API.

Provides strict request and response validation matching PRD Section 12.3 endpoints.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from ..engine.types import DifficultyMode, SubsystemMode


class CreateMissionRequest(BaseModel):
    difficulty_mode: DifficultyMode = Field(..., description="Explorer or Commander mode")
    label: Optional[str] = Field(None, max_length=100, description="Optional outpost name or commander label")
    seed: Optional[str] = Field(None, max_length=64, description="Optional deterministic PRNG seed")


class MissionSummaryResponse(BaseModel):
    id: str
    label: str
    difficulty_mode: str
    current_day: int
    status: str
    total_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime


class CrewMemberSchema(BaseModel):
    astronaut_id: str
    name: str
    role: str
    health: float
    stress: float
    cumulative_radiation: float
    survival_status: str


class SystemLevelsSchema(BaseModel):
    oxygen_level: float
    water_level: float
    battery_level: float
    food_level: float
    greenhouse_progress: int
    radiation_daily_dose: float
    solar_generation: float
    total_energy_load: float


class DailySnapshotSchema(BaseModel):
    day_number: int
    oxygen_level: float
    water_level: float
    energy_generated: float
    battery_level: float
    food_level: float
    greenhouse_progress: int
    radiation_daily_dose: float
    state_checksum: str


class PowerAllocationsSchema(BaseModel):
    life_support: float = Field(12.0, ge=0.0, le=40.0)
    water_recycling: float = Field(8.0, ge=0.0, le=30.0)
    greenhouse: float = Field(10.0, ge=0.0, le=30.0)
    radiation_shelter: float = Field(0.0, ge=0.0, le=30.0)


class WaterAllocationsSchema(BaseModel):
    crew_share: float = Field(4.0, ge=0.0, le=10.0)
    greenhouse_share: float = Field(2.0, ge=0.0, le=10.0)
    electrolysis_share: float = Field(1.0, ge=0.0, le=10.0)


class AdvanceDayRequest(BaseModel):
    expected_day: int = Field(..., description="Current active day index for idempotency check")
    power_allocations: PowerAllocationsSchema = Field(default_factory=PowerAllocationsSchema)
    water_allocations: WaterAllocationsSchema = Field(default_factory=WaterAllocationsSchema)
    oxygen_mode: SubsystemMode = Field(SubsystemMode.NOMINAL)
    greenhouse_active: bool = True
    storm_shelter_posture: bool = False
    crew_rest_posture: bool = False
    repair_target: Optional[str] = None


class EventOptionSchema(BaseModel):
    option_id: str
    title: str
    description: str
    trade_offs_summary: str
    energy_cost: float = 0.0
    water_cost: float = 0.0
    food_cost: float = 0.0
    stress_impact: float = 0.0
    health_impact: float = 0.0


class MissionEventSchema(BaseModel):
    event_id: str
    day_number: int
    category: str
    event_code: str
    title: str
    description: str
    severity: str
    affected_systems: List[str]
    requires_decision: bool
    options: List[EventOptionSchema] = Field(default_factory=list)
    resolution_status: str
    chosen_option_id: Optional[str] = None
    outcome_summary: Optional[str] = None


class EducationalFeedbackSchema(BaseModel):
    feedback_id: str
    title: str
    fact_summary: str
    concept_area: str


class ScoreBreakdownSchema(BaseModel):
    crew_survival_score: float
    duration_score: float
    resource_stewardship_score: float
    radiation_safety_score: float
    decision_quality_score: float
    difficulty_multiplier_applied: float
    total_score: float


class MissionDetailResponse(BaseModel):
    id: str
    label: str
    difficulty_mode: str
    seed: str
    status: str
    current_day: int
    failure_reason: Optional[str] = None
    systems: SystemLevelsSchema
    crew: List[CrewMemberSchema]
    active_event: Optional[MissionEventSchema] = None
    educational_feedback: List[EducationalFeedbackSchema] = Field(default_factory=list)
    history: List[DailySnapshotSchema] = Field(default_factory=list)
    score_breakdown: Optional[ScoreBreakdownSchema] = None


class AdvanceDayResponse(BaseModel):
    day_number: int
    mission_status: str
    system_levels: SystemLevelsSchema
    crew: List[CrewMemberSchema]
    deltas: Dict[str, Any]
    active_event: Optional[MissionEventSchema] = None
    educational_feedback: List[EducationalFeedbackSchema] = Field(default_factory=list)
    failure_reason: Optional[str] = None
    score_breakdown: Optional[ScoreBreakdownSchema] = None
    state_checksum: str


class ResolveEventRequest(BaseModel):
    chosen_option_id: str = Field(..., description="ID of chosen mitigation option")


class ResolveEventResponse(BaseModel):
    event_id: str
    resolution_status: str
    chosen_option_id: str
    outcome_summary: str
    updated_mission_status: str
    educational_feedback: List[EducationalFeedbackSchema] = Field(default_factory=list)
    score_breakdown: Optional[ScoreBreakdownSchema] = None


class MissionReportResponse(BaseModel):
    mission_id: str
    label: str
    difficulty_mode: str
    outcome_status: str
    days_survived: int
    failure_reason: Optional[str] = None
    score_breakdown: Optional[ScoreBreakdownSchema] = None
    crew: List[CrewMemberSchema]
    telemetry_history: List[DailySnapshotSchema]
    events_log: List[MissionEventSchema]
    key_turning_points: List[Dict[str, Any]]
    educational_takeaways: List[EducationalFeedbackSchema]
