import { lazy } from 'react';

// === LAZY LOADING DES PAGES PRINCIPALES ===
export const LazyIndex = lazy(() => import('@/pages/index')); // ✅ Existe
export const LazyProfile = lazy(() => import('@/pages/ProfileComplete')); // ✅ Corrigé
export const LazyWorkout = lazy(() => import('@/pages/WorkoutPage')); // ✅ Corrigé
export const LazyNutrition = lazy(() => import('@/pages/Nutrition')); // ✅ Existe
export const LazySleep = lazy(() => import('@/pages/Sleep')); // ✅ Existe
export const LazyHydration = lazy(() => import('@/pages/Hydration')); // ✅ Existe
export const LazySocial = lazy(() => import('@/pages/Social')); // ✅ Existe

// === PAGES ADDITIONNELLES ===
export const LazyAnalytics = lazy(() => import('@/pages/Analytics')); // ✅ Ajouté
export const LazySettings = lazy(() => import('@/pages/settings')); // ✅ Ajouté
export const LazyNotFound = lazy(() => import('@/pages/NotFound')); // ✅ Ajouté

// === LAZY LOADING DES COMPOSANTS LOURDS ===
// Note: Commentés car probablement non existants - à vérifier
// export const LazySmartDashboard = lazy(() => import('@/components/SmartDashboard'));
// export const LazyAIIntelligence = lazy(() => import('@/components/AIIntelligence'));
export const LazyOnboardingQuestionnaire = lazy(() => import('@/components/OnboardingQuestionnaire'));
// export const LazySocialDashboard = lazy(() => import('@/components/SocialDashboard'));

// === COMPOSANT DE FALLBACK OPTIMISÉ ===
export const OptimizedSuspenseFallback = ({ text = "Chargement..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="relative">
      {/* Spinner principal */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      {/* Spinner secondaire avec délai */}
      <div 
        className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin absolute top-2 left-2" 
        style={{ animationDelay: '0.2s', animationDuration: '0.8s' }}
      ></div>
    </div>
    
    {/* Texte avec animation */}
    <div className="mt-4 text-center">
      <p className="text-lg font-medium text-gray-600 animate-pulse">{text}</p>
      <p className="mt-1 text-sm text-gray-400">MyFitHero V4</p>
    </div>
    
    {/* Barre de progression animée */}
    <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);
