"""ASTRA Simulation Engine Type Definitions.

Pure Python dataclasses and enums representing simulation state,
subsystem telemetry, decisions, events, and results.
Contains no web framework or ORM dependencies.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class DifficultyMode(str, Enum):
    EXPLORER = "EXPLORER"
    COMMANDER = "COMMANDER"


class MissionStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AstronautStatus(str, Enum):
    ALIVE = "ALIVE"
    CRITICAL = "CRITICAL"
    DECEASED = "DECEASED"


class SubsystemMode(str, Enum):
    CONSERVATION = "CONSERVATION"
    NOMINAL = "NOMINAL"
    HIGH = "HIGH"


class EventCategory(str, Enum):
    ENVIRONMENTAL = "ENVIRONMENTAL"
    EQUIPMENT_FAILURE = "EQUIPMENT_FAILURE"


class EventSeverity(str, Enum):
    MINOR = "MINOR"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"


class EventResolutionStatus(str, Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"


@dataclass
class AstronautState:
    astronaut_id: str
    name: str
    role: str
    health: float  # 0.0 - 100.0
    stress: float  # 0.0 - 100.0
    cumulative_radiation: float  # absorbed dose units
    survival_status: AstronautStatus = AstronautStatus.ALIVE


@dataclass
class PowerAllocations:
    life_support: float = 12.0  # Oxygen scrubber / electrolysis / thermal
    water_recycling: float = 8.0  # Water reclamation filtration & distillation
    greenhouse: float = 10.0  # Lighting and climate pumps
    radiation_shelter: float = 0.0  # Active shelter / deflector load when active


@dataclass
class WaterAllocations:
    crew_share: float = 4.0  # Potable water routed to crew hydration & hygiene
    greenhouse_share: float = 2.0  # Routed to crops
    electrolysis_share: float = 1.0  # Feedstock for oxygen generation


@dataclass
class EngineeringDecisions:
    power_allocations: PowerAllocations = field(default_factory=PowerAllocations)
    water_allocations: WaterAllocations = field(default_factory=WaterAllocations)
    oxygen_mode: SubsystemMode = SubsystemMode.NOMINAL
    greenhouse_active: bool = True
    storm_shelter_posture: bool = False
    crew_rest_posture: bool = False  # If true, crew prioritizes rest over maintenance
    repair_target: Optional[str] = None  # Subsystem code to repair if damaged


@dataclass
class SystemLevels:
    oxygen_level: float
    water_level: float
    battery_level: float
    food_level: float
    greenhouse_progress: int  # Days accumulated toward GREENHOUSE_GROWTH_CYCLE_DAYS
    radiation_daily_dose: float
    solar_generation: float = 0.0
    total_energy_load: float = 0.0


@dataclass
class EventOption:
    option_id: str
    title: str
    description: str
    trade_offs_summary: str
    energy_cost: float = 0.0
    water_cost: float = 0.0
    food_cost: float = 0.0
    stress_impact: float = 0.0
    health_impact: float = 0.0
    repaired_system: Optional[str] = None


@dataclass
class ActiveEvent:
    event_id: str
    day_number: int
    category: EventCategory
    event_code: str
    title: str
    description: str
    severity: EventSeverity
    affected_systems: List[str]
    requires_decision: bool  # True for blocking emergencies; False for informational alerts
    options: List[EventOption] = field(default_factory=list)
    resolution_status: EventResolutionStatus = EventResolutionStatus.PENDING
    chosen_option_id: Optional[str] = None
    outcome_summary: Optional[str] = None


@dataclass
class DailyDeltas:
    oxygen_delta: float
    water_delta: float
    battery_delta: float
    food_delta: float
    radiation_absorbed: float
    crew_health_deltas: Dict[str, float]
    crew_stress_deltas: Dict[str, float]


@dataclass
class ScoreBreakdown:
    crew_survival_score: float
    duration_score: float
    resource_stewardship_score: float
    radiation_safety_score: float
    decision_quality_score: float
    difficulty_multiplier_applied: float
    total_score: float


@dataclass
class EducationalFeedbackItem:
    feedback_id: str
    title: str
    fact_summary: str
    concept_area: str


@dataclass
class SimulationStepResult:
    day_number: int
    mission_status: MissionStatus
    system_levels: SystemLevels
    crew: List[AstronautState]
    deltas: DailyDeltas
    active_event: Optional[ActiveEvent] = None
    educational_feedback: List[EducationalFeedbackItem] = field(default_factory=list)
    failure_reason: Optional[str] = None
    score_breakdown: Optional[ScoreBreakdown] = None
    state_checksum: str = ""
