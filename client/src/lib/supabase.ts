import { createClient } from '@supabase/supabase-js';

// Types exportés pour compatibilité avec le code existant
export interface DailyStats {
  id: string;
  user_id: string;
  stat_date: string;
  total_workout_minutes?: number;
  workouts_completed?: number;
  calories_burned?: number;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  water_intake_ml?: number;
  hydration_goal_ml?: number;
  sleep_duration_minutes?: number;
  sleep_quality?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AiRecommendation {
  id: string;
  user_id: string;
  type: string;
  content: string;
  priority: string;
  context?: Json;
  created_at?: string;
  is_read?: boolean;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Singleton pattern pour éviter les multiples instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
