export interface SmartDashboardContext {
  userProfile: any;
  dailyStats: any;
  currentGoals: any;
  currentProgram: any;
  personalizedGreeting: string;
  personalizedWorkout: string;
  personalizedExercises: string[];
  smartReminders: any[];
  personalizedMotivation: string;
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