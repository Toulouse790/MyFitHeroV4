// routes/wellness.ts
import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy loading des composants bien-être
const Nutrition = lazy(() => import('@/features/nutrition/pages/NutritionPage'));
const Hydration = lazy(() => import('@/features/hydration/pages/HydrationPage'));
const Sleep = lazy(() => import('@/features/sleep/pages/SleepPage'));
const WearableHub = lazy(() => import('@/features/wearables/pages/WearableHubPage'));

export const wellnessRoutes: RouteConfig[] = [
  {
    path: '/nutrition',
    component: Nutrition,
    isProtected: true,
    metadata: {
      title: 'Nutrition',
      description: 'Suivi nutritionnel et calories',
      icon: 'Apple',
      category: 'wellness',
    },
  },
  {
    path: '/hydration',
    component: Hydration,
    isProtected: true,
    metadata: {
      title: 'Hydratation',
      description: "Suivi de votre consommation d'eau",
      icon: 'Droplets',
      category: 'wellness',
    },
  },
  {
    path: '/hydration/history',
    component: Hydration, // Vous pourriez créer une page dédiée à l'historique
    isProtected: true,
    metadata: {
      title: 'Historique hydratation',
      description: "Historique de votre consommation d'eau",
      icon: 'Calendar',
      category: 'wellness',
    },
  },
  {
    path: '/sleep',
    component: Sleep,
    isProtected: true,
    metadata: {
      title: 'Sommeil',
      description: 'Suivi de votre qualité de sommeil',
      icon: 'Moon',
      category: 'wellness',
    },
  },
  {
    path: '/wearables',
    component: WearableHub,
    isProtected: true,
    metadata: {
      title: 'Objets connectés',
      description: 'Connexion avec vos appareils wearables',
      icon: 'Watch',
      category: 'wellness',
    },
  },
];
