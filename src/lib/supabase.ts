import { createClient } from '@supabase/supabase-js';

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          age: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          gender: 'male' | 'female' | 'other' | null;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          fitness_goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'strength' | 'endurance' | null;
          timezone: string | null;
          notifications_enabled: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          fitness_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'strength' | 'endurance' | null;
          timezone?: string | null;
          notifications_enabled?: boolean | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          age?: number | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
          fitness_goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'strength' | 'endurance' | null;
          timezone?: string | null;
          notifications_enabled?: boolean | null;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
          duration_minutes: number | null;
          calories_burned: number | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          exercises: any | null; // JSONB
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          workout_type?: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          exercises?: any | null;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          workout_type?: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          exercises?: any | null;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      exercises_library: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'flexibility' | null;
          muscle_groups: string[] | null;
          equipment: 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_band' | 'machine' | 'other' | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          instructions: string | null;
          tips: string | null;
          image_url: string | null;
          video_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'flexibility' | null;
          muscle_groups?: string[] | null;
          equipment?: 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_band' | 'machine' | 'other' | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          instructions?: string | null;
          tips?: string | null;
          image_url?: string | null;
          video_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'flexibility' | null;
          muscle_groups?: string[] | null;
          equipment?: 'bodyweight' | 'dumbbells' | 'barbell' | 'resistance_band' | 'machine' | 'other' | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          instructions?: string | null;
          tips?: string | null;
          image_url?: string | null;
          video_url?: string | null;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          stat_date: string;
          workouts_completed: number | null;
          total_workout_minutes: number | null;
          calories_burned: number | null;
          total_calories: number | null;
          total_protein: number | null;
          total_carbs: number | null;
          total_fat: number | null;
          sleep_duration_minutes: number | null;
          sleep_quality: number | null;
          water_intake_ml: number | null;
          hydration_goal_ml: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stat_date: string;
          workouts_completed?: number | null;
          total_workout_minutes?: number | null;
          calories_burned?: number | null;
          total_calories?: number | null;
          total_protein?: number | null;
          total_carbs?: number | null;
          total_fat?: number | null;
          sleep_duration_minutes?: number | null;
          sleep_quality?: number | null;
          water_intake_ml?: number | null;
          hydration_goal_ml?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          stat_date?: string;
          workouts_completed?: number | null;
          total_workout_minutes?: number | null;
          calories_burned?: number | null;
          total_calories?: number | null;
          total_protein?: number | null;
          total_carbs?: number | null;
          total_fat?: number | null;
          sleep_duration_minutes?: number | null;
          sleep_quality?: number | null;
          water_intake_ml?: number | null;
          hydration_goal_ml?: number | null;
          updated_at?: string;
        };
      };
    };
    Functions: {
      calculate_daily_stats: {
        Args: {
          user_uuid: string;
          target_date?: string;
        };
        Returns: void;
      };
      get_weekly_stats: {
        Args: {
          user_uuid: string;
          start_date?: string;
        };
        Returns: {
          total_workouts: number;
          total_workout_minutes: number;
          total_calories_burned: number;
          avg_daily_calories: number;
          avg_daily_protein: number;
          avg_daily_hydration: number;
          avg_sleep_duration: number;
          avg_sleep_quality: number;
          days_with_data: number;
        }[];
      };
      get_user_dashboard: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          full_name: string;
          fitness_goal: string;
          activity_level: string;
          today_workouts: number;
          today_workout_minutes: number;
          today_calories_burned: number;
          today_nutrition_calories: number;
          today_hydration_ml: number;
          today_hydration_percentage: number;
          today_sleep_duration: number;
          today_sleep_quality: number;
          week_total_workouts: number;
          week_avg_workout_minutes: number;
          week_total_calories: number;
          week_avg_sleep: number;
          active_goals_count: number;
          achieved_goals_count: number;
        }[];
      };
      create_demo_data: {
        Args: {
          user_uuid: string;
        };
        Returns: string;
      };
    };
  };
}

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY'
  );
}

// Client Supabase configuré avec les types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types utilitaires exportés
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type Exercise = Database['public']['Tables']['exercises_library']['Row'];
export type DailyStats = Database['public']['Tables']['daily_stats']['Row'];

// Helper pour la gestion d'erreurs Supabase
export const handleSupabaseError = (error: any, context: string = '') => {
  console.error(`Erreur Supabase${context ? ` (${context})` : ''}:`, error);
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
};

// Helper pour vérifier l'authentification
export const requireAuth = () => {
  return supabase.auth.getUser();
};

export default supabase;
