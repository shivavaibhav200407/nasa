"""ASTRA Parameter Register.

All simulation constants, rates, thresholds, and scoring weights are defined here.
Per project requirements:
- All values here are working gameplay tuning placeholders.
- The simulation engine reads balance numbers ONLY from this file.
"""

# ==============================================================================
# 1. Oxygen System
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
O2_INITIAL_RESERVE: float = 120.0

# PLACEHOLDER: gameplay tuning value, not real scientific data
O2_CREW_CONSUMPTION_PER_DAY: float = 2.0  # 0.5 per astronaut for 4 crew members

# PLACEHOLDER: gameplay tuning value, not real scientific data
O2_GENERATION_MAX_RATE: float = 4.0  # Max daily O2 produced at 100% power and water feed

# PLACEHOLDER: gameplay tuning value, not real scientific data
O2_CRITICAL_THRESHOLD: float = 15.0  # Hypoxia alert and crew health decline threshold


# ==============================================================================
# 2. Water System
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
WATER_INITIAL_RESERVE: float = 350.0

# PLACEHOLDER: gameplay tuning value, not real scientific data
WATER_CREW_CONSUMPTION_PER_DAY: float = 4.0  # 1.0 per astronaut for 4 crew members

# PLACEHOLDER: gameplay tuning value, not real scientific data
WATER_RECYCLING_EFFICIENCY: float = 0.90  # Fraction recovered per cycle (strictly imperfect)

# PLACEHOLDER: gameplay tuning value, not real scientific data
WATER_RECYCLING_LOSS_RATE: float = 0.10  # Irreversible loss fraction (1.0 - efficiency)

# PLACEHOLDER: gameplay tuning value, not real scientific data
WATER_CRITICAL_THRESHOLD: float = 20.0  # Dehydration alert and crew health decline threshold


# ==============================================================================
# 3. Energy System
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
ENERGY_SOLAR_DAY_OUTPUT: float = 65.0  # Daily solar generation in lunar daylight

# PLACEHOLDER: gameplay tuning value, not real scientific data
ENERGY_SOLAR_NIGHT_OUTPUT: float = 10.0  # Generation during lunar darkness / dust obscuration

# PLACEHOLDER: gameplay tuning value, not real scientific data
ENERGY_BATTERY_CAPACITY: float = 120.0  # Maximum energy storable in outpost batteries

# PLACEHOLDER: gameplay tuning value, not real scientific data
ENERGY_BASE_HABITAT_LOAD: float = 15.0  # Mandatory baseline load for thermal and life support avionics

# PLACEHOLDER: gameplay tuning value, not real scientific data
ENERGY_CRITICAL_THRESHOLD: float = 5.0  # Reserve floor triggering life-support blackout


# ==============================================================================
# 4. Food System
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
FOOD_INITIAL_STORED_SUPPLY: float = 240.0  # Initial packaged ration inventory on Day 1

# PLACEHOLDER: gameplay tuning value, not real scientific data
FOOD_CREW_CONSUMPTION_PER_DAY: float = 4.0  # 1.0 ration per astronaut per day

# PLACEHOLDER: gameplay tuning value, not real scientific data
FOOD_CRITICAL_THRESHOLD: float = 20.0  # Malnutrition alert and starvation decline threshold

# PLACEHOLDER: gameplay tuning value, not real scientific data
GREENHOUSE_WATER_DEMAND: float = 2.0  # Daily water needed when greenhouse is active

# PLACEHOLDER: gameplay tuning value, not real scientific data
GREENHOUSE_ENERGY_DEMAND: float = 10.0  # Daily electrical load for greenhouse grow lights

# PLACEHOLDER: gameplay tuning value, not real scientific data
GREENHOUSE_GROWTH_CYCLE_DAYS: int = 15  # Consecutive healthy growth days required for harvest

# PLACEHOLDER: gameplay tuning value, not real scientific data
GREENHOUSE_HARVEST_YIELD: float = 40.0  # Rations produced per completed harvest cycle


# ==============================================================================
# 5. Radiation Safety System
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
RAD_AMBIENT_DAILY_DOSE: float = 1.0  # Background lunar cosmic radiation dose before shielding

# PLACEHOLDER: gameplay tuning value, not real scientific data
RAD_PASSIVE_SHIELD_FACTOR: float = 0.50  # Baseline habitat attenuation (50% absorbed; never 0)

# PLACEHOLDER: gameplay tuning value, not real scientific data
RAD_SHELTER_SHIELD_FACTOR: float = 0.80  # Storm shelter attenuation (80% attenuated; 20% absorbed)

# PLACEHOLDER: gameplay tuning value, not real scientific data
RAD_SOLAR_EVENT_DOSE_SPIKE: float = 25.0  # Unshielded dose spike during a Solar Particle Event

# PLACEHOLDER: gameplay tuning value, not real scientific data
RAD_CUMULATIVE_WARNING_LIMIT: float = 45.0  # Radiation warning limit for crew monitoring

# PLACEHOLDER: gameplay tuning value, not real scientific data
RAD_CUMULATIVE_FATAL_LIMIT: float = 100.0  # Cumulative dose threshold causing fatal radiation sickness


# ==============================================================================
# 6. Crew Health System
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
CREW_INITIAL_HEALTH: float = 100.0  # Starting health per astronaut on Day 1 (max 100.0)

# PLACEHOLDER: gameplay tuning value, not real scientific data
CREW_INITIAL_STRESS: float = 15.0  # Starting stress level per astronaut on Day 1 (0-100 scale)

# PLACEHOLDER: gameplay tuning value, not real scientific data
CREW_REST_RECOVERY_RATE: float = 6.0  # Health and stress recovery per rest-scheduled day

# PLACEHOLDER: gameplay tuning value, not real scientific data
CREW_DEFICIT_DAMAGE_RATE: float = 15.0  # Health penalty per day under severe resource deficits


# ==============================================================================
# 7. Events & Difficulty
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
EVENT_PROBABILITY_EXPLORER: float = 0.20  # Base daily event chance in Explorer Mode

# PLACEHOLDER: gameplay tuning value, not real scientific data
EVENT_PROBABILITY_COMMANDER: float = 0.40  # Base daily event chance in Commander Mode

# PLACEHOLDER: gameplay tuning value, not real scientific data
MODE_CONSTRAINT_SCALING: float = 1.25  # Commander Mode tightness multiplier on reserves & stress


# ==============================================================================
# 8. Scoring Model Weights
# ==============================================================================
# PLACEHOLDER: gameplay tuning value, not real scientific data
SCORE_WEIGHT_CREW_SURVIVAL: float = 400.0  # Maximum points for 4-astronaut survival

# PLACEHOLDER: gameplay tuning value, not real scientific data
SCORE_WEIGHT_DURATION: float = 200.0  # Maximum points for completing 90 days

# PLACEHOLDER: gameplay tuning value, not real scientific data
SCORE_WEIGHT_RESOURCE_STEWARDSHIP: float = 150.0  # Points for sustainable final reserves

# PLACEHOLDER: gameplay tuning value, not real scientific data
SCORE_WEIGHT_RADIATION_SAFETY: float = 100.0  # Points for keeping cumulative radiation low

# PLACEHOLDER: gameplay tuning value, not real scientific data
SCORE_WEIGHT_DECISION_QUALITY: float = 150.0  # Points for effective emergency resolutions

# PLACEHOLDER: gameplay tuning value, not real scientific data
SCORE_DIFFICULTY_MULTIPLIER: float = 1.25  # Score multiplier bonus applied to Commander Mode
