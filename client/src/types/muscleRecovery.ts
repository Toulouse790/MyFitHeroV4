export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'traps'
  | 'lats'
  | 'delts';

export type RecoveryStatus =
  | 'fully_recovered'
  | 'mostly_recovered'
  | 'partially_recovered'
  | 'needs_recovery'
  | 'overworked';

export type WorkoutIntensity = 'light' | 'moderate' | 'high' | 'extreme';

export interface MuscleRecoveryData {
  muscle_group: MuscleGroup;
  last_workout_date: string;
  workout_intensity: WorkoutIntensity;
  workout_volume: number; // nombre de séries
  workout_duration_minutes: number;
  recovery_status: RecoveryStatus;
  recovery_percentage: number; // 0-100
  estimated_full_recovery: string; // ISO date
  fatigue_level: number; // 1-10
  soreness_level: number; // 1-10
  readiness_score: number; // 0-100
  last_updated: string;
}

export interface UserRecoveryProfile {
  user_id: string;
  recovery_rate_multiplier: number; // 0.5-2.0 (génétique, âge, etc.)
  sleep_quality_impact: number; // 0.5-1.5
  nutrition_quality_impact: number; // 0.5-1.5
  stress_level_impact: number; // 0.5-1.5
  hydration_impact: number; // 0.5-1.5
  age_factor: number; // calculé selon l'âge
  fitness_level_factor: number; // selon l'expérience
  injury_history: MuscleGroup[];
  supplements: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutImpact {
  muscle_group: MuscleGroup;
  intensity: WorkoutIntensity;
  volume: number;
  duration_minutes: number;
  exercise_types: string[];
  compound_movements: boolean;
  eccentric_focus: boolean;
}

export interface RecoveryRecommendation {
  muscle_group: MuscleGroup;
  recommendation_type: 'rest' | 'light_activity' | 'stretching' | 'massage' | 'nutrition' | 'sleep';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  estimated_benefit: number; // 0-100
  duration_minutes?: number;
  specific_actions: string[];
}

export interface GlobalRecoveryMetrics {
  overall_recovery_score: number; // 0-100
  most_recovered_muscle: MuscleGroup;
  least_recovered_muscle: MuscleGroup;
  ready_for_training: MuscleGroup[];
  needs_rest: MuscleGroup[];
  optimal_workout_type: string;
  recovery_trend: 'improving' | 'stable' | 'declining';
  last_calculated: string;
}
