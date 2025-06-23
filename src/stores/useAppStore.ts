import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === TYPES ===
interface HydrationEntry {
  id: string;
  amount: number;
  time: string;
  type: 'water' | 'coffee' | 'tea' | 'juice';
}

interface WorkoutSession {
  id: string;
  name: string;
  duration: number;
  calories: number;
  date: string;
  exercises: number;
}

interface NutritionEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  time: string;
}

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeup: string;
  duration: number;
  quality: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  level: number;
  totalPoints: number;
  joinDate: string;
}

interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  workouts: number;
  sleep: number;
}

interface AppState {
  user: UserProfile;
  dailyGoals: DailyGoals;
  hydrationEntries: HydrationEntry[];
  workoutSessions: WorkoutSession[];
  nutritionEntries: NutritionEntry[];
  sleepEntries: SleepEntry[];
  achievements: Achievement[];
  
  // === COMPUTED VALUES ===
  getTodayHydration: () => number;
  getTodayCalories: () => number;
  getTodayWorkouts: () => number;
  getWeeklyStats: () => any;
  
  // === ACTIONS ===
  addHydration: (amount: number, type?: string) => void;
  removeLastHydration: () => void;
  resetDailyHydration: () => void;
  addWorkout: (workout: Omit<WorkoutSession, 'id'>) => void;
  addNutrition: (nutrition: Omit<NutritionEntry, 'id'>) => void;
  addSleep: (sleep: Omit<SleepEntry, 'id'>) => void;
  unlockAchievement: (achievementId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addExperience: (points: number) => void;
  resetAllData: () => void;
}

// === DONNÉES INITIALES ===
const initialUser: UserProfile = {
  name: 'Alex Martin',
  email: 'alex.martin@email.com',
  avatar: '👨‍💻',
  age: 28,
  weight: 75,
  height: 180,
  goal: 'Prise de masse',
  level: 1,
  totalPoints: 0,
  joinDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
};

const initialGoals: DailyGoals = {
  water: 2.5,
  calories: 2200,
  protein: 120,
  carbs: 250,
  fat: 70,
  steps: 10000,
  workouts: 1,
  sleep: 8
};

const initialAchievements: Achievement[] = [
  { id: 'first-workout', title: 'Premier workout', description: 'Terminez votre premier entraînement', emoji: '🎯', unlocked: false },
  { id: 'perfect-week', title: 'Semaine parfaite', description: '7 jours d\'entraînement consécutifs', emoji: '🔥', unlocked: false },
  { id: 'hydration-master', title: 'Maître hydratation', description: 'Objectif eau atteint 7 jours', emoji: '💧', unlocked: false },
  { id: 'early-bird', title: 'Lève-tôt', description: 'Workout avant 8h', emoji: '🌅', unlocked: false },
  { id: 'marathon', title: 'Marathonien', description: '100 workouts terminés', emoji: '🏃‍♂️', unlocked: false },
  { id: 'nutrition-pro', title: 'Pro nutrition', description: 'Objectif calories 30 jours', emoji: '🍎', unlocked: false }
];

// === STORE ZUSTAND ===
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      dailyGoals: initialGoals,
      hydrationEntries: [],
      workoutSessions: [],
      nutritionEntries: [],
      sleepEntries: [],
      achievements: initialAchievements,

      getTodayHydration: () => {
        const today = new Date().toDateString();
        const todayEntries = get().hydrationEntries.filter(
          entry => new Date(entry.time).toDateString() === today
        );
        return todayEntries.reduce((total, entry) => total + entry.amount, 0) / 1000;
      },

      getTodayCalories: () => {
        const today = new Date().toDateString();
        const todayEntries = get().nutritionEntries.filter(
          entry => new Date(entry.time).toDateString() === today
        );
        return todayEntries.reduce((total, entry) => total + entry.calories, 0);
      },

      getTodayWorkouts: () => {
        const today = new Date().toDateString();
        return get().workoutSessions.filter(
          session => new Date(session.date).toDateString() === today
        ).length;
      },

      getWeeklyStats: () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weekWorkouts = get().workoutSessions.filter(
          session => new Date(session.date) >= weekAgo
        );
        
        const weekHydration = get().hydrationEntries.filter(
          entry => new Date(entry.time) >= weekAgo
        );

        return {
          workouts: weekWorkouts.length,
          totalDuration: weekWorkouts.reduce((total, w) => total + w.duration, 0),
          totalCalories: weekWorkouts.reduce((total, w) => total + w.calories, 0),
          avgHydration: weekHydration.length > 0 
            ? weekHydration.reduce((total, h) => total + h.amount, 0) / 7000
            : 0
        };
      },

      addHydration: (amount: number, type = 'water') => {
        const newEntry: HydrationEntry = {
          id: Date.now().toString(),
          amount,
          time: new Date().toISOString(),
          type: type as any
        };

        set(state => ({
          hydrationEntries: [...state.hydrationEntries, newEntry]
        }));

        get().addExperience(10);

        const { getTodayHydration, dailyGoals, unlockAchievement } = get();
        if (getTodayHydration() >= dailyGoals.water) {
          unlockAchievement('hydration-master');
        }
      },

      removeLastHydration: () => {
        set(state => ({
          hydrationEntries: state.hydrationEntries.slice(0, -1)
        }));
      },

      resetDailyHydration: () => {
        const today = new Date().toDateString();
        set(state => ({
          hydrationEntries: state.hydrationEntries.filter(
            entry => new Date(entry.time).toDateString() !== today
          )
        }));
      },

      addWorkout: (workout) => {
        const newWorkout: WorkoutSession = {
          id: Date.now().toString(),
          ...workout
        };

        set(state => ({
          workoutSessions: [...state.workoutSessions, newWorkout]
        }));

        get().addExperience(50);

        const { workoutSessions, unlockAchievement } = get();
        if (workoutSessions.length === 1) {
          unlockAchievement('first-workout');
        }
        if (workoutSessions.length >= 100) {
          unlockAchievement('marathon');
        }
      },

      addNutrition: (nutrition) => {
        const newNutrition: NutritionEntry = {
          id: Date.now().toString(),
          ...nutrition
        };

        set(state => ({
          nutritionEntries: [...state.nutritionEntries, newNutrition]
        }));

        get().addExperience(20);
      },

      addSleep: (sleep) => {
        const newSleep: SleepEntry = {
          id: Date.now().toString(),
          ...sleep
        };

        set(state => ({
          sleepEntries: [...state.sleepEntries, newSleep]
        }));

        get().addExperience(30);
      },

      unlockAchievement: (achievementId) => {
        set(state => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId && !achievement.unlocked
              ? { ...achievement, unlocked: true, unlockedDate: new Date().toISOString() }
              : achievement
          )
        }));

        get().addExperience(100);
      },

      updateProfile: (updates) => {
        set(state => ({
          user: { ...state.user, ...updates }
        }));
      },

      addExperience: (points) => {
        set(state => {
          const newPoints = state.user.totalPoints + points;
          const newLevel = Math.floor(newPoints / 200) + 1;
          
          return {
            user: {
              ...state.user,
              totalPoints: newPoints,
              level: newLevel
            }
          };
        });
      },

      resetAllData: () => {
        set({
          user: initialUser,
          dailyGoals: initialGoals,
          hydrationEntries: [],
          workoutSessions: [],
          nutritionEntries: [],
          sleepEntries: [],
          achievements: initialAchievements
        });
      }
    }),
    {
      name: 'myfitherov4-storage',
      partialize: (state) => ({
        user: state.user,
        dailyGoals: state.dailyGoals,
        hydrationEntries: state.hydrationEntries,
        workoutSessions: state.workoutSessions,
        nutritionEntries: state.nutritionEntries,
        sleepEntries: state.sleepEntries,
        achievements: state.achievements
      })
    }
  )
);
