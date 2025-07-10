import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
}

export interface AuthResponse {
  user: AuthUser | null;
  error?: string;
}

class SupabaseAuthClient {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            user_metadata: data.user.user_metadata
          }
        };
      }

      return { user: null, error: 'Registration failed' };
    } catch (error) {
      return { user: null, error: 'Registration failed' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            user_metadata: data.user.user_metadata
          }
        };
      }

      return { user: null, error: 'Login failed' };
    } catch (error) {
      return { user: null, error: 'Login failed' };
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        user_metadata: user.user_metadata
      };
    } catch (error) {
      return null;
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return error ? null : session;
    } catch (error) {
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        });
      } else {
        callback(null);
      }
    });
  }
}

export const authClient = new SupabaseAuthClient();
