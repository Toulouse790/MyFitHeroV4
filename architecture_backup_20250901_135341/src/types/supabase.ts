// types/supabase.ts

// Imports des nouveaux types workout
export * from './workout.types';

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  height: number | null;
  weight: number | null;
  activity_level:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active'
    | null;
  fitness_goals: string[] | null;
  sport: string | null;
  sport_position: string | null;
  sport_level: string | null;
  lifestyle: string | null;
  training_frequency: number | null;
  primary_goals: string[] | null;
  fitness_experience: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  workout_reminders: boolean;
  hydration_reminders: boolean;
  meal_reminders: boolean;
  sleep_reminders: boolean;
  achievement_alerts: boolean;
  weekly_summary: boolean;
  marketing_emails: boolean;
}

export interface PrivacySettings {
  profile_public: boolean;
  share_stats: boolean;
  allow_friend_requests: boolean;
  show_activity: boolean;
}

export interface AppPreferences {
  language: 'fr' | 'en' | 'es' | 'de';
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  currency: 'EUR' | 'USD' | 'GBP' | 'CAD';
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  app_preferences: AppPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserWorkout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  calories_burned: number | null;
  exercises: WorkoutExercise[];
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  intensity: 'low' | 'moderate' | 'high';
  notes: string | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  muscle_groups: string[];
  equipment: string | null;
  instructions: string | null;
}

export interface ExerciseSet {
  reps: number;
  weight: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  rest_seconds: number | null;
}

export interface UserNutrition {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number | null;
  total_sugar: number | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories_per_unit: number;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
  fiber_per_unit: number | null;
  sugar_per_unit: number | null;
}

export interface UserHydration {
  id: string;
  user_id: string;
  amount_ml: number;
  beverage_type: 'water' | 'tea' | 'coffee' | 'juice' | 'sports_drink' | 'other';
  notes: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserSleep {
  id: string;
  user_id: string;
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  quality_rating: 1 | 2 | 3 | 4 | 5;
  sleep_stages: SleepStage[] | null;
  notes: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  duration_minutes: number;
  start_time: string;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  date: string;
  steps: number | null;
  calories_burned: number | null;
  active_minutes: number | null;
  distance_meters: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  heart_rate_resting: number | null;
  weight: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  data_source: 'manual' | 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'other';
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type:
    | 'workout_streak'
    | 'weight_loss'
    | 'distance_goal'
    | 'strength_pr'
    | 'consistency'
    | 'other';
  title: string;
  description: string;
  icon: string | null;
  points: number;
  unlocked_at: string;
  created_at: string;
}

export interface UserSocialConnection {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface WearableData {
  steps: number | null;
  caloriesBurned: number | null;
  activeMinutes: number | null;
  distance: number | null;
  heartRate: HeartRateData[] | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  restingHeartRate: number | null;
  sleepData: WearableSleepData | null;
}

export interface HeartRateData {
  timestamp: string;
  value: number;
}

export interface WearableSleepData {
  bedtime: string;
  wakeTime: string;
  duration: number;
  efficiency: number | null;
  stages: SleepStage[] | null;
}

export interface ConnectedScale {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  mac_address: string | null;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  bone_mass: number | null;
  water_percentage: number | null;
  source: 'manual' | 'connected_scale' | 'wearable';
  scale_id: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Types pour les formulaires
export interface ProfileFormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  city: string;
  country: string;
}

export interface WorkoutFormData {
  name: string;
  description: string;
  workout_type: UserWorkout['workout_type'];
  intensity: UserWorkout['intensity'];
  duration_minutes: number;
  exercises: WorkoutExercise[];
  notes: string;
}

export interface NutritionFormData {
  meal_type: UserNutrition['meal_type'];
  food_items: FoodItem[];
  notes: string;
}

export interface HydrationFormData {
  amount_ml: number;
  beverage_type: UserHydration['beverage_type'];
  notes: string;
}

export interface SleepFormData {
  bedtime: string;
  wake_time: string;
  quality_rating: UserSleep['quality_rating'];
  notes: string;
}

// Types pour les stores
export interface AppStoreState {
  appStoreUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setAppStoreUser: (user: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  clearStore: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface WorkoutStoreState {
  workouts: UserWorkout[];
  currentWorkout: UserWorkout | null;
  isLoading: boolean;
  error: string | null;
  addWorkout: (workout: UserWorkout) => void;
  updateWorkout: (id: string, updates: Partial<UserWorkout>) => void;
  deleteWorkout: (id: string) => void;
  setCurrentWorkout: (workout: UserWorkout | null) => void;
  loadWorkouts: (userId: string) => Promise<void>;
  clearWorkouts: () => void;
}

export interface NutritionStoreState {
  nutritionEntries: UserNutrition[];
  dailyTotals: DailyNutritionTotals | null;
  isLoading: boolean;
  error: string | null;
  addNutritionEntry: (entry: UserNutrition) => void;
  updateNutritionEntry: (id: string, updates: Partial<UserNutrition>) => void;
  deleteNutritionEntry: (id: string) => void;
  loadNutritionEntries: (userId: string, date: string) => Promise<void>;
  calculateDailyTotals: (date: string) => void;
  clearNutrition: () => void;
}

export interface DailyNutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface HydrationStoreState {
  hydrationEntries: UserHydration[];
  dailyTotal: number;
  dailyGoal: number;
  isLoading: boolean;
  error: string | null;
  addHydrationEntry: (entry: UserHydration) => void;
  updateHydrationEntry: (id: string, updates: Partial<UserHydration>) => void;
  deleteHydrationEntry: (id: string) => void;
  loadHydrationEntries: (userId: string, date: string) => Promise<void>;
  setDailyGoal: (goal: number) => void;
  calculateDailyTotal: (date: string) => void;
  clearHydration: () => void;
}

export interface SleepStoreState {
  sleepEntries: UserSleep[];
  currentEntry: UserSleep | null;
  isLoading: boolean;
  error: string | null;
  addSleepEntry: (entry: UserSleep) => void;
  updateSleepEntry: (id: string, updates: Partial<UserSleep>) => void;
  deleteSleepEntry: (id: string) => void;
  loadSleepEntries: (userId: string, startDate: string, endDate: string) => Promise<void>;
  clearSleep: () => void;
}

export interface AnalyticsStoreState {
  analyticsData: UserAnalytics[];
  isLoading: boolean;
  error: string | null;
  addAnalyticsEntry: (entry: UserAnalytics) => void;
  loadAnalyticsData: (userId: string, startDate: string, endDate: string) => Promise<void>;
  clearAnalytics: () => void;
}

// Types pour les hooks
export interface UseWearableSyncReturn {
  isLoading: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  isAppleHealthAvailable: boolean;
  isGoogleFitAvailable: boolean;
  syncAppleHealth: () => Promise<WearableData | null>;
  syncGoogleFit: () => Promise<WearableData | null>;
  syncAll: () => Promise<WearableData | null>;
  scheduleSync: (intervalMinutes: number) => () => void;
  getCachedData: () => WearableData | null;
  cacheData: (data: WearableData) => void;
}

export interface UseToastReturn {
  toast: (options: ToastOptions) => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Types pour les composants
export interface UniformHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  gradient?: boolean;
  rightContent?: React.ReactNode;
  onBack?: () => void;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export interface InputProps {
  id?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface TextareaProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Types pour les utilitaires
export interface DateRange {
  start: string;
  end: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ComponentType;
}

// Database type global
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'created_at'>>;
      };
      user_workouts: {
        Row: UserWorkout;
        Insert: Omit<UserWorkout, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserWorkout, 'id' | 'created_at'>>;
      };
      user_nutrition: {
        Row: UserNutrition;
        Insert: Omit<UserNutrition, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserNutrition, 'id' | 'created_at'>>;
      };
      user_hydration: {
        Row: UserHydration;
        Insert: Omit<UserHydration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserHydration, 'id' | 'created_at'>>;
      };
      user_sleep: {
        Row: UserSleep;
        Insert: Omit<UserSleep, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSleep, 'id' | 'created_at'>>;
      };
      user_analytics: {
        Row: UserAnalytics;
        Insert: Omit<UserAnalytics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserAnalytics, 'id' | 'created_at'>>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, 'id' | 'created_at'>;
        Update: Partial<Omit<UserAchievement, 'id' | 'created_at'>>;
      };
      user_social_connections: {
        Row: UserSocialConnection;
        Insert: Omit<UserSocialConnection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSocialConnection, 'id' | 'created_at'>>;
      };
      connected_scales: {
        Row: ConnectedScale;
        Insert: Omit<ConnectedScale, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ConnectedScale, 'id' | 'created_at'>>;
      };
      weight_entries: {
        Row: WeightEntry;
        Insert: Omit<WeightEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WeightEntry, 'id' | 'created_at'>>;
      };
    };
  };
}
