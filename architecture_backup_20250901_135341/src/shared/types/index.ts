import React from 'react';

// Shared types pour toute l'application MyFitHero

// Types utilisateur de base
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  sport: string;
  level: number;
  created_at: string;
  updated_at: string;
}

// Types API standardisés
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les stores Zustand
export interface BaseStore {
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  resetStore: () => void;
}

// Types pour les composants
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Types pour les formulaires
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: FormFieldError[];
  touched: Record<string, boolean>;
}

// Types pour les notifications
export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'destructive' | 'success';
  duration?: number;
}

// Types pour le routing
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  title?: string;
  description?: string;
}

// Types pour les métriques
export interface BaseMetrics {
  date: string;
  value: number;
  unit: string;
  category?: string;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// Types pour les préférences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  units: 'metric' | 'imperial';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  workoutReminders: boolean;
  socialUpdates: boolean;
  achievements: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  activitySharing: boolean;
  dataAnalytics: boolean;
}

// Types d'événements
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}

export interface AnalyticsEvent extends AppEvent {
  type: 'page_view' | 'button_click' | 'feature_used' | 'error_occurred';
  properties: Record<string, any>;
}

// Types pour la cache
export interface CacheEntry<T = any> {
  data: T;
  timestamp: string;
  expiresAt: string;
  key: string;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

// Types pour les sports
export interface SportConfig {
  id: string;
  name: string;
  emoji: string;
  category: 'endurance' | 'strength' | 'team' | 'precision' | 'combat';
  features: string[];
  metrics: string[];
  recommendations: SportRecommendations;
}

export interface SportRecommendations {
  workout: {
    frequency: number; // par semaine
    duration: number; // minutes
    intensity: 'low' | 'medium' | 'high';
  };
  nutrition: {
    calories: number;
    protein: number; // grammes
    carbs: number;
    fats: number;
  };
  recovery: {
    sleep: number; // heures
    restDays: number;
    hydration: number; // litres
  };
}

// Export de tous les types
export * from './api.types';
export * from './workout.types';
export * from './nutrition.types';
export * from './sleep.types';
export * from './social.types';
