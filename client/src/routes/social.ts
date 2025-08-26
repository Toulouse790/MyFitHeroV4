// routes/social.ts
import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy loading des composants sociaux
const Social = lazy(() => import('@/pages/Social'));

export const socialRoutes: RouteConfig[] = [
  {
    path: '/social',
    component: Social,
    isProtected: true,
    metadata: {
      title: 'Social',
      description: 'Communauté et partage',
      icon: 'Users',
      category: 'social'
    }
  },
  {
    path: '/social/feed',
    component: Social, // Vous pourriez créer des sous-composants
    isProtected: true,
    metadata: {
      title: 'Fil d\'actualité',
      description: 'Actualités de la communauté',
      icon: 'MessageSquare',
      category: 'social'
    }
  },
  {
    path: '/social/challenges',
    component: Social,
    isProtected: true,
    metadata: {
      title: 'Défis communautaires',
      description: 'Défis entre amis',
      icon: 'Zap',
      category: 'social'
    }
  },
  {
    path: '/social/friends',
    component: Social,
    isProtected: true,
    metadata: {
      title: 'Amis',
      description: 'Gérer vos connexions',
      icon: 'UserPlus',
      category: 'social'
    }
  }
];
