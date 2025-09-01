import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Utility function for lazy loading with retry mechanism
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (i === retries) {
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw lastError!;
  });
}

// Preload a component module
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFunc();
}

// Lazy load with loading state tracking
export function lazyWithLoadingState<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  onLoadingChange?: (loading: boolean) => void
): LazyExoticComponent<T> {
  return lazy(async () => {
    onLoadingChange?.(true);
    try {
      const module = await importFunc();
      onLoadingChange?.(false);
      return module;
    } catch (error) {
      onLoadingChange?.(false);
      throw error;
    }
  });
}

// Common lazy loaded components
export const LazyDashboard = lazyWithRetry(() => import('../pages/Dashboard/Dashboard'));
export const LazyWorkouts = lazyWithRetry(() => import('../pages/Workouts/Workouts'));
export const LazyNutrition = lazyWithRetry(() => import('../pages/Nutrition/Nutrition'));
export const LazyRecovery = lazyWithRetry(() => import('../pages/Recovery/Recovery'));
export const LazyProfile = lazyWithRetry(() => import('../pages/Profile/Profile'));
export const LazySettings = lazyWithRetry(() => import('../pages/Settings/Settings'));
export const LazyAdmin = lazyWithRetry(() => import('../pages/Admin/Admin'));

// Auth pages
export const LazyLogin = lazyWithRetry(() => import('../pages/Auth/Login'));
export const LazyRegister = lazyWithRetry(() => import('../pages/Auth/Register'));
export const LazyForgotPassword = lazyWithRetry(() => import('../pages/Auth/ForgotPassword'));

// Feature components
export const LazyWorkoutBuilder = lazyWithRetry(() => import('../features/workout/components/WorkoutBuilder'));
export const LazyNutritionTracker = lazyWithRetry(() => import('../features/nutrition/components/NutritionTracker'));
export const LazyRecoveryDashboard = lazyWithRetry(() => import('../features/recovery/components/RecoveryDashboard'));

// Advanced lazy loading with code splitting by feature
export const loadFeature = {
  auth: () => import('../features/auth'),
  workout: () => import('../features/workout'),
  nutrition: () => import('../features/nutrition'),
  recovery: () => import('../features/recovery'),
  admin: () => import('../features/admin'),
  landing: () => import('../features/landing')
};

// Chunk preloading utilities
export const preloadChunks = {
  dashboard: () => Promise.all([
    preloadComponent(() => import('../pages/Dashboard/Dashboard')),
    loadFeature.workout(),
    loadFeature.nutrition(),
    loadFeature.recovery()
  ]),
  
  auth: () => Promise.all([
    preloadComponent(() => import('../pages/Auth/Login')),
    preloadComponent(() => import('../pages/Auth/Register')),
    loadFeature.auth()
  ]),
  
  workouts: () => Promise.all([
    preloadComponent(() => import('../pages/Workouts/Workouts')),
    preloadComponent(() => import('../features/workout/components/WorkoutBuilder')),
    loadFeature.workout()
  ]),
  
  nutrition: () => Promise.all([
    preloadComponent(() => import('../pages/Nutrition/Nutrition')),
    preloadComponent(() => import('../features/nutrition/components/NutritionTracker')),
    loadFeature.nutrition()
  ])
};

// Route-based preloading
export const preloadForRoute = (routeName: string): Promise<unknown> => {
  switch (routeName) {
    case 'dashboard':
      return preloadChunks.dashboard();
    case 'auth':
      return preloadChunks.auth();
    case 'workouts':
      return preloadChunks.workouts();
    case 'nutrition':
      return preloadChunks.nutrition();
    default:
      return Promise.resolve();
  }
};

// Error boundary for lazy components
export const LazyErrorBoundary = lazyWithRetry(() => import('../components/ErrorBoundary'));

export default {
  lazyWithRetry,
  preloadComponent,
  lazyWithLoadingState,
  preloadChunks,
  preloadForRoute,
  loadFeature
};
