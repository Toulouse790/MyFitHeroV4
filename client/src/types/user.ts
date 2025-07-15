export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  email?: string;
  avatar_url?: string | null;
  age?: number | null;
  gender?: 'male' | 'female' | null;
  sport?: string | null;
  sport_name?: string | null;
  sport_position?: string | null;
  sport_level?: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional' | null;
  lifestyle?: 'student' | 'office_worker' | 'physical_job' | 'retired' | null;
  fitness_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  primary_goals?: string[];
  training_frequency?: number | null;
  season_period?: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
  available_time_per_day?: number | null;
  active_modules?: string[];
  modules?: string[];
  profile_type?: 'complete' | 'wellness' | 'sport_only' | 'sleep_focus';
  sport_specific_stats?: Record<string, number>;
  injuries?: string[];
  motivation?: string;
  fitness_goal?: string;
  level?: number;
  totalPoints?: number;
  joinDate?: string;
  name?: string;
  goal?: string;
  daily_calories?: number | null;
  created_at?: string;
  weight?: number | null;
}

// Type pour les données spécifiques au sport
export interface SportProfileData {
  sport?: string | null;
  sport_position?: string | null;
  sport_level?: 'recreational' | 'amateur_competitive' | 'semi_professional' | 'professional' | null;
  season_period?: 'off_season' | 'pre_season' | 'in_season' | 'recovery' | null;
  training_frequency?: number | null;
  available_time_per_day?: number | null;
  sport_specific_stats?: Record<string, number>;
  injuries?: string[];
  primary_goals?: string[];
}