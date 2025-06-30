
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import type { DailyStats, AiRecommendation } from '@/lib/supabase';

interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
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
}

const defaultUser: UserProfile = {
  // Champs de la DB
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
  // Champs calculés
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

// Export du type UserProfile pour compatibilité
export type { UserProfile };
