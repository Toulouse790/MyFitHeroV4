// client/src/types/database.ts
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          age: number | null;
          gender: string | null;
          fitness_goal: string | null;
          activity_level: string | null;
          // ... champs existants
          
          // 🆕 Nouveaux champs
          email_validated: boolean;
          last_login: string | null;
          language: string;
          subscription_status: string;
        };
        Insert: {
          id: string;
          email_validated?: boolean;
          last_login?: string | null;
          language?: string;
          subscription_status?: string;
          // ... autres champs
        };
        Update: {
          email_validated?: boolean;
          last_login?: string | null;
          language?: string;
          subscription_status?: string;
          // ... autres champs
        };
      };
      
      ai_requests: {
        Row: {
          id: string;
          user_id: string | null;
          pillar_type: string | null;
          prompt: string;
          context: Json | null;
          status: string;
          webhook_response: Json | null;
          created_at: string;
          updated_at: string;
          // 🆕 Nouveau champ
          source: string;
        };
        Insert: {
          source?: string;
          // ... autres champs
        };
      };
      
      ai_recommendations: {
        Row: {
          id: string;
          user_id: string | null;
          request_id: string | null;
          pillar_type: string | null;
          recommendation: string;
          metadata: Json | null;
          is_applied: boolean;
          created_at: string;
          applied_at: string | null;
          applied_by: string | null;
          applicable_modules: string[];
          // 🆕 Nouveau champ
          confidence_score: number;
        };
        Insert: {
          confidence_score?: number;
          // ... autres champs
        };
      };
      
      workouts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          workout_type: string | null;
          duration_minutes: number | null;
          calories_burned: number | null;
          difficulty: string | null;
          exercises: Json | null;
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          // 🆕 Nouveaux champs
          plan_id: string | null;
          is_template: boolean;
        };
        Insert: {
          plan_id?: string | null;
          is_template?: boolean;
          // ... autres champs
        };
      };
      
      meals: {
        Row: {
          id: string;
          user_id: string | null;
          meal_type: string | null;
          meal_date: string;
          foods: Json | null;
          total_calories: number | null;
          total_protein: number | null;
          total_carbs: number | null;
          total_fat: number | null;
          notes: string | null;
          created_at: string;
          is_vegetarian: boolean;
          is_vegan: boolean;
          is_gluten_free: boolean;
          is_dairy_free: boolean;
          allergens: string[];
          // 🆕 Nouveaux champs
          meal_photo_url: string | null;
          meal_time: string | null;
        };
        Insert: {
          meal_photo_url?: string | null;
          meal_time?: string | null;
          // ... autres champs
        };
      };
      
      foods_library: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          category: string | null;
          calories_per_100g: number | null;
          protein_per_100g: number | null;
          carbs_per_100g: number | null;
          fat_per_100g: number | null;
          fiber_per_100g: number | null;
          sugar_per_100g: number | null;
          common_units: Json | null;
          created_at: string;
          sodium_per_100g: number | null;
          calcium_per_100g: number | null;
          iron_per_100g: number | null;
          is_vegetarian: boolean;
          is_vegan: boolean;
          is_gluten_free: boolean;
          origin: string | null;
          is_dairy_free: boolean;
          allergens: string[];
          dietary_tags: string[];
          // 🆕 Nouveaux champs
          barcode: string | null;
          portion_size_default: number;
        };
        Insert: {
          barcode?: string | null;
          portion_size_default?: number;
          // ... autres champs
        };
      };
      
      sleep_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          sleep_date: string;
          bedtime: string | null;
          wake_time: string | null;
          duration_minutes: number | null;
          quality_rating: number | null;
          mood_rating: number | null;
          energy_level: number | null;
          factors: Json | null;
          notes: string | null;
          created_at: string;
          hrv_ms: number | null;
          resting_hr: number | null;
          sleep_efficiency: number | null;
          // 🆕 Nouveau champ
          sleep_stage_data: Json | null;
        };
        Insert: {
          sleep_stage_data?: Json | null;
          // ... autres champs
        };
      };
      
      hydration_logs: {
        Row: {
          id: string;
          user_id: string | null;
          log_date: string;
          amount_ml: number;
          drink_type: string;
          logged_at: string;
          created_at: string;
          // 🆕 Nouveau champ
          hydration_context: string;
        };
        Insert: {
          hydration_context?: string;
          // ... autres champs
        };
      };
      
      user_goals: {
        Row: {
          id: string;
          user_id: string | null;
          category: string | null;
          goal_type: string | null;
          target_value: number | null;
          current_value: number;
          unit: string | null;
          start_date: string | null;
          target_date: string | null;
          is_active: boolean;
          achieved_at: string | null;
          created_at: string;
          module: string;
          // 🆕 Nouveaux champs
          progress_history: Json;
          reminder_enabled: boolean;
        };
        Insert: {
          progress_history?: Json;
          reminder_enabled?: boolean;
          // ... autres champs
        };
      };
    };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
