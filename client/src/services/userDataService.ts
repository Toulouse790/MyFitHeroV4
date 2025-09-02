// client/src/services/userDataService.ts
import { supabase } from '@/lib/supabase';

export interface UserPillarData {
  id: string;
  user_id: string;
  pillar_type: 'workout' | 'nutrition' | 'sleep' | 'hydration';
  date: string;
  value: number;
  unit: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_workouts: number;
  total_nutrition_logs: number;
  total_sleep_hours: number;
  total_hydration_logs: number;
  current_streak: number;
  longest_streak: number;
  badges_earned: number;
  level: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  workout_completed: boolean;
  nutrition_logged: boolean;
  sleep_tracked: boolean;
  hydration_logged: boolean;
  mood_score: number;
  energy_level: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class UserDataService {
  /**
   * Récupère les données d'un pilier pour un utilisateur
   */
  static async getPillarData(
    userId: string,
    pillarType: 'workout' | 'nutrition' | 'sleep' | 'hydration',
    startDate?: string,
    endDate?: string
  ): Promise<UserPillarData[]> {
    try {
      let query = supabase
        .from('user_pillar_data')
        .select('*')
        .eq('user_id', userId)
        .eq('pillar_type', pillarType)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data: _data, error: _error } = await query;

      if (error) {
        console.error('Erreur lors de la récupération des données du pilier:', error);
        return [];
      }

      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des données du pilier:', error);
      return [];
    }
  }

  /**
   * Sauvegarde les données d'un pilier
   */
  static async savePillarData(
    pillarData: Omit<UserPillarData, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_pillar_data').insert([
        {
          ...pillarData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Erreur lors de la sauvegarde des données du pilier:', error);
        return false;
      }

      return true;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la sauvegarde des données du pilier:', error);
      return false;
    }
  }

  /**
   * Met à jour les données d'un pilier
   */
  static async updatePillarData(id: string, updates: Partial<UserPillarData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_pillar_data')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour des données du pilier:', error);
        return false;
      }

      return true;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la mise à jour des données du pilier:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return null;
      }

      return data;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  /**
   * Met à jour les statistiques d'un utilisateur
   */
  static async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_stats').upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
        return false;
      }

      return true;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la mise à jour des statistiques:', error);
      return false;
    }
  }

  /**
   * Récupère le check-in quotidien d'un utilisateur
   */
  static async getDailyCheckin(userId: string, date: string): Promise<DailyCheckin | null> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du check-in:', error);
        return null;
      }

      return data;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération du check-in:', error);
      return null;
    }
  }

  /**
   * Sauvegarde ou met à jour le check-in quotidien
   */
  static async saveOrUpdateDailyCheckin(
    checkinData: Omit<DailyCheckin, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('daily_checkins').upsert({
        ...checkinData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Erreur lors de la sauvegarde du check-in:', error);
        return false;
      }

      return true;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la sauvegarde du check-in:', error);
      return false;
    }
  }

  /**
   * Récupère l'historique des check-ins d'un utilisateur
   */
  static async getCheckinHistory(userId: string, limit: number = 30): Promise<DailyCheckin[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Erreur lors de la récupération de l'historique des check-ins:", error);
        return [];
      }

      return data || [];
    } catch {
      // Erreur silencieuse
      console.error("Erreur lors de la récupération de l'historique des check-ins:", error);
      return [];
    }
  }

  /**
   * Calcule la streak actuelle d'un utilisateur
   */
  static async calculateCurrentStreak(userId: string): Promise<number> {
    try {
      const checkins = await this.getCheckinHistory(userId, 365);

      if (checkins.length === 0) return 0;

      let streak = 0;
      const today = new Date();

      for (let i = 0; i < checkins.length; i++) {
        const checkinDate = new Date(checkins[i].date);
        const dayDiff = Math.floor(
          (today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === i && this.isCheckinComplete(checkins[i])) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors du calcul de la streak:', error);
      return 0;
    }
  }

  /**
   * Vérifie si un check-in est complet
   */
  private static isCheckinComplete(checkin: DailyCheckin): boolean {
    return (
      checkin.workout_completed &&
      checkin.nutrition_logged &&
      checkin.sleep_tracked &&
      checkin.hydration_logged
    );
  }

  /**
   * Récupère les données de progression pour le dashboard
   */
  static async getDashboardData(userId: string): Promise<{
    stats: UserStats | null;
    todayCheckin: DailyCheckin | null;
    weeklyData: UserPillarData[];
    currentStreak: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [stats, todayCheckin, weeklyData, currentStreak] = await Promise.all([
        this.getUserStats(userId),
        this.getDailyCheckin(userId, today),
        this.getPillarData(userId, 'workout', weekAgo), // Exemple avec workout
        this.calculateCurrentStreak(userId),
      ]);

      return {
        stats,
        todayCheckin,
        weeklyData,
        currentStreak,
      };
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des données du dashboard:', error);
      return {
        stats: null,
        todayCheckin: null,
        weeklyData: [],
        currentStreak: 0,
      };
    }
  }
}
