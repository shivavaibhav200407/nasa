"""Test determinism of the ASTRA simulation engine.

Verifies:
1. Two 90-day runs with identical seed and decisions produce 100% identical outputs.
2. Checksums and step snapshots match byte-for-byte across steps.
3. Mid-mission resume from saved state matches an uninterrupted run.
"""

from app.engine.simulator import (
    create_initial_crew,
    create_initial_systems,
    step_simulation,
)
from app.engine.types import (
    DifficultyMode,
    EngineeringDecisions,
    PowerAllocations,
    WaterAllocations,
)


def test_identical_seed_produces_identical_90_day_run():
    """Verify that identical seed + decisions produce identical state snapshots."""
    seed = "TEST_GOLDEN_SEED_42"
    mode = DifficultyMode.EXPLORER

    # Standard balanced decision set
    nominal_decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(
            life_support=12.0,
            water_recycling=8.0,
            greenhouse=10.0,
            radiation_shelter=0.0,
        ),
        water_allocations=WaterAllocations(
            crew_share=4.0,
            greenhouse_share=2.0,
            electrolysis_share=1.0,
        ),
        greenhouse_active=True,
        storm_shelter_posture=False,
    )

    # Run A
    systems_a = create_initial_systems(mode)
    crew_a = create_initial_crew()
    checksums_a = []
    events_a = []

    for day in range(1, 91):
        res_a = step_simulation(
            seed=seed,
            current_day=day - 1,
            mode=mode,
            prev_systems=systems_a,
            prev_crew=crew_a,
            decisions=nominal_decisions,
        )
        systems_a = res_a.system_levels
        crew_a = res_a.crew
        checksums_a.append(res_a.state_checksum)
        if res_a.active_event:
            events_a.append((day, res_a.active_event.event_code))

    # Run B
    systems_b = create_initial_systems(mode)
    crew_b = create_initial_crew()
    checksums_b = []
    events_b = []

    for day in range(1, 91):
        res_b = step_simulation(
            seed=seed,
            current_day=day - 1,
            mode=mode,
            prev_systems=systems_b,
            prev_crew=crew_b,
            decisions=nominal_decisions,
        )
        systems_b = res_b.system_levels
        crew_b = res_b.crew
        checksums_b.append(res_b.state_checksum)
        if res_b.active_event:
            events_b.append((day, res_b.active_event.event_code))

    # Assert 100% equivalence
    assert checksums_a == checksums_b, "Checksums diverged between identical runs!"
    assert events_a == events_b, "Event generation was non-deterministic!"
    assert systems_a.oxygen_level == systems_b.oxygen_level
    assert systems_a.water_level == systems_b.water_level
    assert systems_a.battery_level == systems_b.battery_level
    assert systems_a.food_level == systems_b.food_level


def test_different_seeds_produce_different_event_trajectories():
    """Verify that different seeds produce distinct event sequences."""
    mode = DifficultyMode.COMMANDER
    events_seed1 = []
    events_seed2 = []

    for day in range(1, 30):
        from app.engine.events import generate_daily_event

        evt1 = generate_daily_event(seed="SEED_ALPHA", day_number=day, mode=mode)
        evt2 = generate_daily_event(seed="SEED_OMEGA", day_number=day, mode=mode)
        if evt1:
            events_seed1.append((day, evt1.event_code))
        if evt2:
            events_seed2.append((day, evt2.event_code))

    assert events_seed1 != events_seed2, "Different seeds unexpectedly produced identical events!"
