// client/src/hooks/useWorkoutSession.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';

export interface ExerciseSet {
  reps: number;
  weight?: number;
  duration?: number;           // secondes (pour exos chronométrés)
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  completed: boolean;
  restTime: number;            // secondes
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  name: string;
  start_time: string;          // ISO
  end_time?: string;           // ISO
  duration_seconds: number;
  target_duration_min: number;
  exercises: WorkoutExercise[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  calories_burned: number;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/*                         CONSTANTES / KEYS                          */
/* ------------------------------------------------------------------ */

const LS_CURRENT = 'mfh_currentWorkoutSession';
const LS_HISTORY = 'mfh_workoutHistory';
const LS_WEIGHT  = 'mfh_exerciseWeightHistory';

/* ------------------------------------------------------------------ */
/*                       HOOK PRINCIPAL                               */
/* ------------------------------------------------------------------ */

export const useWorkoutSession = () => {
  const { toast } = useToast();
  const { appStoreUser, setAppStoreUser } = useAppStore.getState();
  const userId = appStoreUser?.id;

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isActive, setIsActive]   = useState(false);

  /* ========================= UTILITAIRES ========================= */

  const calcCalories = useCallback((minutes: number) => {
    const weight = appStoreUser?.weight_kg ?? 70;
    const MET = 6;                                 // valeur moyenne
    return Math.round(weight * MET * (minutes / 60));
  }, [appStoreUser?.weight_kg]);

  const persistLocal = (data: WorkoutSession | null) => {
    if (data) localStorage.setItem(LS_CURRENT, JSON.stringify(data));
    else      localStorage.removeItem(LS_CURRENT);
  };

  const upsertSupabase = async (data: WorkoutSession) => {
    await supabase.from('workouts').upsert(data, { onConflict: 'id' });
  };

  /* ========================== ACTIONS =========================== */

  const startSession = useCallback(
    async (name: string, target = 30) => {
      if (!userId) return toast({ title: 'Non connecté', variant: 'destructive' });

      const newSession: WorkoutSession = {
        id: crypto.randomUUID(),
        user_id: userId,
        name,
        start_time: new Date().toISOString(),
        duration_seconds: 0,
        target_duration_min: target,
        exercises: [],
        status: 'active',
        calories_burned: 0,
      };

      setSession(newSession);
      setIsActive(true);
      persistLocal(newSession);
      await upsertSupabase(newSession);

      toast({ title: 'Entraînement démarré', description: name });
    },
    [toast, userId],
  );

  const pauseSession = useCallback(async () => {
    if (!session) return;
    const update = { ...session, status: 'paused' as const };
    setSession(update);
    setIsActive(false);
    persistLocal(update);
    await upsertSupabase(update);
  }, [session]);

  const resumeSession = useCallback(async () => {
    if (!session) return;
    const update = { ...session, status: 'active' as const };
    setSession(update);
    setIsActive(true);
    persistLocal(update);
    await upsertSupabase(update);
  }, [session]);

  const completeSession = useCallback(async () => {
    if (!session) return;
    const end = new Date();
    const duration = Math.floor(
      (end.getTime() - new Date(session.start_time).getTime()) / 1000,
    );
    const calories = calcCalories(duration / 60);

    const completed: WorkoutSession = {
      ...session,
      end_time: end.toISOString(),
      duration_seconds: duration,
      calories_burned: calories,
      status: 'completed',
    };

    setSession(completed);
    setIsActive(false);
    persistLocal(null);

    // Historique local
    const history: WorkoutSession[] = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
    localStorage.setItem(LS_HISTORY, JSON.stringify([...history, completed]));

    // Supabase
    await upsertSupabase(completed);
    await supabase.rpc('update_daily_stats_after_workout', {
      p_user_id: userId,
      p_calories: calories,
      p_duration: duration,
    }); // fonction SQL stockée

    toast({
      title: 'Session terminée',
      description: `${Math.round(duration / 60)} min • ${calories} kcal`,
    });

    // Rafraîchir le store profil (ex : total workouts)
    const { data } = await supabase
      .from('user_profiles')
      .select('total_workouts')
      .eq('id', userId)
      .single();
    setAppStoreUser({ ...appStoreUser, total_workouts: data?.total_workouts });
  }, [session, calcCalories, toast, userId, setAppStoreUser, appStoreUser]);

  const cancelSession = useCallback(async () => {
    if (!session) return;
    const cancelled = { ...session, status: 'cancelled' as const };
    setSession(cancelled);
    setIsActive(false);
    persistLocal(null);
    await upsertSupabase(cancelled);
    toast({ title: 'Session annulée', variant: 'destructive' });
  }, [session, toast]);

  /* ------------------ EXERCICES & SETS ------------------ */

  const addExercise = (exercise: Omit<WorkoutExercise, 'id'>) => {
    if (!session) return;
    const newEx: WorkoutExercise = { ...exercise, id: crypto.randomUUID() };
    const upd = { ...session, exercises: [...session.exercises, newEx] };
    setSession(upd);
    persistLocal(upd);
  };

  const updateExerciseSet = (
    exId: string,
    setIdx: number,
    changes: Partial<ExerciseSet>,
  ) => {
    if (!session) return;
    const upd = {
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) => (i === setIdx ? { ...s, ...changes } : s)),
            }
          : ex,
      ),
    };
    setSession(upd);
    persistLocal(upd);

    // Historiser poids
    if (changes.weight !== undefined) {
      saveWeightHistory(exId, changes.weight);
    }
  };

  const completeExercise = (exId: string) => {
    if (!session) return;
    const upd = {
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === exId ? { ...ex, completed: true } : ex,
      ),
    };
    setSession(upd);
    persistLocal(upd);
  };

  /* ---------------- HISTORIQUE POIDS ---------------- */

  const saveWeightHistory = (exerciseName: string, weight: number) => {
    const hist = JSON.parse(localStorage.getItem(LS_WEIGHT) || '{}');
    if (!hist[exerciseName]) hist[exerciseName] = [];
    hist[exerciseName].push({
      weight,
      date: new Date().toISOString(),
      uid: userId,
    });
    if (hist[exerciseName].length > 20) hist[exerciseName] = hist[exerciseName].slice(-20);
    localStorage.setItem(LS_WEIGHT, JSON.stringify(hist));
  };

  const getLastWeight = (exerciseName: string): number | undefined => {
    const hist = JSON.parse(localStorage.getItem(LS_WEIGHT) || '{}')[exerciseName] || [];
    const userEntries = hist.filter((h: any) => h.uid === userId);
    return userEntries.length ? userEntries[userEntries.length - 1].weight : undefined;
  };

  /* ================ REPRISE À L’OUVERTURE ================ */

  useEffect(() => {
    const saved = localStorage.getItem(LS_CURRENT);
    if (saved) {
      const s: WorkoutSession = JSON.parse(saved);
      setSession(s);
      setIsActive(s.status === 'active');
    }
  }, []);

  /* ================ EXPORTS ================ */

  return {
    /* état */
    currentSession: session,
    isSessionActive: isActive,

    /* contrôles */
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,

    /* exercices */
    addExercise,
    updateExerciseSet,
    completeExercise,
    getLastWeight,

    /* utilitaires */
    saveWeightHistory,
  };
};
