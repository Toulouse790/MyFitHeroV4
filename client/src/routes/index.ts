// routes/index.ts
import { RouteConfig, RouteGroup } from './types';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { fitnessRoutes } from './fitness';
import { wellnessRoutes } from './wellness';
import { socialRoutes } from './social';
import { adminRoutes, legalRoutes, specialRoutes } from './admin';

// Compilation de toutes les routes
export const allRoutes: RouteConfig[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...fitnessRoutes,
  ...wellnessRoutes,
  ...socialRoutes,
  ...adminRoutes,
  ...legalRoutes,
  ...specialRoutes,
];

// Routes organisées par catégorie
export const routeGroups: RouteGroup[] = [
  { category: 'auth', routes: authRoutes },
  { category: 'dashboard', routes: dashboardRoutes },
  { category: 'fitness', routes: fitnessRoutes },
  { category: 'wellness', routes: wellnessRoutes },
  { category: 'social', routes: socialRoutes },
  { category: 'admin', routes: adminRoutes },
  {
    category: 'settings',
    routes: dashboardRoutes.filter(r => r.metadata?.category === 'settings'),
  },
  { category: 'legal', routes: legalRoutes },
];

// Routes protégées
export const protectedRoutes = allRoutes.filter(route => route.isProtected);

// Routes publiques
export const publicRoutes = allRoutes.filter(route => !route.isProtected);

// Fonction utilitaire pour trouver une route par path
export const findRouteByPath = (path: string): RouteConfig | undefined => {
  return allRoutes.find(route => {
    // Support des paramètres dynamiques (:id, etc.)
    const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path);
  });
};

// Fonction utilitaire pour obtenir les routes par catégorie
export const getRoutesByCategory = (category: string): RouteConfig[] => {
  return allRoutes.filter(route => route.metadata?.category === category);
};

// Export des routes individuelles pour l'usage direct
export {
  authRoutes,
  dashboardRoutes,
  fitnessRoutes,
  wellnessRoutes,
  socialRoutes,
  adminRoutes,
  legalRoutes,
  specialRoutes,
};

// Export des types
export type { RouteConfig, RouteGroup, RouteCategory } from './types';
