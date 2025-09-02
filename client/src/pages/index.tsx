// ====================================================================
// MyFitHero - Index Principal - Architecturé pour le Marché US
// ====================================================================

import React, {
  useState,
  useCallback,
  useEffect,
  lazy,
  Suspense,
  ReactNode,
} from 'react';
import { Router, Route, useLocation } from 'wouter';
import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// ====================================================================
// Configuration et Types de Base
// ====================================================================

// Interfaces pour les données de géolocalisation
interface GeolocationContext {
  id: string;
  short_code?: string;
  text?: string;
}

// Configuration Supabase optimisée pour le marché US
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Instance Supabase pour usage interne - pour export, voir /lib/supabase.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'myfithero-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'myfithero@1.0.0',
    },
  },
});

// Types TypeScript complets pour l'application
interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  // Profil US-spécifique
  preferred_units: 'imperial' | 'metric';
  timezone: string;
  location?: {
    state: string;
    city: string;
    zip_code: string;
  };
  fitness_profile?: FitnessProfile;
  subscription_tier: 'free' | 'premium' | 'elite';
}

interface FitnessProfile {
  // Données anthropométriques (US units par défaut)
  weight_lbs: number;
  height_ft: number;
  height_in: number;
  age: number;
  gender: 'male' | 'female' | 'null';
  body_fat_percentage?: number;

  // Sports US populaires
  primary_sport: USMainSports;
  secondary_sports: USMainSports[];
  position?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';

  // Objectifs fitness
  fitness_goals: FitnessGoal[];
  target_weight_lbs?: number;
  weekly_workout_frequency: number;

  // Équipements disponibles
  available_equipment: Equipment[];
  gym_membership: boolean;
  home_gym_setup: boolean;

  // Préférences nutritionnelles US
  dietary_restrictions: DietaryRestriction[];
  calorie_goal_daily: number;
  protein_goal_grams: number;

  // Objectifs d'hydratation (fl oz)
  daily_water_goal_floz: number;

  // Préférences de sommeil
  target_sleep_hours: number;
  sleep_schedule: {
    bedtime: string; // Format HH:MM
    wake_time: string; // Format HH:MM
  };

  // Préférences sociales
  privacy_level: 'public' | 'friends' | 'private';
  share_workouts: boolean;
  join_challenges: boolean;
}

type USMainSports =
  | 'basketball'
  | 'football'
  | 'baseball'
  | 'soccer'
  | 'tennis'
  | 'swimming'
  | 'running'
  | 'cycling'
  | 'weightlifting'
  | 'crossfit'
  | 'yoga'
  | 'pilates'
  | 'martial_arts'
  | 'rock_climbing'
  | 'skiing'
  | 'snowboarding'
  | 'surfing'
  | 'golf'
  | 'volleyball'
  | 'gymnastics';

type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'strength_building'
  | 'endurance_improvement'
  | 'flexibility_increase'
  | 'sport_performance'
  | 'general_fitness'
  | 'rehabilitation'
  | 'stress_relief'
  | 'better_sleep';

type Equipment =
  | 'dumbbells'
  | 'barbell'
  | 'kettlebells'
  | 'resistance_bands'
  | 'pull_up_bar'
  | 'yoga_mat'
  | 'treadmill'
  | 'stationary_bike'
  | 'rowing_machine'
  | 'squat_rack'
  | 'bench'
  | 'cable_machine'
  | 'medicine_ball'
  | 'foam_roller'
  | 'jump_rope';

type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'low_carb'
  | 'low_fat'
  | 'mediterranean'
  | 'intermittent_fasting'
  | 'none';

// Types pour l'onboarding conversationnel
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  completedModules: OnboardingModule[];
  userData: Partial<User>;
  conversationHistory: ConversationMessage[];
  aiRecommendations: AIRecommendation[];
  isCompleted: boolean;
}

interface OnboardingModule {
  id: string;
  name: string;
  type: 'sport' | 'nutrition' | 'sleep' | 'hydration' | 'mental_wellness' | 'social';
  icon: string;
  isCompleted: boolean;
  isOptional: boolean;
  estimatedMinutes: number;
  usRelevance: number; // Score de pertinence pour le marché US (0-10)
}

interface ConversationMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  context?: Record<string, string | number | boolean> | undefined;
  suggestedResponses?: string[];
}

interface AIRecommendation {
  id: string;
  type: 'workout' | 'nutrition' | 'hydration' | 'sleep' | 'mental_health';
  title: string;
  description: string;
  confidence: number;
  usContext: string; // Contexte spécifique au marché US
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Types pour les workouts
interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: WorkoutType;
  duration_minutes: number;
  exercises: Exercise[];
  created_at: string;
  completed_at?: string;
  calories_burned?: number;
  notes?: string;
  rating?: number; // 1-5 stars
  us_sport_specific?: boolean;
  equipment_used: Equipment[];
}

interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscle_groups: MuscleGroup[];
  sets: ExerciseSet[];
  instructions: string[];
  video_url?: string;
  thumbnail_url?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  us_sport_relevance: USMainSports[];
  equipment_required: Equipment[];
  alternative_exercises: string[];
}

interface ExerciseSet {
  id: string;
  exercise_id: string;
  set_number: number;
  reps?: number;
  weight_lbs?: number;
  duration_seconds?: number;
  distance_miles?: number;
  rest_seconds: number;
  perceived_exertion?: number; // RPE 1-10
  notes?: string;
  is_warmup: boolean;
  is_failure: boolean;
}

type WorkoutType =
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'sport_specific'
  | 'flexibility'
  | 'rehabilitation'
  | 'circuit'
  | 'crossfit';

type ExerciseCategory =
  | 'compound'
  | 'isolation'
  | 'cardio'
  | 'plyometric'
  | 'stability'
  | 'flexibility'
  | 'core'
  | 'functional';

type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body';

// Types pour la nutrition
interface NutritionEntry {
  id: string;
  user_id: string;
  date: string;
  meals: Meal[];
  daily_totals: NutritionTotals;
  water_intake_floz: number;
  supplements: Supplement[];
  notes?: string;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  time: string;
  calories: number;
  macros: Macronutrients;
}

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  serving_size: string;
  serving_unit: USFoodUnit;
  quantity: number;
  calories_per_serving: number;
  macros_per_serving: Macronutrients;
  micronutrients?: Micronutrients;
  is_us_food: boolean; // True pour les aliments spécifiquement US
  barcode?: string;
}

interface Macronutrients {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
}

interface Micronutrients {
  vitamin_c_mg?: number;
  vitamin_d_iu?: number;
  calcium_mg?: number;
  iron_mg?: number;
  sodium_mg?: number;
  potassium_mg?: number;
}

interface NutritionTotals {
  calories: number;
  macros: Macronutrients;
  goal_calories: number;
  goal_macros: Macronutrients;
  percentage_complete: number;
}

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  time_taken: string;
  notes?: string;
}

type USFoodUnit =
  | 'oz'
  | 'lb'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'fl_oz'
  | 'pint'
  | 'quart'
  | 'gallon'
  | 'slice'
  | 'piece'
  | 'serving';

// Types pour le sommeil
interface SleepEntry {
  id: string;
  user_id: string;
  date: string;
  bedtime: string;
  sleep_time?: string;
  wake_time: string;
  total_sleep_hours: number;
  sleep_quality: number; // 1-10
  sleep_stages?: SleepStages;
  sleep_environment: SleepEnvironment;
  sleep_factors: SleepFactor[];
  notes?: string;
}

interface SleepStages {
  deep_sleep_minutes: number;
  rem_sleep_minutes: number;
  light_sleep_minutes: number;
  awake_minutes: number;
}

interface SleepEnvironment {
  temperature_f: number;
  humidity_percentage: number;
  noise_level: 'silent' | 'quiet' | 'moderate' | 'loud';
  light_level: 'dark' | 'dim' | 'moderate' | 'bright';
  comfort_rating: number; // 1-10
}

type SleepFactor =
  | 'caffeine'
  | 'alcohol'
  | 'exercise'
  | 'stress'
  | 'medication'
  | 'screen_time'
  | 'meal_timing'
  | 'room_temperature'
  | 'noise'
  | 'travel'
  | 'illness';

// Types pour l'hydratation
interface HydrationEntry {
  id: string;
  user_id: string;
  date: string;
  entries: WaterIntake[];
  daily_goal_floz: number;
  total_intake_floz: number;
  percentage_complete: number;
  reminders_sent: number;
  climate_factor: ClimateFactor;
}

interface WaterIntake {
  id: string;
  time: string;
  amount_floz: number;
  source: HydrationSource;
  temperature: 'cold' | 'room' | 'warm' | 'hot';
  notes?: string;
}

type HydrationSource =
  | 'water'
  | 'sports_drink'
  | 'tea'
  | 'coffee'
  | 'juice'
  | 'soda'
  | 'milk'
  | 'protein_shake'
  | 'other';

interface ClimateFactor {
  temperature_f: number;
  humidity_percentage: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'intense';
  sweat_rate: 'low' | 'medium' | 'high';
}

// Types pour le bien-être mental
interface MentalWellnessEntry {
  id: string;
  user_id: string;
  date: string;
  mood_rating: number; // 1-10
  stress_level: number; // 1-10
  energy_level: number; // 1-10
  anxiety_level: number; // 1-10
  meditation_minutes: number;
  gratitude_notes: string[];
  mood_factors: MoodFactor[];
  activities: WellnessActivity[];
  notes?: string;
}

type MoodFactor =
  | 'work_stress'
  | 'relationship'
  | 'finances'
  | 'health'
  | 'weather'
  | 'sleep_quality'
  | 'exercise'
  | 'nutrition'
  | 'social_interaction'
  | 'achievement'
  | 'relaxation'
  | 'other';

interface WellnessActivity {
  id: string;
  type: WellnessActivityType;
  duration_minutes: number;
  rating: number; // 1-10
  notes?: string;
}

type WellnessActivityType =
  | 'meditation'
  | 'breathing_exercise'
  | 'journaling'
  | 'mindfulness'
  | 'yoga'
  | 'nature_walk'
  | 'reading'
  | 'music'
  | 'art'
  | 'social_time'
  | 'hobby';

// Types pour l'aspect social
interface SocialProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  privacy_settings: PrivacySettings;
  stats: SocialStats;
  badges: Badge[];
  friends: Friend[];
  groups: Group[];
  challenges: Challenge[];
}

interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  workout_sharing: boolean;
  progress_sharing: boolean;
  location_sharing: boolean;
  challenge_participation: boolean;
}

interface SocialStats {
  total_workouts: number;
  total_calories_burned: number;
  total_workout_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  challenges_completed: number;
  friends_count: number;
  groups_count: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  earned_date: string;
  category: BadgeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

type BadgeCategory =
  | 'workout_consistency'
  | 'weight_loss'
  | 'strength_gain'
  | 'endurance'
  | 'social'
  | 'challenge'
  | 'milestone'
  | 'special_event'
  | 'us_sport_specific';

interface Friend {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile: {
    display_name: string;
    avatar_url?: string;
    current_streak: number;
    recent_activity: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  member_count: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  us_region?: string; // Pour les groupes régionaux US
}

type GroupCategory =
  | 'sport_specific'
  | 'location_based'
  | 'goal_oriented'
  | 'age_group'
  | 'workout_type'
  | 'nutrition_focused'
  | 'beginner_friendly'
  | 'competitive'
  | 'support_group';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  goal_value: number;
  goal_unit: string;
  start_date: string;
  end_date: string;
  participants: ChallengeParticipant[];
  prizes: Prize[];
  is_us_themed: boolean; // Défis à thème américain
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

type ChallengeType =
  | 'step_count'
  | 'workout_frequency'
  | 'calories_burned'
  | 'weight_loss'
  | 'strength_gain'
  | 'consistency'
  | 'sport_specific'
  | 'team_based'
  | 'charity'
  | 'seasonal';

interface ChallengeParticipant {
  user_id: string;
  display_name: string;
  current_progress: number;
  position: number;
  joined_date: string;
}

interface Prize {
  position: number;
  description: string;
  value?: number;
  sponsor?: string;
}

// Types pour les analytics et métriques
interface UserAnalytics {
  user_id: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  fitness_metrics: FitnessMetrics;
  nutrition_metrics: NutritionMetrics;
  sleep_metrics: SleepMetrics;
  hydration_metrics: HydrationMetrics;
  wellness_metrics: WellnessMetrics;
  social_metrics: SocialMetrics;
  generated_at: string;
}

interface FitnessMetrics {
  total_workouts: number;
  total_exercise_minutes: number;
  average_workout_duration: number;
  calories_burned: number;
  strength_progression: StrengthProgression[];
  cardio_progression: CardioProgression[];
  consistency_score: number; // 0-100
  favorite_exercises: string[];
  workout_frequency_by_day: Record<string, number>;
}

interface StrengthProgression {
  exercise_name: string;
  start_weight_lbs: number;
  current_weight_lbs: number;
  max_weight_lbs: number;
  progression_percentage: number;
}

interface CardioProgression {
  activity: string;
  start_performance: number;
  current_performance: number;
  best_performance: number;
  unit: string;
  improvement_percentage: number;
}

interface NutritionMetrics {
  average_daily_calories: number;
  calorie_goal_adherence: number; // Pourcentage
  macro_distribution: Macronutrients;
  hydration_adherence: number; // Pourcentage
  meal_consistency: number; // Score 0-100
  supplement_adherence: number; // Pourcentage
  favorite_foods: string[];
  nutrition_score: number; // Score global 0-100
}

interface SleepMetrics {
  average_sleep_duration: number;
  sleep_quality_average: number;
  bedtime_consistency: number; // Score 0-100
  sleep_debt_hours: number;
  best_sleep_factors: SleepFactor[];
  worst_sleep_factors: SleepFactor[];
  sleep_trend: 'improving' | 'stable' | 'declining';
}

interface HydrationMetrics {
  average_daily_intake_floz: number;
  hydration_goal_adherence: number; // Pourcentage
  hydration_consistency: number; // Score 0-100
  preferred_hydration_sources: HydrationSource[];
  dehydration_risk_days: number;
}

interface WellnessMetrics {
  average_mood_rating: number;
  average_stress_level: number;
  average_energy_level: number;
  meditation_minutes_total: number;
  wellness_activities_count: number;
  mood_trend: 'improving' | 'stable' | 'declining';
  top_mood_factors: MoodFactor[];
}

interface SocialMetrics {
  social_engagement_score: number; // 0-100
  friends_added: number;
  challenges_joined: number;
  challenges_completed: number;
  workout_shares: number;
  community_interactions: number;
  influence_score: number; // Impact sur les autres utilisateurs
}

// ====================================================================
// Configuration PWA et Service Worker
// ====================================================================

interface PWAConfig {
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableBackgroundSync: boolean;
  cacheStrategy: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate';
}

const pwaConfig: PWAConfig = {
  enableOfflineMode: true,
  enablePushNotifications: true,
  enableBackgroundSync: true,
  cacheStrategy: 'staleWhileRevalidate',
};

// ====================================================================
// Store Zustand Global pour la Gestion d'État
// ====================================================================

interface AppState {
  // État d'authentification
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // État d'onboarding
  onboarding: OnboardingState;

  // Préférences utilisateur
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'fr';
    units: 'imperial' | 'metric';
    notifications: NotificationSettings;
    privacy: PrivacySettings;
  };

  // Cache des données
  cache: {
    workouts: Workout[];
    exercises: Exercise[];
    nutritionEntries: NutritionEntry[];
    sleepEntries: SleepEntry[];
    hydrationEntries: HydrationEntry[];
    wellnessEntries: MentalWellnessEntry[];
    socialData: SocialProfile | null;
    analytics: UserAnalytics | null;
  };

  // État de l'interface
  ui: {
    currentPage: string;
    isOffline: boolean;
    lastSyncTime: string | null;
    pendingSyncs: PendingSync[];
  };

  // Actions
  setUser: (user: User | null) => void;
  updateOnboarding: (state: Partial<OnboardingState>) => void;
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  updateCache: (cacheKey: keyof AppState['cache'], data: unknown) => void;
  clearCache: () => void;
  addPendingSync: (sync: PendingSync) => void;
  removePendingSync: (syncId: string) => void;
}

interface NotificationSettings {
  workoutReminders: boolean;
  nutritionReminders: boolean;
  hydrationReminders: boolean;
  sleepReminders: boolean;
  socialNotifications: boolean;
  challengeUpdates: boolean;
  systemUpdates: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

interface PendingSync {
  id: string;
  type: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'wellness';
  data: unknown;
  timestamp: string;
  retryCount: number;
}

const appStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      (set, _get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        isLoading: true,

        onboarding: {
          currentStep: 0,
          totalSteps: 6,
          completedModules: [],
          userData: {},
          conversationHistory: [],
          aiRecommendations: [],
          isCompleted: false,
        },

        preferences: {
          theme: 'system',
          language: 'en',
          units: 'imperial', // US par défaut
          notifications: {
            workoutReminders: true,
            nutritionReminders: true,
            hydrationReminders: true,
            sleepReminders: true,
            socialNotifications: true,
            challengeUpdates: true,
            systemUpdates: true,
            pushNotifications: true,
            emailNotifications: false,
          },
          privacy: {
            profile_visibility: 'friends',
            workout_sharing: true,
            progress_sharing: true,
            location_sharing: false,
            challenge_participation: true,
          },
        },

        cache: {
          workouts: [],
          exercises: [],
          nutritionEntries: [],
          sleepEntries: [],
          hydrationEntries: [],
          wellnessEntries: [],
          socialData: null,
          analytics: null,
        },

        ui: {
          currentPage: '/',
          isOffline: false,
          lastSyncTime: null,
          pendingSyncs: [],
        },

        // Actions
        setUser: user => set({ user, isAuthenticated: !!user }),

        updateOnboarding: newState =>
          set(state => ({
            onboarding: { ...state.onboarding, ...newState },
          })),

        updatePreferences: newPreferences =>
          set(state => ({
            preferences: { ...state.preferences, ...newPreferences },
          })),

        updateCache: (cacheKey, data) =>
          set(state => ({
            cache: { ...state.cache, [cacheKey]: data },
          })),

        clearCache: () =>
          set(_state => ({
            cache: {
              workouts: [],
              exercises: [],
              nutritionEntries: [],
              sleepEntries: [],
              hydrationEntries: [],
              wellnessEntries: [],
              socialData: null,
              analytics: null,
            },
          })),

        addPendingSync: sync =>
          set(state => ({
            ui: {
              ...state.ui,
              pendingSyncs: [...state.ui.pendingSyncs, sync],
            },
          })),

        removePendingSync: syncId =>
          set(state => ({
            ui: {
              ...state.ui,
              pendingSyncs: state.ui.pendingSyncs.filter(sync => sync.id !== syncId),
            },
          })),
      }),
      {
        name: 'myfithero-store',
        partialize: state => ({
          user: state.user,
          preferences: state.preferences,
          onboarding: state.onboarding,
        }),
      }
    )
  )
);

// ====================================================================
// Hooks Personnalisés pour l'Application
// ====================================================================

// Hook pour la géolocalisation US
const useUSLocation = () => {
  const [location, setLocation] = useState<{
    state: string;
    city: string;
    zip: string;
    timezone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUSLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Utiliser l'API de géolocalisation du navigateur
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      // Convertir les coordonnées en adresse US via une API de geocoding
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=us&types=place,postcode`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];

        const state =
          context.find((c: GeolocationContext) => c.id.startsWith('region'))?.short_code?.replace('US-', '') || '';
        const city = feature.text || '';
        const zip = context.find((c: GeolocationContext) => c.id.startsWith('postcode'))?.text || '';

        // Déterminer le fuseau horaire basé sur l'état
        const timezone = getTimezoneFromState(state);

        setLocation({ state, city, zip, timezone });
      }
    } catch () {
      setError('Unable to determine your location. Please ensure location services are enabled.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { location, isLoading, error, getUSLocation };
};

// Fonction utilitaire pour déterminer le fuseau horaire
const getTimezoneFromState = (state: string): string => {
  const stateTimezones: Record<string, string> = {
    CA: 'America/Los_Angeles',
    NY: 'America/New_York',
    TX: 'America/Chicago',
    FL: 'America/New_York',
    IL: 'America/Chicago',
    PA: 'America/New_York',
    OH: 'America/New_York',
    GA: 'America/New_York',
    NC: 'America/New_York',
    MI: 'America/New_York',
    NJ: 'America/New_York',
    VA: 'America/New_York',
    WA: 'America/Los_Angeles',
    AZ: 'America/Phoenix',
    MA: 'America/New_York',
    TN: 'America/Chicago',
    IN: 'America/New_York',
    MO: 'America/Chicago',
    MD: 'America/New_York',
    WI: 'America/Chicago',
    CO: 'America/Denver',
    MN: 'America/Chicago',
    SC: 'America/New_York',
    AL: 'America/Chicago',
    LA: 'America/Chicago',
    KY: 'America/New_York',
    OR: 'America/Los_Angeles',
    OK: 'America/Chicago',
    CT: 'America/New_York',
    UT: 'America/Denver',
    IA: 'America/Chicago',
    NV: 'America/Los_Angeles',
    AR: 'America/Chicago',
    MS: 'America/Chicago',
    KS: 'America/Chicago',
    NM: 'America/Denver',
    NE: 'America/Chicago',
    WV: 'America/New_York',
    ID: 'America/Denver',
    HI: 'Pacific/Honolulu',
    AK: 'America/Anchorage',
    NH: 'America/New_York',
    ME: 'America/New_York',
    MT: 'America/Denver',
    RI: 'America/New_York',
    DE: 'America/New_York',
    SD: 'America/Chicago',
    ND: 'America/Chicago',
    DC: 'America/New_York',
    VT: 'America/New_York',
    WY: 'America/Denver',
  };

  return stateTimezones[state] || 'America/New_York';
};

// Hook pour les conversions d'unités US
const useUSUnits = () => {
  const { preferences } = appStore();
  const isImperial = preferences.units === 'imperial';

  const convertWeight = useCallback(
    (value: number, fromUnit: 'lbs' | 'kg', toUnit?: 'lbs' | 'kg') => {
      const targetUnit = toUnit || (isImperial ? 'lbs' : 'kg');

      if (fromUnit === targetUnit) return { value, unit: targetUnit };

      if (fromUnit === 'lbs' && targetUnit === 'kg') {
        return { value: Math.round(value * 0.453592 * 10) / 10, unit: 'kg' };
      } else if (fromUnit === 'kg' && targetUnit === 'lbs') {
        return { value: Math.round(value * 2.20462 * 10) / 10, unit: 'lbs' };
      }

      return { value, unit: fromUnit };
    },
    [isImperial]
  );

  const convertHeight = useCallback(
    (feet: number, inches: number, targetUnit?: 'ft_in' | 'cm') => {
      const unit = targetUnit || (isImperial ? 'ft_in' : 'cm');

      if (unit === 'ft_in') {
        return { feet, inches, unit: 'ft_in' };
      } else {
        const totalInches = feet * 12 + inches;
        const cm = Math.round(totalInches * 2.54);
        return { value: cm, unit: 'cm' };
      }
    },
    [isImperial]
  );

  const convertDistance = useCallback(
    (value: number, fromUnit: 'miles' | 'km', toUnit?: 'miles' | 'km') => {
      const targetUnit = toUnit || (isImperial ? 'miles' : 'km');

      if (fromUnit === targetUnit) return { value, unit: targetUnit };

      if (fromUnit === 'miles' && targetUnit === 'km') {
        return { value: Math.round(value * 1.60934 * 100) / 100, unit: 'km' };
      } else if (fromUnit === 'km' && targetUnit === 'miles') {
        return { value: Math.round(value * 0.621371 * 100) / 100, unit: 'miles' };
      }

      return { value, unit: fromUnit };
    },
    [isImperial]
  );

  const convertVolume = useCallback(
    (value: number, fromUnit: 'floz' | 'ml' | 'liters', toUnit?: string) => {
      const targetUnit = toUnit || (isImperial ? 'floz' : 'ml');

      if (fromUnit === targetUnit) return { value, unit: targetUnit };

      // Conversions vers fl oz
      if (targetUnit === 'floz') {
        if (fromUnit === 'ml')
          return { value: Math.round(value * 0.033814 * 10) / 10, unit: 'floz' };
        if (fromUnit === 'liters')
          return { value: Math.round(value * 33.814 * 10) / 10, unit: 'floz' };
      }

      // Conversions vers ml
      if (targetUnit === 'ml') {
        if (fromUnit === 'floz') return { value: Math.round(value * 29.5735), unit: 'ml' };
        if (fromUnit === 'liters') return { value: value * 1000, unit: 'ml' };
      }

      return { value, unit: fromUnit };
    },
    [isImperial]
  );

  const convertTemperature = useCallback(
    (value: number, fromUnit: 'F' | 'C', toUnit?: 'F' | 'C') => {
      const targetUnit = toUnit || (isImperial ? 'F' : 'C');

      if (fromUnit === targetUnit) return { value, unit: targetUnit };

      if (fromUnit === 'F' && targetUnit === 'C') {
        return { value: Math.round((((value - 32) * 5) / 9) * 10) / 10, unit: 'C' };
      } else if (fromUnit === 'C' && targetUnit === 'F') {
        return { value: Math.round(((value * 9) / 5 + 32) * 10) / 10, unit: 'F' };
      }

      return { value, unit: fromUnit };
    },
    [isImperial]
  );

  return {
    isImperial,
    convertWeight,
    convertHeight,
    convertDistance,
    convertVolume,
    convertTemperature,
  };
};

// Hook pour l'IA conversationnelle
const useConversationalAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onboarding, updateOnboarding } = appStore();

  const sendMessage = useCallback(
    async (message: string, context?: Record<string, string | number | boolean>) => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            message,
            context: {
              ...context,
              conversationHistory: onboarding.conversationHistory,
              currentStep: onboarding.currentStep,
              userData: onboarding.userData,
              usMarket: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();

        // Ajouter les messages à l'historique
        const userMessage: ConversationMessage = {
          id: `user_${Date.now()}`,
          type: 'user',
          content: message,
          timestamp: new Date(),
          context,
        };

        const aiMessage: ConversationMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          context: data.context,
          suggestedResponses: data.suggestedResponses,
        };

        updateOnboarding({
          conversationHistory: [...onboarding.conversationHistory, userMessage, aiMessage],
          aiRecommendations: data.recommendations || onboarding.aiRecommendations,
        });

        return { response: data.response, recommendations: data.recommendations };
      } catch () {
        const errorMessage = err instanceof Error ? err.message : 'AI service unavailable';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [onboarding, updateOnboarding]
  );

  const generateRecommendations = useCallback(
    async (type: 'workout' | 'nutrition' | 'hydration' | 'sleep') => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            type,
            userData: onboarding.userData,
            usMarket: true,
            preferences: {
              units: 'imperial',
              language: 'en',
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate recommendations');
        }

        const recommendations = await response.json();

        updateOnboarding({
          aiRecommendations: [...onboarding.aiRecommendations, ...recommendations],
        });

        return recommendations;
      } catch () {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate recommendations';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [onboarding, updateOnboarding]
  );

  return {
    sendMessage,
    generateRecommendations,
    isProcessing,
    error,
    conversationHistory: onboarding.conversationHistory,
    recommendations: onboarding.aiRecommendations,
  };
};

// Hook pour la synchronisation offline
const useOfflineSync = () => {
  const { ui, addPendingSync, removePendingSync } = appStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncPendingData = useCallback(async () => {
    if (isSyncing || ui.pendingSyncs.length === 0) return;

    setIsSyncing(true);

    for (const sync of ui.pendingSyncs) {
      try {
        const response = await fetch(`/api/sync/${sync.type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify(sync.data),
        });

        if (response.ok) {
          removePendingSync(sync.id);
        } else {
          // Incrémenter le compteur de retry
          const updatedSync = { ...sync, retryCount: sync.retryCount + 1 };

          // Supprimer après 3 tentatives échouées
          if (updatedSync.retryCount >= 3) {
            removePendingSync(sync.id);
            console.error(`Failed to sync ${sync.type} after 3 attempts:`, sync.data);
          }
        }
      } catch {
      // Erreur silencieuse
      // Erreur silencieuse
      }
    }

    setIsSyncing(false);
  }, [isSyncing, ui.pendingSyncs, removePendingSync]);

  const addToSyncQueue = useCallback(
    (type: PendingSync['type'], data: unknown) => {
      const sync: PendingSync = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      addPendingSync(sync);

      // Essayer de synchroniser immédiatement si en ligne
      if (navigator.onLine) {
        syncPendingData();
      }
    },
    [addPendingSync, syncPendingData]
  );

  // Écouter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      syncPendingData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncPendingData]);

  return {
    addToSyncQueue,
    syncPendingData,
    isSyncing,
    pendingSyncs: ui.pendingSyncs,
    isOffline: !navigator.onLine,
  };
};

// ====================================================================
// Composants Lazy-loaded pour les pages principales
// ====================================================================

// Pages principales
const OnboardingPage = lazy(() => import('../features/auth/pages/ProfileComplete'));
const DashboardPage = lazy(() => import('../features/admin/pages/AdminPage'));
const NotFoundPage = lazy(() => import('./NotFound'));
const AppLoadingSpinner = lazy(() => import('../shared/components/AppLoadingSpinner'));
const AppErrorBoundary = lazy(() => import('../shared/components/AppErrorBoundary'));

// ====================================================================
// Définition des Routes de l'Application
// ====================================================================

// ====================================================================
// Configuration des Routes de l'Application
// ====================================================================

interface RouteConfig {
  path: string;
  component: React.ComponentType<Record<string, unknown>>;
  exact?: boolean;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  title?: string;
  description?: string;
}

const appRoutes: RouteConfig[] = [
  // Routes publiques
  {
    path: '/',
    component: lazy(() => import('../features/landing/pages/LandingPage')),
    exact: true,
    title: 'MyFitHero - AI-Powered Fitness for Americans',
    description:
      'The ultimate US-ready fitness & wellness app with AI coaching, nutrition tracking, and social features.',
  },
  {
    path: '/login',
    component: lazy(() => import('../features/auth/pages/AuthPage')),
    title: 'Sign In - MyFitHero',
    description: 'Sign in to your MyFitHero account and continue your fitness journey.',
  },
  {
    path: '/register',
    component: lazy(() => import('../features/auth/pages/AuthPage')),
    title: 'Create Account - MyFitHero',
    description: 'Join thousands of Americans achieving their fitness goals with MyFitHero.',
  },

  // Routes d'onboarding
  {
    path: '/onboarding',
    component: OnboardingPage,
    requiresAuth: true,
    title: 'Welcome to MyFitHero',
    description: "Let's personalize your fitness journey with our AI-powered onboarding.",
  },
  {
    path: '/onboarding/:step',
    component: OnboardingPage,
    requiresAuth: true,
    title: 'Setup Your Profile - MyFitHero',
    description: 'Personalized fitness setup designed specifically for Americans.',
  },

  // Routes principales de l'application
  {
    path: '/dashboard',
    component: DashboardPage,
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Dashboard - MyFitHero',
    description: 'Your personalized fitness dashboard with AI insights and progress tracking.',
  },
  {
    path: '/workouts',
    component: lazy(() => import('../features/workout/pages/WorkoutPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Workouts - MyFitHero',
    description: 'AI-powered workouts tailored for your sport and fitness goals.',
  },
  {
    path: '/workouts/:id',
    component: lazy(() => import('../features/workout/pages/WorkoutDetailPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Workout Details - MyFitHero',
  },
  {
    path: '/nutrition',
    component: lazy(() => import('../features/nutrition/pages/NutritionPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Nutrition - MyFitHero',
    description: 'Track your nutrition with the most comprehensive US food database.',
  },
  {
    path: '/sleep',
    component: lazy(() => import('../features/sleep/pages/SleepPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Sleep Tracking - MyFitHero',
    description: 'Optimize your recovery with advanced sleep analytics and recommendations.',
  },
  {
    path: '/hydration',
    component: lazy(() => import('../features/hydration/pages/HydrationPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Hydration - MyFitHero',
    description: 'Stay hydrated with personalized goals and smart reminders in fl oz.',
  },
  {
    path: '/wellness',
    component: lazy(() => import('../features/recovery/pages/RecoveryPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Mental Wellness - MyFitHero',
    description: 'Track your mental health, mood, and stress with AI-powered insights.',
  },
  {
    path: '/social',
    component: lazy(() => import('../features/social/pages/SocialPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Community - MyFitHero',
    description: 'Connect with friends, join challenges, and share your fitness journey.',
  },
  {
    path: '/social/challenges',
    component: lazy(() => import('../features/social/pages/ChallengesPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Fitness Challenges - MyFitHero',
    description: 'Join community challenges and compete with friends across America.',
  },
  {
    path: '/analytics',
    component: lazy(() => import('../features/analytics/pages/AnalyticsPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Progress Analytics - MyFitHero',
    description: 'Detailed analytics and insights about your fitness progress and trends.',
  },
  {
    path: '/profile',
    component: lazy(() => import('../features/profile/pages/ProfilePage')),
    requiresAuth: true,
    title: 'Your Profile - MyFitHero',
    description: 'Manage your profile, preferences, and fitness goals.',
  },
  {
    path: '/settings',
    component: lazy(() => import('../features/profile/pages/SettingsPage')),
    requiresAuth: true,
    title: 'Settings - MyFitHero',
    description: 'Customize your MyFitHero experience, privacy, and notifications.',
  },

  // Routes spécialisées
  {
    path: '/ai-coach',
    component: lazy(() => import('../features/ai-coach/pages/AICoachPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'AI Coach - MyFitHero',
    description: 'Get personalized coaching and recommendations from your AI fitness assistant.',
  },
  {
    path: '/exercises',
    component: lazy(() => import('../features/workout/pages/ExercisesPage')),
    requiresAuth: true,
    title: 'Exercise Library - MyFitHero',
    description: 'Comprehensive exercise library with 450+ video-guided workouts.',
  },
  {
    path: '/exercises/:id',
    component: lazy(() => import('../features/workout/pages/ExerciseDetailPage')),
    requiresAuth: true,
    title: 'Exercise Details - MyFitHero',
  },
  {
    path: '/recovery',
    component: lazy(() => import('../features/recovery/pages/RecoveryPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Recovery - MyFitHero',
    description: 'Optimize your recovery with personalized insights and recommendations.',
  },
  {
    path: '/wearables',
    component: lazy(() => import('../features/wearables/pages/WearableHubPage')),
    requiresAuth: true,
    requiresOnboarding: true,
    title: 'Wearable Hub - MyFitHero',
    description: 'Connect and sync your fitness devices for comprehensive tracking.',
  },
  {
    path: '/admin',
    component: lazy(() => import('../features/admin/pages/AdminPage')),
    requiresAuth: true,
    title: 'Admin - MyFitHero',
    description: 'Administrative interface for MyFitHero management.',
  },

  // Routes utilitaires
  {
    path: '/privacy',
    component: lazy(() => import('./PrivacyPage')),
    title: 'Privacy Policy - MyFitHero',
    description: 'Your privacy matters. Learn how we protect your fitness data.',
  },
  {
    path: '/terms',
    component: lazy(() => import('./TermsPage')),
    title: 'Terms of Service - MyFitHero',
    description: 'Terms and conditions for using MyFitHero fitness application.',
  },
  {
    path: '/support',
    component: lazy(() => import('./SupportPage')),
    title: 'Support - MyFitHero',
    description: 'Get help and support for your MyFitHero experience.',
  },
];

// ====================================================================
// Composant d'Authentification Guards
// ====================================================================

interface AuthGuardProps {
  children: ReactNode;
  requiresAuth?: boolean | undefined;
  requiresOnboarding?: boolean | undefined;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiresAuth = false,
  requiresOnboarding = false,
}) => {
  const { user, isAuthenticated, onboarding } = appStore();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
        }

        if (session && !user) {
          // Charger les données utilisateur
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData && !userError) {
            appStore.getState().setUser(userData);
          }
        }
      } catch {
      // Erreur silencieuse
      // Erreur silencieuse
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Utilisateur connecté
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          appStore.getState().setUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        // Utilisateur déconnecté
        appStore.getState().setUser(null);
        appStore.getState().clearCache();
        setLocation('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  if (isLoading) {
    return <AppLoadingSpinner message="Checking authentication..." />;
  }

  // Vérification d'authentification
  if (requiresAuth && !isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Vérification d'onboarding
  if (requiresOnboarding && isAuthenticated && !onboarding.isCompleted) {
    setLocation('/onboarding');
    return null;
  }

  return <>{children}</>;
};

// ====================================================================
// Composant Principal MyFitHero Index
// ====================================================================

const MyFitHeroIndex: React.FC = () => {
  const { isLoading, preferences } = appStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [appVersion] = useState('4.0.0');
  const [buildNumber] = useState('20250801');

  // Initialisation de l'application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Vérifier le support PWA
        if ('serviceWorker' in navigator && pwaConfig.enableOfflineMode) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('ServiceWorker registered:', registration);
        }

        // Configurer les notifications push
        if (pwaConfig.enablePushNotifications && 'Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        }

        // Détecter le statut de connectivité
        const updateOnlineStatus = () => {
          appStore.getState().ui.isOffline = !navigator.onLine;
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Configurer les métriques de performance
        if (process.env.NODE_ENV === 'production') {
          // Web Vitals et autres métriques

          onCLS(console.log);
          onINP(console.log);
          onFCP(console.log);
          onLCP(console.log);
          onTTFB(console.log);
        }

        setIsInitialized(true);
      } catch {
      // Erreur silencieuse
      // Erreur silencieuse
        setIsInitialized(true); // Continue même en cas d'erreur
      }
    };

    initializeApp();
  }, []);

  // Gestion des métadonnées de page
  useEffect(() => {
    const updatePageMetadata = (route: RouteConfig) => {
      if (route.title) {
        document.title = route.title;
      }

      if (route.description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', route.description);
        }
      }
    };

    // Écouter les changements de route - simplified
    const currentRouteInfo: RouteConfig = {
      path: window.location.pathname,
      component: () => null,
      title: 'MyFitHero - US Fitness App',
      description: 'AI-powered fitness coaching for the US market'
    };
    
    updatePageMetadata(currentRouteInfo);
  }, []);

  // Affichage du chargement initial
  if (!isInitialized || isLoading) {
    return <AppLoadingSpinner message="Initializing MyFitHero..." showProgress />;
  }

  return (
    <AppErrorBoundary>
      <div className="app-container min-h-screen bg-gray-50" data-theme={preferences.theme}>
        <Suspense fallback={<AppLoadingSpinner />}>
          <Router>
            {/* Routes principales */}
            {appRoutes.map(({ path, component: Component, requiresAuth, requiresOnboarding }) => (
              <Route key={path} path={path}>
                <AuthGuard requiresAuth={requiresAuth} requiresOnboarding={requiresOnboarding}>
                  <Component />
                </AuthGuard>
              </Route>
            ))}

            {/* Routes spéciales */}
            <Route path="/debug" nest>
              {process.env.NODE_ENV === 'development' && (
                <Route>
                  <div />
                </Route>
              )}
            </Route>

            {/* Route catch-all pour 404 */}
            <Route>
              <NotFoundPage />
            </Route>
          </Router>
        </Suspense>

        {/* Composants Analytics et Monitoring */}

        {/* Informations de version (visible en développement) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono">
            MyFitHero - v{appVersion} (build {buildNumber})
          </div>
        )}
      </div>
    </AppErrorBoundary>
  );
};

export default React.memo(MyFitHeroIndex);

// ====================================================================
// Exports Utilitaires pour l'Application
// ====================================================================

// REMARQUE: Les exports suivants sont nécessaires mais causent des warnings Fast Refresh
// Ils seront déplacés dans des fichiers dédiés à terme

// eslint-disable-next-line react-refresh/only-export-components
export { useUSLocation, useUSUnits, useConversationalAI, useOfflineSync, appStore };

// Types exportés (peuvent rester car ne cassent pas Fast Refresh)
export type {
  User,
  FitnessProfile,
  USMainSports,
  FitnessGoal,
  Equipment,
  OnboardingState,
  OnboardingModule,
  ConversationMessage,
  AIRecommendation,
  Workout,
  Exercise,
  ExerciseSet,
  NutritionEntry,
  Meal,
  FoodItem,
  SleepEntry,
  HydrationEntry,
  MentalWellnessEntry,
  SocialProfile,
  Challenge,
  UserAnalytics,
};

// Export des utilitaires
// eslint-disable-next-line react-refresh/only-export-components
export { pwaConfig, AppErrorBoundary, AppLoadingSpinner, AuthGuard };
