// This file replaces the old Supabase setup with local types
// Migration: Now using local auth system and Drizzle/Neon Postgres

export type Database = any;
export type Json = any;

export type UserProfile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  email?: string;
  age?: number | null;
  gender?: 'male' | 'female' | null;
  sport?: string | null;
  sport_position?: string | null;
  sport_level?: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional' | null;
  lifestyle?: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
  fitness_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  primary_goals?: string[];
  training_frequency?: number | null;
  season_period?: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
  available_time_per_day?: number | null;
  active_modules?: string[];
  modules?: string[];
  profile_type?: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus';
  sport_specific_stats?: Record<string, number>;
  injuries?: string[];
  motivation?: string;
  fitness_goal?: string;
};

export type Workout = any;
export type Exercise = any;
export type DailyStats = any;
export type HydrationEntry = any;
export type Meal = any;
export type SleepSession = any;
export type AiRecommendation = any;
export type AiRequest = any;
export type FoodLibraryEntry = any;
export type UserGoal = any;
export type PillarCoordination = any;

export type SupabaseAuthUserType = UserProfile & {
  level?: number;
  totalPoints?: number;
  joinDate?: string;
  name?: string;
  goal?: string;
};

export const handleSupabaseError = (error: unknown, context: string = '') => {
  console.error(`Error ${context}:`, error);
  
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string;
  }
  
  return 'Une erreur inattendue s\'est produite';
};

export const requireAuth = () => {
  // This is now handled by our local auth system
  return null;
};

// Legacy compatibility - these will be migrated away
export const supabase = {
  auth: {
    signOut: () => Promise.resolve(),
    getUser: () => Promise.resolve({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: null } })
  }
};

export default supabase;