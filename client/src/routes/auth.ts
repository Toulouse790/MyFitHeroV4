// routes/auth.ts
import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy loading des composants d'authentification
const IndexPage = lazy(() => import('@/pages/index'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));

export const authRoutes: RouteConfig[] = [
  {
    path: '/',
    component: IndexPage,
    isProtected: false,
    metadata: {
      title: 'Accueil',
      description: "Page d'accueil MyFitHero",
      category: 'auth',
    },
  },
  {
    path: '/login',
    component: IndexPage,
    isProtected: false,
    metadata: {
      title: 'Connexion',
      description: 'Se connecter à MyFitHero',
      category: 'auth',
    },
  },
  {
    path: '/register',
    component: IndexPage,
    isProtected: false,
    metadata: {
      title: 'Inscription',
      description: 'Créer un compte MyFitHero',
      category: 'auth',
    },
  },
  {
    path: '/auth',
    component: AuthPage,
    isProtected: false,
    metadata: {
      title: 'Authentification',
      description: "Page d'authentification",
      category: 'auth',
    },
  },
  {
    path: '/landing',
    component: LandingPage,
    isProtected: false,
    metadata: {
      title: 'Bienvenue',
      description: 'Page de présentation',
      category: 'auth',
    },
  },
];
