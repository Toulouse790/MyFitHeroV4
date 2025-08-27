// routes/AppRouter.tsx
import React, { Suspense } from 'react';
import { Router, Route } from 'wouter';
import { allRoutes, findRouteByPath } from './index';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLoadingSpinner from '@/components/AppLoadingSpinner';

interface AppRouterProps {
  currentPath?: string;
}

export const AppRouter: React.FC<AppRouterProps> = ({ currentPath }) => {
  return (
    <Suspense fallback={<AppLoadingSpinner />}>
      <Router>
        {allRoutes.map((routeConfig) => (
          <Route key={routeConfig.path} path={routeConfig.path}>
            {routeConfig.isProtected ? (
              <ProtectedRoute>
                <routeConfig.component />
              </ProtectedRoute>
            ) : (
              <routeConfig.component />
            )}
          </Route>
        ))}
        
        {/* Route catch-all pour 404 */}
        <Route path="*">
          {() => {
            // Lazy load du composant 404
            const NotFound = React.lazy(() => import('@/pages/NotFound'));
            return (
              <Suspense fallback={<AppLoadingSpinner />}>
                <NotFound />
              </Suspense>
            );
          }}
        </Route>
      </Router>
    </Suspense>
  );
};

export default AppRouter;
