// client/src/services/badgeService.ts
import { supabase } from '@/lib/supabase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'nutrition' | 'sleep' | 'hydration' | 'streak' | 'level' | 'special';
  condition_type: 'count' | 'streak' | 'level' | 'special';
  condition_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: number;
  is_notified: boolean;
  created_at: string;
  badge?: Badge;
}

export interface BadgeProgress {
  badge: Badge;
  progress: number;
  isEarned: boolean;
  earnedAt?: string;
}

export class BadgeService {
  /**
   * Récupère tous les badges disponibles
   */
  static async getAllBadges(): Promise<Badge[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des badges:', error);
        return [];
      }

      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des badges:', error);
      return [];
    }
  }

  /**
   * Récupère les badges d'un utilisateur
   */
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_badges')
        .select(
          `
          *,
          badge:badges(*)
        `
        )
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des badges utilisateur:', error);
        return [];
      }

      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des badges utilisateur:', error);
      return [];
    }
  }

  /**
   * Récupère les progrès des badges pour un utilisateur
   */
  static async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    try {
      const [allBadges, userBadges] = await Promise.all([
        this.getAllBadges(),
        this.getUserBadges(userId),
      ]);

      const userBadgeMap = new Map(userBadges.map(ub => [ub.badge_id, ub]));

      const progress: BadgeProgress[] = allBadges.map(badge => {
        const userBadge = userBadgeMap.get(badge.id);

        return {
          badge,
          progress: userBadge?.progress || 0,
          isEarned: !!userBadge,
          earnedAt: userBadge?.earned_at,
        };
      });

      return progress;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des progrès des badges:', error);
      return [];
    }
  }

  /**
   * Vérifie et attribue les badges mérités
   */
  static async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!userStats) {
        console.error('Statistiques utilisateur non trouvées');
        return [];
      }

      const { data: userCheckins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      const allBadges = await this.getAllBadges();
      const userBadges = await this.getUserBadges(userId);
      const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

      const newBadges: UserBadge[] = [];

      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue;

        const progress = this.calculateBadgeProgress(badge, userStats, userCheckins || []);

        if (progress >= badge.condition_value) {
          // Attribuer le badge
          const { data: newBadge, error } = await supabase
            .from('user_badges')
            .insert([
              {
                user_id: userId,
                badge_id: badge.id,
                earned_at: new Date().toISOString(),
                progress: progress,
                is_notified: false,
                created_at: new Date().toISOString(),
              },
            ])
            .select(
              `
              *,
              badge:badges(*)
            `
            )
            .single();

          if (!error && newBadge) {
            newBadges.push(newBadge);

            // Mettre à jour les points d'expérience
            await this.updateUserExperience(userId, badge.points_reward);
          }
        } else {
          // Mettre à jour le progrès
          await this.updateBadgeProgress(userId, badge.id, progress);
        }
      }

      return newBadges;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la vérification des badges:', error);
      return [];
    }
  }

  /**
   * Calcule le progrès d'un badge
   */
  private static calculateBadgeProgress(badge: Badge, userStats: any, userCheckins: unknown[]): number {
    switch (badge.condition_type) {
      case 'count':
        return this.calculateCountProgress(badge, userStats);
      case 'streak':
        return userStats.current_streak || 0;
      case 'level':
        return userStats.level || 0;
      case 'special':
        return this.calculateSpecialProgress(badge, userStats, userCheckins);
      default:
        return 0;
    }
  }

  /**
   * Calcule le progrès basé sur le nombre
   */
  private static calculateCountProgress(badge: Badge, userStats: any): number {
    switch (badge.category) {
      case 'workout':
        return userStats.total_workouts || 0;
      case 'nutrition':
        return userStats.total_nutrition_logs || 0;
      case 'sleep':
        return Math.floor(userStats.total_sleep_hours || 0);
      case 'hydration':
        return userStats.total_hydration_logs || 0;
      default:
        return 0;
    }
  }

  /**
   * Calcule le progrès spécial
   */
  private static calculateSpecialProgress(
    badge: Badge,
    userStats: any,
    userCheckins: unknown[]
  ): number {
    // Logique spécifique pour chaque badge spécial
    switch (badge.name) {
      case 'Perfectionniste':
        // Compter les check-ins parfaits (tous les piliers complétés)
        return userCheckins.filter(
          checkin =>
            checkin.workout_completed &&
            checkin.nutrition_logged &&
            checkin.sleep_tracked &&
            checkin.hydration_logged
        ).length;
      case 'Lève-tôt':
        // Compter les check-ins avec un bon score de sommeil
        return userCheckins.filter(checkin => checkin.sleep_tracked && checkin.energy_level >= 8)
          .length;
      case 'Warrior':
        // Compter les workouts intenses
        return userStats.total_workouts || 0;
      default:
        return 0;
    }
  }

  /**
   * Met à jour le progrès d'un badge pour un utilisateur
   */
  private static async updateBadgeProgress(
    userId: string,
    badgeId: string,
    progress: number
  ): Promise<void> {
    try {
      await supabase.from('user_badges').upsert({
        user_id: userId,
        badge_id: badgeId,
        progress: progress,
        is_notified: false,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la mise à jour du progrès du badge:', error);
    }
  }

  /**
   * Met à jour l'expérience d'un utilisateur
   */
  private static async updateUserExperience(userId: string, points: number): Promise<void> {
    try {
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('experience_points, level')
        .eq('user_id', userId)
        .single();

      if (!userStats) return;

      const newExperience = (userStats.experience_points || 0) + points;
      const newLevel = Math.floor(newExperience / 1000) + 1;

      await supabase
        .from('user_stats')
        .update({
          experience_points: newExperience,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch {
      // Erreur silencieuse
      console.error("Erreur lors de la mise à jour de l'expérience:", error);
    }
  }

  /**
   * Marque les notifications de badges comme lues
   */
  static async markBadgeNotificationsAsRead(userId: string, badgeIds: string[]): Promise<void> {
    try {
      await supabase
        .from('user_badges')
        .update({ is_notified: true })
        .eq('user_id', userId)
        .in('badge_id', badgeIds);
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  }

  /**
   * Récupère les badges récemment gagnés non notifiés
   */
  static async getUnnotifiedBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('user_badges')
        .select(
          `
          *,
          badge:badges(*)
        `
        )
        .eq('user_id', userId)
        .eq('is_notified', false)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des badges non notifiés:', error);
        return [];
      }

      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des badges non notifiés:', error);
      return [];
    }
  }

  /**
   * Récupère les badges par catégorie
   */
  static async getBadgesByCategory(category: string): Promise<Badge[]> {
    try {
      const { data: _data, error: _error } = await supabase
        .from('badges')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('condition_value', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des badges par catégorie:', error);
        return [];
      }

      return data || [];
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des badges par catégorie:', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques des badges pour un utilisateur
   */
  static async getBadgeStats(userId: string): Promise<{
    totalBadges: number;
    earnedBadges: number;
    commonBadges: number;
    rareBadges: number;
    epicBadges: number;
    legendaryBadges: number;
    totalPoints: number;
  }> {
    try {
      const [allBadges, userBadges] = await Promise.all([
        this.getAllBadges(),
        this.getUserBadges(userId),
      ]);

      const earnedBadges = userBadges.filter(ub => ub.badge);
      const totalPoints = earnedBadges.reduce((sum, ub) => sum + (ub.badge?.points_reward || 0), 0);

      const rarityCount = earnedBadges.reduce(
        (acc, ub) => {
          const rarity = ub.badge?.rarity || 'common';
          acc[rarity] = (acc[rarity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalBadges: allBadges.length,
        earnedBadges: earnedBadges.length,
        commonBadges: rarityCount.common || 0,
        rareBadges: rarityCount.rare || 0,
        epicBadges: rarityCount.epic || 0,
        legendaryBadges: rarityCount.legendary || 0,
        totalPoints,
      };
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la récupération des statistiques des badges:', error);
      return {
        totalBadges: 0,
        earnedBadges: 0,
        commonBadges: 0,
        rareBadges: 0,
        epicBadges: 0,
        legendaryBadges: 0,
        totalPoints: 0,
      };
    }
  }
}
