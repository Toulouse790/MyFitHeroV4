// Types pour le module Workout

export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  tags: string[];
  category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'recovery';
  equipment: Equipment[];
  caloriesBurned?: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  weight?: number; // en kg
  duration?: number; // en secondes pour les exercices de temps
  restTime: number; // en secondes
  instructions: string[];
  muscleGroups: MuscleGroup[];
  equipment?: Equipment;
  videoUrl?: string;
  imageUrl?: string;
  isCompleted?: boolean;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'paused' | 'completed' | 'cancelled';
  exercises: SessionExercise[];
  totalCaloriesBurned?: number;
  notes?: string;
  rating?: number; // 1-5
}

export interface SessionExercise {
  exerciseId: string;
  sets: ExerciseSet[];
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  isCompleted: boolean;
  timestamp: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'weights' | 'cardio' | 'bodyweight' | 'resistance' | 'flexibility';
  description?: string;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'core';

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // en minutes
  totalCaloriesBurned: number;
  averageWorkoutDuration: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercises: Exercise[];
  weeklyStats: WeeklyWorkoutStats[];
  monthlyStats: MonthlyWorkoutStats[];
  muscleGroupDistribution: Record<MuscleGroup, number>;
}

export interface WeeklyWorkoutStats {
  week: string; // YYYY-WW
  workouts: number;
  duration: number;
  caloriesBurned: number;
}

export interface MonthlyWorkoutStats {
  month: string; // YYYY-MM
  workouts: number;
  duration: number;
  caloriesBurned: number;
  avgPerWeek: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseTemplate[];
  difficulty: Workout['difficulty'];
  estimatedDuration: number;
  targetMuscleGroups: MuscleGroup[];
  equipment: Equipment[];
  isPublic: boolean;
  rating: number;
  usageCount: number;
}

export interface ExerciseTemplate {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime: number;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // en semaines
  difficulty: Workout['difficulty'];
  goal: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
  workouts: PlanWorkout[];
  isActive: boolean;
  progress: number; // 0-100
  startDate?: string;
}

export interface PlanWorkout {
  day: number;
  week: number;
  workoutId: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutProgress {
  exerciseId: string;
  historicalData: ProgressDataPoint[];
  personalBest: PersonalBest;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ProgressDataPoint {
  date: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  volume: number; // sets × reps × weight
}

export interface PersonalBest {
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
  bestDuration?: number;
  achievedAt: string;
}

// DTOs pour les API
export interface CreateWorkoutData {
  name: string;
  description: string;
  exercises: CreateExerciseData[];
  tags: string[];
  category: Workout['category'];
  difficulty: Workout['difficulty'];
  isPublic: boolean;
}

export interface CreateExerciseData {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime: number;
  instructions: string[];
  muscleGroups: MuscleGroup[];
  equipment?: string;
}

export interface UpdateWorkoutData extends Partial<CreateWorkoutData> {
  id: string;
}

export interface WorkoutFilters {
  category?: Workout['category'];
  difficulty?: Workout['difficulty'];
  duration?: {
    min: number;
    max: number;
  };
  muscleGroups?: MuscleGroup[];
  equipment?: string[];
  tags?: string[];
}

export interface WorkoutSearchQuery {
  query?: string;
  filters?: WorkoutFilters;
  sortBy?: 'name' | 'difficulty' | 'duration' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
