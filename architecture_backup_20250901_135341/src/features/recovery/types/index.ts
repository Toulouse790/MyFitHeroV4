// Types pour le module de récupération

export interface RecoveryMetrics {
  id?: string;
  userId: string;
  date: string;
  
  // Métriques physiologiques
  sleepQuality: number; // 0-10
  sleepDuration: number; // heures
  restingHeartRate: number; // bpm
  hrVariability: number; // ms
  
  // Métriques subjectives
  stressLevel: number; // 0-10
  muscleStiffness: number; // 0-10
  energyLevel: number; // 0-10
  moodScore: number; // 0-10
  
  // Scores calculés
  overallScore?: number; // 0-100
  readinessScore?: number; // 0-100
}

export interface RecoveryActivity {
  id?: string;
  userId: string;
  type: 'massage' | 'stretching' | 'meditation' | 'cold_therapy' | 'heat_therapy' | 'sleep' | 'rest';
  duration: number; // minutes
  intensity?: number; // 0-10
  notes?: string;
  timestamp: string;
  benefits?: string[];
}

export interface RecoveryData {
  id?: string;
  userId: string;
  currentScore: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  
  // Historique
  history: RecoveryHistoryEntry[];
  
  // Activités récentes
  recentActivities: RecoveryActivity[];
}

export interface RecoveryHistoryEntry {
  date: string;
  overallScore: number;
  sleepScore: number;
  stressScore: number;
  energyScore: number;
  notes?: string;
}

export interface RecoveryRecommendation {
  id: string;
  type: 'sleep' | 'nutrition' | 'activity' | 'stress' | 'recovery';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  estimatedBenefit: string;
  timeToComplete?: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface RecoveryGoal {
  id?: string;
  userId: string;
  type: 'sleep_duration' | 'sleep_quality' | 'stress_reduction' | 'energy_improvement';
  target: number;
  current: number;
  deadline?: string;
  isActive: boolean;
}

export interface RecoveryInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'achievement' | 'warning';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  actionable: boolean;
  createdAt: string;
}

// Types pour les graphiques et analytics
export interface RecoveryTrendData {
  date: string;
  overall: number;
  sleep: number;
  stress: number;
  energy: number;
  hrv: number;
}

export interface RecoveryComparison {
  current: RecoveryMetrics;
  previous: RecoveryMetrics;
  improvement: {
    overall: number;
    sleep: number;
    stress: number;
    energy: number;
  };
}

// Configuration et paramètres
export interface RecoverySettings {
  userId: string;
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    goalAchievement: boolean;
  };
  goals: RecoveryGoal[];
  preferences: {
    preferredActivities: string[];
    availableTime: number; // minutes par jour
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}
