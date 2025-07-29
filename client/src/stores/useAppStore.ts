import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { DailyStats, AiRecommendation } from '@/lib/supabase';

// --- TYPES & INTERFACES ---

export interface AppUser {
  id: string;
  username?: string | null;
  full_name?: string | null;
  email?: string;
  avatar_url?: string | null;
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
  daily_calories?: number | null;
  active_modules?: string[];
  modules?: string[];
  level?: number;
  totalPoints?: number;
  joinDate?: string;
  profile_type?: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus';
  sport_specific_stats?: Record<string, number>;
  injuries?: string[];
  motivation?: string;
  fitness_goal?: string;
  weight_kg?: number | null;
  height_cm?: number | null;
  phone?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  name?: string;
  goal?: string;
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

// --- HELPER : CALCUL DES OBJECTIFS PERSONNALISÉS ---
const calculatePersonalizedGoals = (user: AppUser): DailyGoals => {
  let baseCalories = user.daily_calories || 2000;
  if (!user.daily_calories && user.age && user.gender && user.weight_kg && user.height_cm) {
    const weight = user.weight_kg;
    const height = user.height_cm;
    const bmr = user.gender === 'male'
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * user.age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * user.age);
    const activityFactors: Record<string, number> = {
      'student': 1.4,
      'office_worker': 1.3,
      'physical_job': 1.6,
      'retired': 1.2
    };
    const activityFactor = activityFactors[user.lifestyle || ''] || 1.4;
    baseCalories = Math.round(bmr * activityFactor);
  } else if (!user.daily_calories && (!user.weight_kg || !user.height_cm)) {
    baseCalories = 1800;
  }
  let calorieAdjustment = 0;
  if (user.primary_goals?.includes('weight_loss')) calorieAdjustment -= 300;
  if (user.primary_goals?.includes('muscle_gain')) calorieAdjustment += 400;
  if (user.primary_goals?.includes('performance')) calorieAdjustment += 200;
  const sportAdjustments: Record<string, number> = {
    'basketball': 250,
    'american_football': 500,
    'football': 200,
    'tennis': 150,
    'running': 400,
    'cycling': 400,
    'swimming': 400,
    'musculation': 300,
    'powerlifting': 300,
    'crossfit': 350
  };
  const sportAdjustment = sportAdjustments[user.sport?.toLowerCase() || ''] || 0;
  const finalCalories = baseCalories + calorieAdjustment + sportAdjustment;
  let proteinMultiplier = 1.2;
  let carbMultiplier = 1.0;
  if (user.sport?.toLowerCase().includes('strength') || user.sport === 'musculation') {
    proteinMultiplier = 1.5;
    carbMultiplier = 1.0;
  } else if (user.sport?.toLowerCase().includes('endurance') || user.sport === 'running') {
    proteinMultiplier = 1.2;
    carbMultiplier = 1.5;
  } else if (user.sport === 'basketball' || user.sport === 'football') {
    proteinMultiplier = 1.2;
    carbMultiplier = 1.3;
  }
  const protein = Math.round((finalCalories * 0.20 / 4) * proteinMultiplier);
  const carbs = Math.round((finalCalories * 0.45 / 4) * carbMultiplier);
  const fat = Math.round((finalCalories * 0.35 / 9));
  let sleepHours = 8;
  if (user.sport?.includes('american_football') || user.sport?.includes('rugby')) {
    sleepHours = 9;
  } else if (user.sport?.includes('endurance') || user.sport === 'running') {
    sleepHours = 8.5;
  }
  if (user.age && user.age > 45) sleepHours += 0.5;
  if (user.training_frequency && user.training_frequency > 5) sleepHours += 0.5;
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
    workouts: user.training_frequency || 3
  };
};

// --- INTERFACE DU STORE ---
interface AppStore {
  appStoreUser: AppUser;
  dailyGoals: DailyGoals;
  isLoading: boolean;
  updateAppStoreUserProfile: (updates: Partial<AppUser>) => void;
  setUser: (user: AppUser) => void;
  clearUser: () => void;
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  calculateAndSetDailyGoals: () => void;
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;
  fetchAiRecommendations: (userId: string, pillarType: string, limit?: number) => Promise<AiRecommendation[]>;
  addHydration: (amount: number, type?: string) => Promise<boolean>;
  addMeal: (meal: any) => Promise<boolean>;
  addSleepSession: (sleepData: any) => Promise<boolean>;
  activateModule: (moduleId: string) => Promise<boolean>;
  deactivateModule: (moduleId: string) => Promise<boolean>;
  isModuleActive: (moduleId: string) => boolean;
}

// --- UTILISATEUR PAR DÉFAUT ---
const defaultUser: AppUser = {
  id: '',
  username: '',
  full_name: '',
  email: '',
  age: null,
  gender: null,
  sport: null,
  sport_position: null,
  sport_level: null,
  lifestyle: null,
  fitness_experience: null,
  primary_goals: [],
  training_frequency: null,
  season_period: null,
  available_time_per_day: null,
  daily_calories: null,
  active_modules: [],
  modules: ['sport', 'nutrition', 'sleep', 'hydration'],
  level: 1,
  totalPoints: 0,
  joinDate: '',
  profile_type: 'complete',
  sport_specific_stats: {},
  injuries: [],
  motivation: '',
  fitness_goal: '',
  name: '',
  goal: ''
};

// --- CRÉATION DU STORE ---
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      appStoreUser: defaultUser,
      dailyGoals: {
        water: 2.5,
        calories: 2000,
        protein: 120,
        carbs: 250,
        fat: 70,
        sleep: 8,
        workouts: 3
      },
      isLoading: false,

      updateAppStoreUserProfile: (updates: Partial<AppUser>) => {
        set(state => {
          const updatedUser = { ...state.appStoreUser, ...updates };
          if (!updatedUser.name) {
            updatedUser.name = updatedUser.full_name || updatedUser.username || 'Utilisateur';
          }
          if (!updatedUser.goal && updatedUser.primary_goals?.length) {
            updatedUser.goal = updatedUser.primary_goals[0];
          }
          return {
            appStoreUser: updatedUser
          };
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
          dailyGoals: { ...state.dailyGoals, ...goals }
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
            console.error('Erreur fetch daily stats:', error);
            return null;
          }
          return data || null;
        } catch (error) {
          console.error('Erreur fetchDailyStats:', error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAiRecommendations: async (userId: string, pillarType: string, limit: number = 5): Promise<AiRecommendation[]> => {
        try {
          const { data, error } = await supabase
            .from('ai_recommendations')
            .select('*')
            .eq('user_id', userId)
            .eq('pillar_type', pillarType)
            .order('created_at', { ascending: false })
            .limit(limit);
          if (error) {
            console.error('Erreur fetch AI recommendations:', error);
            return [];
          }
          return data || [];
        } catch (error) {
          console.error('Erreur fetchAiRecommendations:', error);
          return [];
        }
      },

      addHydration: async (amount: number, type: string = 'water'): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const today = new Date().toISOString().split('T')[0];
          const { error } = await supabase
            .from('hydration_logs')
            .insert({
              user_id: appStoreUser.id,
              amount_ml: amount,
              drink_type: type,
              logged_at: new Date().toISOString(),
              log_date: today
            });
          if (error) {
            console.error('Erreur ajout hydratation:', error);
            return false;
          }
          return true;
        } catch (error) {
          console.error('Erreur addHydration:', error);
          return false;
        }
      },

      addMeal: async (meal: any): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const today = new Date().toISOString().split('T')[0];
          const { error } = await supabase
            .from('meals')
            .insert({
              user_id: appStoreUser.id,
              meal_type: meal.meal_type,
              foods: meal.foods,
              total_calories: meal.calories,
              total_protein: meal.protein || 0,
              total_carbs: meal.carbs || 0,
              total_fat: meal.fat || 0,
              meal_date: today,
              meal_time: new Date().toTimeString().split(' ')[0]
            });
          if (error) {
            console.error('Erreur ajout repas:', error);
            return false;
          }
          return true;
        } catch (error) {
          console.error('Erreur addMeal:', error);
          return false;
        }
      },

      addSleepSession: async (sleepData: any): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const { error } = await supabase
            .from('sleep_sessions')
            .insert({
              user_id: appStoreUser.id,
              sleep_date: sleepData.date || new Date().toISOString().split('T')[0],
              bedtime: sleepData.bedtime,
              wake_time: sleepData.wake_time,
              duration_minutes: sleepData.duration_minutes,
              quality_rating: sleepData.quality_rating || 75,
              notes: sleepData.notes || ''
            });
          if (error) {
            console.error('Erreur ajout sommeil:', error);
            return false;
          }
          return true;
        } catch (error) {
          console.error('Erreur addSleepSession:', error);
          return false;
        }
      },

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
              updated_at: new Date().toISOString()
            })
            .eq('id', appStoreUser.id);
          if (error) {
            console.error('Erreur activation module:', error);
            return false;
          }
          get().updateAppStoreUserProfile({ active_modules: newActiveModules });
          console.log(`✅ Module ${moduleId} activé avec succès`);
          return true;
        } catch (error) {
          console.error('Erreur activateModule:', error);
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
          const newActiveModules = currentActiveModules.filter(module => module !== moduleId);
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              active_modules: newActiveModules,
              updated_at: new Date().toISOString()
            })
            .eq('id', appStoreUser.id);
          if (error) {
            console.error('Erreur désactivation module:', error);
            return false;
          }
          get().updateAppStoreUserProfile({ active_modules: newActiveModules });
          console.log(`✅ Module ${moduleId} désactivé avec succès`);
          return true;
        } catch (error) {
          console.error('Erreur deactivateModule:', error);
          return false;
        }
      },

      isModuleActive: (moduleId: string): boolean => {
        const { appStoreUser } = get();
        return appStoreUser.active_modules?.includes(moduleId) || false;
      }
    }),
    {
      name: 'myfithero-app-store',
      partialize: (state) => ({
        appStoreUser: state.appStoreUser,
        dailyGoals: state.dailyGoals
      })
    }
  )
);
