"""Test failure conditions, strict 4-of-4 crew survival, Day 90 success, and scoring in the ASTRA engine."""

from app.config import parameters as p
from app.engine.simulator import (
    create_initial_crew,
    create_initial_systems,
    step_simulation,
)
from app.engine.types import (
    AstronautState,
    AstronautStatus,
    DifficultyMode,
    EngineeringDecisions,
    MissionStatus,
    PowerAllocations,
    WaterAllocations,
)


def test_strict_four_of_four_survival_single_fatality_fails_mission():
    """Verify that losing even ONE astronaut immediately causes mission failure."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Artificially set 1 astronaut near death, others healthy
    crew[0].health = 1.0
    crew[1].health = 100.0
    crew[2].health = 100.0
    crew[3].health = 100.0

    # Cause a deficit that deals health damage
    systems.oxygen_level = 0.0
    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=0.0),
        water_allocations=WaterAllocations(crew_share=4.0),
    )

    res = step_simulation(
        seed="SURVIVAL_TEST",
        current_day=10,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    # Crew 0 died, crew 1-3 survived
    deceased = [c for c in res.crew if c.survival_status == AstronautStatus.DECEASED]
    survivors = [c for c in res.crew if c.survival_status != AstronautStatus.DECEASED]

    assert len(deceased) >= 1
    assert len(survivors) >= 1
    assert res.mission_status == MissionStatus.FAILED, "Mission must fail if any astronaut dies (strict 4-of-4)!"
    assert "Crew fatality" in res.failure_reason


def test_failure_condition_unrecoverable_oxygen_collapse():
    """Verify mission failure when oxygen collapses without power or water to regenerate."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    systems.oxygen_level = 0.0
    systems.battery_level = 0.0
    systems.water_level = 0.0

    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=0.0),
    )

    res = step_simulation(
        seed="O2_COLLAPSE_TEST",
        current_day=5,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    assert res.mission_status == MissionStatus.FAILED
    assert "Oxygen Collapse" in res.failure_reason


def test_failure_condition_unrecoverable_water_depletion():
    """Verify mission failure when potable water is fully exhausted."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    systems.water_level = 0.0
    decisions = EngineeringDecisions()

    res = step_simulation(
        seed="WATER_DEPLETION_TEST",
        current_day=5,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    assert res.mission_status == MissionStatus.FAILED
    assert "Water Depletion" in res.failure_reason


def test_failure_condition_total_starvation():
    """Verify mission failure when food rations are depleted with no greenhouse yield."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    systems.food_level = 0.0
    decisions = EngineeringDecisions(greenhouse_active=False)

    res = step_simulation(
        seed="STARVATION_TEST",
        current_day=5,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    assert res.mission_status == MissionStatus.FAILED
    assert "Total Starvation" in res.failure_reason


def test_failure_condition_catastrophic_radiation_exposure():
    """Verify mission failure when cumulative radiation breaches fatal limit."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Astronaut at fatal threshold
    crew[0].cumulative_radiation = p.RAD_CUMULATIVE_FATAL_LIMIT

    decisions = EngineeringDecisions()
    res = step_simulation(
        seed="RAD_TEST",
        current_day=20,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    assert res.mission_status == MissionStatus.FAILED
    assert "Radiation Exposure" in res.failure_reason


def test_failure_condition_total_habitat_power_blackout():
    """Verify mission failure when total habitat power blacks out continuously."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Battery empty, zero generation
    systems.battery_level = 0.0
    # Simulate high demand with empty battery
    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=20.0, water_recycling=15.0, greenhouse=15.0),
    )

    # Temporarily monkeypatch solar output for testing night blackout
    orig_solar = p.ENERGY_SOLAR_DAY_OUTPUT
    try:
        p.ENERGY_SOLAR_DAY_OUTPUT = 0.0
        res = step_simulation(
            seed="BLACKOUT_TEST",
            current_day=10,
            mode=DifficultyMode.EXPLORER,
            prev_systems=systems,
            prev_crew=crew,
            decisions=decisions,
        )
        assert res.mission_status == MissionStatus.FAILED
        assert "Power Blackout" in res.failure_reason
    finally:
        p.ENERGY_SOLAR_DAY_OUTPUT = orig_solar


def test_day_90_mission_completion_and_scoring():
    """Verify successful mission completion on Day 90 when all 4 crew survive, and check score breakdown."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Advance from Day 89 to Day 90 under nominal conditions
    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=12.0, water_recycling=8.0, greenhouse=10.0),
        water_allocations=WaterAllocations(crew_share=4.0, greenhouse_share=2.0, electrolysis_share=1.0),
        greenhouse_active=True,
    )

    res = step_simulation(
        seed="DAY90_SUCCESS_TEST",
        current_day=89,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    assert res.day_number == 90
    assert res.mission_status == MissionStatus.COMPLETED
    assert all(c.survival_status != AstronautStatus.DECEASED for c in res.crew)
    assert res.score_breakdown is not None
    assert res.score_breakdown.crew_survival_score > 0.0
    assert res.score_breakdown.duration_score == p.SCORE_WEIGHT_DURATION
    assert res.score_breakdown.total_score > 500.0


def test_commander_mode_difficulty_multiplier_in_scoring():
    """Verify that Commander Mode applies the SCORE_DIFFICULTY_MULTIPLIER."""
    systems = create_initial_systems(DifficultyMode.COMMANDER)
    crew = create_initial_crew()

    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=12.0, water_recycling=8.0),
        water_allocations=WaterAllocations(crew_share=4.0, electrolysis_share=1.0),
        greenhouse_active=False,
    )

    res = step_simulation(
        seed="COMMANDER_SCORE_TEST",
        current_day=89,
        mode=DifficultyMode.COMMANDER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    assert res.mission_status == MissionStatus.COMPLETED
    assert res.score_breakdown.difficulty_multiplier_applied == p.SCORE_DIFFICULTY_MULTIPLIER
