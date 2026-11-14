"""Test physical realism constraints and conservation invariants in the ASTRA engine.

PRD Section 13 Rules:
1. No unrealistic resource regeneration.
2. Imperfect water recycling (losses occur every cycle).
3. Partial radiation protection (dose > 0 always).
4. Greenhouse food depends on resources and time.
5. Energy generation and demand must balance.
"""

from app.config import parameters as p
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


def test_no_free_water_regeneration_and_imperfect_recycling():
    """Verify that water recycling is imperfect and net water never increases spontaneously."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Even with max water recycling power, net water must decrease or stay <= initial
    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(water_recycling=20.0),  # Max power
        water_allocations=WaterAllocations(crew_share=4.0, greenhouse_share=0.0, electrolysis_share=0.0),
        greenhouse_active=False,
    )

    res = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )

    # Reclaimed water cannot exceed consumption, and loss rate is enforced
    assert p.WATER_RECYCLING_EFFICIENCY < 1.0, "Recycling efficiency must be strictly imperfect (< 1.0)!"
    assert p.WATER_RECYCLING_LOSS_RATE > 0.0, "Irreversible loss rate must be greater than zero!"
    assert res.deltas.water_delta < 0.0, "Net water must decrease due to imperfect recycling loss!"
    assert res.system_levels.water_level < systems.water_level, "Water level cannot increase without resupply!"


def test_oxygen_cannot_generate_without_power_or_water():
    """Verify that oxygen generation requires both power and water feedstock."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Case A: Zero power allocated to life support
    decisions_zero_power = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=0.0),
        water_allocations=WaterAllocations(electrolysis_share=2.0),
    )
    res_a = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions_zero_power,
    )
    # With 0 power, oxygen delta should just be negative (crew consumption)
    assert res_a.deltas.oxygen_delta <= -p.O2_CREW_CONSUMPTION_PER_DAY

    # Case B: Zero water feedstock allocated to electrolysis
    decisions_zero_water = EngineeringDecisions(
        power_allocations=PowerAllocations(life_support=15.0),
        water_allocations=WaterAllocations(electrolysis_share=0.0),
    )
    res_b = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions_zero_water,
    )
    assert res_b.deltas.oxygen_delta <= -p.O2_CREW_CONSUMPTION_PER_DAY


def test_radiation_shielding_never_reduces_dose_to_zero():
    """Verify that absorbed radiation dose is strictly greater than zero under all postures."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Case 1: Passive shielding (nominal posture)
    decisions_passive = EngineeringDecisions(storm_shelter_posture=False)
    res_passive = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions_passive,
    )
    assert res_passive.deltas.radiation_absorbed > 0.0, "Passive dose must be greater than zero!"

    # Case 2: Maximum active storm shelter posture
    decisions_shelter = EngineeringDecisions(
        storm_shelter_posture=True,
        power_allocations=PowerAllocations(radiation_shelter=15.0),
    )
    res_shelter = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions_shelter,
    )
    assert res_shelter.deltas.radiation_absorbed > 0.0, "Storm shelter dose must still be greater than zero!"
    assert res_shelter.deltas.radiation_absorbed < res_passive.deltas.radiation_absorbed, (
        "Shelter must attenuate more dose than passive baseline."
    )


def test_energy_balance_and_battery_limits():
    """Verify energy conservation: generation charges battery, deficits drain it, capacity is capped."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    # Set initial battery to 50%
    systems.battery_level = 50.0

    # Low demand -> surplus charges battery
    low_demand_decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(
            life_support=5.0, water_recycling=5.0, greenhouse=0.0, radiation_shelter=0.0
        ),
        greenhouse_active=False,
    )
    res_low = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=low_demand_decisions,
    )
    assert res_low.system_levels.battery_level > 50.0
    assert res_low.system_levels.battery_level <= p.ENERGY_BATTERY_CAPACITY

    # High demand exceeding solar generation -> drains battery
    high_demand_decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(
            life_support=30.0, water_recycling=20.0, greenhouse=20.0, radiation_shelter=20.0
        ),
        greenhouse_active=True,
        storm_shelter_posture=True,
    )
    res_high = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=high_demand_decisions,
    )
    assert res_high.system_levels.battery_level < 50.0


def test_greenhouse_requires_resources_and_time_to_produce_food():
    """Verify greenhouse does not produce instant food and requires growth cycle completion."""
    systems = create_initial_systems(DifficultyMode.EXPLORER)
    crew = create_initial_crew()

    decisions = EngineeringDecisions(
        power_allocations=PowerAllocations(greenhouse=12.0),
        water_allocations=WaterAllocations(crew_share=4.0, greenhouse_share=3.0),
        greenhouse_active=True,
    )

    # Day 1: Growth progress increments, but no harvest yet (food drops by crew consumption)
    res_1 = step_simulation(
        seed="PHYSICS_TEST",
        current_day=0,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )
    assert res_1.system_levels.greenhouse_progress == 1
    assert res_1.deltas.food_delta == -p.FOOD_CREW_CONSUMPTION_PER_DAY

    # Fast-forward to cycle completion
    systems.greenhouse_progress = p.GREENHOUSE_GROWTH_CYCLE_DAYS - 1
    res_harvest = step_simulation(
        seed="PHYSICS_TEST",
        current_day=p.GREENHOUSE_GROWTH_CYCLE_DAYS - 1,
        mode=DifficultyMode.EXPLORER,
        prev_systems=systems,
        prev_crew=crew,
        decisions=decisions,
    )
    # Completing the cycle adds harvest yield!
    assert res_harvest.system_levels.greenhouse_progress == 0
    assert res_harvest.deltas.food_delta == p.GREENHOUSE_HARVEST_YIELD - p.FOOD_CREW_CONSUMPTION_PER_DAY
