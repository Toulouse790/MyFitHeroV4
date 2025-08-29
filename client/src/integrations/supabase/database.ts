// types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Enums pour une meilleure type safety
export type PillarType = 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'strength'
  | 'endurance'
  | 'performance'
  | 'recovery'
  | 'energy'
  | 'sleep_quality'
  | 'general_health'
  | 'general'
  | 'none';
export type SportLevel =
  | 'recreational'
  | 'amateur_competitive'
  | 'semi_professional'
  | 'professional'
  | 'none';
export type SeasonPeriod = 'off_season' | 'pre_season' | 'in_season' | 'recovery';
export type Lifestyle = 'student' | 'office_worker' | 'physical_job' | 'retired';
export type ProfileType = 'complete' | 'wellness' | 'sport_only' | 'sleep_focus';
export type DietaryPreference =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'flexitarian'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'halal'
  | 'kosher'
  | 'other';
export type EquipmentLevel = 'no_equipment' | 'minimal_equipment' | 'some_equipment' | 'full_gym';
export type FitnessExperience = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SubscriptionStatus = 'free' | 'premium' | 'pro' | 'enterprise' | 'trial' | 'expired';
export type UserRole = 'user' | 'admin' | 'coach' | 'moderator';
export type Language = 'fr' | 'en' | 'es' | 'de' | 'it';
export type RequestStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type RequestSource = 'app' | 'voice' | 'chat' | 'api' | 'webhook' | 'mobile' | 'wearable';
export type AppliedBy = 'user' | 'auto';
export type RiskLevel = 'info' | 'warning' | 'critical';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DrinkType = 'water' | 'tea' | 'coffee' | 'juice' | 'sports_drink' | 'other';
export type HydrationContext =
  | 'normal'
  | 'workout'
  | 'meal'
  | 'wake_up'
  | 'before_sleep'
  | 'medication'
  | 'thirst';
export type FoodCategory =
  | 'fruits'
  | 'vegetables'
  | 'proteins'
  | 'grains'
  | 'dairy'
  | 'fats'
  | 'beverages'
  | 'snacks'
  | 'other';
export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'flexibility';
export type Equipment =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'resistance_band'
  | 'machine'
  | 'other';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type MovementType = 'push' | 'pull' | 'legs' | 'core' | 'full_body';
export type ExerciseMechanic = 'compound' | 'isolation';
export type ForceType = 'push' | 'pull' | 'static';
export type HomeUseLevel = 'no_equipment' | 'minimal_equipment' | 'some_equipment';
export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
export type DrillGoal = 'speed' | 'power' | 'endurance' | 'skill' | 'agility' | 'technical';
export type InjurySide = 'left' | 'right' | 'bilateral';
export type InjurySeverity = 'mild' | 'moderate' | 'severe';
export type FoodPreference = 'intolerance' | 'dislike' | 'temporary';
export type GoalCategory = 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'weight';

// Tables principales
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  gender?: Gender;
  activity_level?: ActivityLevel;
  fitness_goal?: FitnessGoal;
  timezone?: string;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  available_time_per_day?: number;
  fitness_experience?: FitnessExperience;
  injuries?: string[];
  primary_goals?: string[];
  motivation?: string;
  sport?: string;
  sport_position?: string;
  sport_level?: SportLevel;
  training_frequency?: number;
  season_period?: SeasonPeriod;
  lifestyle?: Lifestyle;
  profile_type?: ProfileType;
  modules?: string[];
  active_modules?: string[];
  dietary_preference?: DietaryPreference;
  dietary_restrictions?: string[];
  food_allergies?: string[];
  food_dislikes?: string[];
  country_code?: string;
  equipment_level?: EquipmentLevel;
  first_name?: string;
  coaching_style?: string;
  target_weight_kg?: number;
  sleep_hours_average?: number;
  water_intake_goal?: number;
  main_obstacles?: string[];
  connected_devices?: string[];
  device_brands?: Json;
  email_validated?: boolean;
  last_login?: string;
  language?: Language;
  subscription_status?: SubscriptionStatus;
  strength_objective?: string;
  strength_experience?: string;
  nutrition_objective?: string;
  sleep_difficulties?: boolean;
  hydration_reminders?: boolean;
  privacy_consent?: boolean;
  marketing_consent?: boolean;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
  role?: UserRole;
}

export interface DailyStats {
  id: string;
  user_id?: string;
  stat_date: string;
  workouts_completed?: number;
  total_workout_minutes?: number;
  calories_burned?: number;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  sleep_duration_minutes?: number;
  sleep_quality?: number;
  water_intake_ml?: number;
  hydration_goal_ml?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AiRequest {
  id: string;
  user_id?: string;
  pillar_type?: PillarType;
  prompt: string;
  context?: Json;
  status?: RequestStatus;
  webhook_response?: Json;
  created_at?: string;
  updated_at?: string;
  source?: RequestSource;
}

export interface AiRecommendation {
  id: string;
  user_id?: string;
  request_id?: string;
  pillar_type?: PillarType;
  recommendation: string;
  metadata?: Json;
  is_applied?: boolean;
  created_at?: string;
  applied_at?: string;
  applied_by?: AppliedBy;
  applicable_modules?: string[];
  confidence_score?: number;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  mood?: number;
  energy?: number;
  motivation?: number;
  sleep_quality?: number;
  stress_level?: number;
  notes?: string;
  created_at?: string;
}

export interface SleepSession {
  id: string;
  user_id?: string;
  sleep_date: string;
  bedtime?: string;
  wake_time?: string;
  duration_minutes?: number;
  quality_rating?: number;
  mood_rating?: number;
  energy_level?: number;
  factors?: Json;
  notes?: string;
  created_at?: string;
  hrv_ms?: number;
  resting_hr?: number;
  sleep_efficiency?: number;
  sleep_stage_data?: Json;
}

export interface HydrationLog {
  id: string;
  user_id?: string;
  log_date: string;
  amount_ml: number;
  drink_type?: DrinkType;
  logged_at?: string;
  created_at?: string;
  hydration_context?: HydrationContext;
}

export interface Meal {
  id: string;
  user_id?: string;
  meal_type?: MealType;
  meal_date: string;
  foods?: Json;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  notes?: string;
  created_at?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_dairy_free?: boolean;
  allergens?: string[];
  meal_photo_url?: string;
  meal_time?: string;
}

export interface FoodLibrary {
  id: string;
  name: string;
  brand?: string;
  category?: FoodCategory;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  common_units?: Json;
  created_at?: string;
  sodium_per_100g?: number;
  calcium_per_100g?: number;
  iron_per_100g?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  origin?: string;
  is_dairy_free?: boolean;
  allergens?: string[];
  dietary_tags?: string[];
  barcode?: string;
  portion_size_default?: number;
  fdc_id?: string;
  gtin_upc?: string;
  updated_at?: string;
}

export interface ExerciseLibrary {
  id: string;
  name: string;
  description?: string;
  category?: ExerciseCategory;
  muscle_groups?: string[];
  equipment?: Equipment;
  difficulty?: Difficulty;
  instructions?: string;
  notes?: string;
  image_url?: string;
  video_url?: string;
  created_at?: string;
  movement_type?: MovementType;
  exercise_mechanic?: ExerciseMechanic;
  force_type?: ForceType;
  level_of_home_use?: HomeUseLevel;
  is_outdoor_friendly?: boolean;
}

export interface Workout {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  workout_type?: WorkoutType;
  duration_minutes?: number;
  calories_burned?: number;
  difficulty?: Difficulty;
  exercises?: Json;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  plan_id?: string;
  is_template?: boolean;
  muscle_objectives?: string[];
}

export interface SportDrillLibrary {
  id: string;
  name: string;
  description?: string;
  sport: string;
  position?: string;
  season_phase?: SeasonPeriod;
  goal?: DrillGoal;
  difficulty?: Difficulty;
  duration_seconds?: number;
  equipment?: string;
  instructions?: string;
  video_url?: string;
  created_at?: string;
}

export interface SportsLibrary {
  id: number;
  name: string;
  name_en?: string;
  category?: string;
  country_code?: string;
  is_popular?: boolean;
  positions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserGoal {
  id: string;
  user_id?: string;
  category?: GoalCategory;
  goal_type?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date?: string;
  target_date?: string;
  is_active?: boolean;
  achieved_at?: string;
  created_at?: string;
  module?: string;
  progress_history?: Json;
  reminder_enabled?: boolean;
}

export interface UserInjury {
  id: string;
  user_id?: string;
  injury_type?: string;
  side?: InjurySide;
  severity?: InjurySeverity;
  occurred_on?: string;
  resolved_on?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  pillar_type?: PillarType;
  is_read?: boolean;
  scheduled_for?: string;
  sent_at?: string;
  metadata?: Json;
  created_at?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  description?: string;
  earned_at?: string;
  pillar_type?: PillarType;
  metadata?: Json;
}

export interface UserStat {
  id: string;
  user_id: string;
  pillar_type: PillarType;
  stat_type: string;
  value: number;
  date: string;
  metadata?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface UserPillarData {
  id: string;
  user_id: string;
  pillar_type: PillarType;
  data: Json;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyStats {
  id: string;
  user_id: string;
  month: string;
  total_workouts?: number;
  total_workout_minutes?: number;
  avg_workout_duration?: number;
  total_calories_burned?: number;
  avg_daily_calories?: number;
  avg_daily_protein?: number;
  avg_daily_carbs?: number;
  avg_daily_fat?: number;
  avg_sleep_duration?: number;
  avg_sleep_quality?: number;
  total_sleep_sessions?: number;
  avg_daily_water_ml?: number;
  hydration_goal_achievement_rate?: number;
  days_with_data?: number;
  profile_type?: string;
  active_modules?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FoodPreference {
  id: string;
  user_id?: string;
  food_name?: string;
  preference?: FoodPreference;
  recorded_at?: string;
  expire_at?: string;
}

export interface RiskAlert {
  id: string;
  user_id?: string;
  recommendation_id?: string;
  pillar_type?: string;
  risk_code?: string;
  risk_level?: RiskLevel;
  message?: string;
  created_at?: string;
}

export interface TrainingLoad {
  user_id: string;
  session_id: string;
  start_ts?: string;
  duration_min?: number;
  avg_hr?: number;
  trimp?: number;
  atl?: number;
  ctl?: number;
  acwr?: number;
  hrv_rmssd?: number;
  fatigue_flag?: boolean;
  rpe?: number;
}

export interface PillarCoordination {
  id: string;
  user_id?: string;
  coordination_data: Json;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SyntheseFinale {
  id: string;
  user_id?: string;
  thread_id?: string;
  synthese?: string;
  type_demande?: string;
  horodatage?: string;
  created_at?: string;
}

export interface ExerciseComplementarity {
  id: string;
  drill_id?: string;
  strength_ex_id?: string;
  complement_type?: string;
}

export interface Country {
  code: string;
  name_fr: string;
}

export interface DietaryRestrictionsReference {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

export interface FoodAllergiesReference {
  id: number;
  name: string;
  category?: string;
  severity_default?: string;
  description?: string;
}

// Types pour les insertions (sans les champs auto-générés)
export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
export type DailyStatsInsert = Omit<DailyStats, 'id' | 'created_at' | 'updated_at'>;
export type WorkoutInsert = Omit<Workout, 'id' | 'created_at'>;
export type MealInsert = Omit<Meal, 'id' | 'created_at'>;
export type SleepSessionInsert = Omit<SleepSession, 'id' | 'created_at'>;
export type HydrationLogInsert = Omit<HydrationLog, 'id' | 'created_at' | 'logged_at'>;

// Types pour les mises à jour (tous les champs optionnels sauf l'ID)
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id'>>;
export type DailyStatsUpdate = Partial<Omit<DailyStats, 'id'>>;
export type WorkoutUpdate = Partial<Omit<Workout, 'id'>>;
