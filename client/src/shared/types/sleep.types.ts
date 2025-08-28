/**
 * Types pour les fonctionnalités de sommeil
 */

// Types de base pour le sommeil
export interface SleepEntry {
  id: string;
  userId: string;
  date: Date;
  bedTime: Date;
  sleepTime?: Date;
  wakeTime: Date;
  getUpTime?: Date;
  duration: number; // en minutes
  quality: SleepQuality;
  stages?: SleepStages;
  notes?: string;
  mood?: SleepMood;
  factors?: SleepFactor[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SleepQuality {
  VERY_POOR = 1,
  POOR = 2,
  FAIR = 3,
  GOOD = 4,
  EXCELLENT = 5
}

export enum SleepMood {
  TERRIBLE = 1,
  BAD = 2,
  OKAY = 3,
  GOOD = 4,
  GREAT = 5
}

export interface SleepStages {
  light: number; // en minutes
  deep: number; // en minutes
  rem: number; // en minutes
  awake: number; // en minutes
}

export enum SleepFactor {
  CAFFEINE = 'caffeine',
  ALCOHOL = 'alcohol',
  EXERCISE = 'exercise',
  STRESS = 'stress',
  SCREEN_TIME = 'screen_time',
  MEDICATION = 'medication',
  TEMPERATURE = 'temperature',
  NOISE = 'noise',
  LATE_MEAL = 'late_meal',
  NAPPING = 'napping'
}

// Types pour les objectifs de sommeil
export interface SleepGoals {
  id: string;
  userId: string;
  targetBedTime: string; // format HH:mm
  targetWakeTime: string; // format HH:mm
  targetDuration: number; // en minutes
  targetQuality: SleepQuality;
  consistencyGoal: number; // pourcentage
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les rappels de sommeil
export interface SleepReminder {
  id: string;
  userId: string;
  type: SleepReminderType;
  time: string; // format HH:mm
  message: string;
  enabled: boolean;
  daysOfWeek: number[]; // 0-6, dimanche = 0
  createdAt: Date;
  updatedAt: Date;
}

export enum SleepReminderType {
  BEDTIME = 'bedtime',
  WIND_DOWN = 'wind_down',
  WAKE_UP = 'wake_up',
  NAP_LIMIT = 'nap_limit'
}

// Types pour les statistiques de sommeil
export interface SleepStats {
  averageDuration: number; // en minutes
  averageQuality: number;
  averageBedTime: string; // format HH:mm
  averageWakeTime: string; // format HH:mm
  consistency: number; // pourcentage
  sleepDebt: number; // en minutes
  weeklyProgress: WeeklySleepProgress[];
  qualityTrend: SleepTrend;
  durationTrend: SleepTrend;
  sleepEfficiency: number; // pourcentage
}

export interface WeeklySleepProgress {
  week: string;
  year: number;
  averageDuration: number;
  averageQuality: number;
  consistency: number;
  goalAchievement: number; // pourcentage
}

export enum SleepTrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining'
}

// Types pour l'analyse du sommeil
export interface SleepAnalysis {
  id: string;
  userId: string;
  period: AnalysisPeriod;
  startDate: Date;
  endDate: Date;
  insights: SleepInsight[];
  recommendations: SleepRecommendation[];
  patterns: SleepPattern[];
  createdAt: Date;
}

export enum AnalysisPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export interface SleepInsight {
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
  data?: any;
}

export enum InsightType {
  DURATION_PATTERN = 'duration_pattern',
  QUALITY_PATTERN = 'quality_pattern',
  BEDTIME_CONSISTENCY = 'bedtime_consistency',
  WAKE_TIME_CONSISTENCY = 'wake_time_consistency',
  FACTOR_CORRELATION = 'factor_correlation',
  SLEEP_DEBT = 'sleep_debt'
}

export enum InsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface SleepRecommendation {
  title: string;
  description: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  actionItems: string[];
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RecommendationCategory {
  SLEEP_HYGIENE = 'sleep_hygiene',
  BEDTIME_ROUTINE = 'bedtime_routine',
  ENVIRONMENT = 'environment',
  LIFESTYLE = 'lifestyle',
  TIMING = 'timing'
}

export interface SleepPattern {
  type: PatternType;
  description: string;
  frequency: number; // pourcentage
  correlation: number; // -1 à 1
}

export enum PatternType {
  WEEKLY_CYCLE = 'weekly_cycle',
  MONTHLY_CYCLE = 'monthly_cycle',
  SEASONAL_PATTERN = 'seasonal_pattern',
  FACTOR_IMPACT = 'factor_impact'
}

// Types pour la configuration du sommeil par sport
export interface SportSleepConfig {
  sport: string;
  recommendedDuration: {
    min: number;
    max: number;
  };
  qualityFactors: string[];
  recoveryTips: string[];
  sleepHygieneTips: string[];
  benefits: string[];
}

// Types pour les routines de sommeil
export interface SleepRoutine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  activities: RoutineActivity[];
  duration: number; // en minutes
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineActivity {
  id: string;
  name: string;
  description?: string;
  duration: number; // en minutes
  order: number;
  category: ActivityCategory;
}

export enum ActivityCategory {
  RELAXATION = 'relaxation',
  HYGIENE = 'hygiene',
  MEDITATION = 'meditation',
  READING = 'reading',
  PREPARATION = 'preparation',
  ENVIRONMENT = 'environment'
}
