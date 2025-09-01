import { useState, useEffect, useCallback } from 'react';
import { MuscleRecoveryService } from '@/services/muscleRecoveryService';
import {
  supabaseService,
  SupabaseResponse,
  QueryFilter
} from '@/services/supabaseServiceUnified';
import { appStore } from '@/store/appStore';
import type {
  MuscleRecoveryData,
  UserRecoveryProfile,
  RecoveryRecommendation,
  GlobalRecoveryMetrics,
  MuscleGroup,
} from '@/features/workout/types/muscleRecovery';

interface UseMuscleRecoveryReturn {
  // État
  muscleRecoveryData: MuscleRecoveryData[];
  recoveryProfile: UserRecoveryProfile | null;
  recommendations: RecoveryRecommendation[];
  globalMetrics: GlobalRecoveryMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  refreshRecoveryData: () => Promise<void>;
  updateRecoveryProfile: () => Promise<void>;
  getMuscleRecovery: (muscleGroup: MuscleGroup) => MuscleRecoveryData | null;
  getRecoveryScore: () => number;
  isReadyForWorkout: (muscleGroups: MuscleGroup[]) => boolean;
  getOptimalWorkoutType: () => string;

  // Utilitaires
  formatRecoveryStatus: (status: string) => string;
  getRecoveryColor: (percentage: number) => string;
  getNextWorkoutRecommendation: () => string;
}

export const useMuscleRecovery = (): UseMuscleRecoveryReturn => {
  const { appStoreUser } = appStore();

  // État local
  const [muscleRecoveryData, setMuscleRecoveryData] = useState<MuscleRecoveryData[]>([]);
  const [recoveryProfile, setRecoveryProfile] = useState<UserRecoveryProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecoveryRecommendation[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalRecoveryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fonction pour rafraîchir toutes les données de récupération
  const refreshRecoveryData = useCallback(async () => {
    if (!appStoreUser?.id) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implémenter la logique complète quand les services seront prêts
      setMuscleRecoveryData([]);
      setRecommendations([]);
      setGlobalMetrics(null);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors du calcul de récupération';
      setError(errorMessage);
      console.error('Error refreshing recovery data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id]);

  // Fonction pour mettre à jour le profil de récupération
  const updateRecoveryProfile = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      setIsLoading(true);
      // TODO: Implémenter la logique complète quand les services seront prêts
      console.log('Update recovery profile for user:', appStoreUser.id);
    } catch (err) {
      console.error('Error updating recovery profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id]);

  // Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    if (appStoreUser?.id) {
      refreshRecoveryData();
    }
  }, [appStoreUser?.id, refreshRecoveryData]);

  // Fonctions utilitaires
  const getMuscleRecovery = useCallback(
    (muscleGroup: MuscleGroup): MuscleRecoveryData | null => {
      return muscleRecoveryData.find(data => data.muscle_group === muscleGroup) || null;
    },
    [muscleRecoveryData]
  );

  const getRecoveryScore = useCallback((): number => {
    return globalMetrics?.overall_recovery_score || 0;
  }, [globalMetrics]);

  const isReadyForWorkout = useCallback(
    (muscleGroups: MuscleGroup[]): boolean => {
      return muscleGroups.every(muscle => {
        const recovery = getMuscleRecovery(muscle);
        return recovery ? recovery.recovery_percentage > 70 : false;
      });
    },
    [getMuscleRecovery]
  );

  const getOptimalWorkoutType = useCallback((): string => {
    return globalMetrics?.optimal_workout_type || 'rest';
  }, [globalMetrics]);

  const formatRecoveryStatus = useCallback((status: string): string => {
    const statusMap = {
      fully_recovered: 'Complètement récupéré',
      mostly_recovered: 'Bien récupéré',
      partially_recovered: 'Partiellement récupéré',
      needs_recovery: 'Besoin de récupération',
      overworked: 'Surmené',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }, []);

  const getRecoveryColor = useCallback((percentage: number): string => {
    if (percentage >= 90) return '#10B981'; // Vert
    if (percentage >= 70) return '#F59E0B'; // Orange
    if (percentage >= 50) return '#EF4444'; // Rouge
    return '#DC2626'; // Rouge foncé
  }, []);

  const getNextWorkoutRecommendation = useCallback((): string => {
    if (!globalMetrics) return 'Données en cours de calcul...';

    const readyMuscles = globalMetrics.ready_for_training.length;
    const overallScore = globalMetrics.overall_recovery_score;

    if (overallScore < 40) {
      return 'Repos complet recommandé. Concentrez-vous sur la récupération.';
    } else if (overallScore < 60) {
      return 'Entraînement léger uniquement. Cardio doux ou étirements.';
    } else if (readyMuscles >= 6) {
      return 'Vous pouvez faire un entraînement complet du corps.';
    } else if (readyMuscles >= 4) {
      return 'Entraînement en split (haut/bas du corps) recommandé.';
    } else if (readyMuscles >= 2) {
      return `Entraînement ciblé sur: ${globalMetrics.ready_for_training.join(', ')}`;
    } else {
      return 'Récupération active recommandée (marche, étirements).';
    }
  }, [globalMetrics]);

  return {
    // État
    muscleRecoveryData,
    recoveryProfile,
    recommendations,
    globalMetrics,
    isLoading,
    error,
    lastUpdated,

    // Actions
    refreshRecoveryData,
    updateRecoveryProfile,
    getMuscleRecovery,
    getRecoveryScore,
    isReadyForWorkout,
    getOptimalWorkoutType,

    // Utilitaires
    formatRecoveryStatus,
    getRecoveryColor,
    getNextWorkoutRecommendation,
  };
};
