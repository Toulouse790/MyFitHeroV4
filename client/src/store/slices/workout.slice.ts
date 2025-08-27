import { StateCreator } from 'zustand';
import { WorkoutExercise, WorkoutSession } from '@/types/workout';

export interface WorkoutState {
  // Session actuelle
  currentSession: WorkoutSession | null;
  isSessionActive: boolean;
  
  // Historique des sessions
  sessionHistory: WorkoutSession[];
  
  // Exercices favoris
  favoriteExercises: WorkoutExercise[];
  
  // Statistiques
  totalWorkouts: number;
  totalTimeSpent: number;
  totalCaloriesBurned: number;
  
  // Préférences
  defaultRestTime: number;
  quickModeEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface WorkoutActions {
  // Session actions
  startWorkoutSession: (name: string, exercises: WorkoutExercise[]) => void;
  pauseWorkoutSession: () => void;
  resumeWorkoutSession: () => void;
  completeWorkoutSession: () => void;
  cancelWorkoutSession: () => void;
  
  // Exercise actions
  updateSessionExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => void;
  updateExerciseSet: (exerciseId: string, setIndex: number, updates: any) => void;
  completeExercise: (exerciseId: string) => void;
  addSetToExercise: (exerciseId: string) => void;
  removeSetFromExercise: (exerciseId: string, setIndex: number) => void;
  
  // Favorites
  addFavoriteExercise: (exercise: WorkoutExercise) => void;
  removeFavoriteExercise: (exerciseId: string) => void;
  
  // Settings
  setQuickMode: (enabled: boolean) => void;
  setDefaultRestTime: (seconds: number) => void;
  setNotifications: (enabled: boolean) => void;
  
  // Stats
  incrementTotalWorkouts: () => void;
  addTimeSpent: (seconds: number) => void;
  addCaloriesBurned: (calories: number) => void;
}

export type WorkoutSlice = WorkoutState & WorkoutActions;

export const createWorkoutSlice: StateCreator<
  WorkoutSlice,
  [],
  [],
  WorkoutSlice
> = (set, get) => ({
  // État initial
  currentSession: null,
  isSessionActive: false,
  sessionHistory: [],
  favoriteExercises: [],
  totalWorkouts: 0,
  totalTimeSpent: 0,
  totalCaloriesBurned: 0,
  defaultRestTime: 60,
  quickModeEnabled: false,
  notificationsEnabled: true,

  // Session actions
  startWorkoutSession: (name: string, exercises: WorkoutExercise[]) => {
    const newSession: WorkoutSession = {
      id: `session_${Date.now()}`,
      name,
      exercises,
      startTime: new Date(),
      status: 'active',
      totalTime: 0,
      estimatedCalories: 0
    };

    set({
      currentSession: newSession,
      isSessionActive: true
    });
  },

  pauseWorkoutSession: () => {
    set(state => ({
      isSessionActive: false,
      currentSession: state.currentSession ? {
        ...state.currentSession,
        status: 'paused'
      } : null
    }));
  },

  resumeWorkoutSession: () => {
    set(state => ({
      isSessionActive: true,
      currentSession: state.currentSession ? {
        ...state.currentSession,
        status: 'active'
      } : null
    }));
  },

  completeWorkoutSession: () => {
    const state = get();
    if (state.currentSession) {
      const completedSession = {
        ...state.currentSession,
        status: 'completed' as const,
        endTime: new Date(),
        totalTime: state.currentSession.totalTime || 0
      };

      set({
        currentSession: null,
        isSessionActive: false,
        sessionHistory: [completedSession, ...state.sessionHistory].slice(0, 50), // Garder les 50 dernières
        totalWorkouts: state.totalWorkouts + 1,
        totalTimeSpent: state.totalTimeSpent + (completedSession.totalTime || 0),
        totalCaloriesBurned: state.totalCaloriesBurned + (completedSession.estimatedCalories || 0)
      });
    }
  },

  cancelWorkoutSession: () => {
    set({
      currentSession: null,
      isSessionActive: false
    });
  },

  // Exercise actions
  updateSessionExercise: (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    set(state => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        exercises: state.currentSession.exercises.map(exercise =>
          exercise.id === exerciseId ? { ...exercise, ...updates } : exercise
        )
      } : null
    }));
  },

  updateExerciseSet: (exerciseId: string, setIndex: number, updates: any) => {
    set(state => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        exercises: state.currentSession.exercises.map(exercise => {
          if (exercise.id === exerciseId && exercise.sets) {
            const updatedSets = [...exercise.sets];
            updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        })
      } : null
    }));
  },

  completeExercise: (exerciseId: string) => {
    get().updateSessionExercise(exerciseId, { completed: true });
  },

  addSetToExercise: (exerciseId: string) => {
    set(state => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        exercises: state.currentSession.exercises.map(exercise => {
          if (exercise.id === exerciseId && exercise.sets) {
            const lastSet = exercise.sets[exercise.sets.length - 1];
            const newSet = {
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
      } : null
    }));
  },

  removeSetFromExercise: (exerciseId: string, setIndex: number) => {
    set(state => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        exercises: state.currentSession.exercises.map(exercise => {
          if (exercise.id === exerciseId && exercise.sets && exercise.sets.length > 1) {
            const updatedSets = exercise.sets.filter((_, index) => index !== setIndex);
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        })
      } : null
    }));
  },

  // Favorites
  addFavoriteExercise: (exercise: WorkoutExercise) => {
    set(state => ({
      favoriteExercises: [...state.favoriteExercises.filter(e => e.id !== exercise.id), exercise]
    }));
  },

  removeFavoriteExercise: (exerciseId: string) => {
    set(state => ({
      favoriteExercises: state.favoriteExercises.filter(e => e.id !== exerciseId)
    }));
  },

  // Settings
  setQuickMode: (enabled: boolean) => {
    set({ quickModeEnabled: enabled });
  },

  setDefaultRestTime: (seconds: number) => {
    set({ defaultRestTime: seconds });
  },

  setNotifications: (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
  },

  // Stats
  incrementTotalWorkouts: () => {
    set(state => ({ totalWorkouts: state.totalWorkouts + 1 }));
  },

  addTimeSpent: (seconds: number) => {
    set(state => ({ totalTimeSpent: state.totalTimeSpent + seconds }));
  },

  addCaloriesBurned: (calories: number) => {
    set(state => ({ totalCaloriesBurned: state.totalCaloriesBurned + calories }));
  }
});
