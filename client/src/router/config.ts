// Configuration des routes centralisée
export const routeConfig = {
  // Routes publiques
  public: {
    auth: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    forgot: '/auth/forgot-password'
  },

  // Routes principales de l'application
  app: {
    dashboard: '/',
    workout: '/workout',
    workoutSession: '/workout/session',
    nutrition: '/nutrition',
    hydration: '/hydration',
    sleep: '/sleep',
    social: '/social',
    profile: '/profile',
    analytics: '/analytics',
    wearable: '/wearable',
    aicoach: '/ai-coach'
  },

  // Routes d'administration
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    analytics: '/admin/analytics',
    settings: '/admin/settings'
  },

  // Routes US Market
  usmarket: {
    dashboard: '/us-market',
    onboarding: '/us-market/onboarding'
  },

  // Routes de paramètres
  settings: {
    preferences: '/settings/preferences',
    account: '/settings/account',
    privacy: '/settings/privacy',
    notifications: '/settings/notifications'
  }
} as const;

// Type helper pour la validation des routes
export type RouteConfig = typeof routeConfig;
export type PublicRoutes = RouteConfig['public'][keyof RouteConfig['public']];
export type AppRoutes = RouteConfig['app'][keyof RouteConfig['app']];
export type AdminRoutes = RouteConfig['admin'][keyof RouteConfig['admin']];

// Utilitaire pour construire les routes
export const createRoute = (path: string, params?: Record<string, string>): string => {
  let route = path;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      route = route.replace(`:${key}`, value);
    });
  }
  
  return route;
};

// Routes avec paramètres
export const dynamicRoutes = {
  workoutTemplate: '/workout/template/:templateId',
  workoutSession: '/workout/session/:sessionId',
  userProfile: '/profile/:userId',
  adminUserDetail: '/admin/users/:userId'
} as const;
