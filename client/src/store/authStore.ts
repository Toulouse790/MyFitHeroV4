import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types';

// Types pour l'authentification
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (sessionToken: string, refreshToken: string, expiresAt: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUserData: (updates: Partial<User>) => void;
  checkTokenExpiry: () => boolean;
  refreshSession: () => Promise<boolean>;
}

export type AuthStore = AuthState & AuthActions;

// État initial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionToken: null,
  refreshToken: null,
  expiresAt: null,
};

// Store d'authentification
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setUser: user => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setTokens: (sessionToken, refreshToken, expiresAt) => {
        set({
          sessionToken,
          refreshToken,
          expiresAt,
          isAuthenticated: true,
          error: null,
        });
      },

      clearAuth: () => {
        set({
          ...initialState,
          isLoading: false, // Garder isLoading à false lors de la déconnexion
        });
      },

      setLoading: isLoading => {
        set({ isLoading });
      },

      setError: error => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUserData: updates => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },

      checkTokenExpiry: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;

        const now = new Date();
        const expiry = new Date(expiresAt);
        return now < expiry;
      },

      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          set({ isLoading: true, error: null });

          // Ici, intégrer la logique de refresh avec Supabase
          // Pour l'instant, simulation
          await new Promise(resolve => setTimeout(resolve, 1000));

          // En cas de succès, mettre à jour les tokens
          // const newTokens = await authService.refreshTokens(refreshToken);
          // get().setTokens(newTokens.sessionToken, newTokens.refreshToken, newTokens.expiresAt);

          return true;
        } catch {
          set({ error: 'Échec du rafraîchissement de session' });
          get().clearAuth();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        sessionToken: state.sessionToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useAuthState = () =>
  useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
  }));

export const useAuthActions = () =>
  useAuthStore(state => ({
    setUser: state.setUser,
    setTokens: state.setTokens,
    clearAuth: state.clearAuth,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    updateUserData: state.updateUserData,
    checkTokenExpiry: state.checkTokenExpiry,
    refreshSession: state.refreshSession,
  }));

export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
