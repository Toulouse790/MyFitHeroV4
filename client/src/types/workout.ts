// types/workout.ts
export interface ExerciseSet {
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  rpe?: number;
  notes?: string;
  timestamp?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  sets: ExerciseSet[];
  completed: boolean;
  restTime: number;
  actualRestTime?: number;
  equipment?: string;
  video_url?: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  name: string;
  startTime: string;
  endTime?: string;
  duration: number;
  targetDuration: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  caloriesBurned: number;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: WorkoutExercise[];
  notes?: string;
}
