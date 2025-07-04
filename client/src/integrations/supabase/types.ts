export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          created_at: string | null
          id: string
          is_applied: boolean | null
          metadata: Json | null
          pillar_type: string | null
          recommendation: string
          request_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          metadata?: Json | null
          pillar_type?: string | null
          recommendation: string
          request_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          metadata?: Json | null
          pillar_type?: string | null
          recommendation?: string
          request_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ai_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_requests: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          pillar_type: string | null
          prompt: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          webhook_response: Json | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          pillar_type?: string | null
          prompt: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_response?: Json | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          pillar_type?: string | null
          prompt?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_stats: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          hydration_goal_ml: number | null
          id: string
          sleep_duration_minutes: number | null
          sleep_quality: number | null
          stat_date: string
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          total_workout_minutes: number | null
          updated_at: string | null
          user_id: string | null
          water_intake_ml: number | null
          workouts_completed: number | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          hydration_goal_ml?: number | null
          id?: string
          sleep_duration_minutes?: number | null
          sleep_quality?: number | null
          stat_date: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          total_workout_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_intake_ml?: number | null
          workouts_completed?: number | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          hydration_goal_ml?: number | null
          id?: string
          sleep_duration_minutes?: number | null
          sleep_quality?: number | null
          stat_date?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          total_workout_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          water_intake_ml?: number | null
          workouts_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_library: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          equipment: string | null
          id: string
          image_url: string | null
          instructions: string | null
          muscle_groups: string[] | null
          name: string
          notes: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_groups?: string[] | null
          name: string
          notes?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_groups?: string[] | null
          name?: string
          notes?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      foods_library: {
        Row: {
          brand: string | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string | null
          common_units: Json | null
          created_at: string | null
          fat_per_100g: number | null
          fiber_per_100g: number | null
          id: string
          name: string
          protein_per_100g: number | null
          sugar_per_100g: number | null
        }
        Insert: {
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          common_units?: Json | null
          created_at?: string | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          name: string
          protein_per_100g?: number | null
          sugar_per_100g?: number | null
        }
        Update: {
          brand?: string | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string | null
          common_units?: Json | null
          created_at?: string | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          name?: string
          protein_per_100g?: number | null
          sugar_per_100g?: number | null
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          drink_type: string | null
          id: string
          log_date: string
          logged_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          drink_type?: string | null
          id?: string
          log_date: string
          logged_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          drink_type?: string | null
          id?: string
          log_date?: string
          logged_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hydration_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string | null
          foods: Json | null
          id: string
          meal_date: string
          meal_type: string | null
          notes: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          foods?: Json | null
          id?: string
          meal_date: string
          meal_type?: string | null
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          foods?: Json | null
          id?: string
          meal_date?: string
          meal_type?: string | null
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pillar_coordination: {
        Row: {
          active: boolean | null
          coordination_data: Json
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          coordination_data: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          coordination_data?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pillar_coordination_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_sessions: {
        Row: {
          bedtime: string | null
          created_at: string | null
          duration_minutes: number | null
          energy_level: number | null
          factors: Json | null
          id: string
          mood_rating: number | null
          notes: string | null
          quality_rating: number | null
          sleep_date: string
          user_id: string | null
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          energy_level?: number | null
          factors?: Json | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          quality_rating?: number | null
          sleep_date: string
          user_id?: string | null
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          energy_level?: number | null
          factors?: Json | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          quality_rating?: number | null
          sleep_date?: string
          user_id?: string | null
          wake_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          achieved_at: string | null
          category: string | null
          created_at: string | null
          current_value: number | null
          goal_type: string | null
          id: string
          is_active: boolean | null
          start_date: string | null
          target_date: string | null
          target_value: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string | null
          target_date?: string | null
          target_value?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          available_time_per_day: number | null
          avatar_url: string | null
          created_at: string | null
          fitness_experience: string | null
          fitness_goal: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          injuries: string[] | null
          lifestyle: string | null
          motivation: string | null
          notifications_enabled: boolean | null
          primary_goals: string[] | null
          season_period: string | null
          sport: string | null
          sport_level: string | null
          sport_position: string | null
          timezone: string | null
          training_frequency: number | null
          updated_at: string | null
          username: string | null
          weight_kg: number | null
          profile_type: string | null
          modules: string[] | null
          active_modules: string[] | null
          dietary_preference: string | null
          dietary_restrictions: string[] | null
          food_allergies: string[] | null
          food_dislikes: string[] | null
          country_code: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          available_time_per_day?: number | null
          avatar_url?: string | null
          created_at?: string | null
          fitness_experience?: string | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          injuries?: string[] | null
          lifestyle?: string | null
          motivation?: string | null
          notifications_enabled?: boolean | null
          primary_goals?: string[] | null
          season_period?: string | null
          sport?: string | null
          sport_level?: string | null
          sport_position?: string | null
          timezone?: string | null
          training_frequency?: number | null
          updated_at?: string | null
          username?: string | null
          weight_kg?: number | null
          profile_type?: string | null
          modules?: string[] | null
          active_modules?: string[] | null
          dietary_preference?: string | null
          dietary_restrictions?: string[] | null
          food_allergies?: string[] | null
          food_dislikes?: string[] | null
          country_code?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          available_time_per_day?: number | null
          avatar_url?: string | null
          created_at?: string | null
          fitness_experience?: string | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string[] | null
          lifestyle?: string | null
          motivation?: string | null
          notifications_enabled?: boolean | null
          primary_goals?: string[] | null
          season_period?: string | null
          sport?: string | null
          sport_level?: string | null
          sport_position?: string | null
          timezone?: string | null
          training_frequency?: number | null
          updated_at?: string | null
          username?: string | null
          weight_kg?: number | null
          profile_type?: string | null
          modules?: string[] | null
          active_modules?: string[] | null
          dietary_preference?: string | null
          dietary_restrictions?: string[] | null
          food_allergies?: string[] | null
          food_dislikes?: string[] | null
          country_code?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          exercises: Json | null
          id: string
          name: string
          notes: string | null
          started_at: string | null
          user_id: string | null
          workout_type: string | null
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          id?: string
          name: string
          notes?: string | null
          started_at?: string | null
          user_id?: string | null
          workout_type?: string | null
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exercises?: Json | null
          id?: string
          name?: string
          notes?: string | null
          started_at?: string | null
          user_id?: string | null
          workout_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_stats: {
        Args: { user_uuid: string; target_date?: string }
        Returns: undefined
      }
      create_demo_data: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_monthly_progress: {
        Args: { user_uuid: string; target_month?: number; target_year?: number }
        Returns: {
          week_number: number
          total_workouts: number
          avg_workout_duration: number
          total_calories_burned: number
          avg_daily_nutrition: number
          avg_hydration_goal_percentage: number
          avg_sleep_quality: number
        }[]
      }
      get_user_dashboard: {
        Args: { user_uuid: string }
        Returns: {
          full_name: string
          fitness_goal: string
          activity_level: string
          today_workouts: number
          today_workout_minutes: number
          today_calories_burned: number
          today_nutrition_calories: number
          today_hydration_ml: number
          today_hydration_percentage: number
          today_sleep_duration: number
          today_sleep_quality: number
          week_total_workouts: number
          week_avg_workout_minutes: number
          week_total_calories: number
          week_avg_sleep: number
          active_goals_count: number
          achieved_goals_count: number
        }[]
      }
      get_weekly_stats: {
        Args: { user_uuid: string; start_date?: string }
        Returns: {
          total_workouts: number
          total_workout_minutes: number
          total_calories_burned: number
          avg_daily_calories: number
          avg_daily_protein: number
          avg_daily_hydration: number
          avg_sleep_duration: number
          avg_sleep_quality: number
          days_with_data: number
        }[]
      }
      mark_onboarding_completed: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Types additionnels pour l'export
export type UserProfile = Tables<'user_profiles'>
export type HydrationEntry = Tables<'hydration_logs'>
export type Meal = Tables<'meals'>
export type SleepSession = Tables<'sleep_sessions'>
export type DailyStats = Tables<'daily_stats'>
export type AiRecommendation = Tables<'ai_recommendations'>
