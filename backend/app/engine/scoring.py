"""ASTRA Scoring Model.

Computes transparent end-of-mission performance score based on:
- Crew survival & final vitals
- Mission duration progress (out of 90 days)
- Resource stewardship
- Radiation safety
- Decision quality
- Difficulty multiplier (Commander Mode)
Weights are read exclusively from parameters.py.
"""

from typing import List
from ..config import parameters as p
from .types import AstronautState, AstronautStatus, DifficultyMode, ScoreBreakdown, SystemLevels


def calculate_score(
    day_number: int,
    mode: DifficultyMode,
    crew: List[AstronautState],
    systems: SystemLevels,
    unresolved_emergencies_count: int = 0,
) -> ScoreBreakdown:
    """Calculate the final score breakdown using Parameter Register weights."""
    # 1. Crew Survival & Health Score (max SCORE_WEIGHT_CREW_SURVIVAL)
    surviving_count = sum(1 for c in crew if c.survival_status == AstronautStatus.ALIVE)
    avg_health = sum(c.health for c in crew) / max(len(crew), 1)
    survival_ratio = (surviving_count / 4.0) * (avg_health / 100.0)
    crew_survival_score = round(survival_ratio * p.SCORE_WEIGHT_CREW_SURVIVAL, 1)

    # 2. Mission Duration Score (max SCORE_WEIGHT_DURATION)
    duration_ratio = min(max(day_number / 90.0, 0.0), 1.0)
    duration_score = round(duration_ratio * p.SCORE_WEIGHT_DURATION, 1)

    # 3. Resource Stewardship Score (max SCORE_WEIGHT_RESOURCE_STEWARDSHIP)
    # Rewards healthy reserves above critical thresholds without depletion
    o2_ratio = min(max((systems.oxygen_level - p.O2_CRITICAL_THRESHOLD) / max(p.O2_INITIAL_RESERVE, 1.0), 0.0), 1.0)
    water_ratio = min(max((systems.water_level - p.WATER_CRITICAL_THRESHOLD) / max(p.WATER_INITIAL_RESERVE, 1.0), 0.0), 1.0)
    battery_ratio = min(max(systems.battery_level / max(p.ENERGY_BATTERY_CAPACITY, 1.0), 0.0), 1.0)
    food_ratio = min(max((systems.food_level - p.FOOD_CRITICAL_THRESHOLD) / max(p.FOOD_INITIAL_STORED_SUPPLY, 1.0), 0.0), 1.0)

    stewardship_ratio = (o2_ratio + water_ratio + battery_ratio + food_ratio) / 4.0
    resource_stewardship_score = round(stewardship_ratio * p.SCORE_WEIGHT_RESOURCE_STEWARDSHIP, 1)

    # 4. Radiation Safety Score (max SCORE_WEIGHT_RADIATION_SAFETY)
    max_crew_dose = max((c.cumulative_radiation for c in crew), default=0.0)
    # Ratio is 1.0 if dose is 0, declining to 0.0 as dose approaches RAD_CUMULATIVE_WARNING_LIMIT
    rad_ratio = max(0.0, 1.0 - (max_crew_dose / max(p.RAD_CUMULATIVE_WARNING_LIMIT, 1.0)))
    radiation_safety_score = round(rad_ratio * p.SCORE_WEIGHT_RADIATION_SAFETY, 1)

    # 5. Decision & Stress Quality Score (max SCORE_WEIGHT_DECISION_QUALITY)
    avg_stress = sum(c.stress for c in crew) / max(len(crew), 1)
    stress_ratio = max(0.0, 1.0 - (avg_stress / 100.0))
    # Deduct for any unaddressed emergencies
    penalty = unresolved_emergencies_count * 15.0
    decision_quality_score = max(0.0, round((stress_ratio * p.SCORE_WEIGHT_DECISION_QUALITY) - penalty, 1))

    # Raw subtotal
    subtotal = (
        crew_survival_score
        + duration_score
        + resource_stewardship_score
        + radiation_safety_score
        + decision_quality_score
    )

    # 6. Difficulty Multiplier
    multiplier = p.SCORE_DIFFICULTY_MULTIPLIER if mode == DifficultyMode.COMMANDER else 1.0
    total_score = round(subtotal * multiplier, 1)

    return ScoreBreakdown(
        crew_survival_score=crew_survival_score,
        duration_score=duration_score,
        resource_stewardship_score=resource_stewardship_score,
        radiation_safety_score=radiation_safety_score,
        decision_quality_score=decision_quality_score,
        difficulty_multiplier_applied=multiplier,
        total_score=total_score,
    )
