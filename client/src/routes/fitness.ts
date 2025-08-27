// routes/fitness.ts
import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy loading des composants fitness
const WorkoutPage = lazy(() => import('@/pages/WorkoutPage'));
const WorkoutDetailPage = lazy(() => import('@/pages/WorkoutDetailPage'));
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'));
const ExerciseDetailPage = lazy(() => import('@/pages/ExerciseDetailPage'));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage'));
const RecoveryPage = lazy(() => import('@/pages/RecoveryPage').then(module => ({ default: module.RecoveryPage })));
const AICoachPage = lazy(() => import('@/pages/AICoachPage'));

export const fitnessRoutes: RouteConfig[] = [
  {
    path: '/workout',
    component: WorkoutPage,
    isProtected: true,
    metadata: {
      title: 'Entraînement',
      description: 'Sessions d\'entraînement',
      icon: 'Dumbbell',
      category: 'fitness'
    }
  },
  {
    path: '/workout/:id',
    component: WorkoutDetailPage,
    isProtected: true,
    metadata: {
      title: 'Détail entraînement',
      description: 'Détails d\'une session d\'entraînement',
      icon: 'Eye',
      category: 'fitness'
    }
  },
  {
    path: '/exercises',
    component: ExercisesPage,
    isProtected: true,
    metadata: {
      title: 'Exercices',
      description: 'Bibliothèque d\'exercices',
      icon: 'Activity',
      category: 'fitness'
    }
  },
  {
    path: '/exercises/:id',
    component: ExerciseDetailPage,
    isProtected: true,
    metadata: {
      title: 'Détail exercice',
      description: 'Instructions détaillées de l\'exercice',
      icon: 'Info',
      category: 'fitness'
    }
  },
  {
    path: '/challenges',
    component: ChallengesPage,
    isProtected: true,
    metadata: {
      title: 'Défis',
      description: 'Relevez des défis fitness',
      icon: 'Trophy',
      category: 'fitness'
    }
  },
  {
    path: '/recovery',
    component: RecoveryPage,
    isProtected: true,
    metadata: {
      title: 'Récupération',
      description: 'Suivi de votre récupération musculaire',
      icon: 'Heart',
      category: 'fitness'
    }
  },
  {
    path: '/ai-coach',
    component: AICoachPage,
    isProtected: true,
    metadata: {
      title: 'Coach IA',
      description: 'Coaching personnalisé par intelligence artificielle',
      icon: 'Brain',
      category: 'fitness'
    }
  }
];
