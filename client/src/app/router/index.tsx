import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loading } from '@/shared/components';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

// Lazy loading des pages principales
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const HydrationPage = lazy(() => import('@/features/hydration/pages/HydrationPage'));
const SleepPage = lazy(() => import('@/features/sleep/pages/SleepPage'));
const SocialPage = lazy(() => import('@/features/social/pages/SocialPage'));
const WorkoutPage = lazy(() => import('@/features/workout/pages/WorkoutPage'));
const NutritionPage = lazy(() => import('@/features/nutrition/pages/NutritionPage'));
const SettingsPage = lazy(() => import('@/features/profile/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

// Pages d'authentification
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'));

// Pages d'erreur et support
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>;
  meta: {
    title: string;
    description?: string;
    requiresAuth?: boolean;
    redirectIfAuth?: boolean;
    roles?: string[];
  };
}

const routes: RouteConfig[] = [
  // Routes publiques
  {
    path: '/',
    element: LandingPage,
    meta: {
      title: 'MyFitHero - Votre compagnon santé et bien-être',
      description: 'Suivez votre hydratation, sommeil, nutrition et activités physiques',
      redirectIfAuth: true,
    },
  },
  {
    path: '/auth',
    element: AuthPage,
    meta: {
      title: 'Authentification - MyFitHero',
      redirectIfAuth: true,
    },
  },

  // Routes protégées - Analytics comme dashboard principal
  {
    path: '/dashboard',
    element: AnalyticsPage,
    meta: {
      title: 'Tableau de bord - MyFitHero',
      description: "Vue d'ensemble de votre santé et bien-être",
      requiresAuth: true,
    },
  },
  {
    path: '/hydration',
    element: HydrationPage,
    meta: {
      title: 'Hydratation - MyFitHero',
      description: "Suivez votre consommation d'eau quotidienne",
      requiresAuth: true,
    },
  },
  {
    path: '/sleep',
    element: SleepPage,
    meta: {
      title: 'Sommeil - MyFitHero',
      description: 'Analysez la qualité de votre sommeil',
      requiresAuth: true,
    },
  },
  {
    path: '/social',
    element: SocialPage,
    meta: {
      title: 'Communauté - MyFitHero',
      description: "Connectez-vous avec d'autres utilisateurs",
      requiresAuth: true,
    },
  },
  {
    path: '/workout',
    element: WorkoutPage,
    meta: {
      title: 'Entraînements - MyFitHero',
      description: "Planifiez et suivez vos séances d'entraînement",
      requiresAuth: true,
    },
  },
  {
    path: '/nutrition',
    element: NutritionPage,
    meta: {
      title: 'Nutrition - MyFitHero',
      description: 'Suivez votre alimentation et vos calories',
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    element: ProfilePage,
    meta: {
      title: 'Profil - MyFitHero',
      description: 'Gérez vos informations personnelles',
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    element: SettingsPage,
    meta: {
      title: 'Paramètres - MyFitHero',
      description: 'Configurez votre application',
      requiresAuth: true,
    },
  },

  // Pages d'erreur
  {
    path: '/error',
    element: NotFoundPage,
    meta: {
      title: 'Erreur - MyFitHero',
    },
  },
  {
    path: '*',
    element: NotFoundPage,
    meta: {
      title: 'Page introuvable - MyFitHero',
    },
  },
];

// Créer les routes React Router
const router = createBrowserRouter(
  routes.map(route => ({
    path: route.path,
    element: (
      <ErrorBoundary>
        <Suspense fallback={<Loading fullScreen text="Chargement de la page..." />}>
          {route.meta.requiresAuth ? (
            <ProtectedRoute>
              <route.element />
            </ProtectedRoute>
          ) : (
            <route.element />
          )}
        </Suspense>
      </ErrorBoundary>
    ),
    errorElement: <div>Erreur de chargement</div>,
  }))
);

// Hook pour accéder aux métadonnées de route
export const useRouteMetadata = (pathname: string) => {
  const route = routes.find(r => r.path === pathname);
  return route?.meta;
};

// Hook pour navigation typée
export const useTypedNavigation = () => {
  const routePaths = routes.map(r => r.path);

  return {
    paths: routePaths,
    isValidPath: (path: string): path is (typeof routePaths)[number] => routePaths.includes(path),
  };
};

export default router;
