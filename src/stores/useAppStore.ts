import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// --- TYPES & INTERFACES ---

// Interface pour l'utilisateur dans le store (simplifié pour éviter les conflits)
interface AppUser {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | null;
  sport?: string;
  sport_position?: string;
  sport_level?: string;
  lifestyle?: string;
  fitness_experience?: string;
  primary_goals?: string[];
  training_frequency?: number;
  season_period?: string;
  available_time_per_day?: number;
  daily_calories?: number;
  active_modules?: string[];
  modules?: string[];
  level?: number;
  totalPoints?: number;
  joinDate?: string;
  profile_type?: string;
  sport_specific_stats?: Record<string, number>;
}

// Interface pour les objectifs quotidiens
interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sleep: number;
  workouts: number;
}

// Interface pour les stats quotidiennes
interface DailyStats {
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  water_intake_ml?: number;
  hydration_goal_ml?: number;
  sleep_hours?: number;
  workouts_completed?: number;
}

// --- HELPER : CALCUL DES OBJECTIFS PERSONNALISÉS ---
const calculatePersonalizedGoals = (user: AppUser): DailyGoals => {
  // Valeurs par défaut
  let baseCalories = user.daily_calories || 2000;
  
  // Calcul BMR si on a les données
  if (!user.daily_calories && user.age && user.gender) {
    const weight = 70; // Poids moyen par défaut
    const height = user.gender === 'male' ? 175 : 165;
    
    // Formule Mifflin-St Jeor
    const bmr = user.gender === 'male'
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * user.age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * user.age);
    
    // Facteur d'activité selon lifestyle
    const activityFactors: Record<string, number> = {
      'student': 1.4,
      'office_worker': 1.3,
      'physical_job': 1.6,
      'retired': 1.2
    };
    
    const activityFactor = activityFactors[user.lifestyle || ''] || 1.4;
    baseCalories = Math.round(bmr * activityFactor);
  }

  // Ajustements selon les objectifs
  let calorieAdjustment = 0;
  if (user.primary_goals?.includes('weight_loss')) calorieAdjustment -= 300;
  if (user.primary_goals?.includes('muscle_gain')) calorieAdjustment += 400;
  if (user.primary_goals?.includes('performance')) calorieAdjustment += 200;

  // Ajustements selon le sport
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

  // Calcul des macronutriments (ajustés selon le sport)
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

  // Objectif de sommeil selon le sport
  let sleepHours = 8;
  if (user.sport?.includes('american_football') || user.sport?.includes('rugby')) {
    sleepHours = 9;
  } else if (user.sport?.includes('endurance') || user.sport === 'running') {
    sleepHours = 8.5;
  }

  // Ajustements selon l'âge
  if (user.age && user.age > 45) sleepHours += 0.5;
  if (user.training_frequency && user.training_frequency > 5) sleepHours += 0.5;

  return {
    calories: finalCalories,
    protein,
    carbs,
    fat,
    sleep: sleepHours,
    water: 2.5, // Base 2.5L, peut être ajusté selon le poids
    workouts: user.training_frequency || 3
  };
};

// --- INTERFACE DU STORE ---
interface AppStore {
  // État
  appStoreUser: AppUser;
  dailyGoals: DailyGoals;
  
  // Actions pour l'utilisateur
  updateAppStoreUserProfile: (updates: Partial<AppUser>) => void;
  setUser: (user: AppUser) => void;
  
  // Actions pour les objectifs
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  calculateAndSetDailyGoals: () => void;
  
  // Actions pour les données
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;
  addHydration: (amount: number, type?: string) => Promise<boolean>;
  addMeal: (meal: any) => Promise<boolean>;
  addSleepSession: (sleepData: any) => Promise<boolean>;
  
  // Actions pour les modules
  activateModule: (moduleId: string) => Promise<boolean>;
}

// --- UTILISATEUR PAR DÉFAUT ---
const defaultUser: AppUser = {
  id: '',
  name: 'Utilisateur',
  email: '',
  age: 25,
  gender: 'male',
  sport: 'musculation',
  sport_position: '',
  sport_level: 'recreational',
  lifestyle: 'office_worker',
  fitness_experience: 'intermediate',
  primary_goals: ['general_health'],
  training_frequency: 3,
  season_period: 'off_season',
  available_time_per_day: 60,
  daily_calories: 2000,
  active_modules: ['sport'],
  modules: ['sport', 'nutrition', 'sleep', 'hydration'],
  level: 1,
  totalPoints: 0,
  joinDate: 'Nouveau membre',
  profile_type: 'complete',
  sport_specific_stats: {}
};

// --- CRÉATION DU STORE ---
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- ÉTAT INITIAL ---
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

      // --- ACTIONS UTILISATEUR ---
      updateAppStoreUserProfile: (updates: Partial<AppUser>) => {
        set(state => ({
          appStoreUser: { ...state.appStoreUser, ...updates }
        }));
        
        // Recalculer les objectifs après mise à jour
        setTimeout(() => {
          get().calculateAndSetDailyGoals();
        }, 100);
      },

      setUser: (user: AppUser) => {
        set({ appStoreUser: user });
        get().calculateAndSetDailyGoals();
      },

      // --- ACTIONS OBJECTIFS ---
      updateDailyGoals: (goals: Partial<DailyGoals>) => {
        set(state => ({
          dailyGoals: { ...state.dailyGoals, ...goals }
        }));
      },

      calculateAndSetDailyGoals: () => {
        const { appStoreUser } = get();
        const newGoals = calculatePersonalizedGoals(appStoreUser);
        set({ dailyGoals: newGoals });
        console.log('🎯 Objectifs personnalisés calculés:', newGoals);
      },

      // --- ACTIONS DONNÉES ---
      fetchDailyStats: async (userId: string, date: string): Promise<DailyStats | null> => {
        try {
          const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Erreur fetch daily stats:', error);
            return null;
          }

          return data || null;
        } catch (error) {
          console.error('Erreur fetchDailyStats:', error);
          return null;
        }
      },

      addHydration: async (amount: number, type: string = 'water'): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const today = new Date().toISOString().split('T')[0];

          const { error } = await supabase
            .from('hydration_entries')
            .insert({
              user_id: appStoreUser.id,
              amount_ml: amount,
              drink_type: type,
              recorded_at: new Date().toISOString(),
              date: today
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
              food_name: meal.food_name,
              total_calories: meal.calories,
              protein_g: meal.protein || 0,
              carbs_g: meal.carbs || 0,
              fat_g: meal.fat || 0,
              date: today,
              recorded_at: new Date().toISOString()
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
              bedtime: sleepData.bedtime,
              wake_time: sleepData.wake_time,
              duration_hours: sleepData.duration_hours,
              quality_score: sleepData.quality_score || 75,
              date: sleepData.date,
              recorded_at: new Date().toISOString()
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

      // --- ACTION ACTIVATION MODULE ---
      activateModule: async (moduleId: string): Promise<boolean> => {
        try {
          const { appStoreUser } = get();
          const currentActiveModules = appStoreUser.active_modules || [];
          
          if (currentActiveModules.includes(moduleId)) {
            console.log(`Module ${moduleId} déjà activé`);
            return true;
          }

          const newActiveModules = [...currentActiveModules, moduleId];

          // Mise à jour en base
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

          // Mise à jour du store
          get().updateAppStoreUserProfile({ active_modules: newActiveModules });

          console.log(`✅ Module ${moduleId} activé avec succès`);
          return true;
        } catch (error) {
          console.error('Erreur activateModule:', error);
          return false;
        }
      }
    }),
    {
      name: 'myfit-hero-store',
      partialize: (state) => ({
        appStoreUser: state.appStoreUser,
        dailyGoals: state.dailyGoals
      })
    }
  )
);
