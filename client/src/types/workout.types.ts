// Types centralisés pour les workouts
export interface WorkoutSet {
  id?: string;
  reps: number;
  weight?: number;
  duration?: number; // en secondes
  restTime?: number; // en secondes
  completed: boolean;
  notes?: string;
  actualReps?: number; // reps réellement effectuées
  actualWeight?: number; // poids réellement utilisé
  createdAt?: Date;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'balance';
  category: string; // chest, back, legs, etc.
  sets: WorkoutSet[];
  instructions?: string;
  tips?: string[];
  muscleGroups: string[];
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  estimatedDuration?: number; // en minutes
  actualDuration?: number; // temps réellement passé
  notes?: string;
  createdAt?: Date;
  lastPerformed?: Date;
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'mixed' | 'flexibility';
  exercises: WorkoutExercise[];
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  totalTime?: number; // en secondes
  estimatedCalories?: number;
  actualCalories?: number;
  notes?: string;
  rating?: number; // 1-5
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'mixed' | 'flexibility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en minutes
  exercises: Omit<WorkoutExercise, 'completed' | 'actualDuration'>[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  timesUsed: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // en semaines
  workoutsPerWeek: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  templates: WorkoutTemplate[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalTimeSpent: number; // en secondes
  totalCaloriesBurned: number;
  averageWorkoutDuration: number; // en minutes
  mostUsedExercises: Array<{
    exerciseName: string;
    count: number;
  }>;
  personalRecords: Array<{
    exerciseName: string;
    type: 'weight' | 'reps' | 'duration';
    value: number;
    date: Date;
  }>;
  weeklyGoal: number; // workouts per week
  weeklyProgress: number; // current week progress
  monthlyStats: Array<{
    month: string;
    workouts: number;
    timeSpent: number;
    calories: number;
  }>;
}

export interface WorkoutPreferences {
  defaultRestTime: number; // en secondes
  quickModeEnabled: boolean;
  notificationsEnabled: boolean;
  autoProgressWeight: boolean;
  preferredUnits: 'metric' | 'imperial';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  timerVisible: boolean;
}

// Types pour les événements/analytics
export interface WorkoutEvent {
  type:
    | 'session_started'
    | 'session_paused'
    | 'session_completed'
    | 'exercise_completed'
    | 'set_completed';
  sessionId: string;
  exerciseId?: string;
  setIndex?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Types pour l'intégration avec les wearables
export interface WorkoutMetrics {
  heartRate?: number[];
  caloriesBurned?: number;
  distance?: number; // pour cardio
  steps?: number;
  activeMinutes?: number;
  recoveryTime?: number;
}

export interface WorkoutSummary {
  session: WorkoutSession;
  metrics?: WorkoutMetrics;
  improvements: Array<{
    exerciseName: string;
    improvement: string;
    percentage?: number;
  }>;
  achievements: string[];
  nextWorkoutSuggestion?: string;
}
