import React, { Suspense } from 'react';
import { Route, Switch, Redirect } from 'wouter';

// Composants de routing
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { LoadingRoute } from './components/LoadingRoute';

// Configuration des routes
import { routeConfig } from './config';

// Imports lazy
import {
  WorkoutPageRefactored,
  WorkoutPageLegacy,
  NutritionPage,
  SocialPage,
  ProfilePage,
  AnalyticsPage,
  AdminDashboard,
  AuthPage,
  HydrationPage,
  SleepPage,
  WearableHubPage,
  AICoachPage
} from './lazy-imports';

// Page de dashboard temporaire
const DashboardPage = React.lazy(() => import('@/pages/index'));

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingRoute />}>
      <Switch>
        {/* Routes publiques */}
        <PublicRoute path={routeConfig.public.auth}>
          <AuthPage />
        </PublicRoute>

        {/* Routes protégées principales */}
        <ProtectedRoute path={routeConfig.app.dashboard}>
          <DashboardPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.workout}>
          {/* Utiliser la version refactorisée si disponible, sinon fallback */}
          <WorkoutPageRefactored />
        </ProtectedRoute>

        <ProtectedRoute path="/workout/legacy">
          <WorkoutPageLegacy />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.nutrition}>
          <NutritionPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.hydration}>
          <HydrationPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.sleep}>
          <SleepPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.social}>
          <SocialPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.profile}>
          <ProfilePage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.analytics}>
          <AnalyticsPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.wearable}>
          <WearableHubPage />
        </ProtectedRoute>

        <ProtectedRoute path={routeConfig.app.aicoach}>
          <AICoachPage />
        </ProtectedRoute>

        {/* Routes d'administration */}
        <ProtectedRoute path={routeConfig.admin.dashboard} adminRequired>
          <AdminDashboard />
        </ProtectedRoute>

        {/* Redirection par défaut */}
        <Route>
          <Redirect to={routeConfig.app.dashboard} />
        </Route>
      </Switch>
    </Suspense>
  );
};
