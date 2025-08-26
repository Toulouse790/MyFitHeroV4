// routes/admin.ts
import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy loading des composants admin et légaux
const Admin = lazy(() => import('@/pages/Admin'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export const adminRoutes: RouteConfig[] = [
  {
    path: '/admin',
    component: Admin,
    isProtected: true,
    requiredRoles: ['admin', 'moderator'],
    metadata: {
      title: 'Administration',
      description: 'Panneau d\'administration',
      icon: 'Shield',
      category: 'admin'
    }
  },
  {
    path: '/support',
    component: SupportPage,
    isProtected: true,
    metadata: {
      title: 'Support',
      description: 'Centre d\'aide et support',
      icon: 'HelpCircle',
      category: 'settings'
    }
  }
];

export const legalRoutes: RouteConfig[] = [
  {
    path: '/privacy',
    component: PrivacyPage,
    isProtected: false,
    metadata: {
      title: 'Confidentialité',
      description: 'Politique de confidentialité',
      icon: 'Lock',
      category: 'legal'
    }
  },
  {
    path: '/terms',
    component: TermsPage,
    isProtected: false,
    metadata: {
      title: 'Conditions d\'utilisation',
      description: 'Termes et conditions',
      icon: 'FileText',
      category: 'legal'
    }
  }
];

export const specialRoutes: RouteConfig[] = [
  {
    path: '/404',
    component: NotFound,
    isProtected: false,
    metadata: {
      title: 'Page non trouvée',
      description: 'La page demandée n\'existe pas',
      category: 'auth'
    }
  }
];
