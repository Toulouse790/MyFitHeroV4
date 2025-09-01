// routes/dashboard.ts
import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy loading des composants dashboard
const Analytics = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const ProfileComplete = lazy(() => import('@/features/auth/pages/ProfileComplete'));
const Settings = lazy(() => import('@/features/profile/pages/SettingsPage'));

export const dashboardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: Analytics,
    isProtected: true,
    metadata: {
      title: 'Tableau de bord',
      description: "Vue d'ensemble de vos statistiques",
      icon: 'BarChart3',
      category: 'dashboard',
    },
  },
  {
    path: '/analytics',
    component: Analytics,
    isProtected: true,
    metadata: {
      title: 'Analytiques',
      description: 'Analyses détaillées de vos performances',
      icon: 'TrendingUp',
      category: 'dashboard',
    },
  },
  {
    path: '/profile',
    component: ProfilePage,
    isProtected: true,
    metadata: {
      title: 'Profil',
      description: 'Gérer votre profil utilisateur',
      icon: 'User',
      category: 'dashboard',
    },
  },
  {
    path: '/profile/complete',
    component: ProfileComplete,
    isProtected: true,
    metadata: {
      title: 'Compléter le profil',
      description: 'Finaliser la configuration de votre profil',
      icon: 'UserCheck',
      category: 'dashboard',
    },
  },
  {
    path: '/settings',
    component: Settings,
    isProtected: true,
    metadata: {
      title: 'Paramètres',
      description: "Configuration de l'application",
      icon: 'Settings',
      category: 'settings',
    },
  },
];
