// Types pour le module d'hydratation
export interface HydrationEntry {
  id: string;
  userId: string;
  amount: number; // en ml
  timestamp: string;
  type: 'water' | 'coffee' | 'tea' | 'juice' | 'sports_drink' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HydrationGoal {
  id: string;
  userId: string;
  dailyTarget: number; // en ml
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface HydrationStats {
  daily: {
    current: number;
    target: number;
    percentage: number;
    entries: HydrationEntry[];
  };
  weekly: {
    total: number;
    average: number;
    target: number;
    percentage: number;
    dailyBreakdown: Array<{
      date: string;
      amount: number;
      target: number;
    }>;
  };
  monthly: {
    total: number;
    average: number;
    bestDay: {
      date: string;
      amount: number;
    };
    worstDay: {
      date: string;
      amount: number;
    };
  };
}

export interface HydrationState {
  entries: HydrationEntry[];
  goals: HydrationGoal[];
  currentGoal: HydrationGoal | null;
  stats: HydrationStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface HydrationActions {
  // Entries
  addEntry: (
    entry: Omit<HydrationEntry, 'id' | 'userId' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateEntry: (id: string, updates: Partial<HydrationEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loadEntries: (startDate?: string, endDate?: string) => Promise<void>;

  // Goals
  setGoal: (dailyTarget: number) => Promise<void>;
  updateGoal: (id: string, updates: Partial<HydrationGoal>) => Promise<void>;
  loadGoals: () => Promise<void>;

  // Stats
  calculateStats: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>;

  // Utility
  clearError: () => void;
  resetStore: () => void;
}

export type HydrationStore = HydrationState & HydrationActions;

export interface HydrationFormData {
  amount: number;
  type: HydrationEntry['type'];
  notes?: string;
  timestamp?: string;
}

export interface HydrationChartData {
  date: string;
  amount: number;
  target: number;
  percentage: number;
}

export interface HydrationPreferences {
  defaultType: HydrationEntry['type'];
  quickAmounts: number[]; // montants rapides (ex: [250, 500, 750])
  reminderEnabled: boolean;
  reminderInterval: number; // en minutes
  units: 'ml' | 'oz' | 'cups';
}
