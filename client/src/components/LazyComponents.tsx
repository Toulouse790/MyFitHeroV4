import { lazy } from 'react';

// === LAZY LOADING DES PAGES PRINCIPALES ===
export const LazyIndex = lazy(() => import('@/pages/Index'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazyWorkout = lazy(() => import('@/pages/Workout'));
export const LazyNutrition = lazy(() => import('@/pages/Nutrition'));
export const LazySleep = lazy(() => import('@/pages/Sleep'));
export const LazyHydration = lazy(() => import('@/pages/Hydration'));
export const LazySocial = lazy(() => import('@/pages/Social'));
export const LazyWorkoutPage = lazy(() => import('@/pages/WorkoutPage'));

// === LAZY LOADING DES COMPOSANTS LOURDS ===
export const LazySmartDashboard = lazy(() => import('@/components/SmartDashboard'));
export const LazyAIIntelligence = lazy(() => import('@/components/AIIntelligence'));
export const LazyOnboardingQuestionnaire = lazy(() => import('@/components/OnboardingQuestionnaire'));
export const LazySocialDashboard = lazy(() => import('@/components/SocialDashboard'));

// === COMPOSANT DE FALLBACK OPTIMISÉ ===
export const OptimizedSuspenseFallback = ({ text = "Chargement..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-2" style={{ animationDelay: '0.2s' }}></div>
    </div>
    <p className="mt-4 text-lg font-medium text-gray-600 animate-pulse">{text}</p>
    <p className="mt-1 text-sm text-gray-400">MyFitHero V4</p>
  </div>
);
