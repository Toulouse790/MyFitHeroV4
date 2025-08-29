/**
 * Types pour les fonctionnalités d'entraînement
 */

// Types de base pour les exercices
export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: ExerciseDifficulty;
  instructions: string[];
  tips?: string[];
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  PLYOMETRIC = 'plyometric',
  REHABILITATION = 'rehabilitation',
}

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  QUADRICEPS = 'quadriceps',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  FULL_BODY = 'full_body',
}

export enum Equipment {
  BODYWEIGHT = 'bodyweight',
  DUMBBELLS = 'dumbbells',
  BARBELL = 'barbell',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BANDS = 'resistance_bands',
  PULL_UP_BAR = 'pull_up_bar',
  MACHINE = 'machine',
  CABLE = 'cable',
  MEDICINE_BALL = 'medicine_ball',
  FOAM_ROLLER = 'foam_roller',
}

export enum ExerciseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

// Types pour les séances d'entraînement
export interface Workout {
  id: string;
  name: string;
  description?: string;
  category: WorkoutCategory;
  difficulty: ExerciseDifficulty;
  duration: number; // en minutes
  exercises: WorkoutExercise[];
  tags: string[];
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkoutCategory {
  STRENGTH_TRAINING = 'strength_training',
  CARDIO = 'cardio',
  HIIT = 'hiit',
  YOGA = 'yoga',
  PILATES = 'pilates',
  STRETCHING = 'stretching',
  REHABILITATION = 'rehabilitation',
  SPORTS_SPECIFIC = 'sports_specific',
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps?: number;
  duration?: number; // en secondes
  weight?: number; // en kg
  restTime?: number; // en secondes
  notes?: string;
}

// Types pour les sessions d'entraînement
export interface WorkoutSession {
  id: string;
  workoutId: string;
  workout: Workout;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: WorkoutSessionStatus;
  exercises: SessionExercise[];
  notes?: string;
  rating?: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkoutSessionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export interface SessionExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: SessionSet[];
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface SessionSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

// Types pour les statistiques d'entraînement
export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // en minutes
  totalVolume: number; // kg * reps
  averageRating: number;
  streakDays: number;
  weeklyFrequency: number;
  monthlyProgress: MonthlyWorkoutProgress[];
  muscleGroupDistribution: MuscleGroupStats[];
  personalRecords: PersonalRecord[];
}

export interface MonthlyWorkoutProgress {
  month: string;
  year: number;
  workouts: number;
  duration: number;
  volume: number;
}

export interface MuscleGroupStats {
  muscleGroup: MuscleGroup;
  workouts: number;
  volume: number;
  percentage: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exercise: Exercise;
  type: 'max_weight' | 'max_reps' | 'max_duration';
  value: number;
  unit: string;
  achievedAt: Date;
}

// Types pour la planification d'entraînement
export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  duration: number; // en semaines
  difficulty: ExerciseDifficulty;
  goal: FitnessGoal;
  workouts: PlanWorkout[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
  REHABILITATION = 'rehabilitation',
}

export interface PlanWorkout {
  workoutId: string;
  workout: Workout;
  week: number;
  day: number;
  order: number;
}
