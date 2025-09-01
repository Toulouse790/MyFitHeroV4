// shared/types/user.ts - SYSTÈME UNIFIÉ
// 🎯 Remplace TOUTES les définitions User dispersées

import { Database } from '../../types/database';

// Type de base depuis Supabase
type SupabaseUser = Database['public']['Tables']['user_profiles']['Row'];

// Extensions spécifiques à l'app
export interface AppUser extends SupabaseUser {
  // Extensions calculées
  level?: number;
  totalPoints?: number;
  joinDate?: string;
  
  // Extensions métier
  name?: string;  // Calculé depuis full_name || username
  goal?: string;  // Calculé depuis primary_goals[0]
  
  // Extensions sport (compatibilité)
  sport_specific_stats?: Record<string, number>;
  daily_calories?: number | null;
}

// Types spécialisés (héritent d'AppUser)
export interface AdminUser extends AppUser {
  // Permissions admin
  admin_level: 'super' | 'moderate' | 'basic';
  permissions: string[];
  last_admin_action?: string;
}

export interface AuthUser extends AppUser {
  // État d'authentification
  isAuthenticated: boolean;
  authProvider: 'email' | 'google' | 'apple';
  lastLogin?: string;
}

export interface ProfileUser extends AppUser {
  // Données calculées pour le profil
  bmi?: number;
  bmr?: number;
  progressScore?: number;
  achievementCount?: number;
}

// Types pour les formulaires (évite la duplication)
export interface UserFormData {
  // Champs editables seulement
  full_name?: string;
  bio?: string;
  height?: number;
  weight?: number;
  fitness_goals?: string[];
  activity_level?: string;
}

export interface UserUpdatePayload extends Partial<AppUser> {
  updated_at: string;  // Toujours requis pour les updates
}

// Guards de types (évite les erreurs)
export const isAppUser = (user: unknown): user is AppUser => {
  return user !== null && typeof user === 'object' && 'id' in user && typeof (user as { id: unknown }).id === 'string';
};

export const isAuthenticatedUser = (user: unknown): user is AuthUser => {
  return isAppUser(user) && 'isAuthenticated' in user && (user as AuthUser).isAuthenticated === true;
};

export const hasAdminAccess = (user: unknown): user is AdminUser => {
  return isAppUser(user) && 'admin_level' in user && (user as AdminUser).admin_level !== undefined;
};

// Utilitaires (évite la logique dupliquée)
export const getUserDisplayName = (user: AppUser): string => {
  return user.name || user.full_name || user.username || 'Utilisateur';
};

export const getUserPrimaryGoal = (user: AppUser): string => {
  return user.goal || user.primary_goals?.[0] || 'Aucun objectif';
};

export const isModuleActive = (user: AppUser, moduleId: string): boolean => {
  return user.active_modules?.includes(moduleId) || false;
};

// Export par défaut pour faciliter l'import
export default AppUser;

// Types legacy (pour migration douce)
/** @deprecated Utilise AppUser à la place */
export type User = AppUser;

/** @deprecated Utilise ProfileUser à la place */  
export type UserProfile = ProfileUser;

/** @deprecated Utilise AuthUser à la place */
export type AuthContextUser = AuthUser;
