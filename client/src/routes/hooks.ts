// routes/hooks.ts
import { useLocation, useRouter } from 'wouter';
import { useMemo } from 'react';
import { findRouteByPath, getRoutesByCategory, type RouteConfig } from './index';

/**
 * Hook pour obtenir les informations de la route actuelle
 */
export const useCurrentRoute = (): {
  currentRoute: RouteConfig | undefined;
  currentPath: string;
  isProtectedRoute: boolean;
} => {
  const [location] = useLocation();

  const currentRoute = useMemo(() => {
    return findRouteByPath(location);
  }, [location]);

  return {
    currentRoute,
    currentPath: location,
    isProtectedRoute: currentRoute?.isProtected ?? false,
  };
};

/**
 * Hook pour la navigation avec métadonnées
 */
export const useAppNavigation = () => {
  const [location, setLocation] = useLocation();
  const { currentRoute } = useCurrentRoute();

  const navigateTo = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      setLocation(path, { replace: true });
    } else {
      setLocation(path);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const goHome = () => {
    navigateTo('/dashboard');
  };

  return {
    navigateTo,
    goBack,
    goHome,
    currentRoute,
    location,
  };
};

/**
 * Hook pour obtenir les routes de navigation par catégorie
 */
export const useNavigationRoutes = (category?: string) => {
  const routes = useMemo(() => {
    if (category) {
      return getRoutesByCategory(category);
    }
    // Retourne les routes principales pour la navigation
    return getRoutesByCategory('dashboard')
      .concat(getRoutesByCategory('fitness'))
      .concat(getRoutesByCategory('wellness'))
      .concat(getRoutesByCategory('social'));
  }, [category]);

  return routes;
};

/**
 * Hook pour vérifier les permissions de route
 */
export const useRoutePermissions = (routePath?: string) => {
  const route = useMemo(() => {
    if (!routePath) return null;
    return findRouteByPath(routePath);
  }, [routePath]);

  const hasAccess = (userRoles: string[] = []): boolean => {
    if (!route) return false;
    if (!route.isProtected) return true;
    if (!route.requiredRoles || route.requiredRoles.length === 0) return true;

    return route.requiredRoles.some(role => userRoles.includes(role));
  };

  return {
    route,
    hasAccess,
    isProtected: route?.isProtected ?? false,
    requiredRoles: route?.requiredRoles ?? [],
  };
};
