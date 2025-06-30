
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import type { DailyStats, AiRecommendation } from '@/lib/supabase';

interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sleep: number;
  workouts: number;
}

interface AppStore {
  user: UserProfile;
  dailyGoals: DailyGoals;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;
  fetchAiRecommendations: (userId: string, pillarType: string, limit?: number) => Promise<AiRecommendation[]>;
  addHydration: (userId: string, amount: number, date: string) => Promise<boolean>;
  removeLastHydration: (userId: string) => Promise<boolean>;
  resetDailyHydration: (userId: string) => Promise<boolean>;
  fetchHydrationEntries: (userId: string, date: string) => Promise<any[]>;
  unlockAchievement: (achievement: string) => void;
  addMeal: (userId: string, meal: any, mealType: string, date: string, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number) => Promise<boolean>;
  fetchMeals: (userId: string, date: string) => Promise<any[]>;
  addSleepSession: (session: any) => void;
  fetchSleepSessions: (userId: string, date: string) => Promise<any[]>;
}

const defaultUser: UserProfile = {
  id: '',
  username: null,
  full_name: null,
  avatar_url: null,
  age: null,
  height_cm: null,
  weight_kg: null,
  gender: null,
  activity_level: null,
  fitness_goal: null,
  timezone: null,
  notifications_enabled: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  lifestyle: null,
  available_time_per_day: null,
  fitness_experience: null,
  injuries: null,
  primary_goals: null,
  motivation: null,
  sport: null,
  sport_position: null,
  sport_level: null,
  training_frequency: null,
  season_period: null,
  name: 'Invité',
  email: '',
  goal: 'Non défini',
  level: 1,
  totalPoints: 0,
  joinDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      dailyGoals: {
        water: 2.5,
        calories: 2000,
        protein: 120,
        carbs: 250,
        fat: 70,
        sleep: 8,
        workouts: 1
      },

      updateProfile: (profile) => {
        set(state => ({
          user: { ...state.user, ...profile }
        }));
      },

      updateDailyGoals: (goals) => {
        set(state => ({
          dailyGoals: { ...state.dailyGoals, ...goals }
        }));
      },

      fetchDailyStats: async (userId: string, date: string) => {
        try {
          const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('stat_date', date)
            .maybeSingle();

          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Erreur lors du fetch des stats quotidiennes:', error);
          return null;
        }
      },

      fetchAiRecommendations: async (userId: string, pillarType: string, limit = 5) => {
        try {
          let query = supabase
            .from('ai_recommendations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (pillarType !== 'general') {
            query = query.eq('pillar_type', pillarType);
          }

          if (limit) {
            query = query.limit(limit);
          }

          const { data, error } = await query;

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Erreur lors du fetch des recommandations IA:', error);
          return [];
        }
      },

      addHydration: async (userId: string, amount: number, date: string) => {
        try {
          const { error } = await supabase
            .from('hydration_logs')
            .insert({
              user_id: userId,
              amount_ml: amount,
              log_date: date
            });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'hydratation:', error);
          return false;
        }
      },

      removeLastHydration: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('hydration_logs')
            .select('id')
            .eq('user_id', userId)
            .order('logged_at', { ascending: false })
            .limit(1);

          if (error || !data || data.length === 0) return false;

          const { error: deleteError } = await supabase
            .from('hydration_logs')
            .delete()
            .eq('id', data[0].id);

          if (deleteError) throw deleteError;
          return true;
        } catch (error) {
          console.error('Erreur lors de la suppression d\'hydratation:', error);
          return false;
        }
      },

      resetDailyHydration: async (userId: string) => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { error } = await supabase
            .from('hydration_logs')
            .delete()
            .eq('user_id', userId)
            .eq('log_date', today);

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Erreur lors de la remise à zéro de l\'hydratation:', error);
          return false;
        }
      },

      fetchHydrationEntries: async (userId: string, date: string) => {
        try {
          const { data, error } = await supabase
            .from('hydration_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('log_date', date)
            .order('logged_at', { ascending: false });

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Erreur lors du fetch des entrées d\'hydratation:', error);
          return [];
        }
      },

      unlockAchievement: (achievement: string) => {
        console.log('Unlocking achievement:', achievement);
      },

      addMeal: async (userId: string, meal: any, mealType: string, date: string, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number) => {
        try {
          const { error } = await supabase
            .from('meals')
            .insert({
              user_id: userId,
              meal_type: mealType,
              meal_date: date,
              foods: meal,
              total_calories: totalCalories,
              total_protein: totalProtein,
              total_carbs: totalCarbs,
              total_fat: totalFat
            });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Erreur lors de l\'ajout du repas:', error);
          return false;
        }
      },

      fetchMeals: async (userId: string, date: string) => {
        try {
          const { data, error } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', userId)
            .eq('meal_date', date)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Erreur lors du fetch des repas:', error);
          return [];
        }
      },

      addSleepSession: (session: any) => {
        console.log('Adding sleep session:', session);
      },

      fetchSleepSessions: async (userId: string, date: string) => {
        try {
          const { data, error } = await supabase
            .from('sleep_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('sleep_date', date)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Erreur lors du fetch des sessions de sommeil:', error);
          return [];
        }
      }
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        dailyGoals: state.dailyGoals
      })
    }
  )
);

export type { UserProfile };
