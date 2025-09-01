import { useState, useCallback } from 'react';
import { WorkoutExercise } from '@/types/workout.types';

export interface UseWorkoutExercisesReturn {
  exercises: WorkoutExercise[];
  expandedExercise: string | null;
  setExercises: (exercises: WorkoutExercise[]) => void;
  updateExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => void;
  updateExerciseSet: (exerciseId: string, setIndex: number, updates: any) => void;
  completeExercise: (exerciseId: string) => void;
  addSetToExercise: (exerciseId: string) => void;
  removeSetFromExercise: (exerciseId: string, setIndex: number) => void;
  setExpandedExercise: (exerciseId: string | null) => void;
  getCompletedExercisesCount: () => number;
  getTotalExercisesCount: () => number;
  getProgressPercentage: () => number;
}

export const useWorkoutExercises = (
  initialExercises: WorkoutExercise[] = []
): UseWorkoutExercisesReturn => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const updateExercise = useCallback((exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setExercises(prev =>
      prev.map(exercise => (exercise.id === exerciseId ? { ...exercise, ...updates } : exercise))
    );
  }, []);

  const updateExerciseSet = useCallback((exerciseId: string, setIndex: number, updates: any) => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId && exercise.sets) {
          const updatedSets = [...exercise.sets];
          updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    );
  }, []);

  const completeExercise = useCallback(
    (exerciseId: string) => {
      updateExercise(exerciseId, { completed: true });

      // Passer au prochain exercice non terminé
      const nextExercise = exercises.find(e => !e.completed && e.id !== exerciseId);
      if (nextExercise) {
        setExpandedExercise(nextExercise.id);
      }
    },
    [exercises, updateExercise]
  );

  const addSetToExercise = useCallback((exerciseId: string) => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId && exercise.sets) {
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet = {
            reps: lastSet?.reps || 10,
            weight: lastSet?.weight,
            duration: lastSet?.duration,
            completed: false,
          };
          return {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
        }
        return exercise;
      })
    );
  }, []);

  const removeSetFromExercise = useCallback((exerciseId: string, setIndex: number) => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId && exercise.sets && exercise.sets.length > 1) {
          const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    );
  }, []);

  const getCompletedExercisesCount = useCallback(() => {
    return exercises.filter(e => e.completed).length;
  }, [exercises]);

  const getTotalExercisesCount = useCallback(() => {
    return exercises.length;
  }, [exercises]);

  const getProgressPercentage = useCallback(() => {
    const total = getTotalExercisesCount();
    const completed = getCompletedExercisesCount();
    return total > 0 ? (completed / total) * 100 : 0;
  }, [getCompletedExercisesCount, getTotalExercisesCount]);

  return {
    exercises,
    expandedExercise,
    setExercises,
    updateExercise,
    updateExerciseSet,
    completeExercise,
    addSetToExercise,
    removeSetFromExercise,
    setExpandedExercise,
    getCompletedExercisesCount,
    getTotalExercisesCount,
    getProgressPercentage,
  };
};
