// hooks/workout/useWorkoutSession.ts
import { useWorkoutSessionCore } from './useWorkoutSessionCore';
import { useWorkoutTimer } from './useWorkoutTimer';
import { useWorkoutExercises } from './useWorkoutExercises';
import { useWorkoutPersistence } from './useWorkoutPersistence';

export const useWorkoutSession = () => {
  const sessionCore = useWorkoutSessionCore();
  const timer = useWorkoutTimer(sessionCore.isActive);
  const exercises = useWorkoutExercises(
    sessionCore.session?.exercises || [],
    sessionCore.currentExerciseIndex
  );
  const persistence = useWorkoutPersistence();

  return {
    ...sessionCore,
    ...timer,
    ...exercises,
    ...persistence,
  };
};
