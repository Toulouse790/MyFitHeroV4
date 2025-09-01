import { useCallback } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { WorkoutSession, WorkoutExercise, ExerciseSet } from './useWorkoutSessionCore';

export interface UseWorkoutExercisesReturn {
  addExercise: (exercise: Omit<WorkoutExercise, 'id'>) => Promise<void>;
  updateExerciseSet: (
    exerciseId: string,
    setIndex: number,
    updates: Partial<ExerciseSet>
  ) => Promise<void>;
  completeExercise: (exerciseId: string) => Promise<void>;
  addSetToExercise: (exerciseId: string, newSet?: Partial<ExerciseSet>) => Promise<void>;
  removeSetFromExercise: (exerciseId: string, setIndex: number) => Promise<void>;
}

export const useWorkoutExercises = (
  currentSession: WorkoutSession | null,
  updateSession: (updates: Partial<WorkoutSession>) => void,
  saveWeightHistory: (exerciseName: string, weight: number) => void
): UseWorkoutExercisesReturn => {
  const { toast } = useToast();

  const addExercise = useCallback(
    async (exercise: Omit<WorkoutExercise, 'id'>) => {
      if (!currentSession) return;
      const newEx: WorkoutExercise = { ...exercise, id: crypto.randomUUID() };
      updateSession({
        exercises: [...currentSession.exercises, newEx],
      });
    },
    [currentSession, updateSession]
  );

  const updateExerciseSet = useCallback(
    async (exerciseId: string, setIndex: number, updates: Partial<ExerciseSet>) => {
      if (!currentSession) return;

      const updatedExercises = currentSession.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;

        const updatedSets = ex.sets.map((set, index) => {
          if (index !== setIndex) return set;

          // Ajouter timestamp si le set devient complété
          const setUpdates = { ...updates };
          if (updates.completed && !set.completed) {
            setUpdates.timestamp = new Date().toISOString();
          }

          return { ...set, ...setUpdates };
        });

        // Marquer l'exercice terminé si toutes les séries le sont
        const completed = updatedSets.every(s => s.completed);

        return { ...ex, sets: updatedSets, completed };
      });

      updateSession({ exercises: updatedExercises });

      // Sauvegarder l'historique des poids
      if (updates.weight && updates.weight > 0) {
        const exercise = currentSession.exercises.find(e => e.id === exerciseId);
        if (exercise) {
          saveWeightHistory(exercise.name, updates.weight);
        }
      }
    },
    [currentSession, updateSession, saveWeightHistory]
  );

  const completeExercise = useCallback(
    async (exerciseId: string) => {
      if (!currentSession) return;

      const updatedExercises = currentSession.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              completed: true,
              sets: ex.sets.map(set => ({
                ...set,
                completed: true,
                timestamp: new Date().toISOString(),
              })),
            }
          : ex
      );

      updateSession({ exercises: updatedExercises });

      toast({
        title: 'Exercice terminé',
        description: 'Bravo ! Toutes les séries sont complétées',
      });
    },
    [currentSession, updateSession, toast]
  );

  const addSetToExercise = useCallback(
    async (exerciseId: string, newSet?: Partial<ExerciseSet>) => {
      if (!currentSession) return;

      const defaultSet: ExerciseSet = {
        reps: 0,
        weight: 0,
        completed: false,
        ...newSet,
      };

      const updatedExercises = currentSession.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, defaultSet] } : ex
      );

      updateSession({ exercises: updatedExercises });

      toast({
        title: 'Série ajoutée',
        description: "Nouvelle série ajoutée à l'exercice",
      });
    },
    [currentSession, updateSession, toast]
  );

  const removeSetFromExercise = useCallback(
    async (exerciseId: string, setIndex: number) => {
      if (!currentSession) return;

      const updatedExercises = currentSession.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.filter((_, i) => i !== setIndex),
              completed: false, // Réinitialiser le statut de l'exercice
            }
          : ex
      );

      updateSession({ exercises: updatedExercises });

      toast({
        title: 'Série supprimée',
        description: "La série a été retirée de l'exercice",
      });
    },
    [currentSession, updateSession, toast]
  );

  return {
    addExercise,
    updateExerciseSet,
    completeExercise,
    addSetToExercise,
    removeSetFromExercise,
  };
};
