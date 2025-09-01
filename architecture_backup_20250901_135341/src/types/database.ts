export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          id: string;
          user_id: string | null;
          request_id: string | null;
          pillar_type: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general' | null;
          recommendation: string;
          metadata: Json | null;
          is_applied: boolean | null;
          created_at: string | null;
          applied_at: string | null;
          applied_by: 'user' | 'auto' | null;
          applicable_modules: string[] | null;
          confidence_score: number | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          request_id?: string | null;
          pillar_type?: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general' | null;
          recommendation: string;
          metadata?: Json | null;
          is_applied?: boolean | null;
          created_at?: string | null;
          applied_at?: string | null;
          applied_by?: 'user' | 'auto' | null;
          applicable_modules?: string[] | null;
          confidence_score?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          request_id?: string | null;
          pillar_type?: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general' | null;
          recommendation?: string;
          metadata?: Json | null;
          is_applied?: boolean | null;
          created_at?: string | null;
          applied_at?: string | null;
          applied_by?: 'user' | 'auto' | null;
          applicable_modules?: string[] | null;
          confidence_score?: number | null;
        };
      };
      ai_requests: {
        Row: {
          id: string;
          user_id: string | null;
          pillar_type: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general' | null;
          prompt: string;
          context: Json | null;
          status: 'pending' | 'processing' | 'completed' | 'failed' | null;
          webhook_response: Json | null;
          created_at: string | null;
          updated_at: string | null;
          source: 'app' | 'voice' | 'chat' | 'api' | 'webhook' | 'mobile' | 'wearable' | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          pillar_type?: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general' | null;
          prompt: string;
          context?: Json | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          webhook_response?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          source?: 'app' | 'voice' | 'chat' | 'api' | 'webhook' | 'mobile' | 'wearable' | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          pillar_type?: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'general' | null;
          prompt?: string;
          context?: Json | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          webhook_response?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          source?: 'app' | 'voice' | 'chat' | 'api' | 'webhook' | 'mobile' | 'wearable' | null;
        };
      };
      countries: {
        Row: {
          code: string;
          name_fr: string;
        };
        Insert: {
          code: string;
          name_fr: string;
        };
        Update: {
          code?: string;
          name_fr?: string;
        };
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: number | null;
          energy: number | null;
          motivation: number | null;
          sleep_quality: number | null;
          stress_level: number | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          mood?: number | null;
          energy?: number | null;
          motivation?: number | null;
          sleep_quality?: number | null;
          stress_level?: number | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mood?: number | null;
          energy?: number | null;
          motivation?: number | null;
          sleep_quality?: number | null;
          stress_level?: number | null;
          notes?: string | null;
          created_at?: string | null;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          user_id: string | null;
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
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
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
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
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
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      dietary_restrictions_reference: {
        Row: {
          id: number;
          name: string;
          category: string | null;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          category?: string | null;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string | null;
          description?: string | null;
        };
      };
      exercises_complementarity: {
        Row: {
          id: string;
          drill_id: string | null;
          strength_ex_id: string | null;
          complement_type: string | null;
        };
        Insert: {
          id?: string;
          drill_id?: string | null;
          strength_ex_id?: string | null;
          complement_type?: string | null;
        };
        Update: {
          id?: string;
          drill_id?: string | null;
          strength_ex_id?: string | null;
          complement_type?: string | null;
        };
      };
      exercises_library: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category:
            | 'chest'
            | 'back'
            | 'shoulders'
            | 'arms'
            | 'legs'
            | 'core'
            | 'cardio'
            | 'flexibility'
            | null;
          muscle_groups: string[] | null;
          equipment:
            | 'bodyweight'
            | 'dumbbells'
            | 'barbell'
            | 'resistance_band'
            | 'machine'
            | 'other'
            | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          instructions: string | null;
          notes: string | null;
          image_url: string | null;
          video_url: string | null;
          created_at: string | null;
          movement_type: 'push' | 'pull' | 'legs' | 'core' | 'full_body' | null;
          exercise_mechanic: 'compound' | 'isolation' | null;
          force_type: 'push' | 'pull' | 'static' | null;
          level_of_home_use: 'no_equipment' | 'minimal_equipment' | 'some_equipment' | null;
          is_outdoor_friendly: boolean | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?:
            | 'chest'
            | 'back'
            | 'shoulders'
            | 'arms'
            | 'legs'
            | 'core'
            | 'cardio'
            | 'flexibility'
            | null;
          muscle_groups?: string[] | null;
          equipment?:
            | 'bodyweight'
            | 'dumbbells'
            | 'barbell'
            | 'resistance_band'
            | 'machine'
            | 'other'
            | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          instructions?: string | null;
          notes?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          created_at?: string | null;
          movement_type?: 'push' | 'pull' | 'legs' | 'core' | 'full_body' | null;
          exercise_mechanic?: 'compound' | 'isolation' | null;
          force_type?: 'push' | 'pull' | 'static' | null;
          level_of_home_use?: 'no_equipment' | 'minimal_equipment' | 'some_equipment' | null;
          is_outdoor_friendly?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?:
            | 'chest'
            | 'back'
            | 'shoulders'
            | 'arms'
            | 'legs'
            | 'core'
            | 'cardio'
            | 'flexibility'
            | null;
          muscle_groups?: string[] | null;
          equipment?:
            | 'bodyweight'
            | 'dumbbells'
            | 'barbell'
            | 'resistance_band'
            | 'machine'
            | 'other'
            | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          instructions?: string | null;
          notes?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          created_at?: string | null;
          movement_type?: 'push' | 'pull' | 'legs' | 'core' | 'full_body' | null;
          exercise_mechanic?: 'compound' | 'isolation' | null;
          force_type?: 'push' | 'pull' | 'static' | null;
          level_of_home_use?: 'no_equipment' | 'minimal_equipment' | 'some_equipment' | null;
          is_outdoor_friendly?: boolean | null;
        };
      };
      food_allergies_reference: {
        Row: {
          id: number;
          name: string;
          category: string | null;
          severity_default: string | null;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          category?: string | null;
          severity_default?: string | null;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string | null;
          severity_default?: string | null;
          description?: string | null;
        };
      };
      food_preferences: {
        Row: {
          id: string;
          user_id: string | null;
          food_name: string | null;
          preference: 'intolerance' | 'dislike' | 'temporary' | null;
          recorded_at: string | null;
          expire_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          food_name?: string | null;
          preference?: 'intolerance' | 'dislike' | 'temporary' | null;
          recorded_at?: string | null;
          expire_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          food_name?: string | null;
          preference?: 'intolerance' | 'dislike' | 'temporary' | null;
          recorded_at?: string | null;
          expire_at?: string | null;
        };
      };
      foods_library: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          category:
            | 'fruits'
            | 'vegetables'
            | 'proteins'
            | 'grains'
            | 'dairy'
            | 'fats'
            | 'beverages'
            | 'snacks'
            | 'other'
            | null;
          calories_per_100g: number | null;
          protein_per_100g: number | null;
          carbs_per_100g: number | null;
          fat_per_100g: number | null;
          fiber_per_100g: number | null;
          sugar_per_100g: number | null;
          common_units: Json | null;
          created_at: string | null;
          sodium_per_100g: number | null;
          calcium_per_100g: number | null;
          iron_per_100g: number | null;
          is_vegetarian: boolean | null;
          is_vegan: boolean | null;
          is_gluten_free: boolean | null;
          origin: string | null;
          is_dairy_free: boolean | null;
          allergens: string[] | null;
          dietary_tags: string[] | null;
          barcode: string | null;
          portion_size_default: number | null;
          fdc_id: string | null;
          gtin_upc: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          brand?: string | null;
          category?:
            | 'fruits'
            | 'vegetables'
            | 'proteins'
            | 'grains'
            | 'dairy'
            | 'fats'
            | 'beverages'
            | 'snacks'
            | 'other'
            | null;
          calories_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          fiber_per_100g?: number | null;
          sugar_per_100g?: number | null;
          common_units?: Json | null;
          created_at?: string | null;
          sodium_per_100g?: number | null;
          calcium_per_100g?: number | null;
          iron_per_100g?: number | null;
          is_vegetarian?: boolean | null;
          is_vegan?: boolean | null;
          is_gluten_free?: boolean | null;
          origin?: string | null;
          is_dairy_free?: boolean | null;
          allergens?: string[] | null;
          dietary_tags?: string[] | null;
          barcode?: string | null;
          portion_size_default?: number | null;
          fdc_id?: string | null;
          gtin_upc?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string | null;
          category?:
            | 'fruits'
            | 'vegetables'
            | 'proteins'
            | 'grains'
            | 'dairy'
            | 'fats'
            | 'beverages'
            | 'snacks'
            | 'other'
            | null;
          calories_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          fiber_per_100g?: number | null;
          sugar_per_100g?: number | null;
          common_units?: Json | null;
          created_at?: string | null;
          sodium_per_100g?: number | null;
          calcium_per_100g?: number | null;
          iron_per_100g?: number | null;
          is_vegetarian?: boolean | null;
          is_vegan?: boolean | null;
          is_gluten_free?: boolean | null;
          origin?: string | null;
          is_dairy_free?: boolean | null;
          allergens?: string[] | null;
          dietary_tags?: string[] | null;
          barcode?: string | null;
          portion_size_default?: number | null;
          fdc_id?: string | null;
          gtin_upc?: string | null;
          updated_at?: string | null;
        };
      };
      hydration_logs: {
        Row: {
          id: string;
          user_id: string | null;
          log_date: string;
          amount_ml: number;
          drink_type:
            | 'water'
            | 'tea'
            | 'coffee'
            | 'juice'
            | 'sports_drink'
            | 'other'
            | 'electrolytes'
            | null;
          logged_at: string | null;
          created_at: string | null;
          hydration_context:
            | 'normal'
            | 'workout'
            | 'meal'
            | 'wake_up'
            | 'before_sleep'
            | 'medication'
            | 'thirst'
            | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          log_date: string;
          amount_ml: number;
          drink_type?: 'water' | 'tea' | 'coffee' | 'juice' | 'sports_drink' | 'other' | null;
          logged_at?: string | null;
          created_at?: string | null;
          hydration_context?:
            | 'normal'
            | 'workout'
            | 'meal'
            | 'wake_up'
            | 'before_sleep'
            | 'medication'
            | 'thirst'
            | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          log_date?: string;
          amount_ml?: number;
          drink_type?: 'water' | 'tea' | 'coffee' | 'juice' | 'sports_drink' | 'other' | null;
          logged_at?: string | null;
          created_at?: string | null;
          hydration_context?:
            | 'normal'
            | 'workout'
            | 'meal'
            | 'wake_up'
            | 'before_sleep'
            | 'medication'
            | 'thirst'
            | null;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string | null;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
          meal_date: string;
          foods: Json | null;
          total_calories: number | null;
          total_protein: number | null;
          total_carbs: number | null;
          total_fat: number | null;
          notes: string | null;
          created_at: string | null;
          is_vegetarian: boolean | null;
          is_vegan: boolean | null;
          is_gluten_free: boolean | null;
          is_dairy_free: boolean | null;
          allergens: string[] | null;
          meal_photo_url: string | null;
          meal_time: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
          meal_date: string;
          foods?: Json | null;
          total_calories?: number | null;
          total_protein?: number | null;
          total_carbs?: number | null;
          total_fat?: number | null;
          notes?: string | null;
          created_at?: string | null;
          is_vegetarian?: boolean | null;
          is_vegan?: boolean | null;
          is_gluten_free?: boolean | null;
          is_dairy_free?: boolean | null;
          allergens?: string[] | null;
          meal_photo_url?: string | null;
          meal_time?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
          meal_date?: string;
          foods?: Json | null;
          total_calories?: number | null;
          total_protein?: number | null;
          total_carbs?: number | null;
          total_fat?: number | null;
          notes?: string | null;
          created_at?: string | null;
          is_vegetarian?: boolean | null;
          is_vegan?: boolean | null;
          is_gluten_free?: boolean | null;
          is_dairy_free?: boolean | null;
          allergens?: string[] | null;
          meal_photo_url?: string | null;
          meal_time?: string | null;
        };
      };
      monthly_stats: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          total_workouts: number | null;
          total_workout_minutes: number | null;
          avg_workout_duration: number | null;
          total_calories_burned: number | null;
          avg_daily_calories: number | null;
          avg_daily_protein: number | null;
          avg_daily_carbs: number | null;
          avg_daily_fat: number | null;
          avg_sleep_duration: number | null;
          avg_sleep_quality: number | null;
          total_sleep_sessions: number | null;
          avg_daily_water_ml: number | null;
          hydration_goal_achievement_rate: number | null;
          days_with_data: number | null;
          profile_type: string | null;
          active_modules: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          total_workouts?: number | null;
          total_workout_minutes?: number | null;
          avg_workout_duration?: number | null;
          total_calories_burned?: number | null;
          avg_daily_calories?: number | null;
          avg_daily_protein?: number | null;
          avg_daily_carbs?: number | null;
          avg_daily_fat?: number | null;
          avg_sleep_duration?: number | null;
          avg_sleep_quality?: number | null;
          total_sleep_sessions?: number | null;
          avg_daily_water_ml?: number | null;
          hydration_goal_achievement_rate?: number | null;
          days_with_data?: number | null;
          profile_type?: string | null;
          active_modules?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          total_workouts?: number | null;
          total_workout_minutes?: number | null;
          avg_workout_duration?: number | null;
          total_calories_burned?: number | null;
          avg_daily_calories?: number | null;
          avg_daily_protein?: number | null;
          avg_daily_carbs?: number | null;
          avg_daily_fat?: number | null;
          avg_sleep_duration?: number | null;
          avg_sleep_quality?: number | null;
          total_sleep_sessions?: number | null;
          avg_daily_water_ml?: number | null;
          hydration_goal_achievement_rate?: number | null;
          days_with_data?: number | null;
          profile_type?: string | null;
          active_modules?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      muscle_recovery_data: {
        Row: {
          id: string;
          user_id: string | null;
          muscle_group: string;
          last_workout_date: string | null;
          workout_intensity: string | null;
          workout_volume: number | null;
          workout_duration_minutes: number | null;
          recovery_status: string;
          recovery_percentage: number;
          estimated_full_recovery: string;
          fatigue_level: number;
          soreness_level: number;
          readiness_score: number;
          last_updated: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          muscle_group: string;
          last_workout_date?: string | null;
          workout_intensity?: string | null;
          workout_volume?: number | null;
          workout_duration_minutes?: number | null;
          recovery_status: string;
          recovery_percentage: number;
          estimated_full_recovery: string;
          fatigue_level: number;
          soreness_level: number;
          readiness_score: number;
          last_updated?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          muscle_group?: string;
          last_workout_date?: string | null;
          workout_intensity?: string | null;
          workout_volume?: number | null;
          workout_duration_minutes?: number | null;
          recovery_status?: string;
          recovery_percentage?: number;
          estimated_full_recovery?: string;
          fatigue_level?: number;
          soreness_level?: number;
          readiness_score?: number;
          last_updated?: string | null;
          created_at?: string | null;
        };
      };
      pillar_coordination: {
        Row: {
          id: string;
          user_id: string | null;
          coordination_data: Json;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          coordination_data: Json;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          coordination_data?: Json;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      risk_alerts: {
        Row: {
          id: string;
          user_id: string | null;
          recommendation_id: string | null;
          pillar_type: string | null;
          risk_code: string | null;
          risk_level: 'info' | 'warning' | 'critical' | null;
          message: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          recommendation_id?: string | null;
          pillar_type?: string | null;
          risk_code?: string | null;
          risk_level?: 'info' | 'warning' | 'critical' | null;
          message?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          recommendation_id?: string | null;
          pillar_type?: string | null;
          risk_code?: string | null;
          risk_level?: 'info' | 'warning' | 'critical' | null;
          message?: string | null;
          created_at?: string | null;
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
          created_at: string | null;
          hrv_ms: number | null;
          resting_hr: number | null;
          sleep_efficiency: number | null;
          sleep_stage_data: Json | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          sleep_date: string;
          bedtime?: string | null;
          wake_time?: string | null;
          duration_minutes?: number | null;
          quality_rating?: number | null;
          mood_rating?: number | null;
          energy_level?: number | null;
          factors?: Json | null;
          notes?: string | null;
          created_at?: string | null;
          hrv_ms?: number | null;
          resting_hr?: number | null;
          sleep_efficiency?: number | null;
          sleep_stage_data?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          sleep_date?: string;
          bedtime?: string | null;
          wake_time?: string | null;
          duration_minutes?: number | null;
          quality_rating?: number | null;
          mood_rating?: number | null;
          energy_level?: number | null;
          factors?: Json | null;
          notes?: string | null;
          created_at?: string | null;
          hrv_ms?: number | null;
          resting_hr?: number | null;
          sleep_efficiency?: number | null;
          sleep_stage_data?: Json | null;
        };
      };
      sport_drills_library: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sport: string;
          position: string | null;
          season_phase: 'pre_season' | 'in_season' | 'off_season' | 'recovery' | null;
          goal: 'speed' | 'power' | 'endurance' | 'skill' | 'agility' | 'technical' | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          duration_seconds: number | null;
          equipment: string | null;
          instructions: string | null;
          video_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sport: string;
          position?: string | null;
          season_phase?: 'pre_season' | 'in_season' | 'off_season' | 'recovery' | null;
          goal?: 'speed' | 'power' | 'endurance' | 'skill' | 'agility' | 'technical' | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          duration_seconds?: number | null;
          equipment?: string | null;
          instructions?: string | null;
          video_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sport?: string;
          position?: string | null;
          season_phase?: 'pre_season' | 'in_season' | 'off_season' | 'recovery' | null;
          goal?: 'speed' | 'power' | 'endurance' | 'skill' | 'agility' | 'technical' | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          duration_seconds?: number | null;
          equipment?: string | null;
          instructions?: string | null;
          video_url?: string | null;
          created_at?: string | null;
        };
      };
      sports_library: {
        Row: {
          id: number;
          name: string;
          name_en: string | null;
          category: string | null;
          country_code: string | null;
          is_popular: boolean | null;
          positions: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          name_en?: string | null;
          category?: string | null;
          country_code?: string | null;
          is_popular?: boolean | null;
          positions?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          name_en?: string | null;
          category?: string | null;
          country_code?: string | null;
          is_popular?: boolean | null;
          positions?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      synthese_finale: {
        Row: {
          id: string;
          user_id: string | null;
          thread_id: string | null;
          synthese: string | null;
          type_demande: string | null;
          horodatage: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          thread_id?: string | null;
          synthese?: string | null;
          type_demande?: string | null;
          horodatage?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          thread_id?: string | null;
          synthese?: string | null;
          type_demande?: string | null;
          horodatage?: string | null;
          created_at?: string | null;
        };
      };
      training_load: {
        Row: {
          user_id: string;
          session_id: string;
          start_ts: string | null;
          duration_min: number | null;
          avg_hr: number | null;
          trimp: number | null;
          atl: number | null;
          ctl: number | null;
          acwr: number | null;
          hrv_rmssd: number | null;
          fatigue_flag: boolean | null;
          rpe: number | null;
        };
        Insert: {
          user_id: string;
          session_id: string;
          start_ts?: string | null;
          duration_min?: number | null;
          avg_hr?: number | null;
          trimp?: number | null;
          atl?: number | null;
          ctl?: number | null;
          acwr?: number | null;
          hrv_rmssd?: number | null;
          fatigue_flag?: boolean | null;
          rpe?: number | null;
        };
        Update: {
          user_id?: string;
          session_id?: string;
          start_ts?: string | null;
          duration_min?: number | null;
          avg_hr?: number | null;
          trimp?: number | null;
          atl?: number | null;
          ctl?: number | null;
          acwr?: number | null;
          hrv_rmssd?: number | null;
          fatigue_flag?: boolean | null;
          rpe?: number | null;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          badge_name: string;
          description: string | null;
          earned_at: string | null;
          pillar_type: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general' | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          badge_name: string;
          description?: string | null;
          earned_at?: string | null;
          pillar_type?: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general' | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          badge_name?: string;
          description?: string | null;
          earned_at?: string | null;
          pillar_type?: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general' | null;
          metadata?: Json | null;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string | null;
          category: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'weight' | null;
          goal_type: string | null;
          target_value: number | null;
          current_value: number | null;
          unit: string | null;
          start_date: string | null;
          target_date: string | null;
          is_active: boolean | null;
          achieved_at: string | null;
          created_at: string | null;
          module: 'general' | 'sport' | 'nutrition' | 'sleep' | 'hydration' | null;
          progress_history: Json | null;
          reminder_enabled: boolean | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          category?: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'weight' | null;
          goal_type?: string | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          start_date?: string | null;
          target_date?: string | null;
          is_active?: boolean | null;
          achieved_at?: string | null;
          created_at?: string | null;
          module?: 'general' | 'sport' | 'nutrition' | 'sleep' | 'hydration' | null;
          progress_history?: Json | null;
          reminder_enabled?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          category?: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'weight' | null;
          goal_type?: string | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          start_date?: string | null;
          target_date?: string | null;
          is_active?: boolean | null;
          achieved_at?: string | null;
          created_at?: string | null;
          module?: 'general' | 'sport' | 'nutrition' | 'sleep' | 'hydration' | null;
          progress_history?: Json | null;
          reminder_enabled?: boolean | null;
        };
      };
      user_injuries: {
        Row: {
          id: string;
          user_id: string | null;
          injury_type: string | null;
          side: 'left' | 'right' | 'bilateral' | null;
          severity: 'mild' | 'moderate' | 'severe' | null;
          occurred_on: string | null;
          resolved_on: string | null;
          notes: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          injury_type?: string | null;
          side?: 'left' | 'right' | 'bilateral' | null;
          severity?: 'mild' | 'moderate' | 'severe' | null;
          occurred_on?: string | null;
          resolved_on?: string | null;
          notes?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          injury_type?: string | null;
          side?: 'left' | 'right' | 'bilateral' | null;
          severity?: 'mild' | 'moderate' | 'severe' | null;
          occurred_on?: string | null;
          resolved_on?: string | null;
          notes?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      user_notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          pillar_type: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general' | null;
          is_read: boolean | null;
          scheduled_for: string | null;
          sent_at: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          pillar_type?: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general' | null;
          is_read?: boolean | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          pillar_type?: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general' | null;
          is_read?: boolean | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
      };
      user_pillar_data: {
        Row: {
          id: string;
          user_id: string;
          pillar_type: 'hydration' | 'nutrition' | 'sleep' | 'workout';
          data: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar_type: 'hydration' | 'nutrition' | 'sleep' | 'workout';
          data?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pillar_type?: 'hydration' | 'nutrition' | 'sleep' | 'workout';
          data?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
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
          fitness_goal:
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
            | 'none'
            | null;
          timezone: string | null;
          notifications_enabled: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          available_time_per_day: number | null;
          fitness_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          injuries: string[] | null;
          primary_goals: string[] | null;
          motivation: string | null;
          sport: string | null;
          sport_position: string | null;
          sport_level:
            | 'recreational'
            | 'amateur_competitive'
            | 'semi_professional'
            | 'professional'
            | 'none'
            | null;
          training_frequency: number | null;
          season_period: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
          lifestyle: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
          profile_type: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus' | null;
          modules: string[] | null;
          active_modules: string[] | null;
          dietary_preference:
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
            | 'other'
            | null;
          dietary_restrictions: string[] | null;
          food_allergies: string[] | null;
          food_dislikes: string[] | null;
          country_code: string | null;
          equipment_level:
            | 'no_equipment'
            | 'minimal_equipment'
            | 'some_equipment'
            | 'full_gym'
            | null;
          first_name: string | null;
          coaching_style: string | null;
          target_weight_kg: number | null;
          sleep_hours_average: number | null;
          water_intake_goal: number | null;
          main_obstacles: string[] | null;
          connected_devices: string[] | null;
          device_brands: Json | null;
          email_validated: boolean | null;
          last_login: string | null;
          language: 'fr' | 'en' | 'es' | 'de' | 'it' | null;
          subscription_status:
            | 'free'
            | 'premium'
            | 'pro'
            | 'enterprise'
            | 'trial'
            | 'expired'
            | null;
          strength_objective: string | null;
          strength_experience: string | null;
          nutrition_objective: string | null;
          sleep_difficulties: boolean | null;
          hydration_reminders: boolean | null;
          privacy_consent: boolean | null;
          marketing_consent: boolean | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          role: 'user' | 'admin' | 'coach' | 'moderator';
          height: number | null;
          target_weight: number | null;
          preferred_workout_time: string | null;
          ai_coaching_style: string | null;
          profile_version: number | null;
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
          fitness_goal?:
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
            | 'none'
            | null;
          timezone?: string | null;
          notifications_enabled?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          available_time_per_day?: number | null;
          fitness_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          injuries?: string[] | null;
          primary_goals?: string[] | null;
          motivation?: string | null;
          sport?: string | null;
          sport_position?: string | null;
          sport_level?:
            | 'recreational'
            | 'amateur_competitive'
            | 'semi_professional'
            | 'professional'
            | 'none'
            | null;
          training_frequency?: number | null;
          season_period?: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
          lifestyle?: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
          profile_type?: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus' | null;
          modules?: string[] | null;
          active_modules?: string[] | null;
          dietary_preference?:
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
            | 'other'
            | null;
          dietary_restrictions?: string[] | null;
          food_allergies?: string[] | null;
          food_dislikes?: string[] | null;
          country_code?: string | null;
          equipment_level?:
            | 'no_equipment'
            | 'minimal_equipment'
            | 'some_equipment'
            | 'full_gym'
            | null;
          first_name?: string | null;
          coaching_style?: string | null;
          target_weight_kg?: number | null;
          sleep_hours_average?: number | null;
          water_intake_goal?: number | null;
          main_obstacles?: string[] | null;
          connected_devices?: string[] | null;
          device_brands?: Json | null;
          email_validated?: boolean | null;
          last_login?: string | null;
          language?: 'fr' | 'en' | 'es' | 'de' | 'it' | null;
          subscription_status?:
            | 'free'
            | 'premium'
            | 'pro'
            | 'enterprise'
            | 'trial'
            | 'expired'
            | null;
          strength_objective?: string | null;
          strength_experience?: string | null;
          nutrition_objective?: string | null;
          sleep_difficulties?: boolean | null;
          hydration_reminders?: boolean | null;
          privacy_consent?: boolean | null;
          marketing_consent?: boolean | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          role?: 'user' | 'admin' | 'coach' | 'moderator';
          height?: number | null;
          target_weight?: number | null;
          preferred_workout_time?: string | null;
          ai_coaching_style?: string | null;
          profile_version?: number | null;
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
          fitness_goal?:
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
            | 'none'
            | null;
          timezone?: string | null;
          notifications_enabled?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          available_time_per_day?: number | null;
          fitness_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
          injuries?: string[] | null;
          primary_goals?: string[] | null;
          motivation?: string | null;
          sport?: string | null;
          sport_position?: string | null;
          sport_level?:
            | 'recreational'
            | 'amateur_competitive'
            | 'semi_professional'
            | 'professional'
            | 'none'
            | null;
          training_frequency?: number | null;
          season_period?: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
          lifestyle?: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
          profile_type?: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus' | null;
          modules?: string[] | null;
          active_modules?: string[] | null;
          dietary_preference?:
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
            | 'other'
            | null;
          dietary_restrictions?: string[] | null;
          food_allergies?: string[] | null;
          food_dislikes?: string[] | null;
          country_code?: string | null;
          equipment_level?:
            | 'no_equipment'
            | 'minimal_equipment'
            | 'some_equipment'
            | 'full_gym'
            | null;
          first_name?: string | null;
          coaching_style?: string | null;
          target_weight_kg?: number | null;
          sleep_hours_average?: number | null;
          water_intake_goal?: number | null;
          main_obstacles?: string[] | null;
          connected_devices?: string[] | null;
          device_brands?: Json | null;
          email_validated?: boolean | null;
          last_login?: string | null;
          language?: 'fr' | 'en' | 'es' | 'de' | 'it' | null;
          subscription_status?:
            | 'free'
            | 'premium'
            | 'pro'
            | 'enterprise'
            | 'trial'
            | 'expired'
            | null;
          strength_objective?: string | null;
          strength_experience?: string | null;
          nutrition_objective?: string | null;
          sleep_difficulties?: boolean | null;
          hydration_reminders?: boolean | null;
          privacy_consent?: boolean | null;
          marketing_consent?: boolean | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          role?: 'user' | 'admin' | 'coach' | 'moderator';
          height?: number | null;
          target_weight?: number | null;
          preferred_workout_time?: string | null;
          ai_coaching_style?: string | null;
          profile_version?: number | null;
        };
      };
      user_recovery_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          recovery_rate_multiplier: number | null;
          sleep_quality_impact: number | null;
          nutrition_quality_impact: number | null;
          stress_level_impact: number | null;
          hydration_impact: number | null;
          age_factor: number | null;
          fitness_level_factor: number | null;
          injury_history: string[] | null;
          supplements: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          recovery_rate_multiplier?: number | null;
          sleep_quality_impact?: number | null;
          nutrition_quality_impact?: number | null;
          stress_level_impact?: number | null;
          hydration_impact?: number | null;
          age_factor?: number | null;
          fitness_level_factor?: number | null;
          injury_history?: string[] | null;
          supplements?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          recovery_rate_multiplier?: number | null;
          sleep_quality_impact?: number | null;
          nutrition_quality_impact?: number | null;
          stress_level_impact?: number | null;
          hydration_impact?: number | null;
          age_factor?: number | null;
          fitness_level_factor?: number | null;
          injury_history?: string[] | null;
          supplements?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          pillar_type: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general';
          stat_type: string;
          value: number;
          date: string;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar_type: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general';
          stat_type: string;
          value?: number;
          date?: string;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pillar_type?: 'hydration' | 'nutrition' | 'sleep' | 'workout' | 'general';
          stat_type?: string;
          value?: number;
          date?: string;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
          duration_minutes: number | null;
          calories_burned: number | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          exercises: Json | null;
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string | null;
          plan_id: string | null;
          is_template: boolean | null;
          muscle_objectives: string[] | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          workout_type?: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          exercises?: Json | null;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          plan_id?: string | null;
          is_template?: boolean | null;
          muscle_objectives?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          workout_type?: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other' | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
          exercises?: Json | null;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          plan_id?: string | null;
          is_template?: boolean | null;
          muscle_objectives?: string[] | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Types extraits pour faciliter l'utilisation
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type DailyStats = Database['public']['Tables']['daily_stats']['Row'];
export type DailyStatsInsert = Database['public']['Tables']['daily_stats']['Insert'];
export type DailyStatsUpdate = Database['public']['Tables']['daily_stats']['Update'];

export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];

export type Meal = Database['public']['Tables']['meals']['Row'];
export type MealInsert = Database['public']['Tables']['meals']['Insert'];

export type SleepSession = Database['public']['Tables']['sleep_sessions']['Row'];
export type SleepSessionInsert = Database['public']['Tables']['sleep_sessions']['Insert'];

export type HydrationLog = Database['public']['Tables']['hydration_logs']['Row'];
export type HydrationLogInsert = Database['public']['Tables']['hydration_logs']['Insert'];

export type AiRecommendation = Database['public']['Tables']['ai_recommendations']['Row'];
export type UserGoal = Database['public']['Tables']['user_goals']['Row'];
export type UserNotification = Database['public']['Tables']['user_notifications']['Row'];

// Types pour la récupération musculaire
export interface UserRecoveryProfile {
  id: string;
  user_id: string;
  recovery_rate_preference: 'slow' | 'moderate' | 'fast';
  muscle_sensitivity_scores: Record<string, number>;
  preferred_recovery_methods: string[];
  sleep_quality_weight: number;
  nutrition_quality_weight: number;
  stress_level_weight: number;
  workout_intensity_weight: number;
  created_at: string;
  updated_at: string;
}

export interface MuscleRecoveryData {
  id: string;
  user_id: string;
  muscle_group: string;
  soreness_level: number;
  recovery_percentage: number;
  recommended_rest_hours: number;
  last_workout_date: string;
  recovery_methods_used: string[];
  effectiveness_scores: Record<string, number>;
  created_at: string;
  updated_at: string;
}
