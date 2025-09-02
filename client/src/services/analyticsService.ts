import { supabase } from '@/lib/supabase';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour les analytics
export interface AnalyticsData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
    pillar: string;
  }>;
}

export interface PillarProgress {
  pillar: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  last_7_days: number[];
  color: string;
  icon: string;
}

export interface PerformanceMetrics {
  consistency_score: number;
  improvement_rate: number;
  streak_days: number;
  total_activities: number;
  weekly_average: number;
  best_day: string;
  challenges_completed: number;
  level_progress: number;
}

export interface ComparisonData {
  current_period: {
    label: string;
    hydration: number;
    nutrition: number;
    sleep: number;
    workout: number;
  };
  previous_period: {
    label: string;
    hydration: number;
    nutrition: number;
    sleep: number;
    workout: number;
  };
  improvement: {
    hydration: number;
    nutrition: number;
    sleep: number;
    workout: number;
  };
}

export interface DetailedInsight {
  type: 'achievement' | 'improvement' | 'warning' | 'suggestion';
  pillar: string;
  title: string;
  description: string;
  value?: number;
  target?: number;
  action_needed?: boolean;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

class AnalyticsService {
  // Récupération des données multi-piliers sur une période
  async getMultiPillarData(
    userId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<AnalyticsData> {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = subDays(new Date(), days);

    try {
      // Récupération parallèle des données de tous les piliers
      const [hydrationData, nutritionData, sleepData, workoutData] = await Promise.all([
        this.getHydrationData(userId, startDate),
        this.getNutritionData(userId, startDate),
        this.getSleepData(userId, startDate),
        this.getWorkoutData(userId, startDate),
      ]);

      // Génération des labels de dates
      const labels = Array.from({ length: days }, (_, i) => {
        return format(subDays(new Date(), days - 1 - i), 'dd/MM', { locale: fr });
      });

      return {
        labels,
        datasets: [
          {
            label: 'Hydratation',
            data: hydrationData,
            color: '#06b6d4',
            pillar: 'hydration',
          },
          {
            label: 'Nutrition',
            data: nutritionData,
            color: '#10b981',
            pillar: 'nutrition',
          },
          {
            label: 'Sommeil',
            data: sleepData,
            color: '#8b5cf6',
            pillar: 'sleep',
          },
          {
            label: 'Entraînement',
            data: workoutData,
            color: '#ef4444',
            pillar: 'workout',
          },
        ],
      };
    } catch {
      // Erreur silencieuse
      console.error('Error fetching multi-pillar data:', error);
      throw error;
    }
  }

  // Analyse des progrès par pilier avec tendances
  async getPillarProgress(userId: string): Promise<PillarProgress[]> {
    try {
      const pillars = ['hydration', 'nutrition', 'sleep', 'workout'];
      const progressData: PillarProgress[] = [];

      for (const pillar of pillars) {
        const data = await this.getPillarAnalytics(userId, pillar);
        progressData.push(data);
      }

      return progressData.sort((a, b) => b.progress_percentage - a.progress_percentage);
    } catch {
      // Erreur silencieuse
      console.error('Error fetching pillar progress:', error);
      throw error;
    }
  }

  // Métriques de performance globales
  async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    try {
      const [consistency, activities, streaks] = await Promise.all([
        this.calculateConsistencyScore(userId),
        this.getTotalActivities(userId),
        this.getStreakData(userId),
      ]);

      return {
        consistency_score: consistency.score,
        improvement_rate: consistency.improvement_rate,
        streak_days: streaks.current_streak,
        total_activities: activities.total,
        weekly_average: activities.weekly_average,
        best_day: streaks.best_day,
        challenges_completed: activities.challenges,
        level_progress: consistency.level_progress,
      };
    } catch {
      // Erreur silencieuse
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  // Comparaison entre périodes
  async getComparisonData(
    userId: string,
    currentPeriod: 'week' | 'month' = 'week'
  ): Promise<ComparisonData> {
    try {
      const now = new Date();
      let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

      if (currentPeriod === 'week') {
        currentStart = startOfWeek(now, { locale: fr });
        currentEnd = endOfWeek(now, { locale: fr });
        previousStart = startOfWeek(subDays(now, 7), { locale: fr });
        previousEnd = endOfWeek(subDays(now, 7), { locale: fr });
      } else {
        currentStart = startOfMonth(now);
        currentEnd = endOfMonth(now);
        previousStart = startOfMonth(subDays(now, 30));
        previousEnd = endOfMonth(subDays(now, 30));
      }

      const [currentData, previousData] = await Promise.all([
        this.getPeriodAverages(userId, currentStart, currentEnd),
        this.getPeriodAverages(userId, previousStart, previousEnd),
      ]);

      const improvement = {
        hydration:
          ((currentData.hydration - previousData.hydration) / previousData.hydration) * 100,
        nutrition:
          ((currentData.nutrition - previousData.nutrition) / previousData.nutrition) * 100,
        sleep: ((currentData.sleep - previousData.sleep) / previousData.sleep) * 100,
        workout: ((currentData.workout - previousData.workout) / previousData.workout) * 100,
      };

      return {
        current_period: {
          label: currentPeriod === 'week' ? 'Cette semaine' : 'Ce mois',
          ...currentData,
        },
        previous_period: {
          label: currentPeriod === 'week' ? 'Semaine dernière' : 'Mois dernier',
          ...previousData,
        },
        improvement,
      };
    } catch {
      // Erreur silencieuse
      console.error('Error fetching comparison data:', error);
      throw error;
    }
  }

  // Insights détaillés avec recommandations
  async getDetailedInsights(userId: string): Promise<DetailedInsight[]> {
    try {
      const [progress, metrics, comparison] = await Promise.all([
        this.getPillarProgress(userId),
        this.getPerformanceMetrics(userId),
        this.getComparisonData(userId),
      ]);

      const insights: DetailedInsight[] = [];

      // Analyse des progrès par pilier
      progress.forEach(pillar => {
        if (pillar.progress_percentage >= 90) {
          insights.push({
            type: 'achievement',
            pillar: pillar.pillar,
            title: `Excellent progrès en ${pillar.pillar}`,
            description: `Vous avez atteint ${pillar.progress_percentage}% de vos objectifs !`,
            value: pillar.current_value,
            target: pillar.target_value,
            priority: 'low',
            icon: '🏆',
            color: '#10b981',
            action_needed: false,
          });
        } else if (pillar.progress_percentage < 50) {
          insights.push({
            type: 'warning',
            pillar: pillar.pillar,
            title: `Attention au ${pillar.pillar}`,
            description: `Seulement ${pillar.progress_percentage}% d'objectifs atteints cette semaine.`,
            value: pillar.current_value,
            target: pillar.target_value,
            priority: 'high',
            icon: '⚠️',
            color: '#ef4444',
            action_needed: true,
          });
        }
      });

      // Analyse de la consistance
      if (metrics.consistency_score > 80) {
        insights.push({
          type: 'achievement',
          pillar: 'general',
          title: 'Consistance exceptionnelle',
          description: `Score de consistance de ${metrics.consistency_score}% - continuez !`,
          priority: 'low',
          icon: '🔥',
          color: '#f59e0b',
          action_needed: false,
        });
      }

      // Analyse des améliorations
      Object.entries(comparison.improvement).forEach(([pillar, improvement]) => {
        if (improvement > 20) {
          insights.push({
            type: 'improvement',
            pillar,
            title: `Super amélioration en ${pillar}`,
            description: `+${improvement.toFixed(1)}% par rapport à la semaine dernière`,
            priority: 'medium',
            icon: '📈',
            color: '#06b6d4',
            action_needed: false,
          });
        }
      });

      // Suggestions basées sur les données
      if (metrics.streak_days < 3) {
        insights.push({
          type: 'suggestion',
          pillar: 'general',
          title: 'Construisez votre streak',
          description:
            'Maintenez vos habitudes 3 jours de suite pour créer une dynamique positive.',
          priority: 'medium',
          icon: '🎯',
          color: '#8b5cf6',
          action_needed: true,
        });
      }

      return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch {
      // Erreur silencieuse
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  // Helpers privés pour récupérer les données spécifiques

  private async getHydrationData(userId: string, startDate: Date): Promise<number[]> {
    const { data } = await supabase
      .from('hydration_logs')
      .select('amount_ml, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    return this.aggregateDataByDay(data || [], 'amount_ml');
  }

  private async getNutritionData(userId: string, startDate: Date): Promise<number[]> {
    const { data } = await supabase
      .from('nutrition_logs')
      .select('calories, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    return this.aggregateDataByDay(data || [], 'calories', 100); // Normalisation par 100 calories
  }

  private async getSleepData(userId: string, startDate: Date): Promise<number[]> {
    const { data } = await supabase
      .from('sleep_logs')
      .select('duration_hours, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    return this.aggregateDataByDay(data || [], 'duration_hours');
  }

  private async getWorkoutData(userId: string, startDate: Date): Promise<number[]> {
    const { data } = await supabase
      .from('workout_logs')
      .select('duration_minutes, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    return this.aggregateDataByDay(data || [], 'duration_minutes', 10); // Normalisation par 10 minutes
  }

  private aggregateDataByDay(data: unknown[], field: string, divisor: number = 1): number[] {
    const dailyData: { [key: string]: number } = {};

    data.forEach(item => {
      const day = format(new Date(item.created_at), 'yyyy-MM-dd');
      dailyData[day] = (dailyData[day] || 0) + item[field] / divisor;
    });

    // Remplir les jours manquants avec 0
    const result: number[] = [];
    const days = Math.max(Object.keys(dailyData).length, 7);

    for (let i = days - 1; i >= 0; i--) {
      const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
      result.push(Math.round(dailyData[day] || 0));
    }

    return result;
  }

  private async getPillarAnalytics(userId: string, pillar: string): Promise<PillarProgress> {
    // Simulation des données - À remplacer par de vraies requêtes
    const mockData: { [key: string]: PillarProgress } = {
      hydration: {
        pillar: 'Hydratation',
        current_value: 2.1,
        target_value: 2.5,
        progress_percentage: 84,
        trend: 'up',
        trend_percentage: 12,
        last_7_days: [1.8, 2.0, 2.3, 2.1, 2.4, 2.2, 2.1],
        color: '#06b6d4',
        icon: '💧',
      },
      nutrition: {
        pillar: 'Nutrition',
        current_value: 1850,
        target_value: 2000,
        progress_percentage: 92,
        trend: 'stable',
        trend_percentage: 2,
        last_7_days: [1800, 1900, 1850, 1950, 1880, 1870, 1850],
        color: '#10b981',
        icon: '🍎',
      },
      sleep: {
        pillar: 'Sommeil',
        current_value: 7.2,
        target_value: 8.0,
        progress_percentage: 90,
        trend: 'up',
        trend_percentage: 8,
        last_7_days: [7.0, 7.5, 6.8, 7.2, 7.8, 7.1, 7.2],
        color: '#8b5cf6',
        icon: '😴',
      },
      workout: {
        pillar: 'Entraînement',
        current_value: 45,
        target_value: 60,
        progress_percentage: 75,
        trend: 'down',
        trend_percentage: -5,
        last_7_days: [60, 45, 30, 50, 40, 35, 45],
        color: '#ef4444',
        icon: '💪',
      },
    };

    return mockData[pillar] || mockData.hydration;
  }

  private async calculateConsistencyScore(userId: string): Promise<{
    score: number;
    improvement_rate: number;
    level_progress: number;
  }> {
    // Simulation - À remplacer par de vrais calculs
    return {
      score: 78,
      improvement_rate: 15,
      level_progress: 65,
    };
  }

  private async getTotalActivities(userId: string): Promise<{
    total: number;
    weekly_average: number;
    challenges: number;
  }> {
    // Simulation - À remplacer par de vraies requêtes
    return {
      total: 156,
      weekly_average: 22,
      challenges: 8,
    };
  }

  private async getStreakData(userId: string): Promise<{
    current_streak: number;
    best_day: string;
  }> {
    // Simulation - À remplacer par de vrais calculs
    return {
      current_streak: 12,
      best_day: 'Mercredi',
    };
  }

  private async getPeriodAverages(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    hydration: number;
    nutrition: number;
    sleep: number;
    workout: number;
  }> {
    // Simulation - À remplacer par de vraies requêtes
    return {
      hydration: 2.1,
      nutrition: 1850,
      sleep: 7.2,
      workout: 45,
    };
  }
}

export const analyticsService = new AnalyticsService();
