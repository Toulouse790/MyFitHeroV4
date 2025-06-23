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
  water: number;        // en L
  calories: number;     // kcal
  protein: number;      // g
  carbs: number;        // g
  fat: number;          // g
  steps: number;        // pas
  workouts: number;     // séances
  sleep: number;        // heures
}

interface AppState {
  // === USER DATA ===
  user: UserProfile;
  dailyGoals: DailyGoals;
  
  // === DAILY DATA ===
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
  // Hydratation
  addHydration: (amount: number, type?: string) => void;
  removeLastHydration: () => void;
  resetDailyHydration: () => void;
  
  // Workouts
  addWorkout: (workout: Omit<WorkoutSession, 'id'>) => void;
  
  // Nutrition
  addNutrition: (nutrition: Omit<NutritionEntry, 'id'>) => void;
  
  // Sleep
  addSleep: (sleep: Omit<SleepEntry, 'id'>) => void;
  
  // Achievements
  unlockAchievement: (achievementId: string) => void;
  
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;
  addExperience: (points: number) => void;
  
  // Utils
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
  water: 2.5,      // 2.5L
  calories: 2200,  // 2200 kcal
  protein: 120,    // 120g
  carbs: 250,      // 250g
  fat: 70,         // 70g
  steps: 10000,    // 10k pas
  workouts: 1,     // 1 séance/jour
  sleep: 8         // 8h
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
      // === STATE INITIAL ===
      user: initialUser,
      dailyGoals: initialGoals,
      hydrationEntries: [],
      workoutSessions: [],
      nutritionEntries: [],
      sleepEntries: [],
      achievements: initialAchievements,

      // === COMPUTED VALUES ===
      getTodayHydration: () => {
        const today = new Date().toDateString();
        const todayEntries = get().hydrationEntries.filter(
          entry => new Date(entry.time).toDateString() === today
        );
        return todayEntries.reduce((total, entry) => total + entry.amount, 0) / 1000; // en L
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
            ? weekHydration.reduce((total, h) => total + h.amount, 0) / 7000 // en L/jour
            : 0
        };
      },

      // === ACTIONS HYDRATATION ===
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

        // Vérifier achievements
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

      // === ACTIONS WORKOUTS ===
      addWorkout: (workout) => {
        const newWorkout: WorkoutSession = {
          id: Date.now().toString(),
          ...workout
        };

        set(state => ({
          workoutSessions: [...state.workoutSessions, newWorkout]
        }));

        // Add experience points
        get().addExperience(50);

        // Check achievements
        const { workoutSessions, unlockAchievement } = get();
        if (workoutSessions.length === 1) {
          unlockAchievement('first-workout');
        }
        if (workoutSessions.length >= 100) {
          unlockAchievement('marathon');
        }
      },

      // === ACTIONS NUTRITION ===
      addNutrition: (nutrition) => {
        const newNutrition: NutritionEntry = {
          id: Date.now().toString(),
          ...nutrition
        };

        set(state => ({
          nutritionEntries: [...state.nutritionEntries, newNutrition]
        }));
      },

      // === ACTIONS SLEEP ===
      addSleep: (sleep) => {
        const newSleep: SleepEntry = {
          id: Date.now().toString(),
          ...sleep
        };

        set(state => ({
          sleepEntries: [...state.sleepEntries, newSleep]
        }));
      },

      // === ACTIONS ACHIEVEMENTS ===
      unlockAchievement: (achievementId) => {
        set(state => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId && !achievement.unlocked
              ? { ...achievement, unlocked: true, unlockedDate: new Date().toISOString() }
              : achievement
          )
        }));

        // Add bonus points
        get().addExperience(100);
      },

      // === ACTIONS PROFILE ===
      updateProfile: (updates) => {
        set(state => ({
          user: { ...state.user, ...updates }
        }));
      },

      addExperience: (points) => {
        set(state => {
          const newPoints = state.user.totalPoints + points;
          const newLevel = Math.floor(newPoints / 200) + 1; // 200 points par niveau
          
          return {
            user: {
              ...state.user,
              totalPoints: newPoints,
              level: newLevel
            }
          };
        });
      },

      // === UTILS ===
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
      name: 'myfitherov4-storage', // nom unique pour localStorage
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
