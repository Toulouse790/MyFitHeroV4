import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
// Importe tous les types nécessaires, y compris le UserProfile directement de lib/supabase
import { HydrationEntry, DailyStats, Meal, Json, SleepSession, Workout, Exercise, AiRecommendation, AiRequest, UserProfile as SupabaseDBUserProfile } from '../lib/supabase';

// === TYPES ===
// Le UserProfile du store étend maintenant le UserProfile de la DB Supabase
export interface UserProfile extends SupabaseDBUserProfile { 
  // Champs locaux/calculés qui ne sont pas directement dans la table Supabase,
  // mais gérés par l'application ou dérivés des données Supabase.
  name: string; // Nom d'affichage, peut être full_name ou username
  email: string; // Email de l'utilisateur (peut venir de auth.user)
  goal: string; // Objectif principal résumé (peut être dérivé de fitness_goal)
  level: number; // Niveau de l'utilisateur
  totalPoints: number; // Points d'expérience
  joinDate: string; // Date d'inscription
}

interface WorkoutSession {
  id: string;
  name: string;
  duration: number;
  calories: number;
  date: string;
  exercises: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedDate?: string;
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
  user: UserProfile; // Le user du store est maintenant le type UserProfile complet unifié
  dailyGoals: DailyGoals;
  achievements: Achievement[];
  
  // === ACTIONS LIÉES À SUPABASE ===
  addHydration: (userId: string, amount: number, type?: string) => Promise<HydrationEntry | null>;
  removeLastHydration: (userId: string) => Promise<boolean>;
  addSleepSession: (userId: string, sleepData: { sleep_date: string; bedtime: string; wake_time: string; duration_minutes: number; quality_rating?: number; mood_rating?: number; energy_level?: number; factors?: Json; notes?: string; }) => Promise<SleepSession | null>;
  fetchHydrationEntries: (userId: string, date: string) => Promise<HydrationEntry[]>;
  resetDailyHydration: (userId: string) => Promise<boolean>;
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;

  // ACTIONS POUR LA NUTRITION
  addMeal: (userId: string, mealType: string, foods: Json, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number) => Promise<Meal | null>;
  fetchMeals: (userId: string, date: string) => Promise<Meal[]>;

  // ACTIONS POUR LE SOMMEIL
  fetchSleepSessions: (userId: string, date: string) => Promise<SleepSession[]>;

  // ACTIONS POUR LE SPORT (WORKOUT)
  addWorkoutSession: (userId: string, workoutData: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Workout | null>;
  updateWorkoutSession: (workoutId: string, updates: Partial<Workout>) => Promise<Workout | null>;
  fetchWorkoutSessions: (userId: string, startDate?: string, endDate?: string) => Promise<Workout[]>;
  fetchExercisesLibrary: (category?: string, difficulty?: string) => Promise<Exercise[]>;

  // ACTIONS POUR LES RECOMMANDATIONS IA
  fetchAiRecommendations: (userId: string, pillarType?: string, limit?: number) => Promise<AiRecommendation[]>;


  // === ACTIONS GLOBALES (restent dans le store) ===
  
  unlockAchievement: (achievementId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void; 
  addExperience: (points: number) => void;
  resetAllData: () => void;
}

// === DONNÉES INITIALES ===
// Initialisation de l'utilisateur avec tous les champs possibles du SupabaseUserProfile ET les champs locaux
const initialUser: UserProfile = {
  id: '', 
  username: null,
  full_name: null,
  avatar_url: null,
  age: null,
  height_cm: null,
  weight_kg: null,
  gender: null,
  activity_level: null,
  fitness_goal: null,
  timezone: 'Europe/Paris',
  notifications_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  lifestyle: null,
  available_time_per_day: null,
  fitness_experience: null,
  injuries: null,
  primary_goals: null,
  motivation: null,
  sport: null,
  sport_position: null,
  sport_level: null,
  training_frequency: null,
  season_period: null,

  // Champs locaux/calculés
  name: 'Invité', 
  email: '', 
  goal: 'Non défini', 
  level: 1, 
  totalPoints: 0, 
  joinDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) 
};


const initialGoals: DailyGoals = {
  water: 2.5, // Litres
  calories: 2200, // kcal
  protein: 120, // g
  carbs: 250, // g
  fat: 70, // g
  steps: 10000,
  workouts: 1,
  sleep: 8 // hours
};

const initialAchievements: Achievement[] = [
  { id: 'first-workout', title: 'Premier workout', description: 'Terminez votre premier entraînement', emoji: '🎯', unlocked: false },
  { id: 'perfect-week', title: 'Semaine parfaite', description: "7 jours d'entraînement consécutifs", emoji: '🔥', unlocked: false }, 
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
      achievements: initialAchievements,

      // === ACTIONS DE BASE DE DONNÉES SUPABASE ===

      // Hydratation
      addHydration: async (userId, amount, type = 'water') => {
        try {
          const { data, error } = await supabase
            .from('hydration_logs')
            .insert({ 
                user_id: userId, 
                amount_ml: amount, 
                drink_type: type,
                log_date: new Date().toISOString().split('T')[0],
                logged_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
          
          get().addExperience(10);
          await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: new Date().toISOString().split('T')[0] });
          
          return data as HydrationEntry;
        } catch (error: unknown) {
          console.error('Erreur addHydration:', error);
          return null;
        }
      },

      removeLastHydration: async (userId) => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { data: latestEntry, error: fetchError } = await supabase
            .from('hydration_logs')
            .select('id')
            .eq('user_id', userId)
            .eq('log_date', today)
            .order('logged_at', { ascending: false })
            .limit(1)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
              throw fetchError;
          }
          
          if (latestEntry) {
            const { error: deleteError } = await supabase
              .from('hydration_logs')
              .delete()
              .eq('id', latestEntry.id);

            if (deleteError) throw deleteError;

            await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: today });
            return true;
          }
          return false;
        } catch (error: unknown) {
          console.error('Erreur removeLastHydration:', error);
          return false;
        }
      },

      resetDailyHydration: async (userId) => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { error } = await supabase
            .from('hydration_logs')
            .delete()
            .eq('user_id', userId)
            .eq('log_date', today);

          if (error) throw error;
          
          await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: today });
          return true;
        } catch (error: unknown) {
          console.error('Erreur resetDailyHydration:', error);
          return false;
        }
      },

      fetchHydrationEntries: async (userId, date) => {
        try {
          const { data, error } = await supabase
            .from('hydration_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('log_date', date)
            .order('logged_at', { ascending: false });

          if (error) throw error;
          return data as HydrationEntry[];
        } catch (error: unknown) {
          console.error('Erreur fetchHydrationEntries:', error);
          return [];
        }
      },

      fetchDailyStats: async (userId, date) => {
        try {
          const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('stat_date', date)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          return data as DailyStats | null;
        } catch (error: unknown) {
          console.error('Erreur fetchDailyStats:', error);
          return null;
        }
      },

      // Nutrition
      addMeal: async (userId, mealType, foods, totalCalories, totalProtein, totalCarbs, totalFat) => {
        try {
          const { data, error } = await supabase
            .from('meals')
            .insert({
                user_id: userId,
                meal_type: mealType,
                meal_date: new Date().toISOString().split('T')[0],
                foods: foods, // JSONB
                total_calories: totalCalories,
                total_protein: totalProtein,
                total_carbs: totalCarbs,
                total_fat: totalFat
            })
            .select()
            .single();

          if (error) throw error;

          get().addExperience(20); // Ajouter de l'expérience pour l'ajout de repas
          await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: new Date().toISOString().split('T')[0] });

          return data as Meal;
        } catch (error: unknown) {
          console.error('Erreur addMeal:', error);
          return null;
        }
      },

      fetchMeals: async (userId, date) => {
        try {
          const { data, error } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', userId)
            .eq('meal_date', date)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data as Meal[];
        } catch (error: unknown) {
          console.error('Erreur fetchMeals:', error);
          return [];
        }
      },

      // Sommeil
      addSleepSession: async (userId, sleepData) => {
        try {
          const { data, error } = await supabase
            .from('sleep_sessions')
            .insert({
                user_id: userId,
                sleep_date: sleepData.sleep_date,
                bedtime: sleepData.bedtime,
                wake_time: sleepData.wake_time,
                duration_minutes: sleepData.duration_minutes,
                quality_rating: sleepData.quality_rating,
                mood_rating: sleepData.mood_rating,
                energy_level: sleepData.energy_level,
                factors: sleepData.factors, // JSONB
                notes: sleepData.notes
            })
            .select()
            .single();
          
          if (error) throw error;

          get().addExperience(30); // Ajouter de l'expérience pour l'enregistrement du sommeil
          await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: sleepData.sleep_date });
          
          return data as SleepSession;
        } catch (error: unknown) {
          console.error('Erreur addSleepSession:', error);
          return null;
        }
      },

      fetchSleepSessions: async (userId, date) => {
        try {
          const { data, error } = await supabase
            .from('sleep_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('sleep_date', date)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data as SleepSession[];
        } catch (error: unknown) {
          console.error('Erreur fetchSleepSessions:', error);
          return [];
        }
      },

      // Sport (Workout)
      addWorkoutSession: async (userId, workoutData) => {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .insert({
              user_id: userId,
              name: workoutData.name,
              description: workoutData.description,
              workout_type: workoutData.workout_type,
              duration_minutes: workoutData.duration_minutes,
              calories_burned: workoutData.calories_burned,
              difficulty: workoutData.difficulty,
              exercises: workoutData.exercises,
              notes: workoutData.notes,
              started_at: workoutData.started_at,
              completed_at: workoutData.completed_at
            })
            .select()
            .single();
          
          if (error) throw error;
          
          // Mettre à jour les stats journalières si l'entraînement est complété ou démarre
          if (workoutData.completed_at || workoutData.started_at) {
            await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: new Date().toISOString().split('T')[0] });
          }

          get().addExperience(50); // Expérience pour l'entraînement

          return data as Workout;
        } catch (error: unknown) {
          console.error('Erreur addWorkoutSession:', error);
          return null;
        }
      },

      updateWorkoutSession: async (workoutId, updates) => {
        try {
          const { data, error } = await supabase
            .from('workouts')
            .update(updates)
            .eq('id', workoutId)
            .select()
            .single();

          if (error) throw error;

          // Recalculer les stats si la durée ou les calories changent
          if (updates.duration_minutes || updates.calories_burned) {
            const userId = data?.user_id; // Récupérer l'ID utilisateur de l'entraînement mis à jour
            if (userId) {
              await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: new Date().toISOString().split('T')[0] });
            }
          }

          return data as Workout;
        } catch (error: unknown) {
          console.error('Erreur updateWorkoutSession:', error);
          return null;
        }
      },

      fetchWorkoutSessions: async (userId, startDate, endDate) => {
        try {
          let query = supabase
            .from('workouts')
            .select('*');
          
          if (userId) { 
            query = query.eq('user_id', userId);
          }
          query = query.order('created_at', { ascending: false });
          
          if (startDate) {
            query = query.gte('created_at', startDate);
          }
          if (endDate) {
            query = query.lte('created_at', endDate);
          }

          const { data, error } = await query;

          if (error) throw error;
          return data as Workout[];
        } catch (error: unknown) {
          console.error('Erreur fetchWorkoutSessions:', error);
          return [];
        }
      },

      fetchExercisesLibrary: async (category, difficulty) => {
        try {
          let query = supabase
            .from('exercises_library')
            .select('*');
          
          if (category) {
            query = query.eq('category', category);
          }
          if (difficulty) {
            query = query.eq('difficulty', difficulty);
          }

          const { data, error } = await query;

          if (error) throw error;
          return data as Exercise[];
        } catch (error: unknown) {
          console.error('Erreur fetchExercisesLibrary:', error);
          return [];
        }
      },

      fetchAiRecommendations: async (userId, pillarType, limit = 5) => {
        try {
          let query = supabase
            .from('ai_recommendations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          if (pillarType) {
            query = query.eq('pillar_type', pillarType);
          }

          const { data, error } = await query;

          if (error) throw error;
          const filteredData = data.filter(rec => rec.recommendation && rec.metadata);
          return filteredData as AiRecommendation[];
        } catch (error: unknown) {
          console.error('Erreur fetchAiRecommendations:', error);
          return [];
        }
      },


      // === ACTIONS GLOBALES ===
      
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
          achievements: initialAchievements
        });
      }
    }),
    {
      name: 'myfitherov4-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        dailyGoals: state.dailyGoals,
        achievements: state.achievements
      })
    }
  )
);