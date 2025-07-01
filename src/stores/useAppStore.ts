import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import type { DailyStats, AiRecommendation, HydrationEntry, Meal, Json, SleepSession, UserProfile as SupabaseDBUserProfileType } from '@/lib/supabase';

interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sleep: number;
  workouts: number;
}

interface SleepSessionInput {
  user_id: string;
  sleep_date: string;
  bedtime?: string;
  wake_time?: string;
  duration_minutes?: number;
  quality_rating?: number;
  mood_rating?: number;
  energy_level?: number;
  factors?: Json;
  notes?: string;
}

interface AppStore {
  user: UserProfile;
  dailyGoals: DailyGoals;
  updateProfile: (userId: string, profile: Partial<SupabaseDBUserProfileType>) => Promise<UserProfile | null>; // Updated signature
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;
  fetchAiRecommendations: (userId: string, pillarType: string, limit?: number) => Promise<AiRecommendation[]>;
  addHydration: (userId: string, amount: number, date: string) => Promise<HydrationEntry | null>;
  removeLastHydration: (userId: string) => Promise<boolean>;
  resetDailyHydration: (userId: string) => Promise<boolean>;
  fetchHydrationEntries: (userId: string, date: string) => Promise<HydrationEntry[]>;
  unlockAchievement: (achievement: string) => void;
  addMeal: (userId: string, mealType: string, foods: Json, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number) => Promise<Meal | null>;
  fetchMeals: (userId: string, date: string) => Promise<Meal[]>;
  addSleepSession: (session: SleepSessionInput) => Promise<SleepSession | null>; // Changed return type to Promise<SleepSession | null>
  fetchSleepSessions: (userId: string, date: string) => Promise<SleepSession[]>;
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

      updateProfile: async (userId: string, profileUpdates: Partial<SupabaseDBUserProfileType>) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .update(profileUpdates)
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const updatedUserState: UserProfile = {
               ...get().user, // Keep existing local fields
               ...data, // Overlay with fresh data from DB
               // Recalculate derived fields if necessary, or rely on the component to do it on load
               name: data.full_name || data.username || 'Non défini',
               goal: data.fitness_goal || 'Non défini',
               joinDate: new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) // created_at from data might be needed
            };
            set({ user: updatedUserState });
            return updatedUserState;
          }
           return null;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil Supabase:', error);
          // Propagate error or return null depending on desired handling
          throw error; // Or return null;
        }
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
          const { data, error } = await supabase
            .from('hydration_logs')
            .insert({
              user_id: userId,
              amount_ml: amount,
              log_date: date
            })
            .select()
            .single();

          if (error) throw error;
          return data as HydrationEntry;
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'hydratation:', error);
          return null;
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
        // TODO: Implement backend logic to track achievements
      },

      addMeal: async (userId: string, mealType: string, foods: Json, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number) => {
        try {
          // Check if a meal of this type already exists for the day and user
          const today = new Date().toISOString().split('T')[0];
          const { data: existingMeal, error: fetchError } = await supabase
            .from('meals')
            .select('id')
            .eq('user_id', userId)
            .eq('meal_type', mealType)
            .eq('meal_date', today)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
            throw fetchError;
          }

          const mealData = {
              user_id: userId,
              meal_type: mealType,
              meal_date: today,
              foods: foods,
              total_calories: totalCalories,
              total_protein: totalProtein,
              total_carbs: totalCarbs,
              total_fat: totalFat
          };

          let result;
          if (existingMeal) {
             // Update existing meal
            const { data, error } = await supabase
              .from('meals')
              .update(mealData)
              .eq('id', existingMeal.id)
              .select()
            .select()
            .single();

            if (error) throw error;
            result = data;
          } else {
            // Insert new meal
            const { data, error } = await supabase
              .from('meals')
              .insert(mealData)
              .select()
              .single();

            if (error) throw error;
            result = data;
          }

          if (error) throw error;
          return result as Meal;
        } catch (error) {
          console.error('Erreur lors de l\'ajout du repas:', error);
          return null;
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

      addSleepSession: async (session: SleepSessionInput) => {
         try {
            // TODO: Check for existing sleep session for the day and UPSET or UPDATE
            const { data, error } = await supabase
                .from('sleep_sessions')
                .insert(session)
                .select()
                .single();

            if (error) throw error;
            console.log('Sleep session added:', data);
            // Optionally update store state with new session
            // set(state => ({ sleepSessions: [...state.sleepSessions, data] }));
            return data as SleepSession; // Assuming SleepSessionInput maps directly to SleepSession Row type
         } catch (error) {
            console.error('Erreur lors de l\'ajout de la session de sommeil:', error);
            throw error; // Propagate error for component to handle
         }
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