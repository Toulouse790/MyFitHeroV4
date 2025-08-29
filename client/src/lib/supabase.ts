import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Force reload
// Singleton pattern pour éviter les multiples instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables d'environnement Supabase manquantes");
    }

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
};

export const supabase = getSupabaseClient();
