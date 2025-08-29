// hooks/workout/useExerciseHistory.ts
import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import type { WorkoutExercise } from '@/types/workout';

export interface UseExerciseHistoryReturn {
  getLastWeightForExercise: (exerciseName: string) => number | null;
  saveWeightHistory: (exerciseName: string, weight: number) => void;
  loadExercisesFromLastSession: (workoutName: string) => Promise<WorkoutExercise[]>;
}

export const useExerciseHistory = (): UseExerciseHistoryReturn => {
  const { appStoreUser } = useAppStore();

  const getLastWeightForExercise = useCallback(
    (exerciseName: string): number | null => {
      try {
        const weightHistory = JSON.parse(localStorage.getItem('exerciseWeightHistory') || '{}');
        const exerciseHistory = weightHistory[exerciseName];

        if (!exerciseHistory?.length) return null;

        const userHistory = exerciseHistory.filter(
          (entry: any) => entry.userId === appStoreUser?.id
        );
        return userHistory.length ? userHistory[userHistory.length - 1].weight : null;
      } catch (error) {
        console.error('Erreur lecture historique poids:', error);
        return null;
      }
    },
    [appStoreUser?.id]
  );

  const saveWeightHistory = useCallback(
    (exerciseName: string, weight: number) => {
      if (!appStoreUser?.id || weight <= 0) return;

      try {
        const history = JSON.parse(localStorage.getItem('exerciseWeightHistory') || '{}');
        if (!history[exerciseName]) history[exerciseName] = [];

        history[exerciseName].push({
          weight,
          date: new Date().toISOString(),
          userId: appStoreUser.id,
        });

        // Garder seulement les 50 dernières entrées par exercice
        if (history[exerciseName].length > 50) {
          history[exerciseName] = history[exerciseName].slice(-50);
        }

        localStorage.setItem('exerciseWeightHistory', JSON.stringify(history));
      } catch (error) {
        console.error('Erreur sauvegarde historique poids:', error);
      }
    },
    [appStoreUser?.id]
  );

  const loadExercisesFromLastSession = useCallback(
    async (workoutName: string): Promise<WorkoutExercise[]> => {
      if (!appStoreUser?.id) return [];

      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('exercises')
          .eq('user_id', appStoreUser.id)
          .eq('name', workoutName)
          .not('completed_at', 'is', null) // Sessions terminées
          .order('completed_at', { ascending: false })
          .limit(1);

        if (error || !data?.length) {
          console.log('Aucune session précédente trouvée pour:', workoutName);
          return [];
        }

        // Réinitialiser les exercices pour une nouvelle session
        return (data[0].exercises as WorkoutExercise[]).map((ex: WorkoutExercise) => ({
          ...ex,
          id: crypto.randomUUID(),
          completed: false,
          sets: ex.sets.map(set => ({
            ...set,
            completed: false,
            timestamp: undefined,
          })),
        }));
      } catch (error) {
        console.error('Erreur chargement dernière session:', error);
        return [];
      }
    },
    [appStoreUser?.id]
  );

  return {
    getLastWeightForExercise,
    saveWeightHistory,
    loadExercisesFromLastSession,
  };
};
