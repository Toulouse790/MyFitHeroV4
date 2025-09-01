// Export all hooks for easy importing

// Feature-specific hooks
export { useAuth } from '../features/auth/hooks/useAuth';
export { useWorkout } from '../features/workout/hooks/useWorkout';
export { useNutrition } from '../features/nutrition/hooks/useNutrition';
export { useRecovery } from '../features/recovery/hooks/useRecovery';

// Shared hooks
export { useAuth as useSharedAuth } from '../shared/hooks/useAuth';
export { useNotifications } from '../shared/hooks/useNotifications';
export { useForm } from '../shared/hooks/useForm';
export { useSupabase } from '../shared/hooks/useSupabase';

// Performance and utility hooks
export { usePerformanceMonitoring } from './usePerformanceMonitoring';

// Re-export hook types for convenience
export type { UseWorkoutReturn } from '../features/workout/hooks/useWorkout';
export type { UseNutritionReturn } from '../features/nutrition/hooks/useNutrition';
export type { UseRecoveryReturn } from '../features/recovery/hooks/useRecovery';

export type { UseAuthReturn } from '../shared/hooks/useAuth';
export type { UseNotificationsReturn, Notification } from '../shared/hooks/useNotifications';
export type { UseFormReturn, FormData, ValidationRule } from '../shared/hooks/useForm';
export type { UseSupabaseReturn } from '../shared/hooks/useSupabase';

// Performance hook types
export type { UsePerformanceMonitoringReturn } from './usePerformanceMonitoring';

// Hook collections for feature sets
export const authHooks = {
  useAuth: () => import('../features/auth/hooks/useAuth').then(m => m.useAuth),
  useSharedAuth: () => import('../shared/hooks/useAuth').then(m => m.useAuth),
};

export const workoutHooks = {
  useWorkout: () => import('../features/workout/hooks/useWorkout').then(m => m.useWorkout),
};

export const nutritionHooks = {
  useNutrition: () => import('../features/nutrition/hooks/useNutrition').then(m => m.useNutrition),
};

export const recoveryHooks = {
  useRecovery: () => import('../features/recovery/hooks/useRecovery').then(m => m.useRecovery),
};

export const sharedHooks = {
  useNotifications: () => import('../shared/hooks/useNotifications').then(m => m.useNotifications),
  useForm: () => import('../shared/hooks/useForm').then(m => m.useForm),
  useSupabase: () => import('../shared/hooks/useSupabase').then(m => m.useSupabase),
};

export const utilityHooks = {
  usePerformanceMonitoring: () => import('./usePerformanceMonitoring').then(m => m.usePerformanceMonitoring),
};

// Default export with all hooks grouped
export default {
  auth: authHooks,
  workout: workoutHooks,
  nutrition: nutritionHooks,
  recovery: recoveryHooks,
  shared: sharedHooks,
  utility: utilityHooks,
};
