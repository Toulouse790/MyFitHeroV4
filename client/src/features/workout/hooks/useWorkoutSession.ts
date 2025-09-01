// hooks/workout/useWorkoutSession.ts
import { useWorkoutSessionCore } from './useWorkoutSessionCore';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutExercises } from './useWorkoutExercises';
import { useExerciseHistory } from './useExerciseHistory';

export const useWorkoutSession = () => {
  const sessionCore = useWorkoutSessionCore();
  const timer = useWorkoutTimer(sessionCore);
  const history = useExerciseHistory();
  const exercises = useWorkoutExercises(
    sessionCore.currentSession,
    sessionCore.updateSession,
    history.saveWeightHistory
  );

  return {
    // État de base
    currentSession: sessionCore.currentSession,
    isSessionActive: sessionCore.isSessionActive,

    // Actions de session
    startSession: sessionCore.startSession,
    pauseSession: sessionCore.pauseSession,
    resumeSession: sessionCore.resumeSession,
    completeSession: sessionCore.completeSession,
    cancelSession: sessionCore.cancelSession,

    // Gestion des exercices
    addExercise: exercises.addExercise,
    updateExerciseSet: exercises.updateExerciseSet,
    completeExercise: exercises.completeExercise,
    addSetToExercise: exercises.addSetToExercise,
    removeSetFromExercise: exercises.removeSetFromExercise,

    // Historique et utilitaires
    loadExercisesFromLastSession: history.loadExercisesFromLastSession,
    getLastWeightForExercise: history.getLastWeightForExercise,

    // Utilitaires
    calculateCalories: sessionCore.calculateCalories,
    formatTime: timer.formatTime,
  };
};

// Export des types pour réutilisation
export type { WorkoutSession, WorkoutExercise, ExerciseSet } from '@/shared/types/workout';
