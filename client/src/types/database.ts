// MyFitHeroV4/client/src/types/database.ts
/* -------------------------------------------------------------------------- */
/*                              JSON ALIAS                                    */
/* -------------------------------------------------------------------------- */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/* -------------------------------------------------------------------------- */
/*                               DATABASE                                     */
/* -------------------------------------------------------------------------- */
export interface Database {
  public: {
    /* =============================== TABLES =============================== */
    Tables: {
      /* --------------------------- AI REQUESTS -------------------------- */
      ai_requests: {
        Row: {
          id: string;
          user_id: string | null;
          pillar_type: string | null;
          prompt: string;
          context: Json | null;
          status: string | null;
          webhook_response: Json | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          pillar_type?: string | null;
          prompt: string;
          context?: Json | null;
          status?: string | null;
          webhook_response?: Json | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['ai_requests']['Row'], 'id'>>;
      };

      /* ------------------------ AI RECOMMENDATIONS ---------------------- */
      ai_recommendations: {
        Row: {
          id: string;
          user_id: string | null;
          request_id: string | null;
          pillar_type: string | null;
          recommendation: string;
          metadata: Json | null;
          is_applied: boolean | null;
          applicable_modules: string[] | null;
          confidence_score: number | null;
          created_at: string;
          applied_at: string | null;
          applied_by: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          request_id?: string | null;
          pillar_type?: string | null;
          recommendation: string;
          metadata?: Json | null;
          is_applied?: boolean | null;
          applicable_modules?: string[] | null;
          confidence_score?: number | null;
          created_at?: string;
          applied_at?: string | null;
          applied_by?: string | null;
        };
        Update: Partial<Omit<Database['public']['Tables']['ai_recommendations']['Row'], 'id'>>;
      };

      /* --------------------------- USER PROFILES ------------------------ */
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          first_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          age: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          gender: string | null;
          timezone: string | null;
          language: string | null;
          notifications_enabled: boolean | null;
          lifestyle: string | null;

          fitness_goal: string | null;
          profile_type: string | null;
          modules: string[] | null;
          active_modules: string[] | null;

          /* sport */
          sport: string | null;
          sport_position: string | null;
          sport_level: string | null;
          season_period: string | null;
          training_frequency: string | null;
          equipment_level: string | null;

          /* strength */
          strength_objective: string | null;
          strength_experience: string | null;

          /* nutrition */
          dietary_preference: string | null;
          dietary_restrictions: string[] | null;
          food_allergies: string[] | null;
          food_dislikes: string[] | null;
          nutrition_objective: string | null;

          /* sleep */
          sleep_hours_average: number | null;
          sleep_difficulties: boolean | null;

          /* hydration */
          water_intake_goal: number | null;
          hydration_reminders: boolean | null;

          /* misc & coaching */
          injuries: string[] | null;
          primary_goals: string[] | null;
          motivation: string | null;
          available_time_per_day: number | null;
          activity_level: string | null;
          coaching_style: string | null;
          target_weight_kg: number | null;
          main_obstacles: string[] | null;
          connected_devices: string[] | null;
          device_brands: Json | null;

          /* localisation */
          country_code: string | null;

          /* system flags */
          email_validated: boolean | null;
          subscription_status: string | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['user_profiles']['Row'], 'id'>>;
      };

      /* ----------------------------- WORKOUTS --------------------------- */
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
          plan_id: string | null;
          is_template: boolean | null;
          muscle_objectives: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workouts']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['workouts']['Row'], 'id'>>;
      };

      /* ------------------------------ MEALS ---------------------------- */
      meals: {
        Row: {
          id: string;
          user_id: string | null;
          meal_type: string | null;
          meal_date: string;
          meal_time: string | null;
          foods: Json | null;
          total_calories: number | null;
          total_protein: number | null;
          total_carbs: number | null;
          total_fat: number | null;
          notes: string | null;
          meal_photo_url: string | null;
          is_vegetarian: boolean | null;
          is_vegan: boolean | null;
          is_gluten_free: boolean | null;
          is_dairy_free: boolean | null;
          allergens: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meals']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['meals']['Row'], 'id'>>;
      };

      /* -------------------------- FOODS LIBRARY ------------------------ */
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
          sodium_per_100g: number | null;
          calcium_per_100g: number | null;
          iron_per_100g: number | null;
          common_units: Json | null;
          origin: string | null;
          barcode: string | null;
          portion_size_default: number | null;
          is_vegetarian: boolean | null;
          is_vegan: boolean | null;
          is_gluten_free: boolean | null;
          is_dairy_free: boolean | null;
          allergens: string[] | null;
          dietary_tags: string[] | null;
          fdc_id: string | null;
          gtin_upc: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['foods_library']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['foods_library']['Row'], 'id'>>;
      };

      /* ------------------------- HYDRATION LOGS ------------------------ */
      hydration_logs: {
        Row: {
          id: string;
          user_id: string | null;
          log_date: string;
          amount_ml: number;
          drink_type: string;
          hydration_context: string | null;
          logged_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hydration_logs']['Row'], 'id' | 'logged_at' | 'created_at'> & {
          id?: string;
          logged_at?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['hydration_logs']['Row'], 'id'>>;
      };

      /* -------------------------- SLEEP SESSIONS ----------------------- */
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
          sleep_stage_data: Json | null;
          hrv_ms: number | null;
          resting_hr: number | null;
          sleep_efficiency: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sleep_sessions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['sleep_sessions']['Row'], 'id'>>;
      };

      /* --------------------------- USER GOALS -------------------------- */
      user_goals: {
        Row: {
          id: string;
          user_id: string | null;
          category: string | null;
          goal_type: string | null;
          module: string | null;
          target_value: number | null;
          current_value: number;
          unit: string | null;
          start_date: string | null;
          target_date: string | null;
          is_active: boolean | null;
          achieved_at: string | null;
          progress_history: Json | null;
          reminder_enabled: boolean | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_goals']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['user_goals']['Row'], 'id'>>;
      };

      /* --------------------------- (autres tables) ---------------------- */
      /* Les autres tables de ton schéma (daily_stats, risk_alerts, etc.)
         ne sont pas encore utilisées dans le code ; ajoute‑les ici plus
         tard si besoin.                                                   */
    };
  };
}
