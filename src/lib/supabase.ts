import { createClient } from '@supabase/supabase-js';
// Importe la définition de Database et Json depuis le fichier auto-généré
import { Database as DBType, Json as JsonType } from '@/integrations/supabase/types';

// Utilise la Database importée de types.ts
export type Database = DBType;
// Ré-exporte directement le type Json importé de types.ts
export type Json = JsonType; 

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY'
  );
}

// Client Supabase configuré avec les types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types utilitaires exportés (dérivés de la Database importée)
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type Exercise = Database['public']['Tables']['exercises_library']['Row'];
export type DailyStats = Database['public']['Tables']['daily_stats']['Row'];
export type HydrationEntry = Database['public']['Tables']['hydration_logs']['Row'];
export type Meal = Database['public']['Tables']['meals']['Row'];
export type SleepSession = Database['public']['Tables']['sleep_sessions']['Row'];
export type AiRecommendation = Database['public']['Tables']['ai_recommendations']['Row'];
export type AiRequest = Database['public']['Tables']['ai_requests']['Row'];
export type FoodLibraryEntry = Database['public']['Tables']['foods_library']['Row'];
export type UserGoal = Database['public']['Tables']['user_goals']['Row'];
export type PillarCoordination = Database['public']['Tables']['pillar_coordination']['Row'];


// Helper pour la gestion d'erreurs Supabase
export const handleSupabaseError = (error: unknown, context: string = '') => {
  let message = 'Une erreur inattendue s\'est produite';
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  console.error(`Erreur Supabase${context ? ` (${context})` : ''}:`, error);
  return message;
};

// Helper pour vérifier l'authentification
export const requireAuth = () => {
  return supabase.auth.getUser();
};

export default supabase;