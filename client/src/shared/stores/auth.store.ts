import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Record<string, any>) => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // État initial
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({ 
            user: data.user, 
            isAuthenticated: !!data.user,
            isLoading: false 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur de connexion';
          set({ 
            error: message, 
            isLoading: false,
            isAuthenticated: false,
            user: null 
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string, metadata = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata
            }
          });

          if (error) throw error;

          set({ 
            user: data.user, 
            isAuthenticated: !!data.user,
            isLoading: false 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
          set({ 
            error: message, 
            isLoading: false,
            isAuthenticated: false,
            user: null 
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur de déconnexion';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;

          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la réinitialisation';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (updates: Record<string, any>) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: updates
          });

          if (error) throw error;

          set({ 
            user: data.user, 
            isLoading: false 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
