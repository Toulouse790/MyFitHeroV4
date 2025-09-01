import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/profile.service';
import type {
  UserProfile,
  UpdateProfileData,
  ProfileStats,
  AchievementData,
  GoalData,
  CreateGoalData,
  UpdateGoalData,
} from '../types/index';

export interface UseProfileReturn {
  // État
  profile: UserProfile | null;
  stats: ProfileStats | null;
  achievements: AchievementData[];
  goals: GoalData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  createGoal: (goal: CreateGoalData) => Promise<void>;
  updateGoal: (goalId: string, data: UpdateGoalData) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Calculateurs
  getCompletionRate: () => number;
  getActiveGoalsCount: () => number;
}

export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || 'current-user';

  // Chargement des données du profil
  const loadProfile = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const profileData = await ProfileService.getProfile(currentUserId);
      setProfile(profileData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors du chargement du profil';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Chargement des statistiques
  const loadStats = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const statsData = await ProfileService.getProfileStats(currentUserId);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, [currentUserId]);

  // Chargement des achievements
  const loadAchievements = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const achievementsData = await ProfileService.getAchievements(currentUserId);
      setAchievements(achievementsData);
    } catch (err) {
      console.error('Erreur lors du chargement des achievements:', err);
    }
  }, [currentUserId]);

  // Chargement des objectifs
  const loadGoals = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const goalsData = await ProfileService.getGoals(currentUserId);
      setGoals(goalsData);
    } catch (err) {
      console.error('Erreur lors du chargement des objectifs:', err);
    }
  }, [currentUserId]);

  // Mise à jour du profil
  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const updatedProfile = await ProfileService.updateProfile(currentUserId, data);
        setProfile(updatedProfile);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // Upload d'avatar
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const avatarUrl = await ProfileService.uploadAvatar(currentUserId, file);
        if (profile) {
          setProfile({ ...profile, avatar: avatarUrl });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de l'upload de l'avatar";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, profile]
  );

  // Création d'objectif
  const createGoal = useCallback(
    async (goal: CreateGoalData) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const newGoal = await ProfileService.createGoal(currentUserId, goal);
        setGoals(prev => [...prev, newGoal]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la création de l'objectif";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // Mise à jour d'objectif
  const updateGoal = useCallback(async (goalId: string, data: UpdateGoalData) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedGoal = await ProfileService.updateGoal(goalId, data);
      setGoals(prev => prev.map(goal => (goal.id === goalId ? updatedGoal : goal)));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'objectif";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Suppression d'objectif
  const deleteGoal = useCallback(async (goalId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await ProfileService.deleteGoal(goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la suppression de l'objectif";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rafraîchissement complet
  const refreshProfile = useCallback(async () => {
    await Promise.all([loadProfile(), loadStats(), loadAchievements(), loadGoals()]);
  }, [loadProfile, loadStats, loadAchievements, loadGoals]);

  // Calculateurs
  const getCompletionRate = useCallback((): number => {
    if (!goals.length) return 0;
    const completedGoals = goals.filter(goal => goal.progress >= 100);
    return Math.round((completedGoals.length / goals.length) * 100);
  }, [goals]);

  const getActiveGoalsCount = useCallback((): number => {
    return goals.filter(goal => goal.isActive && goal.progress < 100).length;
  }, [goals]);

  // Chargement initial
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    stats,
    achievements,
    goals,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshProfile,
    getCompletionRate,
    getActiveGoalsCount,
  };
}
