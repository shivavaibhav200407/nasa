"""ASTRA Simulation Engine Package."""

from .education import EDUCATIONAL_CATALOG
from .events import generate_daily_event
from .scoring import calculate_score
from .simulator import (
    compute_state_checksum,
    create_initial_crew,
    create_initial_systems,
    step_simulation,
)
from .types import (
    ActiveEvent,
    AstronautState,
    AstronautStatus,
    DailyDeltas,
    DifficultyMode,
    EducationalFeedbackItem,
    EngineeringDecisions,
    EventCategory,
    EventOption,
    EventResolutionStatus,
    EventSeverity,
    MissionStatus,
    PowerAllocations,
    ScoreBreakdown,
    SimulationStepResult,
    SubsystemMode,
    SystemLevels,
    WaterAllocations,
)

__all__ = [
    "EDUCATIONAL_CATALOG",
    "generate_daily_event",
    "calculate_score",
    "create_initial_crew",
    "create_initial_systems",
    "step_simulation",
    "compute_state_checksum",
    "ActiveEvent",
    "AstronautState",
    "AstronautStatus",
    "DailyDeltas",
    "DifficultyMode",
    "EducationalFeedbackItem",
    "EngineeringDecisions",
    "EventCategory",
    "EventOption",
    "EventResolutionStatus",
    "EventSeverity",
    "MissionStatus",
    "PowerAllocations",
    "ScoreBreakdown",
    "SimulationStepResult",
    "SubsystemMode",
    "SystemLevels",
    "WaterAllocations",
]
