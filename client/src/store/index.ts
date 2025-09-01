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

// Store combiné pour compatibilité (temporaire)
export interface CombinedAppState {
  auth: ReturnType<typeof useAuthState>;
  profile: ReturnType<typeof useProfileState>;
  scales: ReturnType<typeof useScalesState>;
  settings: ReturnType<typeof useSettingsState>;
}

/**
 * Hook combiné pour accéder à l'état global de l'app
 * @deprecated Utilisez les stores individuels pour de meilleures performances
 */
export function useCombinedAppState(): CombinedAppState {
  return {
    auth: useAuthState(),
    profile: useProfileState(),
    scales: useScalesState(),
    settings: useSettingsState(),
  };
}

// Utilitaires pour la migration
export const StoreUtils = {
  // Reset tous les stores
  resetAllStores: () => {
    // Implémenter si nécessaire
  },

  // Vérifier l'état de synchronisation
  getSyncStatus: () => {
    // Implémenter si nécessaire
  },
};

export default {
  useAuthStore,
  useProfileStore,
  useScalesStore,
  useSettingsStore,
};
