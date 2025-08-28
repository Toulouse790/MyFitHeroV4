export interface SleepEntry {
  id: string;
  userId: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // en minutes
  quality: number; // 1-10
  factors: SleepFactor[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SleepFactor {
  id: string;
  name: string;
  type: 'positive' | 'negative';
  impact: 'low' | 'medium' | 'high';
  category: 'environment' | 'lifestyle' | 'physical' | 'mental';
}

export interface SleepGoal {
  id: string;
  userId: string;
  targetDuration: number; // en minutes
  targetBedtime: string;
  targetWakeTime: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  bedtimeConsistency: number; // score 0-100
  sleepDebt: number; // en minutes
  trend: 'improving' | 'stable' | 'declining';
  weeklyData: SleepDayData[];
}

export interface SleepDayData {
  date: string;
  duration: number;
  quality: number;
  bedtime: string;
  wakeTime: string;
}

export interface SportSleepConfig {
  emoji: string;
  sleepGoalHours: number;
  motivationalMessage: string;
  benefits: SleepBenefit[];
  tips: SleepTip[];
}

export interface SleepBenefit {
  icon: any; // Lucide icon component
  title: string;
  value: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SleepTip {
  icon: any; // Lucide icon component
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SleepStore {
  // État
  entries: SleepEntry[];
  currentEntry: SleepEntry | null;
  goals: SleepGoal[];
  currentGoal: SleepGoal | null;
  stats: SleepStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Entries
  addEntry: (entryData: Omit<SleepEntry, 'id' | 'userId' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<SleepEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loadEntries: () => Promise<void>;

  // Actions - Goals
  setGoal: (goalData: Omit<SleepGoal, 'id' | 'userId' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SleepGoal>) => Promise<void>;
  loadGoals: () => Promise<void>;

  // Actions - Stats
  calculateStats: () => Promise<void>;
  loadStats: () => Promise<void>;

  // Actions - Utility
  clearError: () => void;
  resetStore: () => void;
}
