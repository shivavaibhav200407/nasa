/**
 * ASTRA TypeScript interfaces matching backend Pydantic schemas.
 */

export type DifficultyMode = 'EXPLORER' | 'COMMANDER';
export type MissionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type AstronautStatus = 'ALIVE' | 'CRITICAL' | 'DECEASED';
export type SubsystemMode = 'CONSERVATION' | 'NOMINAL' | 'HIGH';
export type EventSeverity = 'MINOR' | 'MODERATE' | 'SEVERE';

export interface MissionSummary {
  id: string;
  label: string;
  difficulty_mode: DifficultyMode;
  current_day: number;
  status: MissionStatus;
  total_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  astronaut_id: string;
  name: string;
  role: string;
  health: number;
  stress: number;
  cumulative_radiation: number;
  survival_status: AstronautStatus;
}

export interface SystemLevels {
  oxygen_level: number;
  water_level: number;
  battery_level: number;
  food_level: number;
  greenhouse_progress: number;
  radiation_daily_dose: number;
  solar_generation: number;
  total_energy_load: number;
}

export interface DailySnapshot {
  day_number: number;
  oxygen_level: number;
  water_level: number;
  energy_generated: number;
  battery_level: number;
  food_level: number;
  greenhouse_progress: number;
  radiation_daily_dose: number;
  state_checksum: string;
}

export interface PowerAllocations {
  life_support: number;
  water_recycling: number;
  greenhouse: number;
  radiation_shelter: number;
}

export interface WaterAllocations {
  crew_share: number;
  greenhouse_share: number;
  electrolysis_share: number;
}

export interface EventOption {
  option_id: string;
  title: string;
  description: string;
  trade_offs_summary: string;
  energy_cost: number;
  water_cost: number;
  food_cost: number;
  stress_impact: number;
  health_impact: number;
  educational_hint?: string;
  risk_level?: string;
}

export interface MissionEvent {
  event_id: string;
  day_number: number;
  category: string;
  event_code: string;
  title: string;
  description: string;
  severity: EventSeverity;
  affected_systems: string[];
  requires_decision: boolean;
  options: EventOption[];
  resolution_status: 'PENDING' | 'RESOLVED';
  chosen_option_id?: string | null;
  outcome_summary?: string | null;
}

export interface EducationalFeedback {
  feedback_id: string;
  title: string;
  fact_summary: string;
  concept_area: string;
}

export interface ScoreBreakdown {
  crew_survival_score: number;
  duration_score: number;
  resource_stewardship_score: number;
  radiation_safety_score: number;
  decision_quality_score: number;
  difficulty_multiplier_applied: number;
  total_score: number;
}

export interface MissionDetail {
  id: string;
  label: string;
  difficulty_mode: DifficultyMode;
  seed: string;
  status: MissionStatus;
  current_day: number;
  failure_reason?: string | null;
  systems: SystemLevels;
  crew: CrewMember[];
  active_event?: MissionEvent | null;
  educational_feedback: EducationalFeedback[];
  history: DailySnapshot[];
  score_breakdown?: ScoreBreakdown | null;
}

export interface AdvanceDayPayload {
  expected_day: number;
  power_allocations: PowerAllocations;
  water_allocations: WaterAllocations;
  oxygen_mode: SubsystemMode;
  greenhouse_active: boolean;
  storm_shelter_posture: boolean;
  crew_rest_posture: boolean;
  repair_target?: string | null;
}

export interface AdvanceDayResponse {
  day_number: number;
  mission_status: MissionStatus;
  system_levels: SystemLevels;
  crew: CrewMember[];
  deltas: {
    oxygen_delta: number;
    water_delta: number;
    battery_delta: number;
    food_delta: number;
    radiation_absorbed: number;
    crew_health_deltas: Record<string, number>;
    crew_stress_deltas: Record<string, number>;
  };
  active_event?: MissionEvent | null;
  educational_feedback: EducationalFeedback[];
  failure_reason?: string | null;
  score_breakdown?: ScoreBreakdown | null;
  state_checksum: string;
}

export interface MissionReport {
  mission_id: string;
  label: string;
  difficulty_mode: DifficultyMode;
  outcome_status: MissionStatus;
  days_survived: number;
  failure_reason?: string | null;
  score_breakdown?: ScoreBreakdown | null;
  crew: CrewMember[];
  telemetry_history: DailySnapshot[];
  events_log: MissionEvent[];
  key_turning_points: Array<{
    day: number;
    event_title: string;
    severity: string;
    resolution: string;
  }>;
  educational_takeaways: EducationalFeedback[];
}
