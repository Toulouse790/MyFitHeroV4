// stores/appStore.ts (VERSION COMPLÈTE TYPÉE)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import {
  UserProfile,
  AppStoreState,
  UserWorkout,
  UserNutrition,
  UserHydration,
  UserSleep,
  UserAnalytics,
  WearableData,
  ConnectedScale,
  WeightEntry,
} from '@/features/workout/types/supabase';

// Types spécifiques au store étendu
export interface AppUser extends UserProfile {
  level?: number;
  totalPoints?: number;
  joinDate?: string;
  daily_calories?: number | null;
  sport_specific_stats?: Record<string, number>;
  name?: string;
  goal?: string;
  profile_type?: string;
  active_modules?: string[];
  available_time_per_day?: number;
  season_period?: string;
  injuries?: string[];
}

export interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sleep: number;
  workouts: number;
}

export interface DailyStats {
  id: string;
  user_id: string;
  stat_date: string;
  total_calories_consumed: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_water_ml: number;
  workouts_completed: number;
  sleep_hours: number;
  steps: number | null;
  active_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface AiRecommendation {
  id: string;
  user_id: string;
  pillar_type: 'nutrition' | 'hydration' | 'sleep' | 'workout' | 'recovery';
  recommendation_text: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

// Interface complète du store
interface ExtendedAppStore extends AppStoreState {
  // États étendus
  appStoreUser: AppUser;
  dailyGoals: DailyGoals;
  currentStats: DailyStats | null;
  recommendations: AiRecommendation[];

  // Données des modules
  workouts: UserWorkout[];
  nutritionEntries: UserNutrition[];
  hydrationEntries: UserHydration[];
  sleepEntries: UserSleep[];
  analyticsData: UserAnalytics[];

  // États UI
  activeModule: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: string | null;

  // Données wearables
  wearableData: WearableData | null;
  connectedScales: ConnectedScale[];
  weightHistory: WeightEntry[];

  // Actions étendues
  updateAppStoreUserProfile: (updates: Partial<AppUser>) => void;
  setUser: (user: AppUser) => void;
  clearUser: () => void;
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  calculateAndSetDailyGoals: () => void;

  // Actions données
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;
  fetchAiRecommendations: (
    userId: string,
    pillarType: string,
    limit?: number
  ) => Promise<AiRecommendation[]>;
  markRecommendationAsRead: (recommendationId: string) => Promise<boolean>;

  // Actions modules
  addHydration: (amount: number, type?: string) => Promise<boolean>;
  addMeal: (meal: Partial<UserNutrition>) => Promise<boolean>;
  addSleepSession: (sleepData: Partial<UserSleep>) => Promise<boolean>;
  addWorkout: (workout: Partial<UserWorkout>) => Promise<boolean>;

  // Gestion modules
  activateModule: (moduleId: string) => Promise<boolean>;
  deactivateModule: (moduleId: string) => Promise<boolean>;
  isModuleActive: (moduleId: string) => boolean;
  setActiveModule: (moduleId: string | null) => void;

  // Actions wearables
  syncWearableData: () => Promise<WearableData | null>;
  addConnectedScale: (scale: Partial<ConnectedScale>) => Promise<boolean>;
  addWeightEntry: (entry: Partial<WeightEntry>) => Promise<boolean>;

  // Actions analytics
  updateUserPoints: (points: number) => void;
  incrementLevel: () => void;
  calculateProgress: (date: string) => Promise<{ [key: string]: number }>;

  // Utilitaires
  getTodayProgress: () => { [key: string]: number };
  getWeeklyStats: () => Promise<{ [key: string]: number[] }>;
  exportUserData: () => Promise<{
    user: UserProfile;
    workouts: UserWorkout[];
    nutrition: UserNutrition[];
    sleep: UserSleep[];
    hydration: UserHydration[];
    analytics: UserAnalytics;
  }>;
}

// Calcul des objectifs personnalisés
const calculatePersonalizedGoals = (user: AppUser): DailyGoals => {
  let baseCalories = user.daily_calories || 2000;

  // Calcul BMR si données disponibles
  if (!user.daily_calories && user.age && user.gender && user.weight && user.height) {
    const weight = user.weight;
    const height = user.height;
    const bmr =
      user.gender === 'male'
        ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * user.age
        : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * user.age;

    const activityFactors: Record<string, number> = {
      student: 1.4,
      office_worker: 1.3,
      physical_job: 1.6,
      retired: 1.2,
    };

    const activityFactor = activityFactors[user.lifestyle || ''] || 1.4;
    baseCalories = Math.round(bmr * activityFactor);
  }

  // Ajustements selon objectifs
  let calorieAdjustment = 0;
  if (user.primary_goals?.includes('weight_loss')) calorieAdjustment -= 300;
  if (user.primary_goals?.includes('muscle_gain')) calorieAdjustment += 400;
  if (user.primary_goals?.includes('performance')) calorieAdjustment += 200;

  // Ajustements sport
  const sportAdjustments: Record<string, number> = {
    basketball: 250,
    american_football: 500,
    football: 200,
    tennis: 150,
    running: 400,
    cycling: 400,
    swimming: 400,
    musculation: 300,
    powerlifting: 300,
    crossfit: 350,
  };

  const sportAdjustment = sportAdjustments[user.sport?.toLowerCase() || ''] || 0;
  const finalCalories = baseCalories + calorieAdjustment + sportAdjustment;

  // Calcul macros
  let proteinMultiplier = 1.2;
  let carbMultiplier = 1.0;

  if (user.sport?.toLowerCase().includes('strength') || user.sport === 'musculation') {
    proteinMultiplier = 1.5;
    carbMultiplier = 1.0;
  } else if (user.sport?.toLowerCase().includes('endurance') || user.sport === 'running') {
    proteinMultiplier = 1.2;
    carbMultiplier = 1.5;
  }

  const protein = Math.round(((finalCalories * 0.2) / 4) * proteinMultiplier);
  const carbs = Math.round(((finalCalories * 0.45) / 4) * carbMultiplier);
  const fat = Math.round((finalCalories * 0.35) / 9);

  // Calcul sommeil
  let sleepHours = 8;
  if (user.sport?.includes('american_football') || user.sport?.includes('rugby')) {
    sleepHours = 9;
  } else if (user.sport?.includes('endurance') || user.sport === 'running') {
    sleepHours = 8.5;
  }

  if (user.age && user.age > 45) sleepHours += 0.5;
  if (user.training_frequency && user.training_frequency > 5) sleepHours += 0.5;

  // Calcul hydratation
  let waterGoal = 2.5;
  if (user.sport?.includes('endurance') || user.sport === 'running') waterGoal = 3.0;
  if (user.sport?.includes('american_football') || user.sport === 'rugby') waterGoal = 3.5;

  return {
    calories: finalCalories,
    protein,
    carbs,
    fat,
    sleep: sleepHours,
    water: waterGoal,
    workouts: user.training_frequency || 3,
  };
};

// Utilisateur par défaut
const defaultUser: AppUser = {
  id: '',
  username: '',
  full_name: '',
  email: '',
  phone: null,
  bio: null,
  city: null,
  country: null,
  avatar_url: null,
  first_name: null,
  last_name: null,
  date_of_birth: null,
  gender: null,
  height: null,
  weight: null,
  activity_level: null,
  fitness_goals: null,
  created_at: '',
  updated_at: '',
  daily_calories: null,
  level: 1,
  totalPoints: 0,
  joinDate: '',
  age: null,
  sport: null,
  sport_position: null,
  sport_level: null,
  lifestyle: null,
  training_frequency: null,
  primary_goals: null,
  fitness_experience: null,
};

// Objectifs par défaut
const defaultGoals: DailyGoals = {
  water: 2.5,
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 70,
  sleep: 8,
  workouts: 3,
};

// Création du store
export const appStore = create<ExtendedAppStore>()(
  persist(
    (set, get) => ({
      // États de base
      appStoreUser: defaultUser,
      isLoading: false,
      error: null,

      // États étendus
      dailyGoals: defaultGoals,
      currentStats: null,
      recommendations: [],

      // Données modules
      workouts: [],
      nutritionEntries: [],
      hydrationEntries: [],
      sleepEntries: [],
      analyticsData: [],

      // États UI
      activeModule: null,
      syncStatus: 'idle',
      lastSyncTime: null,

      // Données wearables
      wearableData: null,
      connectedScales: [],
      weightHistory: [],

      // Actions de base
      setAppStoreUser: (user: AppUser | null) => {
        set({ appStoreUser: user || defaultUser, error: null });
      },

      updateUserProfile: (updates: Partial<AppUser>) => {
        const currentUser = get().appStoreUser;
        if (currentUser) {
          set({
            appStoreUser: {
              ...currentUser,
              ...updates,
              updated_at: new Date().toISOString(),
            },
          });
        }
      },

      clearStore: () => {
        set({
          appStoreUser: defaultUser,
          isLoading: false,
          error: null,
          dailyGoals: defaultGoals,
          currentStats: null,
          recommendations: [],
          workouts: [],
          nutritionEntries: [],
          hydrationEntries: [],
          sleepEntries: [],
          analyticsData: [],
          activeModule: null,
          syncStatus: 'idle',
          lastSyncTime: null,
          wearableData: null,
          connectedScales: [],
          weightHistory: [],
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Actions étendues
      updateAppStoreUserProfile: (updates: Partial<AppUser>) => {
        set(state => {
          const updatedUser = { ...state.appStoreUser, ...updates };
          if (!updatedUser.name) {
            updatedUser.name = updatedUser.full_name || updatedUser.username || 'Utilisateur';
          }
          if (!updatedUser.goal && updatedUser.primary_goals?.length) {
            updatedUser.goal = updatedUser.primary_goals[0];
          }
          return { appStoreUser: updatedUser };
        });

        setTimeout(() => {
          get().calculateAndSetDailyGoals();
        }, 100);
      },

      setUser: (user: AppUser) => {
        if (!user.name) {
          user.name = user.full_name || user.username || 'Utilisateur';
        }
        if (!user.goal && user.primary_goals?.length) {
          user.goal = user.primary_goals[0];
        }
        set({ appStoreUser: user });
        get().calculateAndSetDailyGoals();
      },

      clearUser: () => {
        set({ appStoreUser: defaultUser });
      },

      updateDailyGoals: (goals: Partial<DailyGoals>) => {
        set(state => ({
          dailyGoals: { ...state.dailyGoals, ...goals },
        }));
      },

      calculateAndSetDailyGoals: () => {
        const { appStoreUser } = get();
        if (appStoreUser.id) {
          const newGoals = calculatePersonalizedGoals(appStoreUser);
          set({ dailyGoals: newGoals });
          console.log('🎯 Objectifs personnalisés calculés:', newGoals);
        }
      },

      // Actions données
      fetchDailyStats: async (userId: string, date: string): Promise<DailyStats | null> => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('stat_date', date)
            .single();

          if (error && error.code !== 'PGRST116') {
            return null;
          }

          const stats = (data as any) || null;
          set({ currentStats: stats });
          return stats;
        } catch {
      // Erreur silencieuse
          set({ error: 'Erreur lors du chargement des statistiques' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAiRecommendations: async (
        userId: string,
        pillarType: string,
        limit: number = 5
      ): Promise<AiRecommendation[]> => {
        try {
          const { data, error } = await supabase
            .from('ai_recommendations')
            .select('*')
            .eq('user_id', userId)
            .eq('pillar_type', pillarType)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) {
            return [];
          }

          const recommendations = data as AiRecommendation[];
          set({ recommendations });
          return recommendations;
        } catch {
      // Erreur silencieuse
          return [];
        }
      },

      markRecommendationAsRead: async (recommendationId: string): Promise<boolean> => {
        try {
          const { error } = await supabase
            .from('ai_recommendations')
            .update({ is_read: true })
            .eq('id', recommendationId);

          if (error) {
            return false;
          }

          // Mettre à jour le state local
          set(state => ({
            recommendations: state.recommendations.map(rec =>
              rec.id === recommendationId ? { ...rec, is_read: true } : rec
            ),
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      // Actions modules
      addHydration: async (amount: number, type: string = 'water'): Promise<boolean> => {
        try {
          const { appStoreUser } = get();

          const hydrationEntry: Partial<UserHydration> = {
            user_id: appStoreUser.id,
            amount_ml: amount,
            beverage_type: type as UserHydration['beverage_type'],
            logged_at: new Date().toISOString(),
            notes: null,
          };

          const { data, error } = await supabase
            .from('user_hydration')
            .insert(hydrationEntry)
            .select()
            .single();

          if (error) {
            return false;
          }

          // Mettre à jour le state local
          set(state => ({
            hydrationEntries: [...state.hydrationEntries, data as UserHydration],
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      addMeal: async (meal: Partial<UserNutrition>): Promise<boolean> => {
        try {
          const { appStoreUser } = get();

          const mealEntry: Partial<UserNutrition> = {
            user_id: appStoreUser.id,
            meal_type: meal.meal_type || 'snack',
            food_items: meal.food_items || [],
            total_calories: meal.total_calories || 0,
            total_protein: meal.total_protein || 0,
            total_carbs: meal.total_carbs || 0,
            total_fat: meal.total_fat || 0,
            logged_at: new Date().toISOString(),
            notes: meal.notes || null,
          };

          const { data, error } = await supabase
            .from('user_nutrition')
            .insert(mealEntry)
            .select()
            .single();

          if (error) {
            return false;
          }

          // Mettre à jour le state local
          set(state => ({
            nutritionEntries: [...state.nutritionEntries, data as UserNutrition],
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      addSleepSession: async (sleepData: Partial<UserSleep>): Promise<boolean> => {
        try {
          const { appStoreUser } = get();

          const sleepEntry: Partial<UserSleep> = {
            user_id: appStoreUser.id,
            bedtime: sleepData.bedtime || '',
            wake_time: sleepData.wake_time || '',
            duration_hours: sleepData.duration_hours || 0,
            quality_rating: sleepData.quality_rating || 3,
            date: sleepData.date || new Date().toISOString().split('T')[0],
            notes: sleepData.notes || null,
          };

          const { data, error } = await supabase
            .from('user_sleep')
            .insert(sleepEntry)
            .select()
            .single();

          if (error) {
            return false;
          }

          // Mettre à jour le state local
          set(state => ({
            sleepEntries: [...state.sleepEntries, data as UserSleep],
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      addWorkout: async (workout: Partial<UserWorkout>): Promise<boolean> => {
        try {
          const { appStoreUser } = get();

          const workoutEntry: Partial<UserWorkout> = {
            user_id: appStoreUser.id,
            name: workout.name || 'Entraînement',
            description: workout.description || null,
            duration_minutes: workout.duration_minutes || 0,
            calories_burned: workout.calories_burned || null,
            exercises: workout.exercises || [],
            workout_type: workout.workout_type || 'other',
            intensity: workout.intensity || 'moderate',
            notes: workout.notes || null,
            completed_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('user_workouts')
            .insert(workoutEntry)
            .select()
            .single();

          if (error) {
            return false;
          }

          // Mettre à jour le state local
          set(state => ({
            workouts: [...state.workouts, data as UserWorkout],
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      // Gestion modules
      activateModule: async (moduleId: string): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const currentActiveModules = appStoreUser.active_modules || [];

          if (currentActiveModules.includes(moduleId)) {
            console.log(`Module ${moduleId} déjà activé`);
            return true;
          }

          const newActiveModules = [...currentActiveModules, moduleId];

          const { error } = await supabase
            .from('user_profiles')
            .update({
              active_modules: newActiveModules,
              updated_at: new Date().toISOString(),
            })
            .eq('id', appStoreUser.id);

          if (error) {
            return false;
          }

          get().updateAppStoreUserProfile({ active_modules: newActiveModules });
          console.log(`✅ Module ${moduleId} activé avec succès`);
          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      deactivateModule: async (moduleId: string): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const currentActiveModules = appStoreUser.active_modules || [];

          if (!currentActiveModules.includes(moduleId)) {
            console.log(`Module ${moduleId} déjà inactif`);
            return true;
          }

          const newActiveModules = currentActiveModules.filter((module: string) => module !== moduleId);

          const { error } = await supabase
            .from('user_profiles')
            .update({
              active_modules: newActiveModules,
              updated_at: new Date().toISOString(),
            })
            .eq('id', appStoreUser.id);

          if (error) {
            return false;
          }

          get().updateAppStoreUserProfile({ active_modules: newActiveModules });
          console.log(`✅ Module ${moduleId} désactivé avec succès`);
          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      isModuleActive: (moduleId: string): boolean => {
        const { appStoreUser } = get();
        return appStoreUser.active_modules?.includes(moduleId) || false;
      },

      setActiveModule: (moduleId: string | null) => {
        set({ activeModule: moduleId });
      },

      // Actions wearables
      syncWearableData: async (): Promise<WearableData | null> => {
        try {
          set({ syncStatus: 'syncing' });

          // Logique de sync wearable (à implémenter selon tes besoins)
          // Exemple basique
          const mockData: WearableData = {
            steps: 8500,
            caloriesBurned: 320,
            activeMinutes: 45,
            distance: 6.2,
            heartRate: [],
            avgHeartRate: 72,
            maxHeartRate: 145,
            restingHeartRate: 65,
            sleepData: null,
          };

          set({
            wearableData: mockData,
            syncStatus: 'success',
            lastSyncTime: new Date().toISOString(),
          });

          return mockData;
        } catch {
      // Erreur silencieuse
          set({ syncStatus: 'error' });
          return null;
        }
      },

      addConnectedScale: async (scale: Partial<ConnectedScale>): Promise<boolean> => {
        try {
          const { appStoreUser } = get();

          const scaleEntry: Partial<ConnectedScale> = {
            user_id: appStoreUser.id,
            brand: scale.brand || '',
            model: scale.model || '',
            mac_address: scale.mac_address || null,
            is_active: scale.is_active ?? true,
          };

          const { data, error } = await supabase
            .from('connected_scales')
            .insert(scaleEntry)
            .select()
            .single();

          if (error) {
            return false;
          }

          set(state => ({
            connectedScales: [...state.connectedScales, data as ConnectedScale],
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      addWeightEntry: async (entry: Partial<WeightEntry>): Promise<boolean> => {
        try {
          const { appStoreUser } = get();

          const weightEntry: Partial<WeightEntry> = {
            user_id: appStoreUser.id,
            weight: entry.weight || 0,
            body_fat_percentage: entry.body_fat_percentage || null,
            muscle_mass: entry.muscle_mass || null,
            source: entry.source || 'manual',
            recorded_at: entry.recorded_at || new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('weight_entries')
            .insert(weightEntry)
            .select()
            .single();

          if (error) {
            return false;
          }

          set(state => ({
            weightHistory: [...state.weightHistory, data as WeightEntry],
          }));

          return true;
        } catch {
      // Erreur silencieuse
          return false;
        }
      },

      // Actions analytics
      updateUserPoints: (points: number) => {
        set(state => ({
          appStoreUser: {
            ...state.appStoreUser,
            totalPoints: (state.appStoreUser.totalPoints || 0) + points,
          },
        }));
      },

      incrementLevel: () => {
        set(state => ({
          appStoreUser: {
            ...state.appStoreUser,
            level: (state.appStoreUser.level || 1) + 1,
          },
        }));
      },

      calculateProgress: async (date: string): Promise<{ [key: string]: number }> => {
        try {
          const { appStoreUser, dailyGoals } = get();
          const stats = await get().fetchDailyStats(appStoreUser.id, date);

          if (!stats) return {};

          return {
            calories: Math.min((stats.total_calories_consumed / dailyGoals.calories) * 100, 100),
            protein: Math.min((stats.total_protein / dailyGoals.protein) * 100, 100),
            water: Math.min((stats.total_water_ml / (dailyGoals.water * 1000)) * 100, 100),
            sleep: Math.min((stats.sleep_hours / dailyGoals.sleep) * 100, 100),
            workouts: Math.min((stats.workouts_completed / dailyGoals.workouts) * 100, 100),
          };
        } catch {
      // Erreur silencieuse
          return {};
        }
      },

      // Utilitaires
      getTodayProgress: (): { [key: string]: number } => {
        const { currentStats, dailyGoals } = get();

        if (!currentStats) return {};

        return {
          calories: Math.min(
            (currentStats.total_calories_consumed / dailyGoals.calories) * 100,
            100
          ),
          protein: Math.min((currentStats.total_protein / dailyGoals.protein) * 100, 100),
          water: Math.min((currentStats.total_water_ml / (dailyGoals.water * 1000)) * 100, 100),
          sleep: Math.min((currentStats.sleep_hours / dailyGoals.sleep) * 100, 100),
          workouts: Math.min((currentStats.workouts_completed / dailyGoals.workouts) * 100, 100),
        };
      },

      getWeeklyStats: async (): Promise<{ [key: string]: number[] }> => {
        try {
          const { appStoreUser } = get();
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 6);

          const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .gte('stat_date', startDate.toISOString().split('T')[0])
            .lte('stat_date', endDate.toISOString().split('T')[0])
            .order('stat_date', { ascending: true });

          if (error) {
            return {};
          }

          const stats = (data as any) || [];

          return {
            calories: stats.map(s => s.total_calories_consumed),
            protein: stats.map(s => s.total_protein),
            water: stats.map(s => s.total_water_ml),
            sleep: stats.map(s => s.sleep_hours),
            workouts: stats.map(s => s.workouts_completed),
          };
        } catch {
      // Erreur silencieuse
          return {};
        }
      },

      exportUserData: async (): Promise<{
        user: UserProfile;
        workouts: UserWorkout[];
        nutrition: UserNutrition[];
        sleep: UserSleep[];
        hydration: UserHydration[];
        analytics: UserAnalytics;
      }> => {
        try {
          const { appStoreUser } = get();

          // Récupérer toutes les données utilisateur
          const [workouts, nutrition, hydration, sleep, analytics] = await Promise.all([
            supabase.from('user_workouts').select('*').eq('user_id', appStoreUser.id),
            supabase.from('user_nutrition').select('*').eq('user_id', appStoreUser.id),
            supabase.from('user_hydration').select('*').eq('user_id', appStoreUser.id),
            supabase.from('user_sleep').select('*').eq('user_id', appStoreUser.id),
            supabase.from('user_analytics').select('*').eq('user_id', appStoreUser.id),
          ]);

          return {
            user: appStoreUser,
            workouts: workouts.data || [],
            nutrition: nutrition.data || [],
            hydration: hydration.data || [],
            sleep: sleep.data || [],
            analytics: analytics.data?.[0] || {
              id: '',
              user_id: appStoreUser.id,
              date: new Date().toISOString().split('T')[0],
              steps: 0,
              calories_burned: 0,
              active_minutes: 0,
              distance_meters: 0,
              heart_rate_avg: 0,
              heart_rate_max: 0,
              heart_rate_resting: 0,
              weight: appStoreUser.weight || 0,
              body_fat_percentage: 0,
              muscle_mass: 0,
              data_source: 'manual' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as UserAnalytics,
          };
        } catch {
      // Erreur silencieuse
          throw new Error('Failed to export user data');
        }
      },
    }),
    {
      name: 'myfithero-app-store',
      partialize: state => ({
        appStoreUser: state.appStoreUser,
        dailyGoals: state.dailyGoals,
        activeModule: state.activeModule,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
