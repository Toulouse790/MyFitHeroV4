// client/src/hooks/useWorkoutSession.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useAppStore } from '@/stores/useAppStore';

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // en secondes
  targetDuration: number; // en minutes
  exercises: WorkoutExercise[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  caloriesBurned: number;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  completed: boolean;
  restTime: number; // en secondes
}

export interface ExerciseSet {
  reps: number;
  weight?: number;
  duration?: number; // pour les exercices chronométrés
  completed: boolean;
}

export const useWorkoutSession = () => {
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { toast } = useToast();
  const appStoreUser = useAppStore((state) => state.appStoreUser);

  // Calculer les calories brûlées (estimation basique)
  const calculateCalories = useCallback((durationMinutes: number): number => {
    // Utiliser le poids réel de l'utilisateur ou valeur par défaut
    const weight = appStoreUser?.weight_kg || 70;
    const metValue = 6; // MET moyen pour l'entraînement
    return Math.round(weight * metValue * (durationMinutes / 60));
  }, [appStoreUser?.weight_kg]);

  // Démarrer une nouvelle session
  const startSession = useCallback((workoutName: string, targetDuration: number = 30) => {
    const session: WorkoutSession = {
      id: Date.now().toString(),
      name: workoutName,
      startTime: new Date(),
      duration: 0,
      targetDuration,
      exercises: [],
      status: 'active',
      caloriesBurned: 0
    };

    setCurrentSession(session);
    setIsSessionActive(true);
    
    toast({
      title: "Session démarrée",
      description: `Entraînement "${workoutName}" en cours`,
      variant: "default"
    });

    // Sauvegarder dans le localStorage
    localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
  }, [toast]);

  // Mettre en pause la session
  const pauseSession = useCallback(() => {
    if (currentSession) {
      const updatedSession = { ...currentSession, status: 'paused' as const };
      setCurrentSession(updatedSession);
      setIsSessionActive(false);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Reprendre la session
  const resumeSession = useCallback(() => {
    if (currentSession) {
      const updatedSession = { ...currentSession, status: 'active' as const };
      setCurrentSession(updatedSession);
      setIsSessionActive(true);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Terminer la session
  const completeSession = useCallback(() => {
    if (currentSession) {
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

      toast({
        title: "Session terminée !",
        description: `${Math.floor(duration / 60)} minutes d'entraînement complétées`,
        variant: "default"
      });

      // Sauvegarder dans l'historique
      const sessionHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      sessionHistory.push(completedSession);
      localStorage.setItem('workoutHistory', JSON.stringify(sessionHistory));
      
      // Nettoyer la session courante
      localStorage.removeItem('currentWorkoutSession');
      
      // Réinitialiser après un délai
      setTimeout(() => {
        setCurrentSession(null);
      }, 3000);
    }
  }, [currentSession, calculateCalories, toast]);

  // Annuler la session
  const cancelSession = useCallback(() => {
    if (currentSession) {
      const cancelledSession = { ...currentSession, status: 'cancelled' as const };
      setCurrentSession(cancelledSession);
      setIsSessionActive(false);
      
      localStorage.removeItem('currentWorkoutSession');
      
      toast({
        title: "Session annulée",
        description: "Votre entraînement a été arrêté",
        variant: "destructive"
      });
      
      setTimeout(() => {
        setCurrentSession(null);
      }, 2000);
    }
  }, [currentSession, toast]);

  // Ajouter un exercice
  const addExercise = useCallback((exercise: Omit<WorkoutExercise, 'id'>) => {
    if (currentSession) {
      const newExercise: WorkoutExercise = {
        ...exercise,
        id: Date.now().toString()
      };

      const updatedSession = {
        ...currentSession,
        exercises: [...currentSession.exercises, newExercise]
      };

      setCurrentSession(updatedSession);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Mettre à jour la durée de la session
  const updateSessionDuration = useCallback((duration: number) => {
    if (currentSession) {
      const updatedSession = { ...currentSession, duration };
      setCurrentSession(updatedSession);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Mettre à jour un set spécifique d'un exercice
  const updateExerciseSet = useCallback((exerciseId: string, setIndex: number, updates: Partial<ExerciseSet>) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        exercises: currentSession.exercises.map(exercise => {
          if (exercise.id === exerciseId) {
            const updatedSets = exercise.sets.map((set, index) => {
              if (index === setIndex) {
                const updatedSet = { ...set, ...updates };
                
                // Si le poids est mis à jour, sauvegarder dans l'historique
                if (updates.weight !== undefined) {
                  saveExerciseWeightHistory(exercise.name, updates.weight);
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
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Sauvegarder l'historique des poids pour un exercice
  const saveExerciseWeightHistory = useCallback((exerciseName: string, weight: number) => {
    const weightHistory = JSON.parse(localStorage.getItem('exerciseWeightHistory') || '{}');
    
    if (!weightHistory[exerciseName]) {
      weightHistory[exerciseName] = [];
    }
    
    // Ajouter le nouveau poids avec la date
    weightHistory[exerciseName].push({
      weight,
      date: new Date().toISOString(),
      userId: appStoreUser?.id
    });
    
    // Garder seulement les 10 dernières entrées
    if (weightHistory[exerciseName].length > 10) {
      weightHistory[exerciseName] = weightHistory[exerciseName].slice(-10);
    }
    
    localStorage.setItem('exerciseWeightHistory', JSON.stringify(weightHistory));
  }, [appStoreUser?.id]);

  // Récupérer le dernier poids utilisé pour un exercice
  const getLastWeightForExercise = useCallback((exerciseName: string): number | undefined => {
    const weightHistory = JSON.parse(localStorage.getItem('exerciseWeightHistory') || '{}');
    const exerciseHistory = weightHistory[exerciseName];
    
    if (exerciseHistory && exerciseHistory.length > 0) {
      // Retourner le poids le plus récent pour cet utilisateur
      const userWeights = exerciseHistory.filter((entry: any) => entry.userId === appStoreUser?.id);
      if (userWeights.length > 0) {
        return userWeights[userWeights.length - 1].weight;
      }
    }
    
    return undefined;
  }, [appStoreUser?.id]);

  // Marquer un exercice comme terminé
  const completeExercise = useCallback((exerciseId: string) => {
    if (currentSession) {
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
    }
  }, [currentSession]);

  // Récupérer les données de la dernière séance d'un workout spécifique
  const getLastSessionData = useCallback((workoutName: string): WorkoutSession | null => {
    const sessionHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    
    // Trouver la dernière séance complétée avec le même nom
    const lastSession = sessionHistory
      .filter((session: WorkoutSession) => 
        session.name === workoutName && 
        session.status === 'completed'
      )
      .sort((a: WorkoutSession, b: WorkoutSession) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )[0];

    return lastSession || null;
  }, []);

  // Préremplir les exercices avec les données de la dernière séance
  const loadExercisesFromLastSession = useCallback((workoutName: string, defaultExercises: Omit<WorkoutExercise, 'id'>[]) => {
    const lastSession = getLastSessionData(workoutName);
    
    if (lastSession && lastSession.exercises.length > 0) {
      // Utiliser les données de la dernière séance
      const exercisesFromLastSession = lastSession.exercises.map(exercise => ({
        ...exercise,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Nouvel ID pour cette session
        completed: false, // Réinitialiser le statut de completion
        sets: exercise.sets.map(set => ({ ...set, completed: false })) // Réinitialiser les sets
      }));
      
      return exercisesFromLastSession;
    }
    
    // Si pas de données précédentes, utiliser les exercices par défaut avec historique des poids
    return defaultExercises.map(exercise => {
      const lastWeight = getLastWeightForExercise(exercise.name);
      return {
        ...exercise,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        sets: exercise.sets.map(set => ({
          ...set,
          weight: lastWeight || set.weight // Utiliser le dernier poids connu ou le poids par défaut
        }))
      };
    });
  }, [getLastSessionData, getLastWeightForExercise]);

  // Ajouter une série à un exercice
  const addSetToExercise = useCallback((exerciseId: string) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        exercises: currentSession.exercises.map(exercise => {
          if (exercise.id === exerciseId) {
            // Récupérer les données de la dernière série pour pré-remplir
            const lastSet = exercise.sets[exercise.sets.length - 1];
            const newSet: ExerciseSet = {
              reps: lastSet?.reps || 10,
              weight: lastSet?.weight,
              duration: lastSet?.duration,
              completed: false
            };
            
            return {
              ...exercise,
              sets: [...exercise.sets, newSet]
            };
          }
          return exercise;
        })
      };

      setCurrentSession(updatedSession);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Supprimer une série d'un exercice
  const removeSetFromExercise = useCallback((exerciseId: string, setIndex: number) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        exercises: currentSession.exercises.map(exercise => {
          if (exercise.id === exerciseId && exercise.sets.length > 1) {
            const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        })
      };

      setCurrentSession(updatedSession);
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
    }
  }, [currentSession]);

  // Récupérer l'historique des sessions
  const getSessionHistory = useCallback((): WorkoutSession[] => {
    return JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  }, []);

  // Récupérer la session courante au chargement
  useEffect(() => {
    const savedSession = localStorage.getItem('currentWorkoutSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setCurrentSession(session);
      setIsSessionActive(session.status === 'active');
    }
  }, []);

  return {
    currentSession,
    isSessionActive,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    addExercise,
    updateSessionDuration,
    getSessionHistory,
    updateExerciseSet,
    completeExercise,
    getLastSessionData,
    loadExercisesFromLastSession,
    addSetToExercise,
    removeSetFromExercise,
    getLastWeightForExercise
  };
};
