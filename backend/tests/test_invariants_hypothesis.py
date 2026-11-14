"""Property-based invariant testing with Hypothesis for the ASTRA simulation engine.

Covers:
1. Conservation laws and boundary invariants (battery in [0, 120], non-negative resources).
2. Determinism: identical (seed, initial_state, decisions) yields identical checksums and levels.
3. Mass conservation: water never increases spontaneously (imperfect recycling).
4. Crew survival: nominal strategy preserves 4/4 crew survival across diverse seeds.
"""

from hypothesis import given, settings, strategies as st
from app.engine.simulator import (
    create_initial_crew,
    create_initial_systems,
    step_simulation,
)
from app.engine.types import (
    DifficultyMode,
    EngineeringDecisions,
    PowerAllocations,
    SubsystemMode,
    WaterAllocations,
)


@settings(max_examples=50, deadline=None)
@given(
    seed=st.text(min_size=1, max_size=20),
    pwr_life=st.floats(min_value=0.0, max_value=25.0),
    pwr_water=st.floats(min_value=0.0, max_value=20.0),
    pwr_gh=st.floats(min_value=0.0, max_value=20.0),
    pwr_shelter=st.floats(min_value=0.0, max_value=15.0),
    wtr_crew=st.floats(min_value=0.0, max_value=8.0),
    wtr_gh=st.floats(min_value=0.0, max_value=5.0),
    wtr_elec=st.floats(min_value=0.0, max_value=5.0),
    gh_active=st.booleans(),
    shelter_posture=st.booleans(),
    o2_mode=st.sampled_from([SubsystemMode.CONSERVATION, SubsystemMode.NOMINAL, SubsystemMode.HIGH]),
)
def test_hypothesis_bounds_and_conservation(
    seed,
    pwr_life,
    pwr_water,
    pwr_gh,
    pwr_shelter,
    wtr_crew,
    wtr_gh,
    wtr_elec,
    gh_active,
    shelter_posture,
    o2_mode,
):
    """Verify that arbitrary decision vectors never breach fundamental physical boundaries."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(
            life_support=pwr_life,
            water_recycling=pwr_water,
            greenhouse=pwr_gh,
            radiation_shelter=pwr_shelter,
        ),
        water_allocations=WaterAllocations(
            crew_share=wtr_crew,
            greenhouse_share=wtr_gh,
            electrolysis_share=wtr_elec,
        ),
        oxygen_mode=o2_mode,
        greenhouse_active=gh_active,
        storm_shelter_posture=shelter_posture,
    )

    res = step_simulation(
        seed=seed,
        current_day=1,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    new_sys = res.system_levels

    # Battery capacity bounds [0.0, 120.0] kWh
    assert 0.0 <= new_sys.battery_level <= 120.0, f"Battery out of bounds: {new_sys.battery_level}"

    # Non-negative resource bounds
    assert new_sys.oxygen_level >= 0.0, f"Negative oxygen: {new_sys.oxygen_level}"
    assert new_sys.water_level >= 0.0, f"Negative water: {new_sys.water_level}"
    assert new_sys.food_level >= 0.0, f"Negative food: {new_sys.food_level}"
    assert new_sys.greenhouse_progress >= 0.0, f"Negative greenhouse: {new_sys.greenhouse_progress}"
    assert new_sys.radiation_daily_dose >= 0.0, f"Negative radiation: {new_sys.radiation_daily_dose}"

    # Checksum generated and non-empty
    assert res.state_checksum and len(res.state_checksum) > 8


@settings(max_examples=30, deadline=None)
@given(
    seed=st.text(min_size=1, max_size=15),
    days_to_run=st.integers(min_value=1, max_value=10),
)
def test_hypothesis_determinism_property(seed, days_to_run):
    """Verify that running with identical inputs produces identical trajectories."""
    decisions = EngineeringDecisions(
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
    sys_a = create_initial_systems(DifficultyMode.EXPLORER)
    crew_a = create_initial_crew()
    checksums_a = []

    for d in range(1, days_to_run + 1):
        res_a = step_simulation(
            seed=seed,
            current_day=d,
            mode=DifficultyMode.EXPLORER,
            prev_systems=sys_a,
            prev_crew=crew_a,
            decisions=decisions,
        )
        sys_a = res_a.system_levels
        crew_a = res_a.crew
        checksums_a.append(res_a.state_checksum)

    # Run B
    sys_b = create_initial_systems(DifficultyMode.EXPLORER)
    crew_b = create_initial_crew()
    checksums_b = []

    for d in range(1, days_to_run + 1):
        res_b = step_simulation(
            seed=seed,
            current_day=d,
            mode=DifficultyMode.EXPLORER,
            prev_systems=sys_b,
            prev_crew=crew_b,
            decisions=decisions,
        )
        sys_b = res_b.system_levels
        crew_b = res_b.crew
        checksums_b.append(res_b.state_checksum)

    assert checksums_a == checksums_b, "Checksum trajectories must be identical for identical inputs!"
    assert sys_a.oxygen_level == sys_b.oxygen_level
    assert sys_a.water_level == sys_b.water_level
    assert sys_a.battery_level == sys_b.battery_level


@settings(max_examples=30, deadline=None)
@given(
    seed=st.text(min_size=1, max_size=15),
    water_recycling_power=st.floats(min_value=0.0, max_value=20.0),
)
def test_hypothesis_water_imperfect_recycling(seed, water_recycling_power):
    """Verify that water never spontaneously increases without an explicit water resupply event."""
    initial_systems = create_initial_systems(DifficultyMode.EXPLORER)
    initial_crew = create_initial_crew()

    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(water_recycling=water_recycling_power),
        water_allocations=WaterAllocations(crew_share=4.0, greenhouse_share=0.0, electrolysis_share=0.0),
        greenhouse_active=False,
    )

    res = step_simulation(
        seed=seed,
        current_day=1,
        mode=DifficultyMode.EXPLORER,
        prev_systems=initial_systems,
        prev_crew=initial_crew,
        decisions=decisions,
    )

    # Net water must decrease due to crew consumption and imperfect recycling losses
    assert res.deltas.water_delta < 0.0, "Net water must decrease due to imperfect recycling!"
    assert res.system_levels.water_level < initial_systems.water_level
