import { lazy } from 'react';

// === FEATURES-BASED IMPORTS ===
export const LazySleep = lazy(() => import('@/features/sleep/pages/SleepPage'));
export const LazySocial = lazy(() => import('@/features/social/pages/SocialPage'));
export const LazyHydration = lazy(() => import('@/features/hydration/pages/HydrationPage'));
export const LazyWorkout = lazy(() => import('@/features/workout/pages/WorkoutPage'));

// === LEGACY IMPORTS (à migrer) ===
export const LazyNutrition = lazy(() => import('@/pages/Nutrition'));
export const LazyProfile = lazy(() => import('@/pages/ProfileComplete'));
export const LazySettings = lazy(() => import('@/pages/settings'));
export const LazyAnalytics = lazy(() => import('@/pages/Analytics'));
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));

// === COMPOSANT DE FALLBACK OPTIMISÉ ===
export const OptimizedSuspenseFallback = ({ text = 'Chargement...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="mt-4 text-blue-600 font-medium animate-pulse">{text}</p>
    <div className="mt-2 flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  </div>
);
