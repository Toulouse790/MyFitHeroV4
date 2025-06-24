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
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_name: string
          id: string
          name: string
          unlocked_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon_name: string
          id?: string
          name: string
          unlocked_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          unlocked_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_exercise_management: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string
          exercise_name: string
          id: string
          is_premium: boolean | null
          muscle_group: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level: string
          exercise_name: string
          id?: string
          is_premium?: boolean | null
          muscle_group: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          exercise_name?: string
          id?: string
          is_premium?: boolean | null
          muscle_group?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_widget_configs: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          position: number
          title: string
          updated_at: string
          user_id: string | null
          widget_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          position: number
          title: string
          updated_at?: string
          user_id?: string | null
          widget_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          position?: number
          title?: string
          updated_at?: string
          user_id?: string | null
          widget_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          model: string | null
          response: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          response: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          confidence_score: number | null
          context: string
          created_at: string
          feedback: boolean | null
          id: string
          input_data: Json | null
          metadata: Json | null
          recommendation_text: string
          recommendation_type: string
          response_time_ms: number | null
          updated_at: string
          used_in_session: boolean | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          context: string
          created_at?: string
          feedback?: boolean | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          recommendation_text: string
          recommendation_type: string
          response_time_ms?: number | null
          updated_at?: string
          used_in_session?: boolean | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          context?: string
          created_at?: string
          feedback?: boolean | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          recommendation_text?: string
          recommendation_type?: string
          response_time_ms?: number | null
          updated_at?: string
          used_in_session?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_training_data: {
        Row: {
          action_type: string
          context: Json
          created_at: string
          feedback: boolean | null
          id: string
          input_tokens: number | null
          metadata: Json | null
          model_name: string | null
          output_tokens: number | null
          prompt_template: string | null
          response_time_ms: number | null
          result: string | null
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          context: Json
          created_at?: string
          feedback?: boolean | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model_name?: string | null
          output_tokens?: number | null
          prompt_template?: string | null
          response_time_ms?: number | null
          result?: string | null
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          context?: Json
          created_at?: string
          feedback?: boolean | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model_name?: string | null
          output_tokens?: number | null
          prompt_template?: string | null
          response_time_ms?: number | null
          result?: string | null
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_routes: {
        Row: {
          component: string
          created_at: string
          description: string | null
          id: string
          path: string
          updated_at: string
        }
        Insert: {
          component: string
          created_at?: string
          description?: string | null
          id?: string
          path: string
          updated_at?: string
        }
        Update: {
          component?: string
          created_at?: string
          description?: string | null
          id?: string
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      athlete_assessments: {
        Row: {
          assessment_date: string | null
          created_at: string | null
          id: string
          next_targets: Json | null
          position_id: string | null
          recommendations: Json | null
          sport_id: string | null
          test_results: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          created_at?: string | null
          id?: string
          next_targets?: Json | null
          position_id?: string | null
          recommendations?: Json | null
          sport_id?: string | null
          test_results?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          created_at?: string | null
          id?: string
          next_targets?: Json | null
          position_id?: string | null
          recommendations?: Json | null
          sport_id?: string | null
          test_results?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_assessments_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions_sportives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_assessments_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "sport_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_assessments_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_exercises: {
        Row: {
          calories_burned: number | null
          calories_formula: string
          created_at: string
          id: string
          is_base_male: boolean | null
          name: string
          parameters: Json
          type: string
        }
        Insert: {
          calories_burned?: number | null
          calories_formula: string
          created_at?: string
          id?: string
          is_base_male?: boolean | null
          name: string
          parameters: Json
          type: string
        }
        Update: {
          calories_burned?: number | null
          calories_formula?: string
          created_at?: string
          id?: string
          is_base_male?: boolean | null
          name?: string
          parameters?: Json
          type?: string
        }
        Relationships: []
      }
      cheat_meal_library: {
        Row: {
          calories: number
          carbs: number
          category: string
          created_at: string
          fats: number
          id: string
          name: string
          proteins: number
          updated_at: string
        }
        Insert: {
          calories: number
          carbs?: number
          category: string
          created_at?: string
          fats?: number
          id?: string
          name: string
          proteins: number
          updated_at?: string
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string
          created_at?: string
          fats?: number
          id?: string
          name?: string
          proteins?: number
          updated_at?: string
        }
        Relationships: []
      }
      common_foods: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          description: string | null
          diet_types: string[] | null
          fats: number
          food_category: string
          id: string
          ingredients: Json | null
          is_premium: boolean | null
          micronutrients: Json | null
          name: string
          proteins: number
          serving_size: number
          serving_unit: string
        }
        Insert: {
          calories: number
          carbs: number
          created_at?: string
          description?: string | null
          diet_types?: string[] | null
          fats: number
          food_category: string
          id?: string
          ingredients?: Json | null
          is_premium?: boolean | null
          micronutrients?: Json | null
          name: string
          proteins: number
          serving_size?: number
          serving_unit?: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          description?: string | null
          diet_types?: string[] | null
          fats?: number
          food_category?: string
          id?: string
          ingredients?: Json | null
          is_premium?: boolean | null
          micronutrients?: Json | null
          name?: string
          proteins?: number
          serving_size?: number
          serving_unit?: string
        }
        Relationships: []
      }
      custom_recipes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json | null
          is_public: boolean | null
          micronutrients: Json | null
          name: string
          preparation_time: number | null
          servings: number | null
          tags: string[] | null
          total_calories: number
          total_carbs: number
          total_fats: number
          total_proteins: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions?: Json | null
          is_public?: boolean | null
          micronutrients?: Json | null
          name: string
          preparation_time?: number | null
          servings?: number | null
          tags?: string[] | null
          total_calories: number
          total_carbs: number
          total_fats: number
          total_proteins: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json | null
          is_public?: boolean | null
          micronutrients?: Json | null
          name?: string
          preparation_time?: number | null
          servings?: number | null
          tags?: string[] | null
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_proteins?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_adaptations: {
        Row: {
          activity_level: string | null
          allergies: string[] | null
          created_at: string | null
          diet_type_id: string | null
          health_conditions: string[] | null
          id: string
          individual_adjustments: Json | null
          intolerances: string[] | null
          metabolic_rate: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_level?: string | null
          allergies?: string[] | null
          created_at?: string | null
          diet_type_id?: string | null
          health_conditions?: string[] | null
          id?: string
          individual_adjustments?: Json | null
          intolerances?: string[] | null
          metabolic_rate?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_level?: string | null
          allergies?: string[] | null
          created_at?: string | null
          diet_type_id?: string | null
          health_conditions?: string[] | null
          id?: string
          individual_adjustments?: Json | null
          intolerances?: string[] | null
          metabolic_rate?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_adaptations_diet_type_id_fkey"
            columns: ["diet_type_id"]
            isOneToOne: false
            referencedRelation: "diet_type_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_adaptations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_type_configurations: {
        Row: {
          carbs_multiplier: number | null
          created_at: string
          description: string | null
          diet_type: string
          fats_multiplier: number | null
          hydration_requirements: number | null
          id: string
          meal_timing_recommendations: Json | null
          micronutrient_focus: Json | null
          name: string
          protein_multiplier: number | null
          recommended_foods: string[] | null
          restricted_foods: string[] | null
          scientific_references: string[] | null
          updated_at: string
        }
        Insert: {
          carbs_multiplier?: number | null
          created_at?: string
          description?: string | null
          diet_type: string
          fats_multiplier?: number | null
          hydration_requirements?: number | null
          id?: string
          meal_timing_recommendations?: Json | null
          micronutrient_focus?: Json | null
          name: string
          protein_multiplier?: number | null
          recommended_foods?: string[] | null
          restricted_foods?: string[] | null
          scientific_references?: string[] | null
          updated_at?: string
        }
        Update: {
          carbs_multiplier?: number | null
          created_at?: string
          description?: string | null
          diet_type?: string
          fats_multiplier?: number | null
          hydration_requirements?: number | null
          id?: string
          meal_timing_recommendations?: Json | null
          micronutrient_focus?: Json | null
          name?: string
          protein_multiplier?: number | null
          recommended_foods?: string[] | null
          restricted_foods?: string[] | null
          scientific_references?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      exercise_media: {
        Row: {
          created_at: string | null
          exercise_id: string | null
          id: string
          is_primary: boolean | null
          media_type: string
          media_url: string
          order_index: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          is_primary?: boolean | null
          media_type: string
          media_url: string
          order_index?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          is_primary?: boolean | null
          media_type?: string
          media_url?: string
          order_index?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_media_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "admin_exercise_management"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_recommendations: {
        Row: {
          created_at: string
          difficulty: string | null
          exercises: Json | null
          id: string
          muscle_groups: string[] | null
          training_plan: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          exercises?: Json | null
          id?: string
          muscle_groups?: string[] | null
          training_plan?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          exercises?: Json | null
          id?: string
          muscle_groups?: string[] | null
          training_plan?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sets: {
        Row: {
          biomechanics: Json | null
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          equipment_setup: Json | null
          exercise_cues: string[] | null
          exercise_name: string
          exercise_technique: Json | null
          exercise_variants: string[] | null
          failure_reps: boolean | null
          form_rating: number | null
          id: string
          muscle_activation_level: Json | null
          notes: string | null
          one_rep_max: number | null
          perceived_difficulty: string | null
          previous_performance: Json | null
          progression_metrics: Json | null
          reps: number
          rest_time_seconds: number | null
          rpe: number | null
          safety_considerations: string[] | null
          session_id: string | null
          set_number: number
          set_type: string | null
          target_muscle_activation: string[] | null
          tempo_seconds: Json | null
          volume: number | null
          weight: number | null
        }
        Insert: {
          biomechanics?: Json | null
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          equipment_setup?: Json | null
          exercise_cues?: string[] | null
          exercise_name: string
          exercise_technique?: Json | null
          exercise_variants?: string[] | null
          failure_reps?: boolean | null
          form_rating?: number | null
          id?: string
          muscle_activation_level?: Json | null
          notes?: string | null
          one_rep_max?: number | null
          perceived_difficulty?: string | null
          previous_performance?: Json | null
          progression_metrics?: Json | null
          reps: number
          rest_time_seconds?: number | null
          rpe?: number | null
          safety_considerations?: string[] | null
          session_id?: string | null
          set_number: number
          set_type?: string | null
          target_muscle_activation?: string[] | null
          tempo_seconds?: Json | null
          volume?: number | null
          weight?: number | null
        }
        Update: {
          biomechanics?: Json | null
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          equipment_setup?: Json | null
          exercise_cues?: string[] | null
          exercise_name?: string
          exercise_technique?: Json | null
          exercise_variants?: string[] | null
          failure_reps?: boolean | null
          form_rating?: number | null
          id?: string
          muscle_activation_level?: Json | null
          notes?: string | null
          one_rep_max?: number | null
          perceived_difficulty?: string | null
          previous_performance?: Json | null
          progression_metrics?: Json | null
          reps?: number
          rest_time_seconds?: number | null
          rpe?: number | null
          safety_considerations?: string[] | null
          session_id?: string | null
          set_number?: number
          set_type?: string | null
          target_muscle_activation?: string[] | null
          tempo_seconds?: Json | null
          volume?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_meals: {
        Row: {
          created_at: string
          food_entries: Json | null
          id: string
          meal_type: string
          name: string
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          food_entries?: Json | null
          id?: string
          meal_type: string
          name: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          food_entries?: Json | null
          id?: string
          meal_type?: string
          name?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorite_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "custom_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_workouts: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorite_workouts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_limits: {
        Row: {
          daily_usage: number | null
          feature_type: string
          id: string
          last_reset: string | null
          user_id: string | null
        }
        Insert: {
          daily_usage?: number | null
          feature_type: string
          id?: string
          last_reset?: string | null
          user_id?: string | null
        }
        Update: {
          daily_usage?: number | null
          feature_type?: string
          id?: string
          last_reset?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_database: {
        Row: {
          calories: number
          carbs: number
          categories: string[]
          common_allergens: string[]
          created_at: string
          fats: number
          id: string
          name: string
          proteins: number
          updated_at: string
        }
        Insert: {
          calories: number
          carbs: number
          categories?: string[]
          common_allergens?: string[]
          created_at?: string
          fats: number
          id?: string
          name: string
          proteins: number
          updated_at?: string
        }
        Update: {
          calories?: number
          carbs?: number
          categories?: string[]
          common_allergens?: string[]
          created_at?: string
          fats?: number
          id?: string
          name?: string
          proteins?: number
          updated_at?: string
        }
        Relationships: []
      }
      food_journal_entries: {
        Row: {
          calories: number
          carbs: number
          components: Json | null
          created_at: string
          fats: number
          id: string
          is_composite: boolean | null
          meal_type: string
          name: string
          notes: string | null
          portion_size: number | null
          portion_unit: string | null
          proteins: number
          source: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories: number
          carbs?: number
          components?: Json | null
          created_at?: string
          fats?: number
          id?: string
          is_composite?: boolean | null
          meal_type?: string
          name: string
          notes?: string | null
          portion_size?: number | null
          portion_unit?: string | null
          proteins: number
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          components?: Json | null
          created_at?: string
          fats?: number
          id?: string
          is_composite?: boolean | null
          meal_type?: string
          name?: string
          notes?: string | null
          portion_size?: number | null
          portion_unit?: string | null
          proteins?: number
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hydration_entries: {
        Row: {
          amount_ml: number
          created_at: string
          drink_type: string
          id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          drink_type: string
          id?: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          drink_type?: string
          id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hydration_goals: {
        Row: {
          created_at: string
          daily_target_ml: number
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_target_ml?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_target_ml?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          daily_status: Json | null
          end_date: string
          id: string
          plan_data: Json
          start_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          daily_status?: Json | null
          end_date: string
          id?: string
          plan_data: Json
          start_date: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          daily_status?: Json | null
          end_date?: string
          id?: string
          plan_data?: Json
          start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_reminders: {
        Row: {
          created_at: string
          days_of_week: string[] | null
          id: string
          is_active: boolean | null
          meal_type: string
          reminder_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          days_of_week?: string[] | null
          id?: string
          is_active?: boolean | null
          meal_type: string
          reminder_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          days_of_week?: string[] | null
          id?: string
          is_active?: boolean | null
          meal_type?: string
          reminder_time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_suggestions: {
        Row: {
          calories: number
          carbs: number
          cooking_time_minutes: number | null
          created_at: string
          diet_types: string[] | null
          difficulty_level: string | null
          fats: number
          id: string
          image_url: string | null
          ingredients: Json
          meal_type: string
          name: string
          nutritional_info: Json | null
          preparation: string | null
          proteins: number
          rating: number | null
          reviews_count: number | null
          season: string[] | null
          servings: number | null
          tags: string[] | null
        }
        Insert: {
          calories: number
          carbs: number
          cooking_time_minutes?: number | null
          created_at?: string
          diet_types?: string[] | null
          difficulty_level?: string | null
          fats: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          meal_type: string
          name: string
          nutritional_info?: Json | null
          preparation?: string | null
          proteins: number
          rating?: number | null
          reviews_count?: number | null
          season?: string[] | null
          servings?: number | null
          tags?: string[] | null
        }
        Update: {
          calories?: number
          carbs?: number
          cooking_time_minutes?: number | null
          created_at?: string
          diet_types?: string[] | null
          difficulty_level?: string | null
          fats?: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          meal_type?: string
          name?: string
          nutritional_info?: Json | null
          preparation?: string | null
          proteins?: number
          rating?: number | null
          reviews_count?: number | null
          season?: string[] | null
          servings?: number | null
          tags?: string[] | null
        }
        Relationships: []
      }
      micro_rewards: {
        Row: {
          claimed: boolean | null
          created_at: string
          id: string
          metadata: Json | null
          points: number | null
          reward_type: string
          trigger_event: string
          user_id: string | null
        }
        Insert: {
          claimed?: boolean | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points?: number | null
          reward_type: string
          trigger_event: string
          user_id?: string | null
        }
        Update: {
          claimed?: boolean | null
          created_at?: string
          id?: string
          metadata?: Json | null
          points?: number | null
          reward_type?: string
          trigger_event?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "micro_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      micronutrient_tracking: {
        Row: {
          created_at: string
          date: string
          id: string
          minerals: Json | null
          user_id: string | null
          vitamins: Json | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          minerals?: Json | null
          user_id?: string | null
          vitamins?: Json | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          minerals?: Json | null
          user_id?: string | null
          vitamins?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "micronutrient_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_measurements: {
        Row: {
          biceps_left_cm: number | null
          biceps_right_cm: number | null
          chest_cm: number | null
          created_at: string
          height_cm: number | null
          hips_cm: number | null
          id: string
          measurement_date: string
          thigh_left_cm: number | null
          thigh_right_cm: number | null
          updated_at: string
          user_id: string | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          biceps_left_cm?: number | null
          biceps_right_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hips_cm?: number | null
          id?: string
          measurement_date?: string
          thigh_left_cm?: number | null
          thigh_right_cm?: number | null
          updated_at?: string
          user_id?: string | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          biceps_left_cm?: number | null
          biceps_right_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hips_cm?: number | null
          id?: string
          measurement_date?: string
          thigh_left_cm?: number | null
          thigh_right_cm?: number | null
          updated_at?: string
          user_id?: string | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "muscle_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_recovery: {
        Row: {
          created_at: string | null
          estimated_recovery_hours: number | null
          id: string
          intensity: number | null
          last_trained_at: string | null
          muscle_group: string
          muscle_soreness_level: number | null
          nutrition_status: string | null
          previous_training_intensity: number | null
          recovery_status: string | null
          sleep_quality: number | null
          stress_level: number | null
          training_volume: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_recovery_hours?: number | null
          id?: string
          intensity?: number | null
          last_trained_at?: string | null
          muscle_group: string
          muscle_soreness_level?: number | null
          nutrition_status?: string | null
          previous_training_intensity?: number | null
          recovery_status?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          training_volume?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_recovery_hours?: number | null
          id?: string
          intensity?: number | null
          last_trained_at?: string | null
          muscle_group?: string
          muscle_soreness_level?: number | null
          nutrition_status?: string | null
          previous_training_intensity?: number | null
          recovery_status?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          training_volume?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "muscle_recovery_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page: {
        Row: {
          checksum: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
        }
        Insert: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
        }
        Update: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page_section: {
        Row: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_important: boolean | null
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          message: string
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_important?: boolean | null
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_exports: {
        Row: {
          created_at: string
          date_range: unknown | null
          export_type: string
          file_url: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_range?: unknown | null
          export_type: string
          file_url?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_range?: unknown | null
          export_type?: string
          file_url?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          abandoned: boolean | null
          answers: Json | null
          completed: boolean | null
          created_at: string
          current_step: number
          id: string
          last_activity: string | null
          user_id: string | null
        }
        Insert: {
          abandoned?: boolean | null
          answers?: Json | null
          completed?: boolean | null
          created_at?: string
          current_step: number
          id?: string
          last_activity?: string | null
          user_id?: string | null
        }
        Update: {
          abandoned?: boolean | null
          answers?: Json | null
          completed?: boolean | null
          created_at?: string
          current_step?: number
          id?: string
          last_activity?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string | null
          training_cycle_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string | null
          training_cycle_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string | null
          training_cycle_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      performance_predictions: {
        Row: {
          confidence_score: number
          historical_data: Json | null
          id: string
          metadata: Json | null
          predicted_at: string | null
          prediction_data: Json
          sport_id: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          historical_data?: Json | null
          id?: string
          metadata?: Json | null
          predicted_at?: string | null
          prediction_data?: Json
          sport_id: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          historical_data?: Json | null
          id?: string
          metadata?: Json | null
          predicted_at?: string | null
          prediction_data?: Json
          sport_id?: string
          user_id?: string
        }
        Relationships: []
      }
      periodic_goals: {
        Row: {
          completed: boolean | null
          created_at: string
          current_value: Json | null
          end_date: string
          goal_type: string
          id: string
          period_type: string
          start_date: string
          target_value: Json
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          current_value?: Json | null
          end_date: string
          goal_type: string
          id?: string
          period_type: string
          start_date: string
          target_value: Json
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          current_value?: Json | null
          end_date?: string
          goal_type?: string
          id?: string
          period_type?: string
          start_date?: string
          target_value?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "periodic_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          exercise_id: string | null
          id: string
          reps: number | null
          updated_at: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          reps?: number | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          reps?: number | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "unified_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_trials: {
        Row: {
          conversion_status: string | null
          end_date: string | null
          id: string
          start_date: string | null
          trial_source: string | null
          user_id: string | null
        }
        Insert: {
          conversion_status?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          trial_source?: string | null
          user_id?: string | null
        }
        Update: {
          conversion_status?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          trial_source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_trials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          available_equipment: string[] | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          diet_type: string | null
          email: string | null
          experience_level: string | null
          gender: string | null
          height_cm: number | null
          id: string
          level: number | null
          main_objective: string | null
          meal_notifications: boolean | null
          objectives: string[] | null
          points: number | null
          reminder_time: number | null
          training_frequency: string | null
          updated_at: string
          username: string | null
          weight_kg: number | null
          workout_duration: string | null
        }
        Insert: {
          age?: number | null
          available_equipment?: string[] | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          diet_type?: string | null
          email?: string | null
          experience_level?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          level?: number | null
          main_objective?: string | null
          meal_notifications?: boolean | null
          objectives?: string[] | null
          points?: number | null
          reminder_time?: number | null
          training_frequency?: string | null
          updated_at?: string
          username?: string | null
          weight_kg?: number | null
          workout_duration?: string | null
        }
        Update: {
          age?: number | null
          available_equipment?: string[] | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          diet_type?: string | null
          email?: string | null
          experience_level?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          level?: number | null
          main_objective?: string | null
          meal_notifications?: boolean | null
          objectives?: string[] | null
          points?: number | null
          reminder_time?: number | null
          training_frequency?: string | null
          updated_at?: string
          username?: string | null
          weight_kg?: number | null
          workout_duration?: string | null
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          age: string | null
          available_equipment: string[] | null
          created_at: string
          daily_energy_expenditure: number | null
          diet_type: string | null
          experience_level: string | null
          fitness_level: string | null
          gender: string | null
          has_afternoon_snack: boolean | null
          has_morning_snack: boolean | null
          height: string | null
          id: string
          medical_constraints: string[] | null
          objective: string | null
          objectives: string[] | null
          position_id: string | null
          sport_id: string | null
          training_frequency: string | null
          training_time: string | null
          user_id: string | null
          wake_up_time: string | null
          weight: string | null
          workout_duration: string | null
        }
        Insert: {
          age?: string | null
          available_equipment?: string[] | null
          created_at?: string
          daily_energy_expenditure?: number | null
          diet_type?: string | null
          experience_level?: string | null
          fitness_level?: string | null
          gender?: string | null
          has_afternoon_snack?: boolean | null
          has_morning_snack?: boolean | null
          height?: string | null
          id?: string
          medical_constraints?: string[] | null
          objective?: string | null
          objectives?: string[] | null
          position_id?: string | null
          sport_id?: string | null
          training_frequency?: string | null
          training_time?: string | null
          user_id?: string | null
          wake_up_time?: string | null
          weight?: string | null
          workout_duration?: string | null
        }
        Update: {
          age?: string | null
          available_equipment?: string[] | null
          created_at?: string
          daily_energy_expenditure?: number | null
          diet_type?: string | null
          experience_level?: string | null
          fitness_level?: string | null
          gender?: string | null
          has_afternoon_snack?: boolean | null
          has_morning_snack?: boolean | null
          height?: string | null
          id?: string
          medical_constraints?: string[] | null
          objective?: string | null
          objectives?: string[] | null
          position_id?: string | null
          sport_id?: string | null
          training_frequency?: string | null
          training_time?: string | null
          user_id?: string | null
          wake_up_time?: string | null
          weight?: string | null
          workout_duration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions_sportives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "sport_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_goals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          target_bedtime: string
          target_duration_minutes: number
          target_wake_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          target_bedtime: string
          target_duration_minutes: number
          target_wake_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          target_bedtime?: string
          target_duration_minutes?: number
          target_wake_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_habits: {
        Row: {
          created_at: string
          habit_data: Json
          habit_type: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          habit_data: Json
          habit_type: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          habit_data?: Json
          habit_type?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_reports: {
        Row: {
          created_at: string
          end_date: string
          id: string
          report_data: Json
          report_type: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          report_data: Json
          report_type: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          report_data?: Json
          report_type?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_sessions: {
        Row: {
          created_at: string
          device_data: Json | null
          end_time: string
          environmental_data: Json | null
          id: string
          is_nap: boolean | null
          quality_metrics: Json | null
          sleep_score: number | null
          sleep_stages: Json | null
          start_time: string
          total_duration_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_data?: Json | null
          end_time: string
          environmental_data?: Json | null
          id?: string
          is_nap?: boolean | null
          quality_metrics?: Json | null
          sleep_score?: number | null
          sleep_stages?: Json | null
          start_time: string
          total_duration_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_data?: Json | null
          end_time?: string
          environmental_data?: Json | null
          id?: string
          is_nap?: boolean | null
          quality_metrics?: Json | null
          sleep_score?: number | null
          sleep_stages?: Json | null
          start_time?: string
          total_duration_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_scale_data: {
        Row: {
          body_fat_percentage: number | null
          bone_mass_kg: number | null
          created_at: string | null
          device_info: Json | null
          id: string
          measured_at: string | null
          metabolic_age: number | null
          muscle_mass_kg: number | null
          user_id: string
          visceral_fat_level: number | null
          water_percentage: number | null
          weight_kg: number
        }
        Insert: {
          body_fat_percentage?: number | null
          bone_mass_kg?: number | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          measured_at?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          user_id: string
          visceral_fat_level?: number | null
          water_percentage?: number | null
          weight_kg: number
        }
        Update: {
          body_fat_percentage?: number | null
          bone_mass_kg?: number | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          measured_at?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          user_id?: string
          visceral_fat_level?: number | null
          water_percentage?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "smart_scale_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_exercises_recommendations: {
        Row: {
          created_at: string | null
          exercise_id: string | null
          id: string
          position_id: string | null
          priority: string
          reps_recommendation: Json | null
          sets_recommendation: number | null
          sport_id: string | null
          training_phase: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          position_id?: string | null
          priority?: string
          reps_recommendation?: Json | null
          sets_recommendation?: number | null
          sport_id?: string | null
          training_phase?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          position_id?: string | null
          priority?: string
          reps_recommendation?: Json | null
          sets_recommendation?: number | null
          sport_id?: string | null
          training_phase?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_exercises_recommendations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "unified_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_exercises_recommendations_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions_sportives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_exercises_recommendations_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "sport_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_exercises_recommendations_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_positions: {
        Row: {
          created_at: string | null
          id: string
          initial_tests: Json | null
          name: string
          performance_metrics: Json | null
          recommended_exercises: Json | null
          sport_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initial_tests?: Json | null
          name: string
          performance_metrics?: Json | null
          recommended_exercises?: Json | null
          sport_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initial_tests?: Json | null
          name?: string
          performance_metrics?: Json | null
          recommended_exercises?: Json | null
          sport_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_positions_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_programs: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          duration: number
          exercises: Json
          id: string
          name: string
          position_id: string | null
          sport_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          duration: number
          exercises?: Json
          id?: string
          name: string
          position_id?: string | null
          sport_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration?: number
          exercises?: Json
          id?: string
          name?: string
          position_id?: string | null
          sport_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_programs_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions_sportives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_programs_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "sport_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_programs_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_specific_workouts: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string[] | null
          duration_minutes: number | null
          exercises: string[] | null
          id: string
          name: string
          position_id: string | null
          sport_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string[] | null
          duration_minutes?: number | null
          exercises?: string[] | null
          id?: string
          name: string
          position_id?: string | null
          sport_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string[] | null
          duration_minutes?: number | null
          exercises?: string[] | null
          id?: string
          name?: string
          position_id?: string | null
          sport_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_specific_workouts_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions_sportives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_specific_workouts_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "sport_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_specific_workouts_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          category: Database["public"]["Enums"]["sport_category"] | null
          created_at: string | null
          description: string | null
          equipment: Json | null
          id: string
          name: string
          physical_demands: Json | null
          skill_requirements: Json | null
          sub_category: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["sport_category"] | null
          created_at?: string | null
          description?: string | null
          equipment?: Json | null
          id?: string
          name: string
          physical_demands?: Json | null
          skill_requirements?: Json | null
          sub_category?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["sport_category"] | null
          created_at?: string | null
          description?: string | null
          equipment?: Json | null
          id?: string
          name?: string
          physical_demands?: Json | null
          skill_requirements?: Json | null
          sub_category?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_stats: {
        Row: {
          calories_burned: number | null
          created_at: string
          energy_level: number | null
          id: string
          muscle_groups_worked: string[] | null
          perceived_difficulty: string | null
          rest_time_seconds: number | null
          session_duration_minutes: number
          session_id: string | null
          total_weight_lifted: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          energy_level?: number | null
          id?: string
          muscle_groups_worked?: string[] | null
          perceived_difficulty?: string | null
          rest_time_seconds?: number | null
          session_duration_minutes?: number
          session_id?: string | null
          total_weight_lifted?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          energy_level?: number | null
          id?: string
          muscle_groups_worked?: string[] | null
          perceived_difficulty?: string | null
          rest_time_seconds?: number | null
          session_duration_minutes?: number
          session_id?: string | null
          total_weight_lifted?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_stats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_exercises: {
        Row: {
          biomechanics: Json | null
          created_at: string
          difficulty: string[]
          est_publié: boolean | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          location: string[] | null
          muscle_group: string
          name: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          biomechanics?: Json | null
          created_at?: string
          difficulty?: string[]
          est_publié?: boolean | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          location?: string[] | null
          muscle_group: string
          name: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          biomechanics?: Json | null
          created_at?: string
          difficulty?: string[]
          est_publié?: boolean | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          location?: string[] | null
          muscle_group?: string
          name?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_exercise_weights: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          last_used_at: string | null
          last_used_weight: number | null
          notes: string | null
          personal_record: number | null
          progression_goal: number | null
          updated_at: string
          user_id: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          last_used_at?: string | null
          last_used_weight?: number | null
          notes?: string | null
          personal_record?: number | null
          progression_goal?: number | null
          updated_at?: string
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          last_used_at?: string | null
          last_used_weight?: number | null
          notes?: string | null
          personal_record?: number | null
          progression_goal?: number | null
          updated_at?: string
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_weights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nutrition_preferences: {
        Row: {
          adaptive_tracking: Json | null
          allergies: string[] | null
          created_at: string
          excluded_foods: string[] | null
          id: string
          intolerances: string[] | null
          meal_validation_notifications: boolean | null
          meal_validation_times: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          adaptive_tracking?: Json | null
          allergies?: string[] | null
          created_at?: string
          excluded_foods?: string[] | null
          id?: string
          intolerances?: string[] | null
          meal_validation_notifications?: boolean | null
          meal_validation_times?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          adaptive_tracking?: Json | null
          allergies?: string[] | null
          created_at?: string
          excluded_foods?: string[] | null
          id?: string
          intolerances?: string[] | null
          meal_validation_notifications?: boolean | null
          meal_validation_times?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_nutrition_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          measurement_unit: string | null
          notifications_enabled: boolean | null
          training_days: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          measurement_unit?: string | null
          notifications_enabled?: boolean | null
          training_days?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          measurement_unit?: string | null
          notifications_enabled?: boolean | null
          training_days?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          first_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_progression: {
        Row: {
          achievements_count: number | null
          created_at: string | null
          current_level: number | null
          current_streak: Json | null
          experience_points: number | null
          id: string
          level_history: Json | null
          next_level_threshold: number | null
          nutrition_multiplier: number | null
          nutrition_points: number | null
          sleep_multiplier: number | null
          sleep_points: number | null
          streak_points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          workout_multiplier: number | null
          workout_points: number | null
        }
        Insert: {
          achievements_count?: number | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: Json | null
          experience_points?: number | null
          id?: string
          level_history?: Json | null
          next_level_threshold?: number | null
          nutrition_multiplier?: number | null
          nutrition_points?: number | null
          sleep_multiplier?: number | null
          sleep_points?: number | null
          streak_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          workout_multiplier?: number | null
          workout_points?: number | null
        }
        Update: {
          achievements_count?: number | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: Json | null
          experience_points?: number | null
          id?: string
          level_history?: Json | null
          next_level_threshold?: number | null
          nutrition_multiplier?: number | null
          nutrition_points?: number | null
          sleep_multiplier?: number | null
          sleep_points?: number | null
          streak_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          workout_multiplier?: number | null
          workout_points?: number | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          end_date: string | null
          id: string
          payment_provider: string | null
          start_date: string | null
          status: string
          subscription_details: Json | null
          subscription_type: string
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          end_date?: string | null
          id?: string
          payment_provider?: string | null
          start_date?: string | null
          status: string
          subscription_details?: Json | null
          subscription_type: string
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          end_date?: string | null
          id?: string
          payment_provider?: string | null
          start_date?: string | null
          status?: string
          subscription_details?: Json | null
          subscription_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suggested_foods: {
        Row: {
          calories: number
          carbs: number
          category: string
          created_at: string
          fats: number
          id: string
          name: string
          proteins: number
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories: number
          carbs?: number
          category: string
          created_at?: string
          fats?: number
          id?: string
          name: string
          proteins: number
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string
          created_at?: string
          fats?: number
          id?: string
          name?: string
          proteins?: number
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_suggested_foods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_feedback: {
        Row: {
          comments: string | null
          created_at: string | null
          difficulty_rating: number | null
          fatigue_level: number | null
          id: string
          satisfaction_rating: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          difficulty_rating?: number | null
          fatigue_level?: number | null
          id?: string
          satisfaction_rating?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          difficulty_rating?: number | null
          fatigue_level?: number | null
          id?: string
          satisfaction_rating?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferred_duration: number | null
          preferred_equipment: string[] | null
          preferred_workout_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferred_duration?: number | null
          preferred_equipment?: string[] | null
          preferred_workout_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferred_duration?: number | null
          preferred_equipment?: string[] | null
          preferred_workout_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          current_exercise_index: number | null
          energy_level: number | null
          equipment_used: string[] | null
          exercise_progress: Json | null
          exercises: string[] | null
          id: string
          initial_energy_level: string | null
          is_adapted: boolean | null
          perceived_difficulty: string | null
          planned_start_time: string | null
          session_notes: string | null
          started_at: string | null
          status: string
          target_duration_minutes: number | null
          total_duration_minutes: number | null
          total_rest_time_seconds: number | null
          updated_at: string | null
          user_id: string | null
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          current_exercise_index?: number | null
          energy_level?: number | null
          equipment_used?: string[] | null
          exercise_progress?: Json | null
          exercises?: string[] | null
          id?: string
          initial_energy_level?: string | null
          is_adapted?: boolean | null
          perceived_difficulty?: string | null
          planned_start_time?: string | null
          session_notes?: string | null
          started_at?: string | null
          status?: string
          target_duration_minutes?: number | null
          total_duration_minutes?: number | null
          total_rest_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_type?: string
        }
        Update: {
          created_at?: string | null
          current_exercise_index?: number | null
          energy_level?: number | null
          equipment_used?: string[] | null
          exercise_progress?: Json | null
          exercises?: string[] | null
          id?: string
          initial_energy_level?: string | null
          is_adapted?: boolean | null
          perceived_difficulty?: string | null
          planned_start_time?: string | null
          session_notes?: string | null
          started_at?: string | null
          status?: string
          target_duration_minutes?: number | null
          total_duration_minutes?: number | null
          total_rest_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_suggestions: {
        Row: {
          created_at: string
          criteria: Json | null
          description: string
          difficulty_levels: string[] | null
          equipment_required: string[] | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          muscle_groups: string[] | null
          suggested_order: number | null
          title: string
          type: string
          updated_at: string
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          criteria?: Json | null
          description: string
          difficulty_levels?: string[] | null
          equipment_required?: string[] | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          muscle_groups?: string[] | null
          suggested_order?: number | null
          title: string
          type: string
          updated_at?: string
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          criteria?: Json | null
          description?: string
          difficulty_levels?: string[] | null
          equipment_required?: string[] | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          muscle_groups?: string[] | null
          suggested_order?: number | null
          title?: string
          type?: string
          updated_at?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_suggestions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "sport_specific_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string | null
          description: string | null
          exercise_data: Json | null
          id: string
          is_premium: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          exercise_data?: Json | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          exercise_data?: Json | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_training_analytics: {
        Row: {
          action_type: string | null
          avg_input_tokens: number | null
          avg_output_tokens: number | null
          avg_response_time_ms: number | null
          day: string | null
          negative_feedback: number | null
          positive_feedback: number | null
          total_requests: number | null
        }
        Relationships: []
      }
      duplicate_records_report: {
        Row: {
          column_checked: string[] | null
          duplicate_count: number | null
          sample_values: Json | null
          table_name: string | null
        }
        Relationships: []
      }
      popular_meal_suggestions: {
        Row: {
          calories: number | null
          carbs: number | null
          cooking_time_minutes: number | null
          created_at: string | null
          diet_types: string[] | null
          difficulty_level: string | null
          fats: number | null
          id: string | null
          ingredients: Json | null
          meal_type: string | null
          name: string | null
          nutritional_info: Json | null
          preparation: string | null
          proteins: number | null
          rating: number | null
          reviews_count: number | null
          season: string[] | null
          servings: number | null
          tags: string[] | null
        }
        Relationships: []
      }
      positions_sportives: {
        Row: {
          created_at: string | null
          id: string | null
          initial_tests: Json | null
          performance_metrics: Json | null
          position_name: string | null
          recommended_exercises: Json | null
          sport_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      user_daily_calories: {
        Row: {
          activity_level: string | null
          height_cm: number | null
          objective: string | null
          total_daily_calories: number | null
          training_frequency: string | null
          user_id: string | null
          weight_kg: number | null
          workout_duration: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_calories_by_gender: {
        Args: {
          base_calories: number
          gender: string
          weight_kg?: number
          height_cm?: number
          age?: number
        }
        Returns: number
      }
      calculate_exercise_calories: {
        Args: {
          weight_kg: number
          duration_minutes: number
          intensity: string
          gender: string
        }
        Returns: number
      }
      calculate_macros: {
        Args: {
          base_calories: number
          portion_size: number
          food_type?: string
        }
        Returns: {
          calories: number
          proteins: number
          carbs: number
          fats: number
        }[]
      }
      calculate_sleep_score: {
        Args: {
          duration_minutes: number
          quality_metrics: Json
          environmental_data: Json
        }
        Returns: number
      }
      calculate_total_daily_calories: {
        Args: {
          base_calories: number
          training_frequency: string
          workout_duration: string
          activity_level: string
        }
        Returns: number
      }
      check_premium_access: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_table_for_duplicates: {
        Args: { table_name: string; column_names: string[] }
        Returns: {
          duplicate_count: number
          duplicate_values: Json
        }[]
      }
      crosstab: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      crosstab2: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["tablefunc_crosstab_2"][]
      }
      crosstab3: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["tablefunc_crosstab_3"][]
      }
      crosstab4: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["tablefunc_crosstab_4"][]
      }
      delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      delete_workout_session: {
        Args: { session_id: string }
        Returns: undefined
      }
      dmetaphone: {
        Args: { "": string }
        Returns: string
      }
      dmetaphone_alt: {
        Args: { "": string }
        Returns: string
      }
      find_duplicates_in_table: {
        Args: { table_name: string; column_names: string[] }
        Returns: {
          duplicate_count: number
          duplicate_values: Json
        }[]
      }
      generate_duplicates_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_checked: string[]
          duplicate_count: number
          sample_values: Json
        }[]
      }
      get_ai_usage_stats: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_requests: number
          avg_response_time: number
          success_rate: number
          top_actions: string[]
        }[]
      }
      get_date: {
        Args: { "": string }
        Returns: string
      }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          parent_page_id: number
          path: string
          meta: Json
        }[]
      }
      get_personalized_meal_suggestions: {
        Args: {
          p_user_id: string
          p_meal_type?: string
          p_max_calories?: number
        }
        Returns: {
          calories: number
          carbs: number
          cooking_time_minutes: number | null
          created_at: string
          diet_types: string[] | null
          difficulty_level: string | null
          fats: number
          id: string
          image_url: string | null
          ingredients: Json
          meal_type: string
          name: string
          nutritional_info: Json | null
          preparation: string | null
          proteins: number
          rating: number | null
          reviews_count: number | null
          season: string[] | null
          servings: number | null
          tags: string[] | null
        }[]
      }
      get_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          age: number
          gender: string
          height_cm: number
          weight_kg: number
          timezone: string
          created_at: string
          updated_at: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      json_matches_schema: {
        Args: { schema: Json; instance: Json }
        Returns: boolean
      }
      jsonb_matches_schema: {
        Args: { schema: Json; instance: Json }
        Returns: boolean
      }
      jsonschema_is_valid: {
        Args: { schema: Json }
        Returns: boolean
      }
      jsonschema_validation_errors: {
        Args: { schema: Json; instance: Json }
        Returns: string[]
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
          min_content_length: number
        }
        Returns: {
          id: number
          page_id: number
          slug: string
          heading: string
          content: string
          similarity: number
        }[]
      }
      reset_daily_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soundex: {
        Args: { "": string }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      suggest_duplicate_checks: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          suggested_columns: string[]
        }[]
      }
      text_soundex: {
        Args: { "": string }
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      upsert_user_profile: {
        Args: {
          p_user_id: string
          p_first_name?: string
          p_last_name?: string
          p_email?: string
          p_age?: number
          p_gender?: string
          p_height_cm?: number
          p_weight_kg?: number
          p_timezone?: string
        }
        Returns: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          age: number
          gender: string
          height_cm: number
          weight_kg: number
          timezone: string
          created_at: string
          updated_at: string
        }[]
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      sport_category:
        | "team_sports"
        | "individual_sports"
        | "racket_sports"
        | "motor_sports"
        | "outdoor_extreme"
        | "equestrian"
        | "combat_sports"
        | "paralympic"
    }
    CompositeTypes: {
      tablefunc_crosstab_2: {
        row_name: string | null
        category_1: string | null
        category_2: string | null
      }
      tablefunc_crosstab_3: {
        row_name: string | null
        category_1: string | null
        category_2: string | null
        category_3: string | null
      }
      tablefunc_crosstab_4: {
        row_name: string | null
        category_1: string | null
        category_2: string | null
        category_3: string | null
        category_4: string | null
      }
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
    Enums: {
      sport_category: [
        "team_sports",
        "individual_sports",
        "racket_sports",
        "motor_sports",
        "outdoor_extreme",
        "equestrian",
        "combat_sports",
        "paralympic",
      ],
    },
  },
} as const
