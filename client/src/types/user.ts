
import { UserProfile as SupabaseUserProfile } from '@/lib/supabase';

// Type unifié qui étend le type Supabase avec les champs calculés locaux
export interface UserProfile extends SupabaseUserProfile {
  // Champs calculés/locaux (non stockés en DB)
  name: string;
  email: string;
  goal: string;
  level: number;
  totalPoints: number;
  joinDate: string;
}

// Interface pour l'onboarding (sans les champs calculés)
export interface UserProfileOnboarding {
  age?: number | null;
  gender?: string | null;
  lifestyle?: string | null;
  available_time_per_day?: number | null;
  fitness_experience?: string | null;
  injuries?: string[] | null;
  primary_goals?: string[] | null;
  motivation?: string | null;
  fitness_goal?: string | null;
  sport?: string | null;
  sport_position?: string | null;
  sport_level?: string | null;
  training_frequency?: number | null;
  season_period?: string | null;
}

// Interface pour les données sportives spécifiques
export interface SportProfileData {
  sport?: string | null;
  sport_position?: string | null;
  sport_level?: string | null;
  training_frequency?: number | null;
  season_period?: string | null;
  fitness_experience?: string | null;
  injuries?: string[] | null;
  primary_goals?: string[] | null;
  motivation?: string | null;
  fitness_goal?: string | null;
}
