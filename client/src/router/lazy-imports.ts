import { lazy } from 'react';

// Lazy loading des pages principales (utilisant la nouvelle architecture modulaire)
export const WorkoutPageRefactored = lazy(() => import('@/features/workout/pages/WorkoutPage'));
export const NutritionPage = lazy(() => import('@/features/nutrition/pages/NutritionPage'));
export const SocialPage = lazy(() => import('@/features/social/pages/SocialPage'));
export const ProfilePage = lazy(() => import('@/features/auth/pages/ProfileComplete'));
export const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
export const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));

// Pages d'authentification
export const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'));

// Pages refactorisées vers les features
export const WorkoutPageLegacy = lazy(() => import('@/features/workout/pages/WorkoutPage'));
export const HydrationPage = lazy(() => import('@/features/hydration/pages/HydrationPage'));
export const SleepPage = lazy(() => import('@/features/sleep/pages/SleepPage'));
export const WearableHubPage = lazy(() => import('@/features/wearables/pages/WearableHubPage'));
export const AICoachPage = lazy(() => import('@/features/ai-coach/pages/AICoachPage'));
