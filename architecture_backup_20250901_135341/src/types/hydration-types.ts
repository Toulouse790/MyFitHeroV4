// client/src/types/hydration-types.ts

export interface HydrationLog {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: string;
  logged_at: string;
  log_date: string;
  hydration_context?: string;
}

export interface DailyStats {
  user_id: string;
  stat_date: string;
  water_intake_ml: number;
  hydration_goal_ml: number;
  updated_at: string;
}
