// hooks/workout/useWorkoutSessionCore.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../use-toast';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import type { WorkoutSession, WorkoutExercise, ExerciseSet } from '@/types/workout';

export interface UseWorkoutSessionCoreReturn {
  currentSession: WorkoutSession | null;
  isSessionActive: boolean;
  startSession: (
    workoutName: string,
    options?: {
      targetDuration?: number;
      workout_type?: WorkoutSession['workout_type'];
      difficulty?: WorkoutSession['difficulty'];
      exercises?: WorkoutExercise[];
    }
  ) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  cancelSession: () => Promise<void>;
  calculateCalories: (minutes: number) => number;
  updateSession: (updates: Partial<WorkoutSession>) => void;
}

export const useWorkoutSessionCore = (): UseWorkoutSessionCoreReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { appStoreUser } = useAppStore();

  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(() =>
    loadLocalSession()
  );
  const [isSessionActive, setIsSessionActive] = useState<boolean>(
    () => loadLocalSession()?.status === 'active' || false
  );

  // Utilitaires localStorage
  const saveLocalSession = (session: WorkoutSession | null) => {
    if (session) {
      localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('currentWorkoutSession');
    }
  };

  function loadLocalSession(): WorkoutSession | null {
    try {
      const raw = localStorage.getItem('currentWorkoutSession');
      return raw ? (JSON.parse(raw) as WorkoutSession) : null;
    } catch (error) {
      console.error('Erreur parsing session localStorage:', error);
      localStorage.removeItem('currentWorkoutSession');
      return null;
    }
  }

  const calculateCalories = useCallback(
    (minutes: number) => {
      const w = appStoreUser?.weight_kg || 70;
      const MET = 6;
      return Math.round((w * MET * minutes) / 60);
    },
    [appStoreUser?.weight_kg]
  );

  const persistToSupabase = async (session: WorkoutSession) => {
    try {
      // Adapter les données pour correspondre au schéma Supabase
      const workoutData = {
        id: session.id,
        user_id: session.user_id,
        name: session.name,
        workout_type: session.workout_type,
        difficulty: session.difficulty,
        started_at: session.startTime,
        completed_at: session.endTime,
        duration_minutes: Math.floor(session.duration / 60),
        calories_burned: session.caloriesBurned,
        exercises: session.exercises,
        notes: session.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any).from('workouts').upsert(workoutData);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['workouts', session.user_id] });
    } catch (e) {
      console.error('Supabase persistence error:', e);
    }
  };

  const updateSession = useCallback(
    (updates: Partial<WorkoutSession>) => {
      if (!currentSession) return;
      const updatedSession = { ...currentSession, ...updates };
      setCurrentSession(updatedSession);
      saveLocalSession(updatedSession);
      persistToSupabase(updatedSession);
    },
    [currentSession]
  );

  const startSession = useCallback(
    async (
      workoutName: string,
      {
        targetDuration = 30,
        workout_type = 'strength',
        difficulty = 'intermediate',
        exercises = [] as WorkoutExercise[],
      } = {}
    ) => {
      if (!appStoreUser?.id) {
        toast({
          title: 'Erreur',
          description: 'Utilisateur non connecté',
          variant: 'destructive',
        });
        return;
      }

      const newSession: WorkoutSession = {
        id: crypto.randomUUID(),
        user_id: appStoreUser.id,
        name: workoutName,
        startTime: new Date().toISOString(),
        duration: 0,
        targetDuration,
        status: 'active',
        caloriesBurned: 0,
        workout_type: workout_type as 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other',
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        exercises,
      };

      setCurrentSession(newSession);
      setIsSessionActive(true);
      saveLocalSession(newSession);
      await persistToSupabase(newSession);

      toast({
        title: 'Session démarrée',
        description: `« ${workoutName} » en cours`,
      });

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'workout_started', {
          workout_name: workoutName,
          workout_type,
          user_id: appStoreUser.id,
        });
      }
    },
    [appStoreUser?.id, toast, persistToSupabase]
  );

  const pauseSession = useCallback(async () => {
    if (!currentSession) return;
    const updated = { ...currentSession, status: 'paused' as const };
    setCurrentSession(updated);
    setIsSessionActive(false);
    saveLocalSession(updated);
    await persistToSupabase(updated);

    toast({
      title: 'Session en pause',
      description: 'Reprenez quand vous êtes prêt',
    });
  }, [currentSession, persistToSupabase, toast]);

  const resumeSession = useCallback(async () => {
    if (!currentSession) return;
    const updated = { ...currentSession, status: 'active' as const };
    setCurrentSession(updated);
    setIsSessionActive(true);
    saveLocalSession(updated);
    await persistToSupabase(updated);

    toast({
      title: 'Session reprise',
      description: 'Bon entraînement !',
    });
  }, [currentSession, persistToSupabase, toast]);

  const completeSession = useCallback(async () => {
    if (!currentSession || !appStoreUser?.id) return;

    const end = new Date();
    const durationSec = Math.floor(
      (end.getTime() - new Date(currentSession.startTime).getTime()) / 1000
    );

    const completed: WorkoutSession = {
      ...currentSession,
      endTime: end.toISOString(),
      duration: durationSec,
      caloriesBurned: calculateCalories(durationSec / 60),
      status: 'completed',
    };

    setCurrentSession(completed);
    setIsSessionActive(false);
    saveLocalSession(null);
    await persistToSupabase(completed);

    // Mettre à jour les stats quotidiennes
    try {
      const today = new Date().toISOString().split('T')[0];
      await (supabase as any).from('daily_stats').upsert(
        {
          user_id: appStoreUser.id,
          stat_date: today,
          workouts_completed: 1,
          total_workout_minutes: Math.floor(durationSec / 60),
          calories_burned: completed.caloriesBurned,
        },
        {
          onConflict: 'user_id,stat_date',
        }
      );
    } catch (error) {
      console.error('Erreur mise à jour stats quotidiennes:', error);
    }

    toast({
      title: 'Session terminée ! 🎉',
      description: `${Math.round(durationSec / 60)} min • ${completed.caloriesBurned} kcal`,
    });

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'workout_completed', {
        duration_minutes: Math.round(durationSec / 60),
        calories_burned: completed.caloriesBurned,
        workout_type: completed.workout_type,
        user_id: appStoreUser.id,
      });
    }
  }, [currentSession, calculateCalories, toast, appStoreUser?.id, persistToSupabase]);

  const cancelSession = useCallback(async () => {
    if (!currentSession) return;
    const cancelled = { ...currentSession, status: 'cancelled' as const };
    setCurrentSession(cancelled);
    setIsSessionActive(false);
    saveLocalSession(null);
    await persistToSupabase(cancelled);

    toast({
      title: 'Session annulée',
      variant: 'destructive',
    });
  }, [currentSession, toast, persistToSupabase]);

  // Sync au montage - récupérer session interrompue
  useEffect(() => {
    const loadInterruptedSession = async () => {
      if (appStoreUser?.id && !currentSession) {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .is('completed_at', null) // Sessions non terminées
            .order('started_at', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            const dbSession = data[0] as any;
            // Convertir les données DB vers le format WorkoutSession
            const session: WorkoutSession = {
              id: dbSession.id,
              user_id: dbSession.user_id,
              name: dbSession.name,
              startTime: dbSession.started_at,
              endTime: dbSession.completed_at,
              duration: (dbSession.duration_minutes || 0) * 60,
              targetDuration: 30, // Valeur par défaut
              status: dbSession.completed_at ? 'completed' : 'active',
              caloriesBurned: dbSession.calories_burned || 0,
              workout_type: dbSession.workout_type || 'strength',
              difficulty: dbSession.difficulty || 'intermediate',
              exercises: dbSession.exercises || [],
              notes: dbSession.notes,
            };

            setCurrentSession(session);
            setIsSessionActive(session.status === 'active');
            saveLocalSession(session);
          }
        } catch (error) {
          console.error('Erreur récupération session interrompue:', error);
        }
      }
    };

    loadInterruptedSession();
  }, [appStoreUser?.id, currentSession]);

  return {
    currentSession,
    isSessionActive,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    calculateCalories,
    updateSession,
  };
};
