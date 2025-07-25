// client/src/hooks/useWorkoutSession.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

/* =================================================================== */
/*                             TYPES                                   */
/* =================================================================== */

export interface ExerciseSet {
  reps: number;
  weight?: number;
  duration?: number;           // ex : planche (sec)
  distance?: number;           // ex : run (m)
  completed: boolean;
  rpe?: number;                // Rate of Perceived Exertion (1-10)
  notes?: string;
  timestamp?: string;          // ISO pour historique
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  sets: ExerciseSet[];
  completed: boolean;
  restTime: number;            // prévu (sec)
  actualRestTime?: number;     // mesuré (sec)
  equipment?: string;
  video_url?: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  name: string;
  startTime: string;           // ISO
  endTime?: string;            // ISO
  duration: number;            // sec
  targetDuration: number;      // min
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  caloriesBurned: number;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: WorkoutExercise[];
  notes?: string;
}

/* =================================================================== */
/*                       HOOK PRINCIPAL                                */
/* =================================================================== */

export const useWorkoutSession = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { appStoreUser } = useAppStore.getState();

  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(
    () => loadLocalSession()
  );
  const [isSessionActive, setIsSessionActive] = useState<boolean>(
    () => loadLocalSession()?.status === 'active' || false
  );

  const timerRef = useRef<NodeJS.Timer>();

  /* ------------------------- UTILS --------------------------------- */

  const saveLocalSession = (session: WorkoutSession | null) => {
    if (session) {
      localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('currentWorkoutSession');
    }
  };

  function loadLocalSession(): WorkoutSession | null {
    const raw = localStorage.getItem('currentWorkoutSession');
    return raw ? (JSON.parse(raw) as WorkoutSession) : null;
  }

  const calculateCalories = useCallback(
    (minutes: number) => {
      const w = appStoreUser?.weight_kg || 70;
      const MET = 6; // valeur moyenne, à raffiner
      return Math.round((w * MET * minutes) / 60);
    },
    [appStoreUser?.weight_kg]
  );

  const persistToSupabase = async (session: WorkoutSession) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .upsert({ ...session, updated_at: new Date().toISOString() });

      if (error) throw error;

      // invalider les requêtes « workouts » si vous en avez
      queryClient.invalidateQueries(['workouts', session.user_id]);
    } catch (e) {
      // en cas d’échec, on garde le localStorage ; un service worker pourra resync
      console.error('Supabase persistence error:', e);
    }
  };

  /* ------------------------- START --------------------------------- */

  const startSession = useCallback(
    async (
      workoutName: string,
      {
        targetDuration = 30,
        workout_type = 'strength',
        difficulty = 'intermediate',
        exercises = [] as WorkoutExercise[]
      } = {}
    ) => {
      if (!appStoreUser?.id) return;

      const newSession: WorkoutSession = {
        id: crypto.randomUUID(),
        user_id: appStoreUser.id,
        name: workoutName,
        startTime: new Date().toISOString(),
        duration: 0,
        targetDuration,
        status: 'active',
        caloriesBurned: 0,
        workout_type,
        difficulty,
        exercises
      };

      setCurrentSession(newSession);
      setIsSessionActive(true);
      saveLocalSession(newSession);
      persistToSupabase(newSession);

      toast({
        title: 'Session démarrée',
        description: `« ${workoutName} » en cours`,
      });
    },
    [appStoreUser?.id, toast]
  );

  /* ------------------------- PAUSE / RESUME ------------------------ */

  const pauseSession = useCallback(() => {
    if (!currentSession) return;
    const updated = { ...currentSession, status: 'paused' as const };
    setCurrentSession(updated);
    setIsSessionActive(false);
    saveLocalSession(updated);
    persistToSupabase(updated);
  }, [currentSession]);

  const resumeSession = useCallback(() => {
    if (!currentSession) return;
    const updated = { ...currentSession, status: 'active' as const };
    setCurrentSession(updated);
    setIsSessionActive(true);
    saveLocalSession(updated);
    persistToSupabase(updated);
  }, [currentSession]);

  /* ------------------------- COMPLETE / CANCEL --------------------- */

  const completeSession = useCallback(() => {
    if (!currentSession) return;

    const end = new Date();
    const durationSec =
      Math.floor(
        (end.getTime() - new Date(currentSession.startTime).getTime()) / 1000
      ) + currentSession.duration; // + durée déjà comptée

    const completed: WorkoutSession = {
      ...currentSession,
      endTime: end.toISOString(),
      duration: durationSec,
      caloriesBurned: calculateCalories(durationSec / 60),
      status: 'completed',
    };

    setCurrentSession(completed);
    setIsSessionActive(false);
    saveLocalSession(null); // session terminée → on nettoie
    persistToSupabase(completed);

    toast({
      title: 'Session terminée',
      description: `${Math.round(durationSec / 60)} min • ${completed.caloriesBurned} kcal`,
    });
  }, [currentSession, calculateCalories, toast]);

  const cancelSession = useCallback(() => {
    if (!currentSession) return;
    const cancelled = { ...currentSession, status: 'cancelled' as const };
    setCurrentSession(cancelled);
    setIsSessionActive(false);
    saveLocalSession(null);
    persistToSupabase(cancelled);

    toast({
      title: 'Session annulée',
      variant: 'destructive',
    });
  }, [currentSession, toast]);

  /* ------------------------- DURÉE EN TEMPS RÉEL ------------------- */

  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setCurrentSession((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, duration: prev.duration + 1 };
          saveLocalSession(updated);
          return updated;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current as NodeJS.Timer);
    }
    return () => clearInterval(timerRef.current as NodeJS.Timer);
  }, [isSessionActive]);

  /* ------------------------- EXERCICES ----------------------------- */

  const updateExerciseSet = useCallback(
    (
      exerciseId: string,
      setIndex: number,
      updates: Partial<ExerciseSet>
    ) => {
      if (!currentSession) return;

      const session = structuredClone(currentSession) as WorkoutSession;
      const ex = session.exercises.find((e) => e.id === exerciseId);
      if (!ex) return;

      ex.sets[setIndex] = { ...ex.sets[setIndex], ...updates };

      // marquer l’exercice terminé si toutes les séries le sont
      ex.completed = ex.sets.every((s) => s.completed);

      setCurrentSession(session);
      saveLocalSession(session);
      persistToSupabase(session);
    },
    [currentSession]
  );

  const addExercise = useCallback(
    (exercise: Omit<WorkoutExercise, 'id'>) => {
      if (!currentSession) return;
      const newEx: WorkoutExercise = { ...exercise, id: crypto.randomUUID() };
      const updated = {
        ...currentSession,
        exercises: [...currentSession.exercises, newEx],
      };
      setCurrentSession(updated);
      saveLocalSession(updated);
      persistToSupabase(updated);
    },
    [currentSession]
  );

  /* ------------------------- SYNC AU MONTAGE ----------------------- */

  useEffect(() => {
    if (currentSession) persistToSupabase(currentSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------- EXPORT ------------------------------- */

  return {
    /* state */
    currentSession,
    isSessionActive,

    /* actions */
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    addExercise,
    updateExerciseSet,
  };
};
