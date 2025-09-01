import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour les paramètres de l'application
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  units: {
    weight: 'kg' | 'lb';
    height: 'cm' | 'ft';
    distance: 'km' | 'mi';
    temperature: 'c' | 'f';
  };
  notifications: {
    push: boolean;
    email: boolean;
    workoutReminders: boolean;
    socialUpdates: boolean;
    achievements: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    activitySharing: boolean;
    dataAnalytics: boolean;
    crashReporting: boolean;
  };
  workout: {
    defaultRestTime: number; // en secondes
    quickModeEnabled: boolean;
    autoSave: boolean;
    soundEffects: boolean;
    vibrations: boolean;
  };
  display: {
    compactMode: boolean;
    showTips: boolean;
    animationsEnabled: boolean;
    reduceMotion: boolean;
  };
}

export interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  lastSynced: string | null;
}

export interface SettingsActions {
  updateTheme: (theme: AppSettings['theme']) => void;
  updateLanguage: (language: AppSettings['language']) => void;
  updateUnits: (units: Partial<AppSettings['units']>) => void;
  updateNotifications: (notifications: Partial<AppSettings['notifications']>) => void;
  updatePrivacy: (privacy: Partial<AppSettings['privacy']>) => void;
  updateWorkoutSettings: (workout: Partial<AppSettings['workout']>) => void;
  updateDisplaySettings: (display: Partial<AppSettings['display']>) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: Partial<AppSettings[K]>) => void;
  loadSettings: (userId: string) => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// Paramètres par défaut
const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'fr',
  units: {
    weight: 'kg',
    height: 'cm',
    distance: 'km',
    temperature: 'c',
  },
  notifications: {
    push: true,
    email: false,
    workoutReminders: true,
    socialUpdates: true,
    achievements: true,
    weeklyReports: false,
  },
  privacy: {
    profileVisibility: 'friends',
    activitySharing: true,
    dataAnalytics: true,
    crashReporting: true,
  },
  workout: {
    defaultRestTime: 60,
    quickModeEnabled: false,
    autoSave: true,
    soundEffects: true,
    vibrations: true,
  },
  display: {
    compactMode: false,
    showTips: true,
    animationsEnabled: true,
    reduceMotion: false,
  },
};

// État initial
const initialState: SettingsState = {
  settings: defaultSettings,
  isLoading: false,
  error: null,
  lastSynced: null,
};

// Store des paramètres
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions spécifiques
      updateTheme: (theme) => {
        set(state => ({
          settings: { ...state.settings, theme },
          error: null,
        }));
        
        // Appliquer le thème immédiatement
        document.documentElement.setAttribute('data-theme', theme);
      },

      updateLanguage: (language) => {
        set(state => ({
          settings: { ...state.settings, language },
          error: null,
        }));
      },

      updateUnits: (units) => {
        set(state => ({
          settings: {
            ...state.settings,
            units: { ...state.settings.units, ...units },
          },
          error: null,
        }));
      },

      updateNotifications: (notifications) => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notifications },
          },
          error: null,
        }));
      },

      updatePrivacy: (privacy) => {
        set(state => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, ...privacy },
          },
          error: null,
        }));
      },

      updateWorkoutSettings: (workout) => {
        set(state => ({
          settings: {
            ...state.settings,
            workout: { ...state.settings.workout, ...workout },
          },
          error: null,
        }));
      },

      updateDisplaySettings: (display) => {
        set(state => ({
          settings: {
            ...state.settings,
            display: { ...state.settings.display, ...display },
          },
          error: null,
        }));
      },

      updateSetting: (key, value) => {
        set(state => ({
          settings: {
            ...state.settings,
            [key]: { ...state.settings[key], ...value },
          },
          error: null,
        }));
      },

      loadSettings: async (_userId) => {
        set({ isLoading: true, error: null });

        try {
          // Ici, charger depuis la base de données
          // const userSettings = await supabaseService.getUserSettings(userId);
          // if (userSettings) {
          //   set({ settings: { ...defaultSettings, ...userSettings } });
          // }
          
          set({ lastSynced: new Date().toISOString() });
        } catch {
          set({ error: 'Erreur lors du chargement des paramètres' });
        } finally {
          set({ isLoading: false });
        }
      },

      saveSettings: async () => {
        set({ isLoading: true, error: null });

        try {
          const { settings } = get();
          
          // Ici, sauvegarder en base de données
          // await supabaseService.saveUserSettings(settings);
          
          set({ lastSynced: new Date().toISOString() });
        } catch {
          set({ error: 'Erreur lors de la sauvegarde des paramètres' });
          throw new Error('Erreur lors de la sauvegarde des paramètres');
        } finally {
          set({ isLoading: false });
        }
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          error: null,
          lastSynced: null,
        });
      },

      exportSettings: () => {
        const { settings } = get();
        return JSON.stringify({
          version: '4.0.0',
          exportDate: new Date().toISOString(),
          settings,
        }, null, 2);
      },

      importSettings: (settingsJson) => {
        try {
          const imported = JSON.parse(settingsJson);
          
          if (!imported.settings) {
            set({ error: 'Format de paramètres invalide' });
            return false;
          }

          // Valider et fusionner avec les paramètres par défaut
          const validatedSettings = {
            ...defaultSettings,
            ...imported.settings,
          };

          set({
            settings: validatedSettings,
            error: null,
            lastSynced: new Date().toISOString(),
          });

          return true;
        } catch {
          set({ error: 'Erreur lors de l\'importation des paramètres' });
          return false;
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        settings: state.settings,
        lastSynced: state.lastSynced,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useAppSettings = () => useSettingsStore(state => state.settings);

export const useThemeSettings = () => useSettingsStore(state => ({
  theme: state.settings.theme,
  updateTheme: state.updateTheme,
}));

export const useLanguageSettings = () => useSettingsStore(state => ({
  language: state.settings.language,
  updateLanguage: state.updateLanguage,
}));

export const useUnitsSettings = () => useSettingsStore(state => ({
  units: state.settings.units,
  updateUnits: state.updateUnits,
}));

export const useNotificationSettings = () => useSettingsStore(state => ({
  notifications: state.settings.notifications,
  updateNotifications: state.updateNotifications,
}));

export const usePrivacySettings = () => useSettingsStore(state => ({
  privacy: state.settings.privacy,
  updatePrivacy: state.updatePrivacy,
}));

export const useWorkoutSettings = () => useSettingsStore(state => ({
  workout: state.settings.workout,
  updateWorkoutSettings: state.updateWorkoutSettings,
}));

export const useDisplaySettings = () => useSettingsStore(state => ({
  display: state.settings.display,
  updateDisplaySettings: state.updateDisplaySettings,
}));

export const useSettingsActions = () => useSettingsStore(state => ({
  loadSettings: state.loadSettings,
  saveSettings: state.saveSettings,
  resetSettings: state.resetSettings,
  exportSettings: state.exportSettings,
  importSettings: state.importSettings,
  updateSetting: state.updateSetting,
}));

export const useSettingsState = () => useSettingsStore(state => ({
  isLoading: state.isLoading,
  error: state.error,
  lastSynced: state.lastSynced,
  clearError: state.clearError,
}));
