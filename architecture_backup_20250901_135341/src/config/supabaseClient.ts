import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from './environment';

// Configuration Supabase sécurisée avec validation
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': `myFitHero-v${env.VITE_APP_VERSION}`,
      },
    },
  }
);
