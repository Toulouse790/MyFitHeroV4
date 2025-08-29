import { lazy } from 'react';

// Lazy loading des pages principales (en utilisant les imports existants)
export const WorkoutPageRefactored = lazy(() => import('@/features/workout/pages/WorkoutPage'));
export const NutritionPage = lazy(() => import('@/pages/Nutrition'));
export const SocialPage = lazy(() => import('@/pages/Social'));
export const ProfilePage = lazy(() => import('@/pages/ProfileComplete'));
export const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
export const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));

// Pages d'authentification
export const AuthPage = lazy(() => import('@/pages/AuthPage'));

// Pages existantes (temporaire pendant la migration)
export const WorkoutPageLegacy = lazy(() => import('@/pages/WorkoutPage'));
export const HydrationPage = lazy(() => import('@/pages/Hydration'));
export const SleepPage = lazy(() => import('@/pages/Sleep'));
export const WearableHubPage = lazy(() => import('@/pages/WearableHub'));
export const AICoachPage = lazy(() => import('@/pages/AICoachPage'));
