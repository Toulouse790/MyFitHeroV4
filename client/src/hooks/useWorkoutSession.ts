// client/src/hooks/useWorkoutSession.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';

export interface WorkoutSession {
  id: string;
  user_id?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en secondes
  targetDuration: number; // en minutes
  exercises: WorkoutExercise[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  caloriesBurned: number;
  notes?: string;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  completed: boolean;
  restTime: number; // en secondes
  category?: string;
  muscle_groups?: string[];
}

export interface ExerciseSet {
  reps: number;
  weight?: number;
  duration?: number; // pour les exercices chronométrés
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export const useWorkoutSession = () => {
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const appStoreUser = useAppStore((state) => state.appStoreUser);

  // Calculer les calories brûlées
  const calculateCalories = useCallback((durationMinutes: number): number => {
    const weight = appStoreUser?.weight_kg || 70;
    const metValue = 6; // MET moyen pour l'entraînement
    return Math.round(weight * metValue * (durationMinutes / 60));
  }, [appStoreUser?.weight_kg]);

  // Démarrer une nouvelle session
  const startSession = useCallback(async (
    workoutName: string, 
    targetDuration: number = 45,
    workoutType: WorkoutSession['workout_type'] = 'strength'
  ) => {
    if (!appStoreUser?.id) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const sessionId = `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newSession: WorkoutSession = {
        id: sessionId,
        user_id: appStoreUser.id,
        name: workoutName,
        startTime: new Date(),
        duration: 0,
        targetDuration,
        exercises: [],
        status: 'active',
        caloriesBurned: 0,
        workout_type: workoutType,
        difficulty: 'intermediate'
      };

      setCurrentSession(newSession);
      setIsSessionActive(true);
      setIsPaused(false);

      // Sauvegarde dans Supabase
      const { error } = await supabase
        .from('workouts')
        .insert({
          id: sessionId,
          user_id: appStoreUser.id,
          name: workoutName,
          workout_type: workoutType,
          started_at: new Date().toISOString(),
          status: 'active',
          target_duration: targetDuration,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        // Fallback localStorage
        localStorage.setItem('currentWorkoutSession', JSON.stringify(newSession));
      }

      toast({
        title: "Session démarrée",
        description: `Entraînement "${workoutName}" en cours`,
      });

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'workout_started', {
          workout_name: workoutName,
          workout_type: workoutType,
          user_id: appStoreUser.id
        });
      }

    } catch (error) {
      console.error('Erreur démarrage session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'entraînement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, toast]);

  // Mettre en pause la session
  const pauseSession = useCallback(async () => {
    if (!currentSession) return;

    const updatedSession = { 
      ...currentSession, 
      status: 'paused' as const 
    };
    
    setCurrentSession(updatedSession);
    setIsSessionActive(false);
    setIsPaused(true);

    // Sauvegarder l'état
    await supabase
      .from('workouts')
      .update({ status: 'paused' })
      .eq('id', currentSession.id);

    toast({
      title: "Session en pause",
      description: "Reprenez quand vous êtes prêt",
    });
  }, [currentSession, toast]);

  // Reprendre la session
  const resumeSession = useCallback(async () => {
    if (!currentSession) return;

    const updatedSession = { 
      ...currentSession, 
      status: 'active' as const 
    };
    
    setCurrentSession(updatedSession);
    setIsSessionActive(true);
    setIsPaused(false);

    await supabase
      .from('workouts')
      .update({ status: 'active' })
      .eq('id', currentSession.id);

    toast({
      title: "Session reprise",
      description: "Bon entraînement !",
    });
  }, [currentSession, toast]);

  // Terminer la session
  const completeSession = useCallback(async () => {
    if (!currentSession || !appStoreUser?.id) return;

    setIsLoading(true);

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      const calories = calculateCalories(duration / 60);

      const completedSession: WorkoutSession = {
        ...currentSession,
        endTime,
        duration,
        caloriesBurned: calories,
        status: 'completed'
      };

      setCurrentSession(completedSession);
      setIsSessionActive(false);

      // Sauvegarde finale
      await supabase
        .from('workouts')
        .update({
          status: 'completed',
          completed_at: endTime.toISOString(),
          duration_minutes: Math.floor(duration / 60),
          calories_burned: calories,
          exercises: currentSession.exercises
        })
        .eq('id', currentSession.id);

      // Mettre à jour les stats quotidiennes
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser.id,
          stat_date: today,
          workouts_completed: 1,
          total_workout_minutes: Math.floor(duration / 60),
          calories_burned: calories
        });

      localStorage.removeItem('currentWorkoutSession');

      toast({
        title: "Entraînement terminé ! 🎉",
        description: `${Math.floor(duration / 60)} min • ${calories} cal`,
      });

      // Reset après délai
      setTimeout(() => {
        setCurrentSession(null);
      }, 3000);

    } catch (error) {
      console.error('Erreur finalisation session:', error);
      toast({
        title: "Erreur",
        description: "Problème lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, appStoreUser?.id, calculateCalories, toast]);

  // Mettre à jour un set d'exercice
  const updateExerciseSet = useCallback(async (
    exerciseId: string, 
    setIndex: number, 
    updates: Partial<ExerciseSet>
  ) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          const updatedSets = exercise.sets.map((set, index) => {
            if (index === setIndex) {
              return { ...set, ...updates };
            }
            return set;
          });
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    };

    setCurrentSession(updatedSession);
    
    // Auto-save
    localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
  }, [currentSession]);

  // Marquer un exercice comme terminé
  const completeExercise = useCallback((exerciseId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return { ...exercise, completed: true };
        }
        return exercise;
      })
    };

    setCurrentSession(updatedSession);
    localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
  }, [currentSession]);

  // Charger les exercices de la dernière session
  const loadExercisesFromLastSession = useCallback(async (
    workoutName: string, 
    defaultExercises: Omit<WorkoutExercise, 'id'>[]
  ) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', appStoreUser?.id)
        .eq('name', workoutName)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return defaultExercises.map(exercise => ({
          ...exercise,
          id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          completed: false
        }));
      }

      const lastSession = data[0];
      return lastSession.exercises.map((exercise: WorkoutExercise) => ({
        ...exercise,
        id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        completed: false,
        sets: exercise.sets.map(set => ({ ...set, completed: false }))
      }));

    } catch (error) {
      console.error('Erreur chargement dernière session:', error);
      return defaultExercises.map(exercise => ({
        ...exercise,
        id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        completed: false
      }));
    }
  }, [appStoreUser?.id]);

  // Récupération session au chargement
  useEffect(() => {
    const loadSavedSession = async () => {
      if (appStoreUser?.id) {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .in('status', ['active', 'paused'])
            .order('started_at', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            const session = {
              ...data[0],
              startTime: new Date(data[0].started_at),
              endTime: data[0].completed_at ? new Date(data[0].completed_at) : undefined,
              exercises: data[0].exercises || []
            };
            setCurrentSession(session);
            setIsSessionActive(session.status === 'active');
            setIsPaused(session.status === 'paused');
            return;
          }
        } catch (error) {
          console.error('Erreur récupération session:', error);
        }
      }

      // Fallback localStorage
      const savedSession = localStorage.getItem('currentWorkoutSession');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          session.startTime = new Date(session.startTime);
          if (session.endTime) session.endTime = new Date(session.endTime);
          
          setCurrentSession(session);
          setIsSessionActive(session.status === 'active');
          setIsPaused(session.status === 'paused');
        } catch (error) {
          console.error('Erreur parsing session localStorage:', error);
        }
      }
    };

    loadSavedSession();
  }, [appStoreUser?.id]);

  return {
    currentSession,
    isSessionActive,
    isPaused,
    isLoading,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    updateExerciseSet,
    completeExercise,
    loadExercisesFromLastSession,
    calculateCalories
  };
};
