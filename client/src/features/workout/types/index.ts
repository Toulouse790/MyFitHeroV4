// Types pour la feature Workout
export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime: number;
  instructions: string;
  muscleGroups: string[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in_progress' | 'completed' | 'cancelled';
  summary?: WorkoutSummary;
}

export interface WorkoutSummary {
  totalDuration: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  averageHeartRate?: number;
  notes?: string;
}

export interface CreateWorkoutDTO {
  name: string;
  description: string;
  exercises: Omit<Exercise, 'id'>[];
  tags: string[];
}

export interface UpdateWorkoutDTO extends Partial<CreateWorkoutDTO> {
  id: string;
}
