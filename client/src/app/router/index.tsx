import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Loading } from '@/shared/components';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Lazy loading des pages principales
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const HydrationPage = lazy(() => import('@/features/hydration/HydrationPage'));
const SleepPage = lazy(() => import('@/features/sleep/SleepPage'));
const SocialPage = lazy(() => import('@/features/social/SocialPage'));
const WorkoutPage = lazy(() => import('@/features/workout/pages/WorkoutPage'));
const NutritionPage = lazy(() => import('@/pages/NutritionPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Pages d'authentification
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// Pages d'erreur
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));

interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>>;
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
    path: '/login',
    element: LoginPage,
    meta: {
      title: 'Connexion - MyFitHero',
      redirectIfAuth: true,
    },
  },
  {
    path: '/register',
    element: RegisterPage,
    meta: {
      title: 'Inscription - MyFitHero',
      redirectIfAuth: true,
    },
  },
  {
    path: '/forgot-password',
    element: ForgotPasswordPage,
    meta: {
      title: 'Mot de passe oublié - MyFitHero',
      redirectIfAuth: true,
    },
  },

  // Routes protégées
  {
    path: '/dashboard',
    element: Dashboard,
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
    element: ErrorPage,
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
    errorElement: <ErrorPage />,
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
    paths: routePaths as const,
    isValidPath: (path: string): path is (typeof routePaths)[number] => routePaths.includes(path),
  };
};

export default router;
