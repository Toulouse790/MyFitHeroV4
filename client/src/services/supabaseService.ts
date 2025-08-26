// services/supabaseService.ts
import { supabase } from '../config/supabaseClient';
import type {
  UserProfile, UserProfileInsert, UserProfileUpdate,
  DailyStats, DailyStatsInsert, DailyStatsUpdate,
  Workout, WorkoutInsert, WorkoutUpdate,
  Meal, MealInsert,
  SleepSession, SleepSessionInsert,
  HydrationLog, HydrationLogInsert,
  AiRecommendation, UserGoal, UserNotification,
  UserRecoveryProfile, MuscleRecoveryData
} from '../types/database';

// ===== USER PROFILES =====
export class UserProfileService {
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(updates: UserProfileUpdate): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async createUserProfile(profile: UserProfileInsert): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .insert({ ...profile, id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }
}

// ===== DAILY STATS =====
export class DailyStatsService {
  static async getTodayStats(): Promise<DailyStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('stat_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data || null;
    } catch (error) {
      console.error('Error fetching today stats:', error);
      return null;
    }
  }

  static async getStatsForDateRange(startDate: string, endDate: string): Promise<DailyStats[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('stat_date', startDate)
        .lte('stat_date', endDate)
        .order('stat_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stats for date range:', error);
      return [];
    }
  }

  static async upsertDailyStats(stats: DailyStatsInsert): Promise<DailyStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('daily_stats')
        .upsert(
          { 
            ...stats, 
            user_id: user.id,
            updated_at: new Date().toISOString() 
          },
          { 
            onConflict: 'user_id,stat_date',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting daily stats:', error);
      throw error;
    }
  }

  static async incrementWorkoutStats(date: string, minutes: number, calories: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Utiliser une fonction RPC pour l'incrémentation atomique
      const { error } = await (supabase as any).rpc('increment_workout_stats', {
        p_user_id: user.id,
        p_date: date,
        p_minutes: minutes,
        p_calories: calories
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing workout stats:', error);
      throw error;
    }
  }
}

// ===== WORKOUTS =====
export class WorkoutService {
  static async getUserWorkouts(limit: number = 20): Promise<Workout[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  }

  static async createWorkout(workout: WorkoutInsert): Promise<Workout | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('workouts')
        .insert({ ...workout, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  }

  static async updateWorkout(id: string, updates: WorkoutUpdate): Promise<Workout | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  }

  static async completeWorkout(id: string): Promise<Workout | null> {
    try {
      return await this.updateWorkout(id, {
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }
}

// ===== MEALS =====
export class MealService {
  static async getTodayMeals(): Promise<Meal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_date', today)
        .order('meal_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today meals:', error);
      return [];
    }
  }

  static async createMeal(meal: MealInsert): Promise<Meal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('meals')
        .insert({ ...meal, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error;
    }
  }

  static async getMealsByDateRange(startDate: string, endDate: string): Promise<Meal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)
        .order('meal_date', { ascending: false })
        .order('meal_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meals by date range:', error);
      return [];
    }
  }
}

// ===== SLEEP SESSIONS =====
export class SleepService {
  static async getRecentSleepSessions(days: number = 7): Promise<SleepSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('sleep_date', startDate.toISOString().split('T')[0])
        .order('sleep_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sleep sessions:', error);
      return [];
    }
  }

  static async createSleepSession(session: SleepSessionInsert): Promise<SleepSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('sleep_sessions')
        .insert({ ...session, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating sleep session:', error);
      throw error;
    }
  }

  static async getLastNightSleep(): Promise<SleepSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('sleep_date', yesterdayStr)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching last night sleep:', error);
      return null;
    }
  }
}

// ===== HYDRATION =====
export class HydrationService {
  static async getTodayHydration(): Promise<HydrationLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('hydration_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .order('logged_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today hydration:', error);
      return [];
    }
  }

  static async logHydration(log: HydrationLogInsert): Promise<HydrationLog | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('hydration_logs')
        .insert({ 
          ...log, 
          user_id: user.id,
          logged_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging hydration:', error);
      throw error;
    }
  }

  static async getTodayHydrationTotal(): Promise<number> {
    try {
      const logs = await this.getTodayHydration();
      return logs.reduce((total, log) => total + log.amount_ml, 0);
    } catch (error) {
      console.error('Error calculating hydration total:', error);
      return 0;
    }
  }
}

// ===== AI RECOMMENDATIONS =====
export class AiRecommendationService {
  static async getActiveRecommendations(): Promise<AiRecommendation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_applied', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      return [];
    }
  }

  static async markRecommendationAsApplied(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await (supabase as any)
        .from('ai_recommendations')
        .update({
          is_applied: true,
          applied_at: new Date().toISOString(),
          applied_by: 'user'
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking recommendation as applied:', error);
      throw error;
    }
  }
}

// ===== USER GOALS =====
export class UserGoalService {
  static async getActiveGoals(): Promise<UserGoal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active goals:', error);
      return [];
    }
  }

  static async updateGoalProgress(id: string, newValue: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Récupérer le goal actuel pour l'historique
      const { data: currentGoal, error: fetchError } = await supabase
        .from('user_goals')
        .select('progress_history, current_value')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentGoal) throw new Error('Goal not found');

      const currentGoalData = currentGoal as any;
      const progressHistory = Array.isArray(currentGoalData.progress_history) 
        ? currentGoalData.progress_history 
        : [];

      // Ajouter l'entrée à l'historique
      progressHistory.push({
        date: new Date().toISOString(),
        value: newValue,
        previous_value: currentGoalData.current_value
      });

      const { error } = await (supabase as any)
        .from('user_goals')
        .update({
          current_value: newValue,
          progress_history: progressHistory
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }
}

// ===== NOTIFICATIONS =====
export class NotificationService {
  static async getUnreadNotifications(): Promise<UserNotification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }
}

// ===== MUSCLE RECOVERY =====
export class MuscleRecoveryDBService {
  static async getUserRecoveryProfile(userId: string): Promise<UserRecoveryProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_recovery_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching user recovery profile:', error);
      return null;
    }
  }

  static async createOrUpdateRecoveryProfile(profile: any): Promise<UserRecoveryProfile | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_recovery_profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating/updating recovery profile:', error);
      return null;
    }
  }

  static async getMuscleRecoveryData(userId: string): Promise<MuscleRecoveryData[]> {
    try {
      const { data, error } = await supabase
        .from('muscle_recovery_data')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching muscle recovery data:', error);
      return [];
    }
  }

  static async saveMuscleRecoveryData(userId: string, recoveryData: any[]): Promise<boolean> {
    try {
      // Supprimer les anciennes données
      await supabase
        .from('muscle_recovery_data')
        .delete()
        .eq('user_id', userId);

      // Insérer les nouvelles données
      const dataToInsert = recoveryData.map(data => ({
        user_id: userId,
        ...data
      }));

      const { error } = await (supabase as any)
        .from('muscle_recovery_data')
        .insert(dataToInsert);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving muscle recovery data:', error);
      return false;
    }
  }
}
