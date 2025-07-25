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
      queryClient.invalidateQueries({ queryKey: ['workouts', session.user_id] });
    } catch (e) {
      // en cas d'échec, on garde le localStorage ; un service worker pourra resync
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
      if (!appStoreUser?.id) {
        toast({
          title: 'Erreur',
          description: 'Utilisateur non connecté',
          variant: 'destructive'
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
        workout_type,
        difficulty,
        exercises
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
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'workout_started', {
          workout_name: workoutName,
          workout_type,
          user_id: appStoreUser.id
        });
      }
    },
    [appStoreUser?.id, toast, persistToSupabase]
  );

  /* ------------------------- PAUSE / RESUME ------------------------ */

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

  /* ------------------------- COMPLETE / CANCEL --------------------- */

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
    saveLocalSession(null); // session terminée → on nettoie
    await persistToSupabase(completed);

    // Mettre à jour les stats quotidiennes
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser.id,
          stat_date: today,
          workouts_completed: 1,
          total_workout_minutes: Math.floor(durationSec / 60),
          calories_burned: completed.caloriesBurned
        }, {
          onConflict: 'user_id,stat_date'
        });
    } catch (error) {
      console.error('Erreur mise à jour stats quotidiennes:', error);
    }

    toast({
      title: 'Session terminée ! 🎉',
      description: `${Math.round(durationSec / 60)} min • ${completed.caloriesBurned} kcal`,
    });

    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'workout_completed', {
        duration_minutes: Math.round(durationSec / 60),
        calories_burned: completed.caloriesBurned,
        workout_type: completed.workout_type,
        user_id: appStoreUser.id
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

  /* ------------------------- DURÉE EN TEMPS RÉEL ------------------- */

  useEffect(() => {
    if (isSessionActive && currentSession) {
      timerRef.current = setInterval(() => {
        setCurrentSession((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, duration: prev.duration + 1 };
          saveLocalSession(updated);
          return updated;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive, currentSession]);

  /* ------------------------- EXERCICES ----------------------------- */

  const updateExerciseSet = useCallback(
    async (
      exerciseId: string,
      setIndex: number,
      updates: Partial<ExerciseSet>
    ) => {
      if (!currentSession) return;

      const session = structuredClone(currentSession) as WorkoutSession;
      const ex = session.exercises.find((e) => e.id === exerciseId);
      if (!ex || !ex.sets[setIndex]) return;

      // Ajouter timestamp si le set devient complété
      if (updates.completed && !ex.sets[setIndex].completed) {
        updates.timestamp = new Date().toISOString();
      }

      ex.sets[setIndex] = { ...ex.sets[setIndex], ...updates };

      // marquer l'exercice terminé si toutes les séries le sont
      ex.completed = ex.sets.every((s) => s.completed);

      setCurrentSession(session);
      saveLocalSession(session);
      await persistToSupabase(session);

      // Sauvegarder l'historique des poids
      if (updates.weight && updates.weight > 0) {
        saveWeightHistory(ex.name, updates.weight);
      }
    },
    [currentSession, persistToSupabase]
  );

  const addExercise = useCallback(
    async (exercise: Omit<WorkoutExercise, 'id'>) => {
      if (!currentSession) return;
      const newEx: WorkoutExercise = { ...exercise, id: crypto.randomUUID() };
      const updated = {
        ...currentSession,
        exercises: [...currentSession.exercises, newEx],
      };
      setCurrentSession(updated);
      saveLocalSession(updated);
      await persistToSupabase(updated);
    },
    [currentSession, persistToSupabase]
  );

  /* =================== FONCTIONS MANQUANTES (AUDIT) ================== */

  // 🔧 FONCTION MANQUANTE #1 - Marquer un exercice comme terminé
  const completeExercise = useCallback(async (exerciseId: string) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(ex => 
        ex.id === exerciseId 
          ? { 
              ...ex, 
              completed: true,
              sets: ex.sets.map(set => ({ ...set, completed: true, timestamp: new Date().toISOString() }))
            }
          : ex
      )
    };
    
    setCurrentSession(updatedSession);
    saveLocalSession(updatedSession);
    await persistToSupabase(updatedSession);

    toast({
      title: 'Exercice terminé',
      description: 'Bravo ! Toutes les séries sont complétées',
    });
  }, [currentSession, persistToSupabase, toast]);

  // 🔧 FONCTION MANQUANTE #2 - Charger les exercices de la dernière session
  const loadExercisesFromLastSession = useCallback(async (workoutName: string): Promise<WorkoutExercise[]> => {
    if (!appStoreUser?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', appStoreUser.id)
        .eq('name', workoutName)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error || !data?.length) {
        console.log('Aucune session précédente trouvée pour:', workoutName);
        return [];
      }
      
      // Réinitialiser les exercices pour une nouvelle session
      return data[0].exercises.map((ex: any) => ({
        ...ex,
        id: crypto.randomUUID(),
        completed: false,
        sets: ex.sets.map((set: any) => ({ 
          ...set, 
          completed: false,
          timestamp: undefined
        }))
      }));
    } catch (error) {
      console.error('Erreur chargement dernière session:', error);
      return [];
    }
  }, [appStoreUser?.id]);

  // 🔧 FONCTION MANQUANTE #3 - Ajouter une série à un exercice
  const addSetToExercise = useCallback(async (exerciseId: string, newSet?: Partial<ExerciseSet>) => {
    if (!currentSession) return;
    
    const defaultSet: ExerciseSet = {
      reps: 0,
      weight: 0,
      completed: false,
      ...newSet
    };
    
    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: [...ex.sets, defaultSet] }
          : ex
      )
    };
    
    setCurrentSession(updatedSession);
    saveLocalSession(updatedSession);
    await persistToSupabase(updatedSession);

    toast({
      title: 'Série ajoutée',
      description: 'Nouvelle série ajoutée à l\'exercice',
    });
  }, [currentSession, persistToSupabase, toast]);

  // 🔧 FONCTION MANQUANTE #4 - Supprimer une série d'un exercice
  const removeSetFromExercise = useCallback(async (exerciseId: string, setIndex: number) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(ex => 
        ex.id === exerciseId 
          ? { 
              ...ex, 
              sets: ex.sets.filter((_, i) => i !== setIndex),
              completed: false // Réinitialiser le statut de l'exercice
            }
          : ex
      )
    };
    
    setCurrentSession(updatedSession);
    saveLocalSession(updatedSession);
    await persistToSupabase(updatedSession);

    toast({
      title: 'Série supprimée',
      description: 'La série a été retirée de l\'exercice',
    });
  }, [currentSession, persistToSupabase, toast]);

  // 🔧 FONCTION MANQUANTE #5 - Obtenir le dernier poids pour un exercice
  const getLastWeightForExercise = useCallback((exerciseName: string): number | null => {
    try {
      const weightHistory = JSON.parse(localStorage.getItem('exerciseWeightHistory') || '{}');
      const exerciseHistory = weightHistory[exerciseName];
      
      if (!exerciseHistory?.length) return null;
      
      const userHistory = exerciseHistory.filter((entry: any) => entry.userId === appStoreUser?.id);
      return userHistory.length ? userHistory[userHistory.length - 1].weight : null;
    } catch (error) {
      console.error('Erreur lecture historique poids:', error);
      return null;
    }
  }, [appStoreUser?.id]);

  // 🔧 FONCTION MANQUANTE #6 - Sauvegarder l'historique des poids
  const saveWeightHistory = useCallback((exerciseName: string, weight: number) => {
    if (!appStoreUser?.id || weight <= 0) return;

    try {
      const history = JSON.parse(localStorage.getItem('exerciseWeightHistory') || '{}');
      if (!history[exerciseName]) history[exerciseName] = [];
      
      history[exerciseName].push({
        weight,
        date: new Date().toISOString(),
        userId: appStoreUser.id
      });
      
      // Garder seulement les 50 dernières entrées par exercice
      if (history[exerciseName].length > 50) {
        history[exerciseName] = history[exerciseName].slice(-50);
      }
      
      localStorage.setItem('exerciseWeightHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Erreur sauvegarde historique poids:', error);
    }
  }, [appStoreUser?.id]);

  /* ------------------------- SYNC AU MONTAGE ----------------------- */

  useEffect(() => {
    // Récupérer une session interrompue au démarrage
    const loadInterruptedSession = async () => {
      if (appStoreUser?.id && !currentSession) {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .in('status', ['active', 'paused'])
            .order('startTime', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            const session = data[0];
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

  /* ------------------------- EXPORT ------------------------------- */

  return {
    // État de base
    currentSession,
    isSessionActive,

    // Actions de session
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,

    // Gestion des exercices
    addExercise,
    updateExerciseSet,
    completeExercise,           // 🔧 AJOUTÉ
    addSetToExercise,           // 🔧 AJOUTÉ
    removeSetFromExercise,      // 🔧 AJOUTÉ

    // Historique et utilitaires
    loadExercisesFromLastSession, // 🔧 AJOUTÉ
    getLastWeightForExercise,     // 🔧 AJOUTÉ
    saveWeightHistory,            // 🔧 AJOUTÉ

    // Utilitaires
    calculateCalories
  };
};
