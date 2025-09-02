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
} from './settingsStore';

// Store principal pour les données applicatives
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
