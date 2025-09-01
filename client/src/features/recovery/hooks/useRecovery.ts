import { useState, useEffect, useCallback } from 'react';
import { RecoveryService } from '../services/recovery.service';
import type {
  RecoveryData,
  RecoveryMetrics,
  RecoveryRecommendation,
  RecoveryActivity,
} from '../types/index';

type RecoveryActivityInput = {
  type:
    | 'massage'
    | 'stretching'
    | 'meditation'
    | 'cold_therapy'
    | 'heat_therapy'
    | 'sleep'
    | 'rest';
  duration: number;
  intensity?: number;
  notes?: string;
};

export interface UseRecoveryReturn {
  // État
  recoveryData: RecoveryData | null;
  metrics: RecoveryMetrics | null;
  recommendations: RecoveryRecommendation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  updateRecoveryMetrics: (metrics: Partial<RecoveryMetrics>) => Promise<void>;
  addRecoveryActivity: (activity: RecoveryActivityInput) => Promise<void>;
  refreshData: () => Promise<void>;

  // Calculateurs
  calculateOverallScore: () => number;
  getRecoveryTrend: () => 'improving' | 'stable' | 'declining';
}

export const useRecovery = (userId?: string): UseRecoveryReturn => {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [metrics, setMetrics] = useState<RecoveryMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<RecoveryRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de récupération
  const loadRecoveryData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [data, metricsData, recs] = await Promise.all([
        RecoveryService.getRecoveryStatus(userId),
        RecoveryService.getRecoveryMetrics(userId),
        RecoveryService.getRecoveryRecommendations(userId),
      ]);

      setRecoveryData(data);
      setMetrics(metricsData);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mettre à jour les métriques
  const updateRecoveryMetrics = useCallback(
    async (newMetrics: Partial<RecoveryMetrics>) => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const updated = await RecoveryService.updateRecoveryMetrics(userId, newMetrics);
        setMetrics(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Ajouter une activité de récupération
  const addRecoveryActivity = useCallback(
    async (activity: { type: string; duration: number; intensity?: number; notes?: string }) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const fullActivity: RecoveryActivity = {
          userId,
          timestamp: new Date().toISOString(),
          type: activity.type as
            | 'massage'
            | 'stretching'
            | 'meditation'
            | 'cold_therapy'
            | 'heat_therapy'
            | 'sleep'
            | 'rest',
          duration: activity.duration,
          ...(activity.intensity !== undefined && { intensity: activity.intensity }),
          ...(activity.notes !== undefined && { notes: activity.notes }),
        };

        await RecoveryService.logRecoveryActivity(userId, fullActivity);
        await loadRecoveryData(); // Recharger les données
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, loadRecoveryData]
  );

  // Calculer le score global de récupération
  const calculateOverallScore = useCallback((): number => {
    if (!metrics) return 0;

    const {
      sleepQuality = 0,
      restingHeartRate = 60,
      hrVariability = 30,
      stressLevel = 5,
      muscleStiffness = 5,
      energyLevel = 5,
    } = metrics;

    // Normalisation des scores (0-100)
    const sleepScore = sleepQuality * 10; // 0-10 -> 0-100
    const hrScore = Math.max(0, 100 - Math.abs(restingHeartRate - 60) * 2); // Optimal autour de 60
    const hrvScore = Math.min(100, hrVariability * 2); // Plus c'est haut, mieux c'est
    const stressScore = Math.max(0, 100 - stressLevel * 10); // 0-10 inversé
    const stiffnessScore = Math.max(0, 100 - muscleStiffness * 10); // 0-10 inversé
    const energyScore = energyLevel * 10; // 0-10 -> 0-100

    return Math.round(
      sleepScore * 0.25 +
        hrScore * 0.2 +
        hrvScore * 0.2 +
        stressScore * 0.15 +
        stiffnessScore * 0.1 +
        energyScore * 0.1
    );
  }, [metrics]);

  // Déterminer la tendance de récupération
  const getRecoveryTrend = useCallback((): 'improving' | 'stable' | 'declining' => {
    if (!recoveryData?.history || recoveryData.history.length < 2) return 'stable';

    const recent = recoveryData.history.slice(-3);
    const scores = recent.map(r => r.overallScore);

    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];

    if (firstScore === undefined || lastScore === undefined) return 'stable';

    const trend = lastScore - firstScore;

    if (trend > 5) return 'improving';
    if (trend < -5) return 'declining';
    return 'stable';
  }, [recoveryData]);

  // Rafraîchir les données
  const refreshData = useCallback(async () => {
    await loadRecoveryData();
  }, [loadRecoveryData]);

  // Charger les données au montage
  useEffect(() => {
    if (userId) {
      loadRecoveryData();
    }
  }, [userId, loadRecoveryData]);

  return {
    // État
    recoveryData,
    metrics,
    recommendations,
    isLoading,
    error,

    // Actions
    updateRecoveryMetrics,
    addRecoveryActivity,
    refreshData,

    // Calculateurs
    calculateOverallScore,
    getRecoveryTrend,
  };
};
