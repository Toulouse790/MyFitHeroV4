import { useState, useEffect, useCallback } from 'react';
import { WorkoutService } from '../services/WorkoutService';
import type { 
  Workout, 
  WorkoutSession, 
  Exercise, 
  CreateWorkoutData, 
  UpdateWorkoutData, 
  WorkoutStats 
} from '../types/WorkoutTypes';

export interface UseWorkoutReturn {
  // État
  workouts: Workout[];
  currentSession: WorkoutSession | null;
  activeWorkout: Workout | null;
  stats: WorkoutStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createWorkout: (data: CreateWorkoutData) => Promise<void>;
  updateWorkout: (id: string, data: UpdateWorkoutData) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  startWorkout: (workoutId: string) => Promise<void>;
  pauseWorkout: () => Promise<void>;
  resumeWorkout: () => Promise<void>;
  completeWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  logExercise: (exerciseId: string, sets: number, reps: number, weight?: number) => Promise<void>;
  refreshWorkouts: () => Promise<void>;

  // Getters
  getWorkoutDuration: () => number;
  getCompletedExercises: () => Exercise[];
  getTotalWorkouts: () => number;
}

export function useWorkout(userId?: string): UseWorkoutReturn {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || 'current-user';

  // Chargement des workouts
  const loadWorkouts = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const workoutsData = await WorkoutService.getWorkouts(currentUserId);
      setWorkouts(workoutsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des workouts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Chargement des statistiques
  const loadStats = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const statsData = await WorkoutService.getWorkoutStats(currentUserId);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  }, [currentUserId]);

  // Création de workout
  const createWorkout = useCallback(async (data: CreateWorkoutData) => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newWorkout = await WorkoutService.createWorkout(currentUserId, data);
      setWorkouts(prev => [...prev, newWorkout]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du workout';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Mise à jour de workout
  const updateWorkout = useCallback(async (id: string, data: UpdateWorkoutData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedWorkout = await WorkoutService.updateWorkout(id, data);
      setWorkouts(prev => prev.map(w => w.id === id ? updatedWorkout : w));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du workout';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Suppression de workout
  const deleteWorkout = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await WorkoutService.deleteWorkout(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du workout';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Démarrage de workout
  const startWorkout = useCallback(async (workoutId: string) => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const session = await WorkoutService.startWorkoutSession(currentUserId, workoutId);
      const workout = workouts.find(w => w.id === workoutId);
      setCurrentSession(session);
      setActiveWorkout(workout || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du démarrage du workout';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, workouts]);

  // Pause de workout
  const pauseWorkout = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      const updatedSession = await WorkoutService.pauseWorkoutSession(currentSession.id);
      setCurrentSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise en pause';
      setError(errorMessage);
    }
  }, [currentSession]);

  // Reprise de workout
  const resumeWorkout = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      const updatedSession = await WorkoutService.resumeWorkoutSession(currentSession.id);
      setCurrentSession(updatedSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la reprise';
      setError(errorMessage);
    }
  }, [currentSession]);

  // Finalisation de workout
  const completeWorkout = useCallback(async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await WorkoutService.completeWorkoutSession(currentSession.id);
      setCurrentSession(null);
      setActiveWorkout(null);
      await loadStats(); // Recharger les stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la finalisation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, loadStats]);

  // Annulation de workout
  const cancelWorkout = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      await WorkoutService.cancelWorkoutSession(currentSession.id);
      setCurrentSession(null);
      setActiveWorkout(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      setError(errorMessage);
    }
  }, [currentSession]);

  // Log d'exercice
  const logExercise = useCallback(async (exerciseId: string, sets: number, reps: number, weight?: number) => {
    if (!currentSession) return;
    
    try {
      await WorkoutService.logExercise(currentSession.id, exerciseId, { sets, reps, weight });
      // Optionnel: recharger la session pour avoir les données à jour
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'exercice';
      setError(errorMessage);
    }
  }, [currentSession]);

  // Rafraîchissement
  const refreshWorkouts = useCallback(async () => {
    await Promise.all([loadWorkouts(), loadStats()]);
  }, [loadWorkouts, loadStats]);

  // Getters
  const getWorkoutDuration = useCallback((): number => {
    if (!currentSession || !currentSession.startTime) return 0;
    const now = new Date();
    const start = new Date(currentSession.startTime);
    return Math.floor((now.getTime() - start.getTime()) / 1000); // en secondes
  }, [currentSession]);

  const getCompletedExercises = useCallback((): Exercise[] => {
    if (!activeWorkout) return [];
    // Logique pour déterminer les exercices complétés
    return activeWorkout.exercises.filter(exercise => {
      // Ici, vous devriez vérifier si l'exercice a été complété dans la session
      return false; // Placeholder
    });
  }, [activeWorkout]);

  const getTotalWorkouts = useCallback((): number => {
    return workouts.length;
  }, [workouts]);

  // Chargement initial
  useEffect(() => {
    refreshWorkouts();
  }, [refreshWorkouts]);

  return {
    workouts,
    currentSession,
    activeWorkout,
    stats,
    isLoading,
    error,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
    cancelWorkout,
    logExercise,
    refreshWorkouts,
    getWorkoutDuration,
    getCompletedExercises,
    getTotalWorkouts
  };
}
