import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Error boundary for lazy loaded components
export const LazyComponentError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load component</h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button onClick={retry} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Retry
    </button>
  </div>
);

// Loading fallback component
export const LazyComponentLoading = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
    <span className="ml-3 text-gray-600">{message}</span>
  </div>
);

// Helper to create lazy components with built-in error handling
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
): LazyExoticComponent<T> => {
  return lazy(async () => {
    try {
      const module = await importFunc();
      return module;
    } catch {
      // Erreur silencieuse
      console.error('Lazy loading error:', error);
      // Return error component as fallback
      if (fallback) {
        return { default: fallback as T };
      }
      throw error;
    }
  });
};

// Pre-defined lazy loaded components for main features
export const LazyComponents = {
  // Auth components
  LoginPage: createLazyComponent(() => import('../features/auth/pages/LoginPage')),
  RegisterPage: createLazyComponent(() => import('../features/auth/pages/RegisterPage')),
  ProfilePage: createLazyComponent(() => import('../features/auth/pages/ProfilePage')),

  // Workout components
  WorkoutDashboard: createLazyComponent(() => import('../features/workout/pages/WorkoutDashboard')),
  WorkoutSession: createLazyComponent(() => import('../features/workout/pages/WorkoutSession')),
  WorkoutHistory: createLazyComponent(() => import('../features/workout/pages/WorkoutHistory')),

  // Nutrition components
  NutritionDashboard: createLazyComponent(
    () => import('../features/nutrition/pages/NutritionDashboard')
  ),
  MealPlanner: createLazyComponent(() => import('../features/nutrition/pages/MealPlanner')),
  NutritionTracking: createLazyComponent(
    () => import('../features/nutrition/pages/NutritionTracking')
  ),

  // Recovery components
  RecoveryDashboard: createLazyComponent(
    () => import('../features/recovery/pages/RecoveryDashboard')
  ),
  RecoveryMetrics: createLazyComponent(() => import('../features/recovery/pages/RecoveryMetrics')),

  // Admin components
  AdminDashboard: createLazyComponent(() => import('../features/admin/pages/AdminPage')),
  UserManagement: createLazyComponent(() => import('../features/admin/pages/UserManagement')),

  // Landing components
  LandingPage: createLazyComponent(() => import('../features/landing/pages/LandingPage')),
  AboutPage: createLazyComponent(() => import('../features/landing/pages/AboutPage')),

  // Shared components
  NotificationCenter: createLazyComponent(() => import('../shared/components/NotificationCenter')),
  SettingsPage: createLazyComponent(() => import('../shared/components/SettingsPage')),
};

// Utility functions for preloading
export const preloadComponent = (componentImport: () => Promise<any>): void => {
  // Preload in the next tick to avoid blocking
  setTimeout(() => {
    componentImport().catch(error => {
      console.warn('Preload failed:', error);
    });
  }, 0);
};

export const preloadRoute = (routePath: string): void => {
  const routeComponents: Record<string, () => Promise<any>> = {
    '/login': () => import('../features/auth/pages/LoginPage'),
    '/register': () => import('../features/auth/pages/RegisterPage'),
    '/profile': () => import('../features/auth/pages/ProfilePage'),
    '/workout': () => import('../features/workout/pages/WorkoutDashboard'),
    '/nutrition': () => import('../features/nutrition/pages/NutritionDashboard'),
    '/recovery': () => import('../features/recovery/pages/RecoveryDashboard'),
    '/admin': () => import('../features/admin/pages/AdminPage'),
  };

  const componentImport = routeComponents[routePath];
  if (componentImport) {
    preloadComponent(componentImport);
  }
};

// Batch preload critical routes
export const preloadCriticalRoutes = (): void => {
  const criticalRoutes = ['/login', '/workout', '/nutrition'];
  criticalRoutes.forEach(preloadRoute);
};

// Hook for lazy loading with loading state
export const useLazyComponent = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyComponent = createLazyComponent(importFunc);
  return LazyComponent;
};

// Route-based lazy loading configuration
export const routeLazyMap = {
  // Auth routes
  '/login': LazyComponents.LoginPage,
  '/register': LazyComponents.RegisterPage,
  '/profile': LazyComponents.ProfilePage,

  // Feature routes
  '/workout': LazyComponents.WorkoutDashboard,
  '/workout/session': LazyComponents.WorkoutSession,
  '/workout/history': LazyComponents.WorkoutHistory,

  '/nutrition': LazyComponents.NutritionDashboard,
  '/nutrition/meals': LazyComponents.MealPlanner,
  '/nutrition/tracking': LazyComponents.NutritionTracking,

  '/recovery': LazyComponents.RecoveryDashboard,
  '/recovery/metrics': LazyComponents.RecoveryMetrics,

  // Admin routes
  '/admin': LazyComponents.AdminDashboard,
  '/admin/users': LazyComponents.UserManagement,

  // Landing routes
  '/': LazyComponents.LandingPage,
  '/about': LazyComponents.AboutPage,
};

export default LazyComponents;
