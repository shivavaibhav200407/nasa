# Product Requirements Document: ASTRA – Junior Astronaut Mission Trainer

| Document Control | Value |
| :--- | :--- |
| **Product Name** | ASTRA – Junior Astronaut Mission Trainer |
| **Document Version** | 1.0 |
| **Status** | Draft |
| **Date** | 2026-11-12 |
| **Competition Context** | 2026 NASA Space Apps Challenge Entry |
| **Independence Notice** | ASTRA is an independent educational software project. It is not affiliated with, endorsed by, or certified by NASA. |

---

## 1. Executive Summary

**ASTRA – Junior Astronaut Mission Trainer** is an interactive 2D/2.5D web-based space mission simulation designed for beginner and intermediate STEM students. Casting the student as the Mission Commander of a lunar research outpost, ASTRA challenges the player to keep a crew of four astronauts alive across a 90-day mission by managing six tightly coupled survival and engineering systems: Oxygen, Water, Energy, Food, Radiation Safety, and Crew Health.

Unlike arcade resource games that simplify survival into isolated counters, ASTRA models realistic cause-and-effect relationships—such as imperfect water recovery, energy-dependent life support, resource- and time-dependent greenhouse food production, and partial radiation shielding—using a deterministic Python simulation backend and a clean, game-like React frontend. Students choose between **Explorer Mode** (guided scaffolding with educational explanations) and **Commander Mode** (tighter constraints, higher uncertainty, and stricter trade-offs), advancing day by day while responding to environmental hazards and equipment failures.

This document defines the complete Minimum Viable Product (MVP) specification so that a frontend developer, backend developer, and UI/UX designer can execute implementation independently and consistently.

---

## 2. Problem Statement

Beginner and intermediate STEM students often encounter space science, closed-loop life support, and systems engineering as disconnected textbook topics—chemistry for oxygen, physics for solar power, biology for nutrition, and health science for radiation—without seeing how decisions in one domain cascade across an entire habitat.

Existing educational materials suffer from three gaps:
1. **Passive consumption:** Static readings and videos do not allow students to test trade-offs, experience scarcity, or observe delayed consequences.
2. **Oversimplified or opaque tools:** Many browser games ignore physical conservation and system coupling, teaching misconceptions (such as effortless 100% recycling), while professional engineering simulators are inaccessible to younger learners.
3. **Weak feedback loops:** Learners rarely receive immediate, context-specific explanations connecting an engineering choice (e.g., cutting power to water recovery) to both its downstream operational failure and the underlying scientific principle.

ASTRA addresses these gaps by providing an approachable, deterministic, systems-thinking simulation tailored to STEM classrooms and self-directed learners.

---

## 3. Project Vision

ASTRA aims to make systems-level spaceflight engineering intuitive, engaging, and scientifically grounded for the next generation of explorers. By turning a 90-day lunar outpost survival challenge into a structured daily decision loop, ASTRA empowers students to think like mission commanders: reading telemetry, weighing competing priorities under resource constraints, mitigating unexpected emergencies, and learning real-world space habitat concepts through experimentation and reflection.

---

## 4. Target Audience

ASTRA serves two primary learner segments within beginner and intermediate STEM education, along with educators facilitating the experience.

| Segment | Profile | Needs & Expectations | Recommended Mode |
| :--- | :--- | :--- | :--- |
| **Beginner STEM Students** | Middle school to early high school learners with introductory science knowledge and limited simulation experience. | Clear plain-language telemetry, guided step-by-step hints, forgiving margins, and immediate explanations of cause and effect. | Explorer Mode |
| **Intermediate STEM Students** | High school learners, STEM club participants, or Space Apps youth learners comfortable with multi-variable trade-offs. | Meaningful resource scarcity, complex cross-system dependencies, unexpected emergencies, and performance scoring for replayability. | Commander Mode (after optional Explorer run) |
| **Educators / Facilitators** (Secondary) | Teachers or club mentors assigning ASTRA as an interactive lab or challenge. | Reliable browser access with zero installation, deterministic repeatable scenarios, clear end-of-mission reports, and scientifically honest disclaimers. | Both Modes |

---

## 5. Mission Scenario

- **Setting:** An established surface research habitat (**Lunar Outpost**) operating in a harsh lunar environment characterized by vacuum, extreme thermal swings, micrometeoroid risk, and cosmic/solar radiation `[FACT]`.
- **Role:** The student serves as **Mission Commander**, responsible for daily operational and engineering decisions from Mission Control.
- **Crew:** **Four astronauts** living and working inside the outpost for the duration of the mission. Individual crew members share habitat life support while tracking individual health, stress, and cumulative radiation exposure `[GAMEPLAY ASSUMPTION]`.
- **Duration:** **90 mission days** (Day 1 through Day 90).
- **Primary Objective:** Manage finite reserves, energy generation, recycling, food production, shielding, and crew well-being so that all four astronauts survive to the end of Day 90.
- **Stakes:** Poor resource allocation, neglected maintenance, or unmitigated emergencies create cascading system deficits that can lead to early mission failure before Day 90.

---

## 6. Game Mechanics

### 6.1 Daily Gameplay Loop

ASTRA operates as a turn-based daily simulation where each turn represents one mission day from Day 1 through Day 90. All state calculations and event resolutions execute on the deterministic Python backend; the frontend presents state and collects player commands.

| Step | Loop Phase | Execution Side | Data Read | Data Written |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Inspect mission status** | Frontend (displays persisted backend state) | Current day index, mission status, difficulty mode, reserves and status for all 6 systems, individual crew health/stress/radiation states, active alerts, prior day log, historical time-series. | None (read-only inspection; UI view state only). |
| **2** | **Make engineering decisions** | Frontend (staged) -> Backend (validated on submit) | Subsystem operational states (life-support mode, water recycling state, greenhouse cultivation mode, shielding posture, crew schedule/rest posture), active equipment faults. | Staged engineering configuration payload (subsystem modes, repair/mitigation selections, crew posture flags). |
| **3** | **Allocate resources** | Frontend (staged) -> Backend (validated on submit) | Available energy generation forecast, battery reserve, water reserve, nutrient/ration reserve, subsystem demand ceilings. | Staged allocation directives (electrical power distribution across subsystems, water routing between crew vs. greenhouse, food ration policy). |
| **4** | **Advance the mission by one day** | Frontend triggers -> Backend executes | Current mission state snapshot, deterministic RNG state/seed, player's submitted engineering decisions and resource allocations, active multi-day event modifiers. | Validated player decision record for the current day; day-advance lock to prevent duplicate turn submission. |
| **5** | **Calculate resource changes** | Backend Simulation Engine | Previous day's resource reserves, crew headcount/status, validated engineering decisions and power/water allocations, difficulty parameters from Parameter Register, active event modifiers. | Updated levels for Energy (generation, consumption, battery charge/discharge), Oxygen, Water (consumption, imperfect recycling loss), Food (ration drawdown, greenhouse growth/harvest), Radiation cumulative dose, and Crew Health/Stress. |
| **6** | **Generate environmental events or equipment failures** | Backend Simulation Engine | Current mission day, difficulty mode, seeded PRNG state, subsystem stress/wear indicators, active environmental modifiers. | Newly triggered environmental event or equipment failure record (category, severity tier, affected systems, required player response options), or confirmation of a nominal day. |
| **7** | **Display consequences** | Backend persists -> Frontend displays | Daily delta calculations, updated system statuses, triggered events, crew state changes, failure/completion check result, educational feedback rules. | Daily Mission Log entry (persisted in SQLite); UI presentation of day summary, warnings, event modal/view, and educational explanation cards. |
| **8** | **Continue until Day 90 or mission failure** | Backend evaluates -> Frontend routes | Updated crew survival statuses, critical life-support failure flags, current day index relative to Day 90. | Mission status transition (`IN_PROGRESS`, `FAILED`, or `COMPLETED`); if ended, final score calculation and Mission Report record. |

### 6.2 Difficulty Modes

Students select a difficulty mode during Mission Setup before Day 1 begins. The mode cannot be changed mid-mission so that scoring and historical logs remain consistent `[GAMEPLAY ASSUMPTION]`.

| Dimension | Explorer Mode | Commander Mode |
| :--- | :--- | :--- |
| **Target Learner** | Beginner STEM students and first-time players. | Intermediate STEM students and repeat players seeking mastery. |
| **Interface & Guidance** | Guided onboarding prompts, contextual tooltips, highlighted bottleneck warnings, and suggested action hints before advancing a day. | Clean Mission Control telemetry without prescriptive hints or action suggestions. |
| **Starting Reserves & Constraints** | Generous initial supply buffers and lower baseline degradation rates (`TBD` via Parameter Register). | Tighter initial reserves and stricter resource constraints requiring proactive balancing. |
| **Resource Dependencies** | Simplified coupling presentation with clear cause-and-effect previews before confirming allocations. | Full multi-system dependency pressure where secondary cascading effects surface rapidly if margins slip. |
| **Event Frequency & Severity** | Lower event occurrence rate, gentler severity tiers, and clearer recovery paths. | Unexpected emergencies, higher severity impacts, and potential overlapping stressors. |
| **Consequences of Poor Decisions** | Gradual warning states allow recovery over subsequent days before reaching failure thresholds. | Rapid deterioration with sharper penalties to reserves, equipment health, and crew survival. |
| **Educational Feedback** | Automatically displayed, beginner-friendly explanations after every key decision, event, and day transition. | Concise post-decision debriefs available on demand and highlighted in the end-of-mission analysis. |

### 6.3 Failure Conditions

A mission ends early (prior to completing Day 90) whenever crew survival becomes impossible or any astronaut dies. Failure detection is evaluated deterministically by the backend at the end of Step 5 (daily resource calculation) and after unresolved emergency consequences in Step 6.

| Failure Condition | Triggering Cause (Conceptual) | Detection Mechanism |
| :--- | :--- | :--- |
| **Crew Fatality (Any Astronaut)** | An astronaut's health falls to zero due to hypoxia, dehydration, starvation, acute or cumulative radiation injury, or untreated severe stress/illness `[GAMEPLAY ASSUMPTION]`. | Backend evaluates each of the four astronaut health records at day resolution; if any crew member's survival status transitions to deceased, mission status immediately becomes `FAILED`. |
| **Unrecoverable Oxygen Collapse** | Oxygen reserves reach depletion (`O2_CRITICAL_THRESHOLD`) while power or hardware faults prevent oxygen generation from restoring breathable atmosphere before crew survival threshold is breached `[GAMEPLAY ASSUMPTION]`. | Backend checks oxygen reserve against survival threshold during daily life-support calculation; sustained depletion triggers acute crew health collapse and immediate mission failure. |
| **Unrecoverable Water Depletion** | Stored water drops to depletion (`WATER_CRITICAL_THRESHOLD`) with recycling offline or insufficient energy to recover moisture, resulting in fatal crew dehydration `[GAMEPLAY ASSUMPTION]`. | Backend checks net water availability after crew demand and recycling; unrecoverable potable water depletion triggers rapid dehydration health loss and mission failure upon fatality. |
| **Total Starvation** | Stored rations and greenhouse yield are exhausted (`FOOD_CRITICAL_THRESHOLD`) beyond the crew's survival tolerance `[GAMEPLAY ASSUMPTION]`. | Backend evaluates daily caloric/ration satisfaction; prolonged deficit days deplete crew health until fatality triggers failure. |
| **Catastrophic Radiation Exposure** | Cumulative or acute radiation dose exceeds the crew survival limit (`RAD_CUMULATIVE_FATAL_LIMIT`) due to unmitigated solar particle events or inadequate shielding `[GAMEPLAY ASSUMPTION]`. | Backend compares each astronaut's cumulative radiation exposure against the fatal dose threshold; exceeding the threshold triggers acute radiation failure. |
| **Total Habitat Power Blackout (Cascading)** | Energy generation and battery reserves drop below life-support continuity (`ENERGY_CRITICAL_THRESHOLD`), shutting down oxygen generation, thermal control, and water recovery `[GAMEPLAY ASSUMPTION]`. | Backend detects insufficient available power across life-support loops; resulting oxygen/thermal loss drives crew health to failure if backup power cannot be restored within survival limits. |

*Note: All numeric thresholds referenced above are governed by named placeholders in the Section 7 Parameter Register (`Value: TBD`).*

### 6.4 Event System

During Step 6 of the daily loop, the deterministic simulation engine evaluates whether an environmental event or equipment failure occurs based on the mission seed, day index, difficulty mode, and current outpost wear/exposure state `[GAMEPLAY ASSUMPTION]`.

- **Event Categories:**
  1. **Environmental Events:** External lunar hazards beyond direct crew control, such as **Solar Particle Events (radiation spikes)**, **Extended Lunar Night / Dust Electrostatic Interference (reduced solar input)**, **Micrometeoroid Impacts (hull or solar array damage)**, and **Extreme Thermal Shifts (increased habitat heating/cooling demand)**.
  2. **Equipment Failures:** Internal subsystem faults driven by continuous operation or deferred maintenance, such as **Oxygen Scrubber/Electrolyzer Degradation**, **Water Recycling Filter Fouling**, **Battery Cell Fault**, **Greenhouse Lighting/Irrigation Malfunction**, and **Radiation Shelter Seal Fault**.
- **Severity Tiers:** Events are classified conceptually into three tiers—**Minor** (localized efficiency loss or temporary warning), **Moderate** (noticeable reserve drain or subsystem output reduction requiring resource reallocation), and **Severe** (critical subsystem outage or acute hazard requiring immediate emergency action and trade-offs).
- **Mode Differences:**
  - In **Explorer Mode**, events occur less frequently, favor Minor and Moderate tiers, avoid simultaneous stacked Severe crises, and include guided impact previews explaining which system is threatened and why.
  - In **Commander Mode**, events occur with higher probability, include Severe emergencies, can compound existing resource deficits, and require the student to diagnose subsystem dependencies without guided recommendations.

### 6.5 Scoring Model

Upon completing Day 90 (or at mission failure for diagnostic comparison), the backend computes a transparent final score summarizing the student's performance as Mission Commander. All scoring factor weights are stored as named placeholders in the Section 7 Parameter Register (`Value: TBD`) so they can be calibrated without modifying UI logic.

| Scoring Factor | What It Measures | Placeholder Weight (Parameter Register) |
| :--- | :--- | :--- |
| **Crew Survival & Health** | Number of astronauts alive at mission end (four required for mission success) and average final crew health and stress stability. | `SCORE_WEIGHT_CREW_SURVIVAL` |
| **Mission Duration Progress** | Total days survived out of 90 (full credit on Day 90 completion; partial progress recorded on early failure). | `SCORE_WEIGHT_DURATION` |
| **Resource Stewardship** | Ending balance and stability of Oxygen, Water, Energy, and Food reserves, rewarding sustainable closed-loop management without reckless depletion. | `SCORE_WEIGHT_RESOURCE_STEWARDSHIP` |
| **Radiation Protection** | Keeping cumulative crew radiation exposure safely below mission limits through timely shielding actions. | `SCORE_WEIGHT_RADIATION_SAFETY` |
| **Decision & Emergency Quality** | Effectiveness of engineering trade-offs, minimal preventable emergency damage, and timely responses to events. | `SCORE_WEIGHT_DECISION_QUALITY` |
| **Difficulty Multiplier** | Optional scaling recognition distinguishing Commander Mode achievements from Explorer Mode runs. | `SCORE_DIFFICULTY_MULTIPLIER` |

### 6.6 Educational Feedback

Educational feedback is a core learning mechanism rather than a passive glossary:
- **When Feedback Appears:**
  1. **After Allocation & Day Resolution (Step 7):** When a player's decision causes a notable shift (e.g., under-powering water recycling, neglecting greenhouse water, or activating storm shielding), the daily summary surfaces a concise **"Why This Happened"** card tying the outcome to the underlying STEM concept.
  2. **During Emergency Events (Step 6):** Event cards explain the real-world physical phenomenon behind the hazard (e.g., why solar particle events raise radiation risk on the Moon `[FACT]`) and how each response option trades off resources.
  3. **End-of-Mission Debrief (Mission Report):** The final report highlights the top positive engineering habits and key turning-point mistakes with tailored scientific takeaways.
- **Mode Behavior:** In **Explorer Mode**, educational cards expand automatically after decisions and events; in **Commander Mode**, concise tags appear in the daily log with an option to expand the full explanation so immersion is preserved while learning remains accessible.

### 6.7 Save and History

ASTRA persists mission state automatically after mission creation and after every completed day transition so students never lose progress across browser refreshes or class periods.
- **Stored Per Mission:** Unique mission ID, optional commander/outpost label, chosen difficulty mode (`Explorer` or `Commander`), deterministic random seed, start/last-updated timestamps, current mission status (`IN_PROGRESS`, `COMPLETED`, `FAILED`), current day index, failure reason (if failed), and final score breakdown (if ended).
- **Stored Per Day:** Day index (1–90), full snapshot of all six resource system states before and after resolution, individual states for all four astronauts, player engineering decisions and power/water allocations submitted for that day, any triggered event and chosen emergency response, daily educational feedback identifiers, and deterministic state checksum/hash for auditability.

---

## 7. Resource Systems

All scientific statements in this section are tagged as `[FACT]`, `[GAMEPLAY ASSUMPTION]`, or `[TO VERIFY]`. Numeric simulation constants are intentionally omitted and represented by named placeholders in the **Parameter Register** (Section 7.3).

### 7.1 System Specifications

#### 1. Oxygen System
- **Scientific Context:** Human crews continuously consume oxygen through respiration and exhale carbon dioxide, requiring both breathable oxygen supply and CO₂ removal in closed habitats `[FACT]`. On a lunar outpost, oxygen can be supplied from stored reserves and generated by splitting water via electrolysis or oxygen recovery hardware `[FACT]`.
- **Inputs:** Electrical energy from the Energy system, water feedstock (for electrolysis-based generation) `[FACT]`, and scrubber/generator operational allocation.
- **Outputs:** Breathable habitat oxygen added to reserves; consumption by the four astronauts; waste carbon dioxide load managed by scrubbers `[FACT]`.
- **Player Controls:** Set Oxygen Generation & Scrubbing priority/power level (e.g., Conservation, Nominal, High Output) and authorize emergency reserve draw or repairs during faults `[GAMEPLAY ASSUMPTION]`.
- **Failure Conditions:** Oxygen reserves dropping below safe partial-pressure levels causes acute crew hypoxia, rapid Crew Health decline, and early mission failure `[FACT]`.
- **Educational Concept Taught:** Closed-loop atmospheric management, metabolic demand, and the coupling between water, electrical energy, and breathable air.

#### 2. Water System
- **Scientific Context:** Water is essential for crew hydration, hygiene, oxygen electrolysis, and plant growth `[FACT]`. Space habitat water recovery systems reclaim wastewater, urine, and cabin humidity, but recovery is never 100% efficient—some water is inevitably lost as brine or unrecoverable waste `[FACT]`.
- **Inputs:** Initial stored potable water reserves, reclaimed greywater/condensate, and electrical energy powering filtration and distillation loops `[FACT]`.
- **Outputs:** Potable water for crew consumption, irrigation water routed to the Greenhouse (Food system), electrolysis feedstock (Oxygen system), and irreversible recycling loss (`WATER_RECYCLING_LOSS_RATE`) `[FACT]`.
- **Player Controls:** Allocate power to the Water Recycling unit, adjust greenhouse irrigation share, and enforce temporary water conservation policies during shortages `[GAMEPLAY ASSUMPTION]`.
- **Failure Conditions:** Potable water depletion prevents crew hydration and halts water-dependent oxygen generation and crop irrigation, leading to severe Crew Health loss and mission failure `[GAMEPLAY ASSUMPTION]`.
- **Educational Concept Taught:** Conservation of mass, imperfect recycling efficiency (real-world entropy/brine losses), and competing multi-system demand for a finite resource.

#### 3. Energy System
- **Scientific Context:** A lunar outpost relies primarily on solar photovoltaic arrays during lunar daylight and high-capacity batteries to sustain loads during darkness, dust interference, or peak demand `[FACT]`. Total energy consumed by active subsystems cannot exceed available generation plus battery discharge `[FACT]`.
- **Inputs:** Solar array illumination (affected by lunar daylight/night cycles `[FACT]`, dust/micrometeoroid damage, and array efficiency) and stored battery charge.
- **Outputs:** Electrical power distributed across Life Support (Oxygen/Thermal), Water Recycling, Greenhouse lighting/pumps, and Active Radiation/Shelter systems; excess generation charges batteries up to capacity `[GAMEPLAY ASSUMPTION]`.
- **Player Controls:** Allocate daily power budgets across subsystems, toggle non-essential loads into low-power mode, and manage battery reserve thresholds `[GAMEPLAY ASSUMPTION]`.
- **Failure Conditions:** Energy deficit forces brownouts or shutdowns of subordinate systems; zero power across batteries and generation causes total life-support collapse and mission failure `[GAMEPLAY ASSUMPTION]`.
- **Educational Concept Taught:** Energy balance, peak vs. baseline load management, energy storage limits, and prioritization under scarcity.

#### 4. Food System
- **Scientific Context:** Crews require consistent daily nutrition to maintain physical health and cognitive performance `[FACT]`. Packaged rations provide reliable baseline sustenance but deplete monotonically, whereas an onboard lunar greenhouse can supplement food over time only if supplied continuously with water, electrical lighting/thermal energy, and sufficient crop maturation time `[FACT]`.
- **Inputs:** Pre-packaged stored food supplies, greenhouse water allocation, greenhouse electrical energy (lighting and climate control), and multi-day crop growth cycles (`GREENHOUSE_GROWTH_CYCLE_DAYS`) `[GAMEPLAY ASSUMPTION]`.
- **Outputs:** Daily crew rations consumed by four astronauts and periodic fresh biomass harvests added to food availability `[GAMEPLAY ASSUMPTION]`.
- **Player Controls:** Set greenhouse cultivation active/standby status, allocate water and power to crops, and choose standard vs. reduced rationing during shortages `[GAMEPLAY ASSUMPTION]`.
- **Failure Conditions:** Depletion of stored rations without sufficient greenhouse harvest leads to malnutrition, falling Crew Health, rising stress, and eventual starvation failure `[GAMEPLAY ASSUMPTION]`.
- **Educational Concept Taught:** Long-term resource planning, delayed return on investment (biological growth time vs. immediate consumption), and agricultural resource trade-offs.

#### 5. Radiation Safety System
- **Scientific Context:** Beyond Earth's protective magnetosphere and dense atmosphere, the lunar surface is exposed to galactic cosmic rays and episodic solar particle events `[FACT]`. Habitat shielding reduces radiation exposure risk, but passive and operational shielding can never guarantee 100% protection `[FACT]`.
- **Inputs:** Ambient lunar radiation flux, episodic solar event intensity, structural shielding baseline, and optional active shelter/operational posture (powered shielding/storm shelter protocols) `[GAMEPLAY ASSUMPTION]`.
- **Outputs:** Attenuated daily radiation dose absorbed by each astronaut (always greater than zero under cosmic background `[FACT]`) and crew stress impacts when confined to storm shelter protocols `[GAMEPLAY ASSUMPTION]`.
- **Player Controls:** Toggle elevated Radiation Shelter Posture during solar alerts, allocate power to shielding/monitoring systems, and limit high-exposure EVA/maintenance activities during peak radiation `[GAMEPLAY ASSUMPTION]`.
- **Failure Conditions:** Cumulative exposure exceeding safe mission thresholds causes progressive Crew Health degradation; extreme unshielded solar events cause acute radiation injury and mission failure `[TO VERIFY]`.
- **Educational Concept Taught:** Risk mitigation versus total elimination, cumulative vs. acute environmental hazards, and trade-offs between crew safety and operational productivity.

#### 6. Crew Health System
- **Scientific Context:** Astronaut survival depends on physiological needs (oxygen, hydration, nutrition, radiation protection) as well as psychological well-being under confinement and workload stress `[FACT]`. High stress degrades task efficiency and amplifies vulnerability to health decline `[TO VERIFY]`.
- **Inputs:** Daily satisfaction levels of Oxygen, Water, Food, Radiation Safety, habitat comfort/thermal stability, and crew workload vs. rest scheduling `[GAMEPLAY ASSUMPTION]`.
- **Outputs:** Individual health score, stress level, cumulative radiation burden, and survival status (`ALIVE`, `CRITICAL`, `DECEASED`) for each of the four astronauts `[GAMEPLAY ASSUMPTION]`.
- **Player Controls:** Assign crew rest/recovery periods, authorize medical/counseling support (consuming minor power/water reserves), and balance repair workload against fatigue `[GAMEPLAY ASSUMPTION]`.
- **Failure Conditions:** If any astronaut's health drops to zero (due to life-support deficit, radiation, or severe unmitigated decline), that crew member dies and the mission ends immediately in failure `[GAMEPLAY ASSUMPTION]`.
- **Educational Concept Taught:** Human factors in spaceflight, holistic systems health (physical + psychological), and why engineering failures ultimately manifest as human risk.

### 7.2 Cross-System Dependency Matrix

The table below defines the conceptual coupling between all six systems without numeric values.

| When This System Changes (`X`) | Affected System (`Y`) | Conceptual Explanation ("When X changes, Y is affected because...") |
| :--- | :--- | :--- |
| **Energy** drops (e.g., lunar night or solar array damage) | **Oxygen, Water, Food, Radiation Safety** | When Energy drops, power-hungry life-support scrubbers, water recyclers, greenhouse grow lights, and active shelter systems cannot run at full capacity unless batteries cover the deficit `[GAMEPLAY ASSUMPTION]`. |
| **Water** reserves decline or recycling slows | **Oxygen, Food, Crew Health** | When Water declines, less water is available for electrolysis oxygen production and greenhouse crop irrigation, and severe shortages directly dehydrate the crew `[FACT]`. |
| **Oxygen** generation or scrubbing falls short | **Crew Health** | When Oxygen falls or CO₂ accumulates, crew physiological health deteriorates rapidly because human respiration cannot pause `[FACT]`. |
| **Food** greenhouse cultivation increases | **Water, Energy, Crew Health** | When Food cultivation increases, the greenhouse draws extra water and lighting energy over multiple days before yielding harvests that stabilize rations and boost crew morale/health `[GAMEPLAY ASSUMPTION]`. |
| **Radiation Safety** enters storm-shelter posture | **Energy, Crew Health** | When Radiation Safety enters high-protection posture, active shelter/environmental systems draw additional energy and crew confinement increases psychological stress while reducing radiation injury `[GAMEPLAY ASSUMPTION]`. |
| **Crew Health** / stress worsens | **Energy, Oxygen, Water, Food (Maintenance)** | When Crew Health drops or stress spikes, crew repair effectiveness decreases, delaying recovery from equipment failures across all engineered subsystems `[GAMEPLAY ASSUMPTION]`. |

### 7.3 Parameter Register

All numerical simulation constants, capacities, rates, thresholds, event probabilities, and scoring weights are externalized into this Parameter Register. **No arbitrary numbers are specified in this PRD; every parameter starts as `TBD` and must be calibrated from verified references during simulation balancing.**

| Parameter Name | System | What It Represents | Value Status |
| :--- | :--- | :--- | :--- |
| `O2_INITIAL_RESERVE` | Oxygen | Starting breathable oxygen reserve on Day 1. | Value: TBD, to be set from a verified source during balancing |
| `O2_CREW_CONSUMPTION_PER_DAY` | Oxygen | Baseline oxygen consumed per astronaut per day. | Value: TBD, to be set from a verified source during balancing |
| `O2_GENERATION_MAX_RATE` | Oxygen | Maximum daily oxygen produced by life support at full power and water feed. | Value: TBD, to be set from a verified source during balancing |
| `O2_CRITICAL_THRESHOLD` | Oxygen | Oxygen reserve level triggering critical warning and hypoxia health penalty. | Value: TBD, to be set from a verified source during balancing |
| `WATER_INITIAL_RESERVE` | Water | Starting potable water reserve on Day 1. | Value: TBD, to be set from a verified source during balancing |
| `WATER_CREW_CONSUMPTION_PER_DAY` | Water | Daily potable water required per astronaut for hydration and hygiene. | Value: TBD, to be set from a verified source during balancing |
| `WATER_RECYCLING_EFFICIENCY` | Water | Imperfect fraction of wastewater recovered per cycle (strictly less than complete recovery). | Value: TBD, to be set from a verified source during balancing |
| `WATER_RECYCLING_LOSS_RATE` | Water | Irreversible fraction lost as brine/unrecoverable waste each cycle. | Value: TBD, to be set from a verified source during balancing |
| `WATER_CRITICAL_THRESHOLD` | Water | Potable water level triggering dehydration warning and health penalty. | Value: TBD, to be set from a verified source during balancing |
| `ENERGY_SOLAR_DAY_OUTPUT` | Energy | Baseline daily solar generation during illuminated lunar phases. | Value: TBD, to be set from a verified source during balancing |
| `ENERGY_SOLAR_NIGHT_OUTPUT` | Energy | Reduced or zero solar generation during lunar night or heavy dust events. | Value: TBD, to be set from a verified source during balancing |
| `ENERGY_BATTERY_CAPACITY` | Energy | Maximum electrical energy storable in outpost batteries. | Value: TBD, to be set from a verified source during balancing |
| `ENERGY_BASE_HABITAT_LOAD` | Energy | Mandatory baseline electrical load for habitat thermal and core avionics. | Value: TBD, to be set from a verified source during balancing |
| `ENERGY_CRITICAL_THRESHOLD` | Energy | Minimum electrical availability floor below which life-support blackout occurs. | Value: TBD, to be set from a verified source during balancing |
| `FOOD_INITIAL_STORED_SUPPLY` | Food | Starting packaged food rations on Day 1. | Value: TBD, to be set from a verified source during balancing |
| `FOOD_CREW_CONSUMPTION_PER_DAY` | Food | Daily food ration consumed per astronaut. | Value: TBD, to be set from a verified source during balancing |
| `FOOD_CRITICAL_THRESHOLD` | Food | Food reserve floor triggering severe malnutrition health penalty and starvation failure progression. | Value: TBD, to be set from a verified source during balancing |
| `GREENHOUSE_WATER_DEMAND` | Food | Daily irrigation water required for active greenhouse growth. | Value: TBD, to be set from a verified source during balancing |
| `GREENHOUSE_ENERGY_DEMAND` | Food | Daily electrical power required for greenhouse lighting and climate control. | Value: TBD, to be set from a verified source during balancing |
| `GREENHOUSE_GROWTH_CYCLE_DAYS` | Food | Number of healthy growth days required before a greenhouse harvest matures. | Value: TBD, to be set from a verified source during balancing |
| `GREENHOUSE_HARVEST_YIELD` | Food | Food units produced upon completing a greenhouse growth cycle. | Value: TBD, to be set from a verified source during balancing |
| `RAD_AMBIENT_DAILY_DOSE` | Radiation Safety | Background lunar cosmic radiation dose per day before shielding attenuation. | Value: TBD, to be set from a verified source during balancing |
| `RAD_PASSIVE_SHIELD_FACTOR` | Radiation Safety | Fractional attenuation provided by baseline habitat structure (never complete protection). | Value: TBD, to be set from a verified source during balancing |
| `RAD_SHELTER_SHIELD_FACTOR` | Radiation Safety | Enhanced fractional attenuation when storm-shelter posture is active (still incomplete). | Value: TBD, to be set from a verified source during balancing |
| `RAD_SOLAR_EVENT_DOSE_SPIKE` | Radiation Safety | Additional unshielded radiation burden during a Solar Particle Event. | Value: TBD, to be set from a verified source during balancing |
| `RAD_CUMULATIVE_WARNING_LIMIT` | Radiation Safety | Cumulative dose threshold triggering medical alert. | Value: TBD, to be set from a verified source during balancing |
| `RAD_CUMULATIVE_FATAL_LIMIT` | Radiation Safety | Cumulative dose threshold causing acute radiation failure. | Value: TBD, to be set from a verified source during balancing |
| `CREW_INITIAL_HEALTH` | Crew Health | Starting health level for each astronaut on Day 1. | Value: TBD, to be set from a verified source during balancing |
| `CREW_INITIAL_STRESS` | Crew Health | Starting psychological stress level on Day 1. | Value: TBD, to be set from a verified source during balancing |
| `CREW_REST_RECOVERY_RATE` | Crew Health | Health and stress recovery gained per rest-focused day when life support is nominal. | Value: TBD, to be set from a verified source during balancing |
| `CREW_DEFICIT_DAMAGE_RATE` | Crew Health | Health loss applied per day when oxygen, water, or food falls below survival needs. | Value: TBD, to be set from a verified source during balancing |
| `EVENT_PROBABILITY_EXPLORER` | Events & Difficulty | Daily base probability of environmental/equipment events in Explorer Mode. | Value: TBD, to be set from a verified source during balancing |
| `EVENT_PROBABILITY_COMMANDER` | Events & Difficulty | Daily base probability of environmental/equipment events in Commander Mode. | Value: TBD, to be set from a verified source during balancing |
| `MODE_CONSTRAINT_SCALING` | Events & Difficulty | Difficulty scaling factor governing reserve buffers and degradation between modes. | Value: TBD, to be set from a verified source during balancing |
| `SCORE_WEIGHT_CREW_SURVIVAL` | Scoring | Weight of crew survival and final health in the overall mission score. | Value: TBD, to be set from a verified source during balancing |
| `SCORE_WEIGHT_DURATION` | Scoring | Weight of mission days survived out of 90 in the overall score. | Value: TBD, to be set from a verified source during balancing |
| `SCORE_WEIGHT_RESOURCE_STEWARDSHIP` | Scoring | Weight of final resource balance and sustainable reserves in the overall score. | Value: TBD, to be set from a verified source during balancing |
| `SCORE_WEIGHT_RADIATION_SAFETY` | Scoring | Weight of keeping cumulative crew radiation low in the overall score. | Value: TBD, to be set from a verified source during balancing |
| `SCORE_WEIGHT_DECISION_QUALITY` | Scoring | Weight of effective emergency handling and low preventable waste in the overall score. | Value: TBD, to be set from a verified source during balancing |
| `SCORE_DIFFICULTY_MULTIPLIER` | Scoring | Mode-based multiplier applied to recognize Commander Mode difficulty. | Value: TBD, to be set from a verified source during balancing |

---

## 8. User Journey

The end-to-end learner flow connects onboarding, daily systems decision-making, emergency response, and reflective debriefing:

1. **Discovery & Entry (`SCR-01` Landing Page):** The student lands on ASTRA, sees the premise ("Lead a 4-astronaut lunar outpost for 90 days"), reviews the independence disclaimer, and chooses to **Start New Mission**, **Resume Saved Mission** (if any active mission exists), or **View Mission History**.
2. **Configuration (`SCR-02` Mission Setup):** The student optionally names their outpost/commander profile, compares **Explorer Mode** vs. **Commander Mode** via the side-by-side summary, selects a mode, optionally views/sets a mission seed for classroom repeatability, and launches Day 1.
3. **Daily Mission Control (`SCR-03` Mission Control Dashboard):** On Day 1 (and each subsequent day), the student inspects the 2D/2.5D lunar outpost status, six resource bars/charts, and individual crew status cards. In Explorer Mode, guided hints highlight immediate priorities.
4. **Subsystem Decisions (`SCR-04` Engineering Management):** The student navigates to Engineering Management to adjust power allocation, water recycling/irrigation routing, oxygen generation posture, greenhouse cultivation, radiation shelter posture, and crew rest/repair schedules, seeing conceptual dependency previews before committing.
5. **Day Resolution & Emergencies (`SCR-03` -> `SCR-05` Mission Events and Emergency Decisions):** Returning to or advancing from Mission Control triggers the backend's 1-day simulation step. If an environmental event or equipment failure occurs, the student is directed to `SCR-05`, reviews the scientific context and impact severity, selects a response decision, and views the educational "Why This Happened" feedback.
6. **90-Day Cycle or Early Failure (`SCR-03` -> `SCR-06` Mission Report and Final Score):** Steps 3–5 repeat daily until either all four astronauts survive through Day 90 (`COMPLETED`) or a failure condition ends the mission early (`FAILED`).
7. **Debrief & Replay (`SCR-06` Mission Report and Final Score):** The student inspects their score breakdown, multi-day Recharts resource trends, key turning points, and tailored STEM takeaways, then launches a new Explorer or Commander mission or revisits saved runs.

---

## 9. Screen Requirements

### 9.1 `SCR-01`: Landing Page

- **Purpose:** Introduce ASTRA's mission premise, establish educational context and non-endorsement transparency, and route students to start a new mission or resume/review saved missions.
- **Layout Regions:**
  - **Top Navigation Bar:** ASTRA wordmark, quick link to Mission History drawer/section, accessibility contrast/help toggle.
  - **Hero Banner:** 2D/2.5D lunar outpost visual preview, headline premise (90 days, 4 astronauts), and primary Call-to-Action (CTA).
  - **Mode & Systems Preview Strip:** Brief visual summary of the 6 outpost systems and Explorer vs. Commander modes.
  - **Saved Missions Panel:** Compact list of in-progress or completed missions stored in SQLite.
  - **Footer:** Independent educational project notice (explicitly stating no NASA endorsement/certification) and 2026 Space Apps context.
- **Components:** Primary CTA button ("Start New Mission"), secondary button ("Resume Active Mission"), Saved Mission list cards, System Overview badges, Disclaimer banner.
- **Data Displayed:** Static product overview; list of saved missions (mission label, difficulty mode, current day / 90, status badge `IN_PROGRESS` / `COMPLETED` / `FAILED`, last updated timestamp).
- **User Interactions:** Click "Start New Mission"; click "Resume" on an in-progress mission; click "View Report" on a finished mission; open quick-start guide modal.
- **States:**
  - *Loading:* Skeleton placeholders inside Saved Missions Panel while fetching `/api/missions`.
  - *Empty:* Friendly prompt when no saved missions exist ("No missions launched yet—start your first 90-day lunar command!").
  - *Error:* Non-blocking inline alert with "Retry" button if the backend API is unreachable, while keeping static overview readable.
- **Navigation:** To `SCR-02` (New Mission), `SCR-03` (Resume in-progress mission), or `SCR-06` (View completed/failed mission report).

### 9.2 `SCR-02`: Mission Setup

- **Purpose:** Configure and initialize a deterministic 90-day mission with a chosen difficulty mode before entering Mission Control.
- **Layout Regions:**
  - **Header Breadcrumb:** Back link to Landing Page + step title.
  - **Mission Identity Card:** Optional Commander/Outpost name input and optional deterministic scenario seed input (auto-generated by default for convenience, editable for classroom repeatability).
  - **Difficulty Selection Comparison Grid:** Side-by-side cards for Explorer Mode and Commander Mode showing key differences.
  - **Crew & Outpost Briefing Panel:** Roster preview of the four astronauts and baseline Day 1 readiness summary.
  - **Action Footer:** "Launch Mission (Day 1)" primary button.
- **Components:** Text input (Mission/Commander Label), toggle/input (Optional Seed), two selectable Difficulty Mode cards, Crew Roster preview cards, Launch CTA button.
- **Data Displayed:** Mode comparison summary (guidance level, resource tightness, event intensity, feedback style), fixed mission parameters (4 astronauts, 90 days), generated default seed.
- **User Interactions:** Enter/edit mission label, select Explorer or Commander mode, optionally enter custom seed, click "Launch Mission".
- **States:**
  - *Loading:* Disabled Launch button with spinner ("Initializing Lunar Outpost...") while backend creates mission record.
  - *Empty:* Default pre-selected recommendation (Explorer Mode) and auto-populated placeholder label so student is never stuck on blank required fields.
  - *Error:* Inline validation message (e.g., invalid characters/length in label) or API creation error banner with retry option.
- **Navigation:** Back to `SCR-01`; on successful creation, forward to `SCR-03` (Day 1).

### 9.3 `SCR-03`: Mission Control Dashboard

- **Purpose:** Serve as the student's central operational hub to inspect outpost health, monitor all six resource systems and crew vitals, review historical trends, receive educational guidance, and advance the mission by one day.
- **Layout Regions:**
  - **Top Telemetry Header:** Mission label, Day counter (`Day X / 90`), Difficulty Mode badge, Overall Outpost Status indicator, quick navigation tabs (`Dashboard`, `Engineering`, `Events/Log`), and Save/Exit link.
  - **2D/2.5D Interactive Outpost Viewport:** Visual habitat diagram displaying module states (Solar Array, Habitat Dome, Greenhouse, Water Loop, Shielding) with color-coded health/warning overlays.
  - **Six-System Resource Strip:** Six summary cards (Oxygen, Water, Energy, Food, Radiation Safety, Crew Health) showing current level, daily net direction indicator (rising/stable/falling), and alert state.
  - **Crew Status Panel:** Four individual astronaut cards showing survival status, health bar, stress indicator, and cumulative radiation gauge.
  - **Trend & Log Panel:** Recharts multi-day line/area charts for resource history alongside the latest Day Summary and Educational Feedback card.
  - **Day Advance Action Bar:** Summary of staged engineering decisions and primary **"Advance to Next Day"** button.
- **Components:** Top nav bar, 2D/2.5D SVG/Canvas habitat map, 6 KPI status cards, 4 Crew cards, Recharts trend chart tabs, Explorer Hint banner (Explorer Mode only), Educational Feedback drawer/card, "Advance Day" primary CTA.
- **Data Displayed:** Current day index, mission status, all 6 resource system levels and daily deltas, 4 astronaut states, active alerts/pending event indicator, historical resource time series (Day 1 to current day), staged allocation summary, latest educational takeaway.
- **User Interactions:** Inspect habitat modules via hover/click tooltips; switch Recharts series (e.g., Oxygen & Water vs. Energy & Food); expand/collapse educational feedback cards; navigate to Engineering Management to adjust settings; click "Advance Day" to execute backend simulation step.
- **States:**
  - *Loading:* Skeleton dashboard cards on initial load; locked "Resolving Day X..." state on Advance Day until backend responds.
  - *Empty:* On Day 1 prior to advancing, historical charts display Day 1 baseline with a prompt ("Advance Day 1 to begin recording multi-day trends").
  - *Error:* Clear error banner if state fetch or day-advance request fails, preserving staged choices without advancing the day counter prematurely.
- **Navigation:** To `SCR-04` (Engineering Management), `SCR-05` (when an event is triggered or active), `SCR-06` (automatically upon Day 90 completion or early mission failure), or `SCR-01` (Save & Exit to Home).

### 9.4 `SCR-04`: Engineering Management

- **Purpose:** Allow the student to configure subsystem priorities, allocate daily electrical energy and water routing, manage greenhouse and shielding postures, and schedule crew rest/repairs before advancing the day.
- **Layout Regions:**
  - **Persistent Top Telemetry Header:** Shared with `SCR-03` for constant day and alert awareness.
  - **Energy Budget & Allocation Bar:** Visual summary showing total available energy (generation + usable battery) versus total allocated demand across subsystems.
  - **Subsystem Control Cards Grid:** Dedicated control panels for Oxygen/Life Support, Water Recycling & Routing, Greenhouse (Food), Radiation Shielding Posture, and Crew Work/Rest Posture.
  - **Conceptual Impact Preview Sidebar:** Real-time qualitative warnings (e.g., "Reducing water recycling power increases reserve drawdown") and Explorer Mode hints.
  - **Confirmation Footer:** "Apply Allocations & Return to Mission Control" and "Reset to Previous Day Settings" controls.
- **Components:** Power allocation sliders/steppers, mode selectors (e.g., Conservation / Nominal / High), toggles (Greenhouse Active, Storm Shelter Posture), repair assignment buttons (if faults exist), qualitative dependency callout box, Save/Reset buttons.
- **Data Displayed:** Available energy supply and battery state, per-subsystem power/water allocation limits, current fault/degradation flags, greenhouse growth cycle progress indicator, active shielding posture, qualitative dependency notices.
- **User Interactions:** Adjust subsystem allocations within available energy/water bounds; toggle greenhouse or shelter modes; assign crew repair priority to damaged equipment; apply or reset staged decisions.
- **States:**
  - *Loading:* Disabled controls with loading indicator while fetching current engineering configuration or validating staged submission.
  - *Empty:* If no equipment faults exist, Repair Queue section displays "All subsystems structurally nominal—no repairs required."
  - *Error:* Inline validation blocks over-allocation beyond available energy/water capacity with plain-language explanation; network failure banner retains unsaved slider positions.
- **Navigation:** Back to `SCR-03` (Mission Control Dashboard) or directly to `SCR-05` if a pending emergency requires attention before day advance.

### 9.5 `SCR-05`: Mission Events and Emergency Decisions

- **Purpose:** Present environmental events or equipment failures triggered during day resolution, explain the real-world science behind the event, and capture the student's emergency response decision.
- **Layout Regions:**
  - **Alert Header:** Severity badge (`Minor`, `Moderate`, or `Severe`), Event Category tag (`Environmental` or `Equipment Failure`), and current day index.
  - **Event Briefing Card:** Narrative description, affected outpost systems highlighted visually, and scientific context panel.
  - **Decision Options Grid:** Two to three structured response choices showing qualitative resource trade-offs (e.g., Energy cost, Crew stress impact, Repair speed, Risk reduction).
  - **Post-Decision Educational Debrief Panel:** Revealed after submitting a choice, explaining cause-and-effect and scientific principles.
- **Components:** Severity indicator banner, affected-system badges, decision option cards with radio/button selection, "Confirm Emergency Decision" CTA, Explorer Mode recommendation badge (Explorer Mode only), Educational Debrief card, "Return to Mission Control" CTA.
- **Data Displayed:** Event title, category, severity tier, affected subsystems, qualitative consequences of each option, Explorer Mode guidance (when enabled), and post-decision outcome summary + educational explanation.
- **User Interactions:** Inspect affected systems and trade-offs; select one response option; submit decision to backend; read post-decision educational feedback; return to Mission Control.
- **States:**
  - *Loading:* Disabled option buttons while backend resolves the chosen emergency action.
  - *Empty:* If accessed via navigation when no active event is pending, displays "No active emergencies on Day X" alongside a chronological list of past mission events.
  - *Error:* Inline error alert with retry if emergency decision submission fails; prevents duplicate submission.
- **Navigation:** From `SCR-03` (automatically surfaced when a day resolution triggers an actionable event, or via Events tab) and back to `SCR-03` (or directly to `SCR-06` if catastrophic unmitigated consequences cause mission failure).

### 9.6 `SCR-06`: Mission Report and Final Score

- **Purpose:** Summarize mission outcome (90-day success or early failure), present the transparent score breakdown, visualize 90-day system trends, and deliver a reflective STEM learning debrief.
- **Layout Regions:**
  - **Outcome Hero Banner:** Clear status (`Mission Accomplished – Day 90 Survived` or `Mission Failed – Day X`), failure cause summary (if failed), difficulty mode badge, and total score.
  - **Score Breakdown Panel:** Individual factor scores matching Section 6.5 (Crew Survival & Health, Duration Progress, Resource Stewardship, Radiation Protection, Decision Quality).
  - **Crew Final Status Row:** End-state summary cards for all four astronauts.
  - **Full-Mission Telemetry Charts:** Interactive Recharts timelines covering Oxygen, Water, Energy, Food, Radiation, and Crew Health across all played days.
  - **Key Turning Points & STEM Takeaways:** Curated timeline of pivotal decisions/events and educational lessons learned.
  - **Action Footer:** "Play Again (New Mission)", "Try Commander Mode" (if finished in Explorer), and "Return to Home".
- **Components:** Outcome banner, Score Factor breakdown cards, 4 Crew end-state cards, Recharts multi-series timeline charts, Turning Point accordion/cards, Action buttons.
- **Data Displayed:** Mission metadata, outcome status, total and factor-level scores, final crew health/stress/radiation states, full Day 1–N resource history, triggered events log, tailored educational debrief items.
- **User Interactions:** Switch chart views across the 6 systems; hover over chart points to inspect specific day events; expand turning-point educational explanations; start a new mission or return home.
- **States:**
  - *Loading:* Skeleton report layout while fetching full mission report and time-series payload.
  - *Empty:* If a mission ended on Day 1 or very early, charts render available points with a note explaining limited trend history.
  - *Error:* Error card with "Retry Loading Report" and fallback link back to `SCR-01`.
- **Navigation:** To `SCR-02` (Play Again / New Mission) or `SCR-01` (Landing Page / Mission History).

---

## 10. Functional Requirements

All functional requirements use the identifier format `FR-<AREA>-<number>` and link directly to a Screen ID (`SCR-01`–`SCR-06`) and Acceptance Criterion (`AC-01`–`AC-20`) defined in Section 16.

| ID | Area | Description | Priority | Related Screen(s) | Linked AC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FR-MISS-01` | Mission Creation | The system shall allow a user to create a new 90-day lunar outpost mission initialized with four astronauts and Day 1 deterministic baseline states across all six resource systems. | Must | `SCR-02` | `AC-01` |
| `FR-MISS-02` | Mission Creation | The system shall allow an optional mission/commander label and an optional deterministic scenario seed (auto-generating a seed if omitted) to support repeatable classroom runs. | Should | `SCR-02` | `AC-02` |
| `FR-DIFF-01` | Difficulty Selection | The system shall require selecting either **Explorer Mode** or **Commander Mode** during mission setup and lock the chosen mode for the duration of that mission. | Must | `SCR-02` | `AC-03` |
| `FR-DIFF-02` | Difficulty Selection | The system shall enforce mode-specific guidance and constraints: Explorer Mode displays onboarding prompts, bottleneck hints, and automatic explanations; Commander Mode omits prescriptive hints and applies stricter constraints and event severity. | Must | `SCR-03`, `SCR-04`, `SCR-05` | `AC-04` |
| `FR-RES-01` | Resource Monitoring | The system shall display current reserve levels, operational statuses, daily directional deltas, and warning indicators for all six resource systems (Oxygen, Water, Energy, Food, Radiation Safety, Crew Health). | Must | `SCR-03` | `AC-05` |
| `FR-RES-02` | Resource Monitoring | The system shall display an interactive 2D/2.5D lunar outpost overview showing subsystem states alongside Recharts time-series charts of historical resource trends from Day 1 to the current day. | Must | `SCR-03` | `AC-06` |
| `FR-PWR-01` | Power Allocation | The system shall allow the user to allocate daily electrical energy across outpost subsystems within total available solar generation and battery discharge limits, rejecting over-allocation before day advancement. | Must | `SCR-04` | `AC-07` |
| `FR-OXY-01` | Life-Support Management | The system shall allow the user to configure oxygen generation and CO₂ scrubbing operational posture, computing net oxygen change on the backend from power allocation, water feedstock, and four-crew consumption. | Must | `SCR-04` | `AC-08` |
| `FR-WTR-01` | Water Recycling | The system shall allow the user to manage water recycling power priority and water routing between crew hydration, electrolysis, and greenhouse irrigation, enforcing imperfect recovery with irreversible recycling loss. | Must | `SCR-04` | `AC-09` |
| `FR-FOOD-01` | Food Production | The system shall allow the user to toggle and supply the lunar greenhouse (consuming water, energy, and multi-day growth time toward periodic harvests) alongside managing stored ration policies. | Must | `SCR-04` | `AC-10` |
| `FR-RAD-01` | Radiation Protection | The system shall allow the user to activate or adjust radiation shelter/shielding posture in response to ambient radiation and solar particle events, reducing exposure risk without granting complete immunity. | Must | `SCR-04`, `SCR-05` | `AC-11` |
| `FR-HLTH-01` | Crew Health Monitoring | The system shall track and display individual health, stress, cumulative radiation exposure, and survival status for all four astronauts, allowing the user to assign crew rest or repair priorities. | Must | `SCR-03`, `SCR-04` | `AC-12` |
| `FR-EVT-01` | Random Events | During daily resolution, the backend engine shall deterministically evaluate and trigger environmental events or equipment failures (with category and severity scaled by mode) and present structured response choices to the user. | Must | `SCR-05` | `AC-13` |
| `FR-EVT-02` | Random Events | The system shall submit the user's chosen emergency response to the backend, immediately apply resource/health/equipment consequences, and prevent advancing past an unresolved blocking emergency. | Must | `SCR-05` | `AC-14` |
| `FR-TIME-01` | Mission Time Advancement | The system shall advance the active mission by exactly one day per turn via a backend API call, executing the full deterministic simulation pipeline, persisting the new daily snapshot, and preventing duplicate turn submissions. | Must | `SCR-03` | `AC-15` |
| `FR-FAIL-01` | Failure Conditions | The system shall evaluate all failure conditions (crew fatality or unrecoverable life-support collapse) at day resolution and immediately transition the mission to `FAILED` with an explicit root-cause summary if triggered. | Must | `SCR-03`, `SCR-06` | `AC-16` |
| `FR-COMP-01` | Mission Completion | When all four astronauts survive through the end of Day 90, the system shall transition the mission to `COMPLETED`, compute the final score breakdown from Parameter Register weights, and display the Mission Report. | Must | `SCR-06` | `AC-17` |
| `FR-EDU-01` | Educational Feedback | The system shall generate and display context-sensitive STEM explanations linking engineering decisions, system dependencies, and triggered events to scientific principles (expanded automatically in Explorer Mode, expandable on demand in Commander Mode). | Must | `SCR-03`, `SCR-04`, `SCR-05`, `SCR-06` | `AC-18` |
| `FR-SAVE-01` | Mission History and Saving | The system shall automatically persist mission metadata and per-day simulation snapshots (resources, crew states, decisions, events, scores) in the SQLite database after creation and every day/event resolution. | Must | `SCR-03`, `SCR-06` | `AC-19` |
| `FR-SAVE-02` | Mission History and Saving | The system shall allow users to view a list of saved in-progress and finished missions, resume any `IN_PROGRESS` mission at its exact saved day, and reopen the full report for any `COMPLETED` or `FAILED` mission. | Must | `SCR-01`, `SCR-02`, `SCR-06` | `AC-20` |

---

## 11. Non-Functional Requirements

All numeric targets below are **proposed** engineering targets for MVP validation.

| ID | Category | Requirement & Measurable Target |
| :--- | :--- | :--- |
| `NFR-RESP-01` | Responsive Design | The frontend shall adapt cleanly across desktop, laptop, and tablet viewports without horizontal scrolling on primary mission workflows, supporting widths from **768 px to 1920 px (proposed)** and remaining legible down to **360 px mobile screens (proposed)** for inspection and reports. |
| `NFR-PERF-01` | Performance | The frontend initial interactive load (Landing Page) shall complete within **2.5 seconds on a standard broadband connection (proposed)**. |
| `NFR-PERF-02` | Performance | Backend API responses for daily simulation advancement (`advance-day`) and mission state retrieval shall complete in **under 300 ms at the 95th percentile (proposed)** under single-classroom concurrent usage (**up to 50 concurrent student sessions, proposed**). |
| `NFR-USAB-01` | Usability for Younger Learners | All primary labels, hints, and educational cards shall use plain, age-appropriate STEM language readable at a **Grade 6–9 reading level (proposed)**, avoiding unexplained aerospace jargon and pairing technical terms with hover/inline definitions. |
| `NFR-USAB-02` | Usability for Younger Learners | A first-time beginner student in Explorer Mode shall be able to launch a mission and complete Day 1 allocation and advancement within **3 minutes without external instruction (proposed)**. |
| `NFR-ACC-01` | Accessibility | The web application shall conform to **WCAG 2.1 Level AA** as its target accessibility standard, including full keyboard navigation for all sliders/controls/modals, semantic landmarks, ARIA live regions for daily alerts, and **at least 4.5:1 text contrast / 3:1 UI component contrast (proposed, per WCAG 2.1 AA)**. |
| `NFR-ACC-02` | Accessibility | Status indicators (nominal, warning, critical) shall never rely on color alone; every status state shall pair color with distinct icons and text labels (**100% of status badges compliant, proposed**). |
| `NFR-DATA-01` | Data Consistency | All simulation arithmetic, random event rolls, and failure checks shall execute exclusively on the backend in an atomic database transaction; **0% of simulation state mutations shall occur client-side (proposed)**, and repeating a mission with identical seed and inputs shall yield **100% identical day-by-day outputs (proposed)**. |
| `NFR-ERR-01` | Error Handling | Invalid engineering allocations, malformed requests, or duplicate day-advance clicks shall return structured HTTP 4xx validation errors via Pydantic without mutating persisted state, and transient network failures shall surface recoverable UI prompts preserving **100% of unsaved UI slider state (proposed)**. |
| `NFR-SEC-01` | Security | All API inputs shall be strictly validated with Pydantic schemas; SQLAlchemy ORM parameterized queries shall be used exclusively to eliminate SQL injection; CORS shall restrict browser origins to the deployed frontend domain, and HTTPS shall be enforced in production (**0 unvalidated raw SQL queries and 100% TLS in production, proposed**). |
| `NFR-MAINT-01` | Maintainability | The Python simulation engine shall be strictly decoupled from FastAPI route handlers and SQLAlchemy models as a pure-Python module with simulation constants centralized in a configuration registry (**0 framework imports inside the core simulation package, proposed**). |
| `NFR-TEST-01` | Testability | The simulation engine and API layer shall support automated unit, determinism, and integration testing via `pytest`, targeting **at least 85% line coverage on the simulation engine and 100% deterministic replay verification across 90-day seeded golden runs (proposed)**. |

---

## 12. Technical Architecture

### 12.1 Technology Stack & Layer Responsibilities

| Layer | Technology | Responsibilities |
| :--- | :--- | :--- |
| **Presentation & UI (Frontend)** | React, Vite, Tailwind CSS, Recharts | Renders all six screens (`SCR-01`–`SCR-06`), 2D/2.5D lunar outpost visualization, interactive engineering controls, Recharts resource trend graphs, Explorer hints, and educational cards. Sends user commands to the backend API and renders persisted responses. **Contains zero simulation or scoring math.** |
| **API & Validation Layer (Backend)** | Python, FastAPI, Pydantic | Exposes RESTful JSON endpoints, enforces strict request/response schema validation via Pydantic, coordinates atomic database transactions, enforces turn sequencing (blocking duplicate day advances or unresolved event bypasses), and handles CORS and error formatting. |
| **Deterministic Simulation Engine** | Pure Python module | Owns 100% of mission state transitions: reading Parameter Register constants, computing daily six-system resource balances, enforcing physical coupling, stepping the seeded PRNG for events, checking failure/Day 90 completion rules, generating educational feedback triggers, and computing final scores. |
| **Persistence Layer** | SQLite (initial), SQLAlchemy ORM | Stores missions, astronaut records, daily state snapshots, engineering decision logs, event histories, and score summaries via relational ORM models with transactional rollback on errors. |
| **Design & Collaboration** | Figma, Git, GitHub | Figma holds wireframes, component library, and 2D/2.5D outpost artwork specs; Git/GitHub manage version control, branching, pull-request reviews, and automated CI test runs. |
| **Hosting & Deployment** | Vercel (Frontend), Render (Backend) | Vercel serves the static React/Vite production bundle over HTTPS; Render hosts the FastAPI/Uvicorn service and mounted SQLite storage (with environment-configured CORS linking the Vercel origin to the Render API). |

### 12.2 Layer Communication & Authority Boundary

- **Strict Backend Authority:** All simulation state and math reside exclusively in the Python simulation engine on the backend. The frontend never computes next-day resource deltas, event rolls, failure states, or final scores locally; at most, the frontend displays qualitative dependency hints or ensures UI sliders stay within the energy/water ceilings reported by the backend.
- **Request-Response Flow:** The React client fetches the authoritative mission snapshot on load (`GET`), submits staged engineering allocations or emergency choices (`POST`), receives the newly computed and persisted state snapshot in response, and immediately updates charts, crew cards, and educational panels from that authoritative payload.

### 12.3 Conceptual API Table

| Resource / Endpoint | Method | Purpose | Request Contents (Conceptual) | Response Contents (Conceptual) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/missions` | `GET` | List all saved missions for the Landing Page history panel. | Optional status filter (all, active, finished). | Array of mission summaries: mission ID, label, difficulty mode, current day, status, last updated timestamp, and final score if finished. |
| `/api/missions` | `POST` | Create and initialize a new 90-day lunar mission. | Chosen difficulty mode (`Explorer` or `Commander`), optional mission/commander label, optional scenario seed. | Newly created mission metadata, Day 1 resource levels across all six systems, initial four astronaut records, and Day 1 Explorer guidance if applicable. |
| `/api/missions/{mission_id}` | `GET` | Retrieve full current mission state and historical telemetry for Dashboard and Report views. | Mission ID in path. | Mission metadata, current day state across six systems, four astronaut states, active pending event (if any), Day 1–N historical time series, and past educational feedback entries. |
| `/api/missions/{mission_id}/advance-day` | `POST` | Validate engineering decisions, advance simulation by one day, resolve system deltas, and check events/failure/completion. | Current expected day index (for idempotency), subsystem operational modes, power allocations across subsystems, water routing shares, greenhouse/shelter toggles, crew rest/repair directives. | Updated day index, updated mission status (`IN_PROGRESS`, `COMPLETED`, `FAILED`), before/after resource deltas, updated four astronaut states, newly triggered event (if any), educational feedback items, and final score breakdown if mission ended. |
| `/api/missions/{mission_id}/events/{event_id}/resolve` | `POST` | Submit player's emergency response to an active environmental or equipment event. | Chosen response option ID for the active event. | Resolved event outcome summary, immediate system/crew adjustments, updated mission status (checking if consequences caused failure), and post-decision educational debrief text. |
| `/api/missions/{mission_id}/report` | `GET` | Retrieve the complete end-of-mission debrief, score breakdown, and turning-point highlights. | Mission ID in path. | Mission outcome, failure cause (if failed), factor-by-factor score breakdown, Day 1–N telemetry arrays for Recharts, event log, and curated STEM learning takeaways. |
| `/api/health` | `GET` | Provide service health check for Render deployment monitoring. | None. | Service status indicator and database connectivity status. |

### 12.4 Conceptual Data Model

| Entity | Key Fields (Conceptual) | Relationships |
| :--- | :--- | :--- |
| **Mission** | `id` (primary key), `label`, `difficulty_mode` (`EXPLORER` / `COMMANDER`), `seed`, `prng_state`, `status` (`IN_PROGRESS` / `COMPLETED` / `FAILED`), `current_day`, `failure_reason`, `total_score`, `created_at`, `updated_at`. | One Mission has many **CrewMembers** (fixed at four), many **DailySnapshots**, many **MissionEvents**, and one optional **ScoreBreakdown**. |
| **CrewMember** | `id`, `mission_id` (foreign key), `astronaut_name`, `role_title`, `health`, `stress`, `cumulative_radiation`, `survival_status` (`ALIVE` / `CRITICAL` / `DECEASED`). | Belongs to one **Mission**. |
| **DailySnapshot** | `id`, `mission_id` (foreign key), `day_number` (1–90), `oxygen_level`, `water_level`, `energy_generated`, `battery_level`, `food_level`, `greenhouse_progress`, `radiation_daily_dose`, `submitted_allocations_summary`, `educational_feedback_keys`, `state_checksum`, `created_at`. | Belongs to one **Mission**; uniquely indexed on (`mission_id`, `day_number`). |
| **MissionEvent** | `id`, `mission_id` (foreign key), `day_number`, `event_type` (`ENVIRONMENTAL` / `EQUIPMENT_FAILURE`), `event_code`, `severity` (`MINOR` / `MODERATE` / `SEVERE`), `affected_systems`, `resolution_status` (`PENDING` / `RESOLVED`), `chosen_option_code`, `outcome_summary`. | Belongs to one **Mission**; optionally linked to a specific `day_number`. |
| **ScoreBreakdown** | `id`, `mission_id` (foreign key), `crew_survival_score`, `duration_score`, `resource_stewardship_score`, `radiation_safety_score`, `decision_quality_score`, `difficulty_multiplier_applied`, `total_score`. | One-to-one with **Mission** upon mission end (`COMPLETED` or `FAILED`). |

### 12.5 Determinism & Testing Strategy

- **How Determinism Is Achieved:**
  1. Every mission is initialized with an explicit integer/string `seed` stored in the `Mission` record.
  2. The simulation engine instantiates a dedicated local pseudorandom number generator (`random.Random`) seeded per step from the mission seed and day/event step counter rather than reading global random state, system clock time, or unordered hash iteration.
  3. All arithmetic uses explicit rounding/precision rules and ordered subsystem evaluation (Energy -> Water -> Oxygen -> Food -> Radiation -> Crew Health -> Events -> Failure/Completion) so execution order never varies.
  4. Each `DailySnapshot` stores a deterministic checksum of the canonical post-step state.
- **How Determinism Is Tested:**
  1. **Replay Equivalence Tests:** Automated `pytest` suites run identical 90-day command sequences twice with the same seed and assert byte-for-byte equality across every `DailySnapshot` and final `ScoreBreakdown`.
  2. **Save/Resume Consistency Tests:** Tests pause mid-mission after an arbitrary day, reload state purely from SQLite, continue to Day 90, and verify identical outputs against an uninterrupted run.
  3. **Boundary & Invariant Tests:** Unit tests verify physical invariants (e.g., water recycling efficiency never yields net positive water creation, radiation dose never drops to zero under ambient flux, total allocated power never exceeds supply + battery).

### 12.6 Responsibilities by Role

To allow independent parallel execution across team members once API contracts and Figma specs are agreed:

| Role | Primary Ownership | Key Deliverables |
| :--- | :--- | :--- |
| **Frontend Developer** | React + Vite + Tailwind CSS + Recharts application (`SCR-01`–`SCR-06`), API client integration, client-side form/allocation bounds checking, keyboard/ARIA accessibility implementation, Vercel deployment. | Responsive UI screens, 2D/2.5D interactive outpost view, Recharts trend components, state management preserving unsaved inputs on transient errors, automated component/UI tests. |
| **Backend Developer** | Python + FastAPI + Pydantic API layer, pure-Python deterministic simulation engine, Parameter Register config module, SQLAlchemy ORM + SQLite persistence, Render deployment. | Versioned REST endpoints matching Section 12.3, deterministic 6-system engine, event & scoring pipelines, `pytest` unit/determinism/integration test suites. |
| **UI/UX Designer** | Information architecture, Figma wireframes and high-fidelity mockups for all 6 screens, 2D/2.5D lunar outpost illustrations/states, WCAG 2.1 AA color/iconography system, plain-language STEM microcopy. | Complete Figma design system, non-color-only status badges, Explorer Mode hint patterns, responsive breakpoints (`768px`–`1920px` + `360px` view), and educational card layouts. |

---

## 13. Scientific Accuracy Guidelines

### 13.1 Statement Tagging Standard
Every scientific or domain claim in ASTRA's documentation, educational cards, and design specs must carry one of three explicit tags:
- **`[FACT]`**: Grounded in established physical, biological, or spaceflight engineering principles (e.g., water recovery in closed habitats is less than 100%; human respiration consumes oxygen and produces CO₂).
- **`[GAMEPLAY ASSUMPTION]`**: An intentional simplification or abstraction created to make a 90-day educational web game playable and understandable (e.g., daily turn granularity, unified crew health/stress scales, three-tier event categories).
- **`[TO VERIFY]`**: A quantitative threshold, dose limit, or physiological relationship that requires verification against authoritative literature before final balancing.

### 13.2 Mandatory Physical Realism Rules
1. **No Unrealistic Resource Regeneration:** Resources cannot appear out of nothing. Oxygen generation via electrolysis consumes water and energy; greenhouse harvests require water, energy, and multi-day growth cycles.
2. **Imperfect Water Recycling:** Water recovery loops always incur an irreversible loss fraction (`WATER_RECYCLING_LOSS_RATE`), ensuring students learn why resupply or careful conservation matters.
3. **Partial Radiation Protection:** Passive and storm-shelter shielding attenuate radiation dose (`RAD_PASSIVE_SHIELD_FACTOR`, `RAD_SHELTER_SHIELD_FACTOR`), but never eliminate radiation exposure completely.
4. **Resource- and Time-Dependent Food Production:** The lunar greenhouse cannot produce instant emergency food; crops mature only after accumulating sufficient healthy growth days (`GREENHOUSE_GROWTH_CYCLE_DAYS`) supplied with water and lighting energy.
5. **Energy Balance Enforcement:** Total electrical demand across subsystems cannot exceed solar generation plus available battery discharge; deficits force load shedding or brownouts.

### 13.3 Placeholder Policy
No unverified scientific rates, capacities, caloric figures, or radiation thresholds may be hardcoded or invented in the PRD or initial prototypes. All numerical constants are represented by named placeholders in the Section 7.3 **Parameter Register** until calibrated during balancing.

### 13.4 Reference Sources to Consult During Balancing
The following organizations and public reference categories should be consulted during simulation balancing and educational copy review. **All references below are marked `to verify`—no source, figure, or document in this PRD should be treated as verified or confirmed until reviewed directly by the team during balancing.**

- **NASA Human Research Program (HRP)** — human spaceflight health, radiation, and behavioral/stress hazards (*to verify*)
- **NASA Technical Reports Server (NTRS)** — public technical papers on lunar habitat architecture, ECLSS mass balances, and lunar surface dust/thermal conditions (*to verify*)
- **NASA-STD-3001 (Space Flight Human-System Standard)** — human physiological requirements and environmental bounds for crewed habitats (*to verify*)
- **Public International Space Station (ISS) Environmental Control and Life Support System (ECLSS) Documentation** — real-world water recovery, oxygen generation, and CO₂ scrubbing concepts (*to verify*)
- **NASA Artemis Public Materials** — lunar south pole illumination, surface operations context, and radiation environment overviews (*to verify*)

### 13.5 Independence & Non-Endorsement Statement
**ASTRA – Junior Astronaut Mission Trainer** is an independent student/team educational project created for the **2026 NASA Space Apps Challenge**. It is **not** affiliated with, endorsed by, sponsored by, or certified by NASA, and its gameplay abstractions must never be presented as certified engineering tools.

---

## 14. MVP Scope

The MVP delivers a complete, playable, scientifically grounded 90-day educational simulation and strictly excludes out-of-scope features:

- **Playable 90-Day Mission:** Turn-based daily progression from Day 1 to Day 90 for a four-astronaut lunar outpost.
- **Six Interconnected Resource Systems:** Oxygen, Water, Energy, Food, Radiation Safety, and Crew Health running on the deterministic backend engine.
- **Resource Allocation & Engineering Controls:** Daily power distribution, life-support posture, water recycling/routing, greenhouse cultivation, radiation sheltering, and crew rest/repair management.
- **Mission Events & Emergency Decisions:** Deterministic environmental events and equipment failures with severity tiers and player mitigation choices.
- **Two Difficulty Modes:** Explorer Mode (guided, beginner-friendly) and Commander Mode (challenging, stricter constraints).
- **Mission Failure & Success:** Early failure detection across defined survival conditions, Day 90 completion, and factor-based Mission Report scoring.
- **Educational Feedback & Persistence:** Context-sensitive STEM explanations after decisions/events and automatic SQLite save/resume/history support across all six screens.

---

## 15. Future Enhancements

Listed for post-MVP roadmap awareness only; not designed or specified in MVP scope:

- Multiplayer (collaborative crew roles or classroom team competitions).
- AI assistant (adaptive conversational mission advisor or tutor).
- Advanced 3D lunar environment (real-time WebGL terrain and habitat exploration).
- Additional planetary missions (e.g., Mars transit, Martian surface, or orbital stations).
- Advanced astronaut simulation (individual specializations, EVA physiology, and detailed medical procedures).

---

## 16. Acceptance Criteria

### 16.1 Acceptance Criteria List

Each Acceptance Criterion (`AC-<number>`) is derived directly from its corresponding Functional Requirement in Section 10.

- **`AC-01` (from `FR-MISS-01`):** Submitting the Mission Setup form on `SCR-02` creates a persisted mission record on the backend initialized at `Day 1`, status `IN_PROGRESS`, four `ALIVE` astronauts, and Day 1 starting reserves across all six systems matching the Parameter Register baseline.
- **`AC-02` (from `FR-MISS-02`):** Creating a mission with a custom label and seed stores both verbatim; creating a mission without a custom seed generates and persists a valid default seed; re-running two missions with identical seed, difficulty mode, and daily inputs produces identical snapshots.
- **`AC-03` (from `FR-DIFF-01`):** `SCR-02` blocks mission launch until either Explorer Mode or Commander Mode is selected; once created, no API endpoint or UI control allows altering the mission's difficulty mode.
- **`AC-04` (from `FR-DIFF-02`):** In Explorer Mode, `SCR-03`, `SCR-04`, and `SCR-05` render onboarding/bottleneck hints and automatically expand educational feedback cards; in Commander Mode, prescriptive hints are hidden, stricter Parameter Register constraints apply, and severe events can occur.
- **`AC-05` (from `FR-RES-01`):** `SCR-03` renders current level, operational status badge (icon + text + color), and directional daily delta for Oxygen, Water, Energy, Food, Radiation Safety, and Crew Health matching the latest backend `DailySnapshot`.
- **`AC-06` (from `FR-RES-02`):** `SCR-03` renders an interactive 2D/2.5D lunar outpost visual reflecting subsystem statuses and Recharts time-series charts displaying persisted Day 1–N resource histories upon initial load and after each day advance.
- **`AC-07` (from `FR-PWR-01`):** `SCR-04` enforces that total allocated subsystem power cannot exceed backend-reported available generation plus battery reserve; attempting to submit an over-allocated payload triggers inline validation on `SCR-04` and a Pydantic 4xx rejection if sent directly to the API.
- **`AC-08` (from `FR-OXY-01`):** Changing oxygen generation/scrubbing posture on `SCR-04` and advancing a day updates the Oxygen reserve on the backend according to power allocation, water feedstock availability, and four-crew respiration, without any client-side calculation.
- **`AC-09` (from `FR-WTR-01`):** Adjusting water recycling priority and irrigation share on `SCR-04` and advancing a day causes the backend to recover only a partial fraction of wastewater (`WATER_RECYCLING_EFFICIENCY`), applying irreversible loss (`WATER_RECYCLING_LOSS_RATE`) in every cycle.
- **`AC-10` (from `FR-FOOD-01`):** Activating the greenhouse on `SCR-04` consumes allocated water and energy each day to advance crop growth progress; harvests add food only after completing `GREENHOUSE_GROWTH_CYCLE_DAYS`, while stored rations decrement daily per crew consumption and ration policy.
- **`AC-11` (from `FR-RAD-01`):** Toggling Radiation Shelter Posture on `SCR-04` or during an event on `SCR-05` reduces absorbed daily radiation dose per `RAD_SHELTER_SHIELD_FACTOR` while still accruing non-zero ambient dose and applying shelter energy/stress trade-offs.
- **`AC-12` (from `FR-HLTH-01`):** `SCR-03` displays health, stress, cumulative radiation, and survival status for all four individual astronauts; assigning rest or repair priorities on `SCR-04` modifies recovery and equipment repair progression on the backend.
- **`AC-13` (from `FR-EVT-01`):** When the deterministic backend RNG triggers an environmental event or equipment failure during day resolution, the API returns a `PENDING` event record with category, severity tier, affected systems, and structured response options, and `SCR-05` displays it.
- **`AC-14` (from `FR-EVT-02`):** Selecting a response option on `SCR-05` persists the choice via `/events/{event_id}/resolve`, applies the backend consequences, transitions the event to `RESOLVED`, and unlocks further day advancement; attempting to call `advance-day` while a blocking event is `PENDING` is rejected by the backend.
- **`AC-15` (from `FR-TIME-01`):** Clicking "Advance Day" on `SCR-03` sends one `advance-day` request with the current day index; the backend executes Steps 5–6 atomically, increments `current_day` by 1, persists the `DailySnapshot`, and rejects duplicate requests referencing an already-resolved day index.
- **`AC-16` (from `FR-FAIL-01`):** Whenever any astronaut's survival status becomes `DECEASED` or any unrecoverable life-support failure threshold is breached during day or event resolution, the backend sets mission status to `FAILED` with an explicit `failure_reason` and redirects/routes the user to `SCR-06`.
- **`AC-17` (from `FR-COMP-01`):** When Day 90 resolves with all four astronauts `ALIVE`, the backend sets mission status to `COMPLETED`, computes and persists `ScoreBreakdown` using Parameter Register weights, and routes the user to `SCR-06` displaying the complete report.
- **`AC-18` (from `FR-EDU-01`):** After day resolution, emergency decisions, and mission completion, the backend returns context-matched educational feedback keys/messages explaining the active STEM principles, rendered automatically in Explorer Mode and via expandable controls in Commander Mode across `SCR-03`, `SCR-04`, `SCR-05`, and `SCR-06`.
- **`AC-19` (from `FR-SAVE-01`):** Refreshing the browser or restarting the session immediately after mission creation, day advancement, or event resolution preserves 100% of mission state, crew records, and daily snapshots in SQLite.
- **`AC-20` (from `FR-SAVE-02`):** `SCR-01` lists all saved missions from SQLite; selecting an `IN_PROGRESS` mission opens `SCR-03` at its exact saved day, and selecting a `COMPLETED` or `FAILED` mission opens `SCR-06` with its full historical charts and score breakdown.

### 16.2 Traceability Matrix (FR ↔ Screen ↔ AC)

| Functional Requirement | Requirement Area | Screen ID(s) | Acceptance Criterion |
| :--- | :--- | :--- | :--- |
| `FR-MISS-01` | Mission Creation | `SCR-02` | `AC-01` |
| `FR-MISS-02` | Mission Creation | `SCR-02` | `AC-02` |
| `FR-DIFF-01` | Difficulty Selection | `SCR-02` | `AC-03` |
| `FR-DIFF-02` | Difficulty Selection | `SCR-03`, `SCR-04`, `SCR-05` | `AC-04` |
| `FR-RES-01` | Resource Monitoring | `SCR-03` | `AC-05` |
| `FR-RES-02` | Resource Monitoring | `SCR-03` | `AC-06` |
| `FR-PWR-01` | Power Allocation | `SCR-04` | `AC-07` |
| `FR-OXY-01` | Life-Support Management | `SCR-04` | `AC-08` |
| `FR-WTR-01` | Water Recycling | `SCR-04` | `AC-09` |
| `FR-FOOD-01` | Food Production | `SCR-04` | `AC-10` |
| `FR-RAD-01` | Radiation Protection | `SCR-04`, `SCR-05` | `AC-11` |
| `FR-HLTH-01` | Crew Health Monitoring | `SCR-03`, `SCR-04` | `AC-12` |
| `FR-EVT-01` | Random Events | `SCR-05` | `AC-13` |
| `FR-EVT-02` | Random Events | `SCR-05` | `AC-14` |
| `FR-TIME-01` | Mission Time Advancement | `SCR-03` | `AC-15` |
| `FR-FAIL-01` | Failure Conditions | `SCR-03`, `SCR-06` | `AC-16` |
| `FR-COMP-01` | Mission Completion | `SCR-06` | `AC-17` |
| `FR-EDU-01` | Educational Feedback | `SCR-03`, `SCR-04`, `SCR-05`, `SCR-06` | `AC-18` |
| `FR-SAVE-01` | Mission History and Saving | `SCR-03`, `SCR-06` | `AC-19` |
| `FR-SAVE-02` | Mission History and Saving | `SCR-01`, `SCR-02`, `SCR-06` | `AC-20` |

---

## 17. Risks and Constraints

| Category | Risk / Constraint | Potential Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Scientific Balancing** | Uncalibrated Parameter Register values (`TBD`) could make 90-day survival mathematically impossible or trivially easy. | Students become frustrated by unfair failures or bored by lack of tension. | Externalize all constants into the Parameter Register, consult reference documents marked *to verify* in Section 13.4, and run automated 90-day Monte Carlo/golden-seed playtests before freeze. |
| **Educational Clarity vs. Complexity** | Six coupled systems may overwhelm beginner middle-school learners on Day 1. | High drop-off before students understand core loop. | Provide Explorer Mode guided onboarding, plain-language tooltips, qualitative dependency previews, and post-decision "Why This Happened" cards. |
| **Persistence on Render Free/Ephemeral Hosting** | Default ephemeral filesystems on container platforms like Render can wipe local SQLite files on redeploys unless persistent disk storage is attached. | Loss of student mission history across server restarts. | Configure a persistent volume for SQLite on Render or document migration path via SQLAlchemy ORM if moving to managed PostgreSQL later. |
| **Client-Server Latency & Double Submits** | Rapid clicks on "Advance Day" over school Wi-Fi could cause out-of-order requests or duplicate day progression. | Desynchronized UI state or skipped simulation days. | Disable action buttons while awaiting response, pass expected `current_day` for backend idempotency checks, and wrap step execution in atomic DB transactions. |
| **Scope Creep** | Adding real-time physics, 3D graphics, or AI chat before stabilizing the 90-day loop jeopardizes Space Apps Challenge readiness. | Incomplete MVP or fragile simulation logic. | Strictly defer non-MVP items to Section 15 and lock MVP boundaries around the six systems and six screens. |

---

## 18. Glossary

| Term | Definition |
| :--- | :--- |
| **ASTRA** | *ASTRA – Junior Astronaut Mission Trainer*, the educational lunar outpost simulation web application defined by this PRD. |
| **Commander Mode** | The advanced difficulty mode featuring tighter resource constraints, full multi-system dependencies, higher event severity, and minimal UI hints. |
| **Deterministic Simulation** | A simulation property where identical initial parameters, random seed, and sequence of player inputs always produce the exact same outputs. |
| **ECLSS** | Environmental Control and Life Support System—hardware and processes that maintain breathable air, potable water, and thermal/pressure conditions in a crewed habitat. |
| **Explorer Mode** | The beginner-friendly difficulty mode featuring generous initial buffers, guided hints, simplified dependency previews, and expanded educational explanations. |
| **Greenhouse Growth Cycle** | The multi-day biological maturation period required for lunar outpost crops to turn water and electrical lighting energy into harvested food. |
| **Imperfect Water Recycling** | The realistic constraint that closed-loop water recovery reclaims most wastewater/condensate but always loses a small fraction as unrecoverable waste or brine. |
| **Lunar Outpost** | The 2D/2.5D simulated surface research base housing four astronauts across the 90-day mission. |
| **Parameter Register** | The centralized registry in Section 7.3 containing named placeholders (`Value: TBD`) for all scientific, gameplay, and scoring constants pending verified balancing. |
| **PRNG** | Pseudorandom Number Generator—an algorithm driven by an explicit seed so random mission events remain repeatable for testing and classroom comparison. |
| **Solar Particle Event (SPE)** | An episodic surge of energetic solar radiation posing heightened exposure risk to lunar surface habitats without Earth's magnetic shielding. |
| **TBD** | To Be Determined—denotes placeholder numerical values intentionally deferred until verified scientific balancing. |
