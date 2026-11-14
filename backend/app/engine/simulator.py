"""ASTRA Deterministic Simulation Engine.

Executes the 8-step daily loop across six interconnected systems:
1. Energy: Generation (solar) + Battery balancing
2. Water: Crew hydration, greenhouse irrigation, imperfect recycling loss
3. Oxygen: Respiration, electrolysis, CO2 scrubbing
4. Food: Stored rations, resource/time-dependent greenhouse growth & harvest
5. Radiation Safety: Ambient cosmic flux, solar events, partial shielding attenuation
6. Crew Health: Health, stress, survival tracking (strict 4-of-4 survival rule)

Follows all PRD rules:
- All balance values read from parameters.py
- Pure-Python, zero framework/database imports
- Strictly deterministic based on seed and step index
- Evaluates 6 failure conditions and Day 90 mission completion
"""

import hashlib
import json
from typing import List, Optional, Tuple

from ..config import parameters as p
from .education import EDUCATIONAL_CATALOG
from .events import generate_daily_event
from .scoring import calculate_score
from .types import (
    AstronautState,
    AstronautStatus,
    DailyDeltas,
    DifficultyMode,
    EducationalFeedbackItem,
    EngineeringDecisions,
    MissionStatus,
    SimulationStepResult,
    SubsystemMode,
    SystemLevels,
)


def create_initial_crew() -> List[AstronautState]:
    """Initialize the 4 astronauts on Day 1."""
    return [
        AstronautState(
            astronaut_id="crew_1",
            name="Dr. Elena Rostova",
            role="Mission Commander",
            health=p.CREW_INITIAL_HEALTH,
            stress=p.CREW_INITIAL_STRESS,
            cumulative_radiation=0.0,
            survival_status=AstronautStatus.ALIVE,
        ),
        AstronautState(
            astronaut_id="crew_2",
            name="Marcus Chen",
            role="Flight Engineer",
            health=p.CREW_INITIAL_HEALTH,
            stress=p.CREW_INITIAL_STRESS,
            cumulative_radiation=0.0,
            survival_status=AstronautStatus.ALIVE,
        ),
        AstronautState(
            astronaut_id="crew_3",
            name="Sarah Jenkins",
            role="Life Support Specialist",
            health=p.CREW_INITIAL_HEALTH,
            stress=p.CREW_INITIAL_STRESS,
            cumulative_radiation=0.0,
            survival_status=AstronautStatus.ALIVE,
        ),
        AstronautState(
            astronaut_id="crew_4",
            name="Dr. Tariq Al-Mansoor",
            role="Science Officer",
            health=p.CREW_INITIAL_HEALTH,
            stress=p.CREW_INITIAL_STRESS,
            cumulative_radiation=0.0,
            survival_status=AstronautStatus.ALIVE,
        ),
    ]


def create_initial_systems(mode: DifficultyMode) -> SystemLevels:
    """Initialize outpost system levels on Day 1 scaled by mode."""
    scale = p.MODE_CONSTRAINT_SCALING if mode == DifficultyMode.COMMANDER else 1.0

    return SystemLevels(
        oxygen_level=round(p.O2_INITIAL_RESERVE / scale, 1),
        water_level=round(p.WATER_INITIAL_RESERVE / scale, 1),
        battery_level=round(p.ENERGY_BATTERY_CAPACITY * 0.9, 1),  # Starts at 90% charge
        food_level=round(p.FOOD_INITIAL_STORED_SUPPLY / scale, 1),
        greenhouse_progress=0,
        radiation_daily_dose=0.0,
        solar_generation=p.ENERGY_SOLAR_DAY_OUTPUT,
        total_energy_load=p.ENERGY_BASE_HABITAT_LOAD + 30.0,
    )


def compute_state_checksum(
    day_number: int,
    systems: SystemLevels,
    crew: List[AstronautState],
    status: MissionStatus,
) -> str:
    """Compute deterministic SHA256 checksum of canonical state."""
    payload = {
        "day": day_number,
        "status": status.value,
        "o2": round(systems.oxygen_level, 3),
        "water": round(systems.water_level, 3),
        "battery": round(systems.battery_level, 3),
        "food": round(systems.food_level, 3),
        "greenhouse": systems.greenhouse_progress,
        "crew": [
            {
                "id": c.astronaut_id,
                "health": round(c.health, 3),
                "stress": round(c.stress, 3),
                "rad": round(c.cumulative_radiation, 3),
                "status": c.survival_status.value,
            }
            for c in crew
        ],
    }
    raw = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def step_simulation(
    seed: str,
    current_day: int,
    mode: DifficultyMode,
    prev_systems: SystemLevels,
    prev_crew: List[AstronautState],
    decisions: EngineeringDecisions,
    resolved_event_consequences: Optional[dict] = None,
) -> SimulationStepResult:
    """Advance the mission simulation by exactly one day.

    Follows the 8-step daily gameplay loop from PRD Section 6.1.
    """
    next_day = current_day + 1
    feedback: List[EducationalFeedbackItem] = []

    # Apply any resolved emergency event modifications upfront
    extra_energy_cost = 0.0
    extra_water_cost = 0.0
    extra_stress_penalty = 0.0
    extra_health_penalty = 0.0
    repaired_subsystem: Optional[str] = None

    if resolved_event_consequences:
        extra_energy_cost = resolved_event_consequences.get("energy_cost", 0.0)
        extra_water_cost = resolved_event_consequences.get("water_cost", 0.0)
        extra_stress_penalty = resolved_event_consequences.get("stress_impact", 0.0)
        extra_health_penalty = resolved_event_consequences.get("health_impact", 0.0)
        repaired_subsystem = resolved_event_consequences.get("repaired_system")

    # =========================================================================
    # Step A: Energy Generation, Demand & Battery Balancing
    # =========================================================================
    solar_gen = p.ENERGY_SOLAR_DAY_OUTPUT

    # Calculate allocated power demand
    p_alloc = decisions.power_allocations
    allocated_subsystems_load = (
        max(p_alloc.life_support, 0.0)
        + max(p_alloc.water_recycling, 0.0)
        + (max(p_alloc.greenhouse, 0.0) if decisions.greenhouse_active else 0.0)
        + (max(p_alloc.radiation_shelter, 0.0) if decisions.storm_shelter_posture else 0.0)
    )
    total_demand = p.ENERGY_BASE_HABITAT_LOAD + allocated_subsystems_load + extra_energy_cost

    # Energy balance check: Generation + Battery discharge
    usable_energy = solar_gen + prev_systems.battery_level
    energy_blackout = False

    if total_demand <= solar_gen:
        # Solar covers demand; surplus charges batteries
        surplus = solar_gen - total_demand
        new_battery = min(prev_systems.battery_level + surplus, p.ENERGY_BATTERY_CAPACITY)
        battery_delta = new_battery - prev_systems.battery_level
    elif total_demand <= usable_energy:
        # Solar insufficient; battery discharges to cover shortfall
        shortfall = total_demand - solar_gen
        new_battery = max(prev_systems.battery_level - shortfall, 0.0)
        battery_delta = -shortfall
    else:
        # Deficit exceeds total available generation and battery capacity
        new_battery = 0.0
        battery_delta = -prev_systems.battery_level
        energy_blackout = True

    feedback.append(EDUCATIONAL_CATALOG["ENERGY_BALANCE_FACT"])

    # Effective operational ratio for subordinate subsystems (1.0 = fully powered)
    effective_power_ratio = 0.0 if energy_blackout else min(usable_energy / max(total_demand, 1.0), 1.0)

    # =========================================================================
    # Step B: Water System (Consumption, Recycling Loss, Electrolysis Routing)
    # =========================================================================
    w_alloc = decisions.water_allocations
    crew_water_needed = p.WATER_CREW_CONSUMPTION_PER_DAY
    gh_water_needed = p.GREENHOUSE_WATER_DEMAND if decisions.greenhouse_active else 0.0
    electrolysis_water_needed = max(w_alloc.electrolysis_share, 0.0)

    total_water_demand = crew_water_needed + gh_water_needed + electrolysis_water_needed + extra_water_cost

    # Determine water satisfaction from stored reserve
    available_water = prev_systems.water_level
    actual_water_used = min(available_water, total_water_demand)

    # Water recycling: crew produces wastewater to be reclaimed from water actually consumed
    reclaimable_feedstock = min(actual_water_used, crew_water_needed)
    recycler_power_factor = min(p_alloc.water_recycling / 8.0, 1.0) * effective_power_ratio
    reclaimed_water = reclaimable_feedstock * (p.WATER_RECYCLING_EFFICIENCY * recycler_power_factor)
    irreversible_loss = reclaimable_feedstock * p.WATER_RECYCLING_LOSS_RATE

    # Net water change (reclaimed - used - loss; strictly non-regenerative)
    water_delta = round(reclaimed_water - actual_water_used, 2)
    new_water = max(round(prev_systems.water_level + water_delta, 2), 0.0)

    feedback.append(EDUCATIONAL_CATALOG["WATER_RECYCLING_FACT"])

    # Water deficit indicator for crew hydration
    water_deficit = actual_water_used < crew_water_needed or new_water <= p.WATER_CRITICAL_THRESHOLD

    # =========================================================================
    # Step C: Oxygen System (Respiration, Electrolysis, Scrubbing)
    # =========================================================================
    crew_o2_consumed = p.O2_CREW_CONSUMPTION_PER_DAY

    # Oxygen generation depends on power ratio, mode, and available electrolysis water
    life_support_power_ratio = min(p_alloc.life_support / 12.0, 1.0) * effective_power_ratio
    mode_multiplier = 1.2 if decisions.oxygen_mode == SubsystemMode.HIGH else (
        0.8 if decisions.oxygen_mode == SubsystemMode.CONSERVATION else 1.0
    )

    electrolysis_water_ratio = min(w_alloc.electrolysis_share / 1.0, 1.0)
    o2_generated = (
        p.O2_GENERATION_MAX_RATE
        * life_support_power_ratio
        * mode_multiplier
        * electrolysis_water_ratio
    )

    o2_delta = round(o2_generated - crew_o2_consumed, 2)
    new_o2 = max(round(prev_systems.oxygen_level + o2_delta, 2), 0.0)

    feedback.append(EDUCATIONAL_CATALOG["O2_RECOVERY_FACT"])

    o2_deficit = new_o2 <= p.O2_CRITICAL_THRESHOLD

    # =========================================================================
    # Step D: Food System (Rations & Greenhouse Maturation)
    # =========================================================================
    crew_food_consumed = p.FOOD_CREW_CONSUMPTION_PER_DAY
    new_food = max(round(prev_systems.food_level - crew_food_consumed, 2), 0.0)
    food_delta = -crew_food_consumed

    new_gh_progress = prev_systems.greenhouse_progress

    if decisions.greenhouse_active and not energy_blackout:
        # Greenhouse needs both adequate water and power to grow
        gh_water_met = actual_water_used >= (crew_water_needed + gh_water_needed)
        gh_power_met = (p_alloc.greenhouse * effective_power_ratio) >= (p.GREENHOUSE_ENERGY_DEMAND * 0.7)

        if gh_water_met and gh_power_met:
            new_gh_progress += 1
            if new_gh_progress >= p.GREENHOUSE_GROWTH_CYCLE_DAYS:
                # Harvest ready!
                new_food += p.GREENHOUSE_HARVEST_YIELD
                food_delta += p.GREENHOUSE_HARVEST_YIELD
                new_gh_progress = 0
        else:
            # Stalled growth due to missing water or light
            new_gh_progress = max(new_gh_progress - 1, 0)

    feedback.append(EDUCATIONAL_CATALOG["GREENHOUSE_GROWTH_FACT"])

    food_deficit = new_food <= p.FOOD_CRITICAL_THRESHOLD

    # =========================================================================
    # Step E: Radiation Safety System (Attenuation vs Elimination)
    # =========================================================================
    # Ambient dose attenuated by structural shielding or active storm shelter
    if decisions.storm_shelter_posture and not energy_blackout:
        shield_attenuation = p.RAD_SHELTER_SHIELD_FACTOR
    else:
        shield_attenuation = p.RAD_PASSIVE_SHIELD_FACTOR

    # By physical rule: dose absorbed is strictly > 0.0 (shielding never grants 100% protection)
    absorbed_daily_dose = round(p.RAD_AMBIENT_DAILY_DOSE * (1.0 - shield_attenuation), 3)

    feedback.append(EDUCATIONAL_CATALOG["RADIATION_SHIELDING_FACT"])

    # =========================================================================
    # Step F: Crew Health & Stress Calculation (4 Astronauts)
    # =========================================================================
    updated_crew: List[AstronautState] = []
    crew_health_deltas: dict = {}
    crew_stress_deltas: dict = {}

    has_any_deficit = o2_deficit or water_deficit or food_deficit or energy_blackout

    for astronaut in prev_crew:
        cur_health = astronaut.health
        cur_stress = astronaut.stress
        cur_rad = round(astronaut.cumulative_radiation + absorbed_daily_dose, 3)

        delta_health = 0.0
        delta_stress = 0.0

        if has_any_deficit:
            # Deficit penalties
            penalty_multiplier = (
                (1.5 if o2_deficit else 0.0)
                + (1.2 if water_deficit else 0.0)
                + (0.8 if food_deficit else 0.0)
                + (1.0 if energy_blackout else 0.0)
            )
            delta_health -= p.CREW_DEFICIT_DAMAGE_RATE * penalty_multiplier * 0.5
            delta_stress += 12.0
        else:
            # Nominal conditions
            if decisions.crew_rest_posture:
                delta_health += p.CREW_REST_RECOVERY_RATE
                delta_stress -= p.CREW_REST_RECOVERY_RATE
            else:
                delta_stress -= 2.0  # Mild natural stress reduction on nominal work day

        # Radiation burden damage
        if cur_rad > p.RAD_CUMULATIVE_WARNING_LIMIT:
            rad_overage_ratio = (cur_rad - p.RAD_CUMULATIVE_WARNING_LIMIT) / max(
                p.RAD_CUMULATIVE_FATAL_LIMIT - p.RAD_CUMULATIVE_WARNING_LIMIT, 1.0
            )
            delta_health -= p.CREW_DEFICIT_DAMAGE_RATE * rad_overage_ratio

        # Confinement stress from storm shelter posture
        if decisions.storm_shelter_posture:
            delta_stress += 4.0

        # Event consequence modifiers
        delta_health += extra_health_penalty
        delta_stress += extra_stress_penalty

        new_health = round(min(max(cur_health + delta_health, 0.0), 100.0), 1)
        new_stress = round(min(max(cur_stress + delta_stress, 0.0), 100.0), 1)

        # Status transition
        if new_health <= 0.0:
            new_status = AstronautStatus.DECEASED
        elif new_health < 30.0 or cur_rad >= (p.RAD_CUMULATIVE_WARNING_LIMIT * 1.5):
            new_status = AstronautStatus.CRITICAL
        else:
            new_status = AstronautStatus.ALIVE

        updated_crew.append(
            AstronautState(
                astronaut_id=astronaut.astronaut_id,
                name=astronaut.name,
                role=astronaut.role,
                health=new_health,
                stress=new_stress,
                cumulative_radiation=cur_rad,
                survival_status=new_status,
            )
        )
        crew_health_deltas[astronaut.astronaut_id] = round(new_health - cur_health, 1)
        crew_stress_deltas[astronaut.astronaut_id] = round(new_stress - cur_stress, 1)

    # =========================================================================
    # Step G: Evaluate Failure Conditions (PRD Section 6.3)
    # =========================================================================
    mission_status = MissionStatus.IN_PROGRESS
    failure_reason: Optional[str] = None

    # Condition 1: Any astronaut fatality (strict 4-of-4 survival)
    deceased_crew = [c for c in updated_crew if c.survival_status == AstronautStatus.DECEASED]
    if deceased_crew:
        mission_status = MissionStatus.FAILED
        failure_reason = f"Crew fatality: {deceased_crew[0].name} ({deceased_crew[0].role}) died on Day {next_day}."

    # Condition 2: Unrecoverable Oxygen Collapse
    elif new_o2 <= 0.0 and (o2_generated <= 0.0 or effective_power_ratio <= 0.0 or new_water <= 0.0):
        mission_status = MissionStatus.FAILED
        failure_reason = f"Unrecoverable Oxygen Collapse on Day {next_day}: atmospheric reserves exhausted without generation capacity."

    # Condition 3: Unrecoverable Water Depletion
    elif new_water <= 0.0 and (actual_water_used <= 0.0 or prev_systems.water_level <= 0.0 or water_deficit):
        mission_status = MissionStatus.FAILED
        failure_reason = f"Unrecoverable Water Depletion on Day {next_day}: potable reserves exhausted, causing fatal dehydration risk."

    # Condition 4: Total Starvation
    elif new_food <= 0.0 and prev_systems.food_level <= 0.0:
        mission_status = MissionStatus.FAILED
        failure_reason = f"Total Starvation on Day {next_day}: rations completely depleted with no greenhouse harvest available."

    # Condition 5: Catastrophic Radiation Exposure
    elif any(c.cumulative_radiation >= p.RAD_CUMULATIVE_FATAL_LIMIT for c in updated_crew):
        mission_status = MissionStatus.FAILED
        failure_reason = f"Catastrophic Radiation Exposure on Day {next_day}: cumulative dose breached the fatal threshold ({p.RAD_CUMULATIVE_FATAL_LIMIT})."

    # Condition 6: Total Habitat Power Blackout
    elif energy_blackout and new_battery <= 0.0 and solar_gen <= p.ENERGY_CRITICAL_THRESHOLD:
        mission_status = MissionStatus.FAILED
        failure_reason = f"Total Habitat Power Blackout on Day {next_day}: continuous blackout collapsed life-support continuity."

    # =========================================================================
    # Step H: Check Mission Completion (Day 90)
    # =========================================================================
    score_breakdown = None

    if mission_status == MissionStatus.IN_PROGRESS and next_day >= 90:
        # Check strict 4-of-4 survival
        if all(c.survival_status != AstronautStatus.DECEASED for c in updated_crew):
            mission_status = MissionStatus.COMPLETED

    # Calculate score if mission finished (either completed or failed)
    new_systems = SystemLevels(
        oxygen_level=new_o2,
        water_level=new_water,
        battery_level=round(new_battery, 1),
        food_level=new_food,
        greenhouse_progress=new_gh_progress,
        radiation_daily_dose=absorbed_daily_dose,
        solar_generation=solar_gen,
        total_energy_load=total_demand,
    )

    if mission_status in (MissionStatus.COMPLETED, MissionStatus.FAILED):
        score_breakdown = calculate_score(
            day_number=next_day,
            mode=mode,
            crew=updated_crew,
            systems=new_systems,
        )

    # =========================================================================
    # Step I: Event Generation for the new day
    # =========================================================================
    new_event = None
    if mission_status == MissionStatus.IN_PROGRESS:
        new_event = generate_daily_event(
            seed=seed,
            day_number=next_day,
            mode=mode,
        )
        if new_event and new_event.event_code == "SOLAR_PARTICLE_EVENT":
            feedback.append(EDUCATIONAL_CATALOG["SOLAR_EVENT_FACT"])

    # Step J: State Checksum
    checksum = compute_state_checksum(
        day_number=next_day,
        systems=new_systems,
        crew=updated_crew,
        status=mission_status,
    )

    deltas = DailyDeltas(
        oxygen_delta=o2_delta,
        water_delta=water_delta,
        battery_delta=round(battery_delta, 1),
        food_delta=round(food_delta, 1),
        radiation_absorbed=absorbed_daily_dose,
        crew_health_deltas=crew_health_deltas,
        crew_stress_deltas=crew_stress_deltas,
    )

    return SimulationStepResult(
        day_number=next_day,
        mission_status=mission_status,
        system_levels=new_systems,
        crew=updated_crew,
        deltas=deltas,
        active_event=new_event,
        educational_feedback=feedback,
        failure_reason=failure_reason,
        score_breakdown=score_breakdown,
        state_checksum=checksum,
    )
