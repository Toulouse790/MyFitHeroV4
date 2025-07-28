// hooks/workout/useWorkoutSessionCore.ts
import { useState, useCallback } from 'react';
import { WorkoutSession, Exercise, WorkoutStatus } from '@/types/workout';

export interface UseWorkoutSessionCoreReturn {
  session: WorkoutSession | null;
  status: WorkoutStatus;
  currentExerciseIndex: number;
  isActive: boolean;
  startSession: (templateId: string) => Promise<void>;
  endSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  nextExercise: () => void;
  previousExercise: () => void;
  setCurrentExercise: (index: number) => void;
}

export const useWorkoutSessionCore = (): UseWorkoutSessionCoreReturn => {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [status, setStatus] = useState<WorkoutStatus>('idle');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const isActive = status === 'active' || status === 'paused';

  const startSession = useCallback(async (templateId: string) => {
    try {
      setStatus('loading');
      // Logique de démarrage de session
      const newSession = await createWorkoutSession(templateId);
      setSession(newSession);
      setStatus('active');
      setCurrentExerciseIndex(0);
    } catch (error) {
      setStatus('error');
      throw error;
    }
  }, []);

  const endSession = useCallback(async () => {
    if (!session) return;
    
    try {
      setStatus('completing');
      await completeWorkoutSession(session.id);
      setSession(null);
      setStatus('idle');
      setCurrentExerciseIndex(0);
    } catch (error) {
      setStatus('error');
      throw error;
    }
  }, [session]);

  const pauseSession = useCallback(() => {
    setStatus('paused');
  }, []);

  const resumeSession = useCallback(() => {
    setStatus('active');
  }, []);

  const nextExercise = useCallback(() => {
    if (!session || currentExerciseIndex >= session.exercises.length - 1) return;
    setCurrentExerciseIndex(prev => prev + 1);
  }, [session, currentExerciseIndex]);

  const previousExercise = useCallback(() => {
    if (currentExerciseIndex <= 0) return;
    setCurrentExerciseIndex(prev => prev - 1);
  }, [currentExerciseIndex]);

  const setCurrentExercise = useCallback((index: number) => {
    if (!session || index < 0 || index >= session.exercises.length) return;
    setCurrentExerciseIndex(index);
  }, [session]);

  return {
    session,
    status,
    currentExerciseIndex,
    isActive,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    nextExercise,
    previousExercise,
    setCurrentExercise,
  };
};
