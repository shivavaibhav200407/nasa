"""ASTRA Event System.

Generates deterministic environmental events and equipment failures scaled by difficulty mode.
Categorizes events into:
- Informational alerts (requires_decision=False, non-blocking dashboard alerts)
- Emergency decisions (requires_decision=True, blocks the next day until resolved on SCR-05)
All randomness is derived deterministically from the mission seed and step index.
"""

import hashlib
import random
from typing import List, Optional
from ..config import parameters as p
from .types import (
    ActiveEvent,
    DifficultyMode,
    EventCategory,
    EventOption,
    EventResolutionStatus,
    EventSeverity,
)


# Definitions of possible events
def _get_event_templates() -> List[dict]:
    return [
        {
            "event_code": "SOLAR_PARTICLE_EVENT",
            "title": "Solar Particle Radiation Surge",
            "category": EventCategory.ENVIRONMENTAL,
            "description": (
                "Orbital space weather sensors detect an energetic solar particle surge sweeping across the lunar surface. "
                "Ionizing radiation flux is sharply elevated above ambient levels."
            ),
            "severity": EventSeverity.SEVERE,
            "affected_systems": ["Radiation Safety", "Energy", "Crew Health"],
            "requires_decision": True,
            "options": [
                EventOption(
                    option_id="SHELTER_MAX",
                    title="Enforce Immediate Storm Shelter Lockdown",
                    description="Move all four astronauts to the inner core shelter and activate auxiliary deflector coils.",
                    trade_offs_summary="Maximized radiation shielding; draws additional battery energy and increases crew stress.",
                    energy_cost=15.0,
                    stress_impact=8.0,
                    health_impact=0.0,
                ),
                EventOption(
                    option_id="SHELTER_STANDARD",
                    title="Standard Structural Shelter Protocol",
                    description="Direct crew to habit modules with baseline passive shielding without powering active coils.",
                    trade_offs_summary="Zero auxiliary power draw; modest crew radiation absorption penalty.",
                    energy_cost=0.0,
                    stress_impact=3.0,
                    health_impact=-4.0,
                ),
            ],
        },
        {
            "event_code": "WATER_FILTER_FOULING",
            "title": "Water Recycling Loop Filter Clogging",
            "category": EventCategory.EQUIPMENT_FAILURE,
            "description": (
                "Particulate build-up in the primary greywater distillation manifold is restricting throughput, "
                "reducing potable water recovery efficiency."
            ),
            "severity": EventSeverity.MODERATE,
            "affected_systems": ["Water", "Crew Health"],
            "requires_decision": True,
            "options": [
                EventOption(
                    option_id="FILTER_FLUSH",
                    title="Execute Chemical Flush & Filter Purge",
                    description="Perform an automated high-temperature purge to clear the filtration membrane.",
                    trade_offs_summary="Consumes potable water feedstock and electrical energy to fully restore recycling.",
                    water_cost=6.0,
                    energy_cost=8.0,
                    repaired_system="Water",
                ),
                EventOption(
                    option_id="MANUAL_CLEAN",
                    title="Assign Crew Manual Maintenance Overhaul",
                    description="Task two astronauts to manually disassemble, clean, and reseal the clogged filter.",
                    trade_offs_summary="Saves water; increases crew fatigue and temporary stress while restoring filter.",
                    water_cost=0.0,
                    energy_cost=2.0,
                    stress_impact=10.0,
                    repaired_system="Water",
                ),
            ],
        },
        {
            "event_code": "DUST_ACCUMULATION",
            "title": "Electrostatic Lunar Dust on Solar Arrays",
            "category": EventCategory.ENVIRONMENTAL,
            "description": (
                "Fine lunar regolith dust has settled across photovoltaic panels, reducing daily solar generation output."
            ),
            "severity": EventSeverity.MODERATE,
            "affected_systems": ["Energy"],
            "requires_decision": True,
            "options": [
                EventOption(
                    option_id="ELECTROSTATIC_REPULSION",
                    title="Activate High-Voltage Array Dust Sweepers",
                    description="Pulse the array's electrostatic repellent grids to dislodge accumulated dust.",
                    trade_offs_summary="Consumes battery reserve immediately to restore full solar generation capacity.",
                    energy_cost=12.0,
                    repaired_system="Energy",
                ),
                EventOption(
                    option_id="ACCEPT_DERATING",
                    title="Operate with Derated Solar Efficiency",
                    description="Postpone cleaning and adjust daily power budgets to match lowered incoming generation.",
                    trade_offs_summary="No upfront battery cost; generation remains depressed until cleared.",
                    energy_cost=0.0,
                    stress_impact=2.0,
                ),
            ],
        },
        {
            "event_code": "O2_SCRUBBER_FAULT",
            "title": "CO2 Scrubber Chemical Bed Saturation",
            "category": EventCategory.EQUIPMENT_FAILURE,
            "description": (
                "Secondary amine scrubbing canisters are saturating faster than expected, restricting CO2 removal."
            ),
            "severity": EventSeverity.SEVERE,
            "affected_systems": ["Oxygen", "Crew Health"],
            "requires_decision": True,
            "options": [
                EventOption(
                    option_id="REGEN_SCRUBBER",
                    title="Thermal Desorption Scrubber Regeneration",
                    description="Run an intensive heating cycle to desorb CO2 and restore amine bed capacity.",
                    trade_offs_summary="Consumes substantial electrical energy; restores full scrubbing performance.",
                    energy_cost=14.0,
                    repaired_system="Oxygen",
                ),
                EventOption(
                    option_id="BACKUP_CANISTERS",
                    title="Deploy Disposable Backup Lithium Hydroxide Canisters",
                    description="Switch to consumable backup chemical canisters to capture CO2 without power drain.",
                    trade_offs_summary="No energy required; consumes stored reserve materials and elevates crew workload.",
                    energy_cost=0.0,
                    stress_impact=6.0,
                    repaired_system="Oxygen",
                ),
            ],
        },
        {
            "event_code": "GREENHOUSE_PUMP_GLITCH",
            "title": "Hydroponic Nutrient Pump Intermittent Flow",
            "category": EventCategory.EQUIPMENT_FAILURE,
            "description": (
                "A pressure valve in the greenhouse nutrient solution manifold is sticking, risking dry crop roots."
            ),
            "severity": EventSeverity.MINOR,
            "affected_systems": ["Food"],
            "requires_decision": False,  # Informational alert, non-blocking
            "options": [],
        },
        {
            "event_code": "THERMAL_DIP",
            "title": "Lunar Night Surface Thermal Drop",
            "category": EventCategory.ENVIRONMENTAL,
            "description": (
                "Surface ambient temperature has dropped during the lunar night cycle. Habitat thermal heaters "
                "are maintaining nominal internal cabin conditions."
            ),
            "severity": EventSeverity.MINOR,
            "affected_systems": ["Energy"],
            "requires_decision": False,  # Informational alert, non-blocking
            "options": [],
        },
    ]


def generate_daily_event(
    seed: str,
    day_number: int,
    mode: DifficultyMode,
    active_equipment_faults: Optional[List[str]] = None,
) -> Optional[ActiveEvent]:
    """Deterministically evaluate whether an event occurs on day_number.

    Derives PRNG state strictly from (seed, day_number) to ensure 100% determinism.
    """
    # Deterministic local PRNG instance
    rng_key = f"{seed}:event:day_{day_number}"
    rng = random.Random(rng_key)

    # Check event probability based on mode
    prob = (
        p.EVENT_PROBABILITY_EXPLORER
        if mode == DifficultyMode.EXPLORER
        else p.EVENT_PROBABILITY_COMMANDER
    )

    roll = rng.random()
    if roll > prob:
        return None  # Nominal day without an event

    # Filter templates based on mode constraints
    templates = _get_event_templates()
    if mode == DifficultyMode.EXPLORER:
        # Explorer favors Minor and Moderate, avoiding severe stacking
        weighted_templates = [
            t for t in templates if t["severity"] in (EventSeverity.MINOR, EventSeverity.MODERATE)
        ]
        if not weighted_templates:
            weighted_templates = templates
    else:
        # Commander includes Severe emergencies with full likelihood
        weighted_templates = templates

    chosen_template = rng.choice(weighted_templates)

    seed_hash = hashlib.sha256(f"{seed}:{day_number}".encode()).hexdigest()[:8]
    event_id = f"evt_{day_number}_{chosen_template['event_code'].lower()}_{seed_hash}"
    return ActiveEvent(
        event_id=event_id,
        day_number=day_number,
        category=chosen_template["category"],
        event_code=chosen_template["event_code"],
        title=chosen_template["title"],
        description=chosen_template["description"],
        severity=chosen_template["severity"],
        affected_systems=list(chosen_template["affected_systems"]),
        requires_decision=chosen_template["requires_decision"],
        options=[
            EventOption(
                option_id=opt.option_id,
                title=opt.title,
                description=opt.description,
                trade_offs_summary=opt.trade_offs_summary,
                energy_cost=opt.energy_cost,
                water_cost=opt.water_cost,
                food_cost=opt.food_cost,
                stress_impact=opt.stress_impact,
                health_impact=opt.health_impact,
                repaired_system=opt.repaired_system,
            )
            for opt in chosen_template["options"]
        ],
        resolution_status=(
            EventResolutionStatus.RESOLVED
            if not chosen_template["requires_decision"]
            else EventResolutionStatus.PENDING
        ),
        chosen_option_id=None,
        outcome_summary=(
            "Informational telemetry alert noted by Mission Control."
            if not chosen_template["requires_decision"]
            else None
        ),
    )
