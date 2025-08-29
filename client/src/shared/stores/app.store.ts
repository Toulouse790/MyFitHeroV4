import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  isOnline: boolean;
  lastSync: Date | null;
  debugMode: boolean;
}

export interface AppActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
  toggleDebugMode: () => void;
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  theme: 'system',
  language: 'fr',
  isOnline: navigator.onLine,
  lastSync: null,
  debugMode: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    set => ({
      ...initialState,

      setTheme: theme => set({ theme }),

      setLanguage: language => set({ language }),

      setOnlineStatus: isOnline => set({ isOnline }),

      updateLastSync: () => set({ lastSync: new Date() }),

      toggleDebugMode: () => set(state => ({ debugMode: !state.debugMode })),

      reset: () => set(initialState),
    }),
    {
      name: 'app-storage',
      partialize: state => ({
        theme: state.theme,
        language: state.language,
        debugMode: state.debugMode,
      }),
    }
  )
);
