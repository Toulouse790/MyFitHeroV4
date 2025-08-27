import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createWorkoutSlice, WorkoutSlice } from './slices/workout.slice';

// Store principal unifié
export interface AppStore extends WorkoutSlice {}

export const useAppStoreUnified = create<AppStore>()(
  persist(
    (...a) => ({
      ...createWorkoutSlice(...a),
    }),
    {
      name: 'myfithero-storage',
      partialize: (state) => ({
        // Persister seulement les données importantes
        sessionHistory: state.sessionHistory,
        favoriteExercises: state.favoriteExercises,
        totalWorkouts: state.totalWorkouts,
        totalTimeSpent: state.totalTimeSpent,
        totalCaloriesBurned: state.totalCaloriesBurned,
        defaultRestTime: state.defaultRestTime,
        quickModeEnabled: state.quickModeEnabled,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useWorkoutSession = () => useAppStoreUnified(state => ({
  currentSession: state.currentSession,
  isSessionActive: state.isSessionActive,
  startWorkoutSession: state.startWorkoutSession,
  pauseWorkoutSession: state.pauseWorkoutSession,
  resumeWorkoutSession: state.resumeWorkoutSession,
  completeWorkoutSession: state.completeWorkoutSession,
  cancelWorkoutSession: state.cancelWorkoutSession,
}));

export const useWorkoutExercises = () => useAppStoreUnified(state => ({
  exercises: state.currentSession?.exercises || [],
  updateSessionExercise: state.updateSessionExercise,
  updateExerciseSet: state.updateExerciseSet,
  completeExercise: state.completeExercise,
  addSetToExercise: state.addSetToExercise,
  removeSetFromExercise: state.removeSetFromExercise,
}));

export const useWorkoutStats = () => useAppStoreUnified(state => ({
  totalWorkouts: state.totalWorkouts,
  totalTimeSpent: state.totalTimeSpent,
  totalCaloriesBurned: state.totalCaloriesBurned,
  sessionHistory: state.sessionHistory,
  incrementTotalWorkouts: state.incrementTotalWorkouts,
  addTimeSpent: state.addTimeSpent,
  addCaloriesBurned: state.addCaloriesBurned,
}));

export const useWorkoutFavorites = () => useAppStoreUnified(state => ({
  favoriteExercises: state.favoriteExercises,
  addFavoriteExercise: state.addFavoriteExercise,
  removeFavoriteExercise: state.removeFavoriteExercise,
}));

export const useWorkoutSettings = () => useAppStoreUnified(state => ({
  defaultRestTime: state.defaultRestTime,
  quickModeEnabled: state.quickModeEnabled,
  notificationsEnabled: state.notificationsEnabled,
  setQuickMode: state.setQuickMode,
  setDefaultRestTime: state.setDefaultRestTime,
  setNotifications: state.setNotifications,
}));
