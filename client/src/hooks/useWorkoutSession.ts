// client/src/hooks/useWorkoutSession.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

/* ================================================================== */
/*                           INTERFACES                               */
/* ================================================================== */

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
  tags: string[];
  heartRateData?: HeartRateData[];
  environment?: 'gym' | 'home' | 'outdoor';
  temperature?: number;
  weather?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  sets: ExerciseSet[];
  completed: boolean;
  restTime: number; // en secondes
  actualRestTime?: number; // temps de repos réel
  equipment?: string;
  instructions?: string;
  video_url?: string;
  personal_best?: boolean;
}

export interface ExerciseSet {
  reps: number;
  weight?: number;
  duration?: number; // pour les exercices chronométrés
  distance?: number; // pour les exercices de cardio
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  rest_duration?: number;
  timestamp?: Date;
}

export interface HeartRateData {
  timestamp: Date;
  heartRate: number;
  zone: 'rest' | 'fat_burn' | 'aerobic' | 'anaerobic' | 'max';
}

export interface WorkoutStats {
  totalVolume: number; // poids total soulevé
  averageHeartRate?: number;
  maxHeartRate?: number;
  timeInZones?: Record<string, number>;
  setsCompleted: number;
  personalBests: number;
  estimatedRecoveryTime: number; // en heures
}

/* ================================================================== */
/*                        HOOK PRINCIPAL                              */
/* ================================================================== */

export const useWorkoutSession = () => {
  // States
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStats, setSessionStats] = useState<WorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks et refs
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const appStoreUser = useAppStore((state) => state.appStoreUser);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  /* ========================= FONCTIONS UTILITAIRES ========================= */

  // Calculer les calories avec algorithme amélioré
  const calculateCalories = useCallback((durationMinutes: number, intensity: number = 6): number => {
    const weight = appStoreUser?.weight_kg || 70;
    const age = appStoreUser?.age || 30;
    const gender = appStoreUser?.gender || 'male';
    
    // Facteur de correction selon le genre et l'âge
    const genderFactor = gender === 'female' ? 0.9 : 1.0;
    const ageFactor = age > 40 ? 0.95 : age < 25 ? 1.05 : 1.0;
    
    const baseMET = intensity;
    const adjustedMET = baseMET * genderFactor * ageFactor;
    
    return Math.round(weight * adjustedMET * (durationMinutes / 60));
  }, [appStoreUser?.weight_kg, appStoreUser?.age, appStoreUser?.gender]);

  // Calculer les statistiques de session
  const calculateSessionStats = useCallback((session: WorkoutSession): WorkoutStats => {
    const totalVolume = session.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => {
        return setTotal + ((set.weight || 0) * (set.reps || 0));
      }, 0);
    }, 0);

    const setsCompleted = session.exercises.reduce((total, exercise) => {
      return total + exercise.sets.filter(set => set.completed).length;
    }, 0);

    const personalBests = session.exercises.filter(ex => ex.personal_best).length;

    // Estimation du temps de récupération basé sur l'intensité
    const estimatedRecoveryTime = Math.max(12, totalVolume / 1000 * 24);

    return {
      totalVolume,
      setsCompleted,
      personalBests,
      estimatedRecoveryTime
    };
  }, []);

  // Sauvegarde automatique en base de données
  const autoSaveSession = useCallback(async (session: WorkoutSession) => {
    if (!session || !appStoreUser?.id) return;

    try {
      const sessionData = {
        id: session.id,
        user_id: appStoreUser.id,
        name: session.name,
        workout_type: session.workout_type,
        difficulty: session.difficulty,
        duration_minutes: Math.floor(session.duration / 60),
        calories_burned: session.caloriesBurned,
        exercises: session.exercises,
        notes: session.notes,
        started_at: session.startTime.toISOString(),
        ended_at: session.endTime?.toISOString(),
        status: session.status,
        tags: session.tags,
        environment: session.environment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('workouts')
        .upsert(sessionData);

      if (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        // Fallback vers localStorage
        localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Erreur auto-save:', error);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
    }
  }, [appStoreUser?.id]);

  /* ========================= FONCTIONS PRINCIPALES ========================= */

  // Démarrer une nouvelle session avec IA
  const startSession = useCallback(async (
    workoutName: string, 
    targetDuration: number = 45,
    workoutType: WorkoutSession['workout_type'] = 'strength',
    difficulty: WorkoutSession['difficulty'] = 'intermediate'
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
    setError(null);

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
        difficulty,
        tags: [],
        environment: 'gym' // Par défaut
      };

      setCurrentSession(newSession);
      setIsSessionActive(true);
      setIsPaused(false);

      // Sauvegarde initiale
      await autoSaveSession(newSession);

      // Timer de sauvegarde automatique toutes les 30 secondes
      autoSaveRef.current = setInterval(() => {
        autoSaveSession(newSession);
      }, 30000);

      toast({
        title: "Session démarrée",
        description: `Entraînement "${workoutName}" en cours`,
        action: {
          label: "Voir",
          onClick: () => console.log('Voir session')
        }
      });

      // Déclencher l'analytique
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'workout_started', {
          workout_name: workoutName,
          workout_type: workoutType,
          difficulty,
          user_id: appStoreUser.id
        });
      }

    } catch (error) {
      console.error('Erreur démarrage session:', error);
      setError('Impossible de démarrer la session');
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'entraînement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, toast, autoSaveSession]);

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

    await autoSaveSession(updatedSession);

    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    toast({
      title: "Session en pause",
      description: "Reprenez quand vous êtes prêt",
      variant: "default"
    });
  }, [currentSession, autoSaveSession, toast]);

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

    await autoSaveSession(updatedSession);

    // Redémarrer l'auto-save
    autoSaveRef.current = setInterval(() => {
      autoSaveSession(updatedSession);
    }, 30000);

    toast({
      title: "Session reprise",
      description: "Bon entraînement !",
      variant: "default"
    });
  }, [currentSession, autoSaveSession, toast]);

  // Terminer la session avec mise à jour complète
  const completeSession = useCallback(async () => {
    if (!currentSession || !appStoreUser?.id) return;

    setIsLoading(true);

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      const calories = calculateCalories(duration / 60, 6);
      const stats = calculateSessionStats(currentSession);

      const completedSession: WorkoutSession = {
        ...currentSession,
        endTime,
        duration,
        caloriesBurned: calories,
        status: 'completed'
      };

      setCurrentSession(completedSession);
      setIsSessionActive(false);
      setSessionStats(stats);

      // Sauvegarde finale en base
      await autoSaveSession(completedSession);

      // Mettre à jour les statistiques utilisateur dans daily_stats
      const today = new Date().toISOString().split('T')[0];
      const { error: statsError } = await supabase
        .from('daily_stats')
        .upsert({
          user_id: appStoreUser.id,
          stat_date: today,
          workouts_completed: 1,
          total_workout_minutes: Math.floor(duration / 60),
          calories_burned: calories,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,stat_date',
          ignoreDuplicates: false
        });

      if (statsError) {
        console.error('Erreur mise à jour stats:', statsError);
      }

      // Invalider les queries pour refresh les données
      queryClient.invalidateQueries(['workouts', appStoreUser.id]);
      queryClient.invalidateQueries(['daily_stats', appStoreUser.id]);

      // Nettoyer les timers
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }

      localStorage.removeItem('currentWorkoutSession');

      toast({
        title: "Entraînement terminé ! 🎉",
        description: `${Math.floor(duration / 60)} min • ${calories} cal • ${stats.setsCompleted} séries`,
        variant: "default"
      });

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'workout_completed', {
          workout_name: currentSession.name,
          duration_minutes: Math.floor(duration / 60),
          calories_burned: calories,
          sets_completed: stats.setsCompleted,
          total_volume: stats.totalVolume,
          user_id: appStoreUser.id
        });
      }

      // Reset après délai
      setTimeout(() => {
        setCurrentSession(null);
        setSessionStats(null);
      }, 5000);

    } catch (error) {
      console.error('Erreur finalisation session:', error);
      setError('Erreur lors de la sauvegarde');
      toast({
        title: "Erreur",
        description: "Problème lors de la sauvegarde. Vos données sont conservées localement.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, appStoreUser?.id, calculateCalories, calculateSessionStats, autoSaveSession, queryClient, toast]);

  // Annuler la session
  const cancelSession = useCallback(async () => {
    if (!currentSession) return;

    const cancelledSession = { 
      ...currentSession, 
      status: 'cancelled' as const,
      endTime: new Date()
    };
    
    setCurrentSession(cancelledSession);
    setIsSessionActive(false);

    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    localStorage.removeItem('currentWorkoutSession');

    toast({
      title: "Session annulée",
      description: "Votre entraînement a été arrêté",
      variant: "destructive"
    });

    setTimeout(() => {
      setCurrentSession(null);
    }, 2000);
  }, [currentSession, toast]);

  // Ajouter un exercice avec données enrichies
  const addExercise = useCallback(async (exercise: Omit<WorkoutExercise, 'id'>) => {
    if (!currentSession) return;

    const newExercise: WorkoutExercise = {
      ...exercise,
      id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      sets: exercise.sets || []
    };

    const updatedSession = {
      ...currentSession,
      exercises: [...currentSession.exercises, newExercise]
    };

    setCurrentSession(updatedSession);
    await autoSaveSession(updatedSession);
  }, [currentSession, autoSaveSession]);

  // Mettre à jour la durée de session
  const updateSessionDuration = useCallback(async (duration: number) => {
    if (!currentSession) return;

    const updatedSession = { 
      ...currentSession, 
      duration,
      caloriesBurned: calculateCalories(duration / 60)
    };
    
    setCurrentSession(updatedSession);
  }, [currentSession, calculateCalories]);

  // Mettre à jour un set avec IA pour recommandations
  const updateExerciseSet = useCallback(async (
    exerciseId: string, 
    setIndex: number, 
    updates: Partial<ExerciseSet>
  ) => {
    if (!currentSession || !appStoreUser?.id) return;

    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          const updatedSets = exercise.sets.map((set, index) => {
            if (index === setIndex) {
              const updatedSet = { 
                ...set, 
                ...updates,
                timestamp: new Date()
              };
              
              // Détecter un record personnel
              if (updates.weight !== undefined && updates.reps !== undefined) {
                checkPersonalBest(exercise.name, updates.weight, updates.reps);
              }
              
              return updatedSet;
            }
            return set;
          });
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    };

    setCurrentSession(updatedSession);
    await autoSaveSession(updatedSession);
  }, [currentSession, appStoreUser?.id, autoSaveSession]);

  // Vérifier les records personnels
  const checkPersonalBest = useCallback(async (exerciseName: string, weight: number, reps: number) => {
    if (!appStoreUser?.id) return;

    try {
      // Récupérer l'historique depuis Supabase
      const { data: history, error } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', appStoreUser.id)
        .eq('status', 'completed');

      if (error) return;

      // Analyser l'historique pour détecter les records
      let isPersonalBest = false;
      const currentOneRM = weight * (1 + (reps / 30)); // Formule Epley

      history.forEach(workout => {
        const exercises = workout.exercises || [];
        exercises.forEach((ex: WorkoutExercise) => {
          if (ex.name === exerciseName) {
            ex.sets.forEach(set => {
              if (set.weight && set.reps) {
                const pastOneRM = set.weight * (1 + (set.reps / 30));
                if (currentOneRM <= pastOneRM) {
                  isPersonalBest = false;
                }
              }
            });
          }
        });
      });

      if (isPersonalBest) {
        toast({
          title: "🏆 Record personnel !",
          description: `${exerciseName}: ${weight}kg x ${reps}`,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Erreur vérification record:', error);
    }
  }, [appStoreUser?.id, toast]);

  // Récupérer l'historique depuis Supabase
  const getSessionHistory = useCallback(async (): Promise<WorkoutSession[]> => {
    if (!appStoreUser?.id) return [];

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erreur récupération historique:', error);
        return JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      }

      return data || [];
    } catch (error) {
      console.error('Erreur historique:', error);
      return JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    }
  }, [appStoreUser?.id]);

  // Charger les exercices de la dernière session
  const loadExercisesFromLastSession = useCallback(async (
    workoutName: string, 
    defaultExercises: Omit<WorkoutExercise, 'id'>[]
  ): Promise<WorkoutExercise[]> => {
    if (!appStoreUser?.id) return [];

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', appStoreUser.id)
        .eq('name', workoutName)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
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
      // Tenter de récupérer depuis Supabase d'abord
      if (appStoreUser?.id) {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .in('status', ['active', 'paused'])
            .order('created_at', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) {
            const session = {
              ...data[0],
              startTime: new Date(data[0].started_at),
              endTime: data[0].ended_at ? new Date(data[0].ended_at) : undefined
            };
            setCurrentSession(session);
            setIsSessionActive(session.status === 'active');
            setIsPaused(session.status === 'paused');
            return;
          }
        } catch (error) {
          console.error('Erreur récupération session Supabase:', error);
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

  // Nettoyage des timers
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  return {
    // States
    currentSession,
    isSessionActive,
    isPaused,
    sessionStats,
    isLoading,
    error,
    
    // Actions principales
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    
    // Actions exercices
    addExercise,
    updateExerciseSet,
    loadExercisesFromLastSession,
    
    // Utilitaires
    updateSessionDuration,
    getSessionHistory,
    calculateCalories,
    calculateSessionStats
  };
};

export default useWorkoutSession;
