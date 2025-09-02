// Store principal refactorisé - MyFitHero V4
// Architecture modulaire avec stores séparés

// Imports des stores modulaires
export {
  useAuthStore,
  useAuthState,
  useAuthActions,
  useUser,
  useIsAuthenticated,
} from './authStore';
export {
  useProfileStore,
  useProfileState,
  useProfileActions,
  useProfileMetrics,
  useUserSettings,
} from './profileStore';
export { useScalesStore, useScalesState, useWeightHistory, useScaleActions } from './scalesStore';
export {
  useSettingsStore,
  useAppSettings,
  useThemeSettings,
  useLanguageSettings,
  useUnitsSettings,
  useNotificationSettings,
  usePrivacySettings,
  useWorkoutSettings,
  useDisplaySettings,
  useSettingsActions,
  useSettingsState,
} from './settingsStore';

// Legacy workout store (à migrer)
export {
  appStoreUnified,
  useWorkoutSession,
  useWorkoutExercises,
  useWorkoutStats,
  useWorkoutFavorites,
  useWorkoutSettings,
} from './legacyWorkoutStore';

// Types exports
export type { AuthStore } from './authStore';
export type { ProfileStore } from './profileStore';
export type { ScalesStore } from './scalesStore';
export type { SettingsStore } from './settingsStore';

// Exports centralisés des stores
export { useAuthStore } from './authStore';
export { useProfileStore } from './profileStore';
export { useScalesStore } from './scalesStore';
export { useSettingsStore } from './settingsStore';
export { appStore } from './appStore';

// Types
export type { AuthState } from './authStore';
export type { ProfileState } from './profileStore';
export type { ScalesState } from './scalesStore';
export type { SettingsState } from './settingsStore';

// Utilitaires pour la migration
export const StoreUtils = {
  // Reset tous les stores
  resetAllStores: () => {
    // À implémenter si nécessaire
  },

  // Vérifier l'état de synchronisation
  getSyncStatus: () => {
    // À implémenter si nécessaire
  },
};
