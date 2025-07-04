
import { DailyStats } from '@/lib/supabase';

export interface SmartDashboardContext {
  user_profile?: {
    id: string;
    username: string | null;
    age: number | null;
    gender: string | null;
    fitness_goal: string | null;
    primary_goals: string[] | null;
    sport: string | null;
    sport_position: string | null;
    fitness_experience: string | null;
    lifestyle: string | null;
    available_time_per_day: number | null;
    training_frequency: number | null;
    season_period: string | null;
    injuries: string[] | null;
  };
  current_daily_stats?: DailyStats | null;
  daily_program?: DailyProgramDisplay;
  last_ai_recommendations?: string[];
}

export interface DailyProgramDisplay {
  workout: {
    name: string;
    duration: number;
    exercises: string[];
    completed: boolean;
  };
  nutrition: {
    calories_target: number;
    calories_current: number;
    next_meal: string;
  };
  hydration: {
    target_ml: number;
    current_ml: number;
    percentage: number;
  };
  sleep: {
    target_hours: number;
    last_night_hours: number;
    quality: number;
  };
}
