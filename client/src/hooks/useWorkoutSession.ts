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
    getSessionHistory
  };
};
