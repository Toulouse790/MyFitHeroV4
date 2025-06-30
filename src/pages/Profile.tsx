import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { HydrationEntry, DailyStats, Meal, UserProfile as SupabaseUserProfile, Json, SleepSession, Workout, Exercise, AiRecommendation, AiRequest } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: string | null;
  activity_level: string | null;
  fitness_goal: string | null;
  timezone: string | null;
  notifications_enabled: boolean | null;
  created_at: string;
  updated_at: string;
  lifestyle: string | null;
  available_time_per_day: number | null;
  fitness_experience: string | null;
  injuries: string[] | null;
  primary_goals: string[] | null;
  motivation: string | null;
  sport: string | null;
  sport_position: string | null;
  sport_level: string | null;
  training_frequency: number | null;
  season_period: string | null;

  name: string;
  email: string;
  goal: string;
  level: number;
  totalPoints: number;
  joinDate: string;
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
  user: UserProfile;
  dailyGoals: DailyGoals;
  achievements: Achievement[];
  
  addHydration: (userId: string, amount: number, type?: string) => Promise<HydrationEntry | null>;
  removeLastHydration: (userId: string) => Promise<boolean>;
  resetDailyHydration: (userId: string) => Promise<boolean>;
  fetchHydrationEntries: (userId: string, date: string) => Promise<HydrationEntry[]>;
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;

  addMeal: (userId: string, mealType: string, foods: Json, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number) => Promise<Meal | null>;
  fetchMeals: (userId: string, date: string) => Promise<Meal[]>;

  addSleepSession: (userId: string, sleepData: { sleep_date: string; bedtime: string; wake_time: string; duration_minutes: number; quality_rating?: number; mood_rating?: number; energy_level?: number; factors?: Json; notes?: string; }) => Promise<SleepSession | null>;
  fetchSleepSessions: (userId: string, date: string) => Promise<SleepSession[]>;

  addWorkoutSession: (userId: string, workoutData: Omit<Workout, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Workout | null>;
  updateWorkoutSession: (workoutId: string, updates: Partial<Workout>) => Promise<Workout | null>;
  fetchWorkoutSessions: (userId: string, startDate?: string, endDate?: string) => Promise<Workout[]>;
  fetchExercisesLibrary: (category?: string, difficulty?: string) => Promise<Exercise[]>;

  fetchAiRecommendations: (userId: string, pillarType?: string, limit?: number) => Promise<AiRecommendation[]>;


  unlockAchievement: (achievementId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void; 
  addExperience: (points: number) => void;
  resetAllData: () => void;
}

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

  name: 'Invité',
  email: '',
  goal: 'Non défini',
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
  { id: 'perfect-week', title: 'Semaine parfaite', description: "7 jours d'entraînement consécutifs", emoji: '🔥', unlocked: false }, 
  { id: 'hydration-master', title: 'Maître hydratation', description: 'Objectif eau atteint 7 jours', emoji: '💧', unlocked: false },
  { id: 'early-bird', title: 'Lève-tôt', description: 'Workout avant 8h', emoji: '🌅', unlocked: false },
  { id: 'marathon', title: 'Marathonien', description: '100 workouts terminés', emoji: '🏃‍♂️', unlocked: false },
  { id: 'nutrition-pro', title: 'Pro nutrition', description: 'Objectif calories 30 jours', emoji: '🍎', unlocked: false }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser, 
      dailyGoals: initialGoals,
      achievements: initialAchievements,

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

      addMeal: async (userId, mealType, foods, totalCalories, totalProtein, totalCarbs, totalFat) => {
        try {
          const { data, error } = await supabase
            .from('meals')
            .insert({
                user_id: userId,
                meal_type: mealType,
                meal_date: new Date().toISOString().split('T')[0],
                foods: foods,
                total_calories: totalCalories,
                total_protein: totalProtein,
                total_carbs: totalCarbs,
                total_fat: totalFat
            })
            .select()
            .single();

          if (error) throw error;

          get().addExperience(20);
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
                factors: sleepData.factors,
                notes: sleepData.notes
            })
            .select()
            .single();
          
          if (error) throw error;

          get().addExperience(30);
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
          
          if (workoutData.completed_at || workoutData.started_at) {
            await supabase.rpc('calculate_daily_stats', { user_uuid: userId, target_date: new Date().toISOString().split('T')[0] });
          }

          get().addExperience(50);

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

          if (updates.duration_minutes || updates.calories_burned) {
            const userId = data?.user_id;
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

// Import React et autre pour Profile.tsx
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Calendar, Target, TrendingUp, Mail, Ruler, Scale, Heart, Shield, Dumbbell as DumbbellIcon, PlusCircle, PenTool, BarChart3, Clock, Zap } from 'lucide-react';
import { useAppStore as useAppStoreFromStore } from '@/stores/useAppStore'; // Renommer pour éviter le conflit
import { User as SupabaseAuthUserType } from '@supabase/supabase-js'; // Importe le type User de Supabase

interface ProfileProps {
  userProfile?: SupabaseAuthUserType; // Le user de la session Supabase
}

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
  const { user: appStoreUser, updateProfile } = useAppStoreFromStore(); // Utilisez le hook renommé
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: appStoreUser.full_name || '',
    username: appStoreUser.username || '',
    email: appStoreUser.email || '',
    age: appStoreUser.age || 0,
    height_cm: appStoreUser.height_cm || 0,
    weight_kg: appStoreUser.weight_kg || 0,
    gender: appStoreUser.gender || '',
    fitness_goal: appStoreUser.fitness_goal || '',
    activity_level: appStoreUser.activity_level || '',
    lifestyle: appStoreUser.lifestyle || '',
    available_time_per_day: appStoreUser.available_time_per_day || 0,
    fitness_experience: appStoreUser.fitness_experience || '',
    injuries: appStoreUser.injuries?.join(', ') || '',
    primary_goals: appStoreUser.primary_goals?.join(', ') || '',
    motivation: appStoreUser.motivation || '',
    sport: appStoreUser.sport || '',
    sport_position: appStoreUser.sport_position || '',
    sport_level: appStoreUser.sport_level || '',
    training_frequency: appStoreUser.training_frequency || 0,
    season_period: appStoreUser.season_period || '',
  });

  useEffect(() => {
    // Mettre à jour les valeurs du formulaire si le profil du store change
    setFormValues({
      fullName: appStoreUser.full_name || '',
      username: appStoreUser.username || '',
      email: appStoreUser.email || '',
      age: appStoreUser.age || 0,
      height_cm: appStoreUser.height_cm || 0,
      weight_kg: appStoreUser.weight_kg || 0,
      gender: appStoreUser.gender || '',
      fitness_goal: appStoreUser.fitness_goal || '',
      activity_level: appStoreUser.activity_level || '',
      lifestyle: appStoreUser.lifestyle || '',
      available_time_per_day: appStoreUser.available_time_per_day || 0,
      fitness_experience: appStoreUser.fitness_experience || '',
      injuries: appStoreUser.injuries?.join(', ') || '',
      primary_goals: appStoreUser.primary_goals?.join(', ') || '',
      motivation: appStoreUser.motivation || '',
      sport: appStoreUser.sport || '',
      sport_position: appStoreUser.sport_position || '',
      sport_level: appStoreUser.sport_level || '',
      training_frequency: appStoreUser.training_frequency || 0,
      season_period: appStoreUser.season_period || '',
    });
  }, [appStoreUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userProfile?.id) {
      alert('Utilisateur non connecté.');
      return;
    }

    try {
      const updates = {
        full_name: formValues.fullName,
        username: formValues.username,
        age: formValues.age,
        height_cm: formValues.height_cm,
        weight_kg: formValues.weight_kg,
        gender: formValues.gender,
        fitness_goal: formValues.fitness_goal,
        activity_level: formValues.activity_level,
        lifestyle: formValues.lifestyle,
        available_time_per_day: formValues.available_time_per_day,
        fitness_experience: formValues.fitness_experience,
        injuries: formValues.injuries.split(',').map(s => s.trim()).filter(Boolean),
        primary_goals: formValues.primary_goals.split(',').map(s => s.trim()).filter(Boolean),
        motivation: formValues.motivation,
        sport: formValues.sport,
        sport_position: formValues.sport_position,
        sport_level: formValues.sport_level,
        training_frequency: formValues.training_frequency,
        season_period: formValues.season_period,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Mettre à jour le store Zustand avec les données fraîchement sauvegardées
        updateProfile({
          ...data,
          name: data.full_name || data.username || 'Non défini',
          email: userProfile.email || '', // Conserver l'email de l'authentification
          goal: data.fitness_goal || 'Non défini',
          level: appStoreUser.level, // Conserver les valeurs locales
          totalPoints: appStoreUser.totalPoints,
          joinDate: new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
        setIsEditing(false);
        alert('Profil mis à jour avec succès !');
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error.message);
      alert('Erreur lors de la mise à jour du profil: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mon Profil</h1>
            <p className="text-gray-600">Gérez vos informations et préférences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PenTool size={20} />
            <span className="hidden sm:inline">{isEditing ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>

        {/* Section Infos Générales */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <UserIcon className="mr-2 text-blue-600" size={20} /> Informations Générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom Complet</label>
              {isEditing ? (
                <input type="text" name="fullName" value={formValues.fullName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.full_name || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pseudo</label>
              {isEditing ? (
                <input type="text" name="username" value={formValues.username} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.username || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-800 font-medium flex items-center space-x-2"><Mail size={16} />{appStoreUser.email || 'Non défini'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Âge</label>
              {isEditing ? (
                <input type="number" name="age" value={formValues.age} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.age || 'Non défini'} ans</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
              {isEditing ? (
                <input type="number" name="height_cm" value={formValues.height_cm} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium flex items-center space-x-2"><Ruler size={16} />{appStoreUser.height_cm || 'Non défini'} cm</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Poids (kg)</label>
              {isEditing ? (
                <input type="number" name="weight_kg" value={formValues.weight_kg} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium flex items-center space-x-2"><Scale size={16} />{appStoreUser.weight_kg || 'Non défini'} kg</p>
              )}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Genre</label>
              {isEditing ? (
                <select name="gender" value={formValues.gender} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.gender || 'Non défini'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Objectifs & Activité */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Target className="mr-2 text-green-600" size={20} /> Objectifs & Activité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Objectif Fitness Principal</label>
              {isEditing ? (
                <input type="text" name="fitness_goal" value={formValues.fitness_goal} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.fitness_goal || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau d'Activité</label>
              {isEditing ? (
                <input type="text" name="activity_level" value={formValues.activity_level} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.activity_level || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Objectifs Primaires (séparés par des virgules)</label>
              {isEditing ? (
                <textarea name="primary_goals" value={formValues.primary_goals} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.primary_goals?.join(', ') || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Motivation</label>
              {isEditing ? (
                <textarea name="motivation" value={formValues.motivation} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.motivation || 'Non défini'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Contexte Sportif */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <DumbbellIcon className="mr-2 text-orange-600" size={20} /> Contexte Sportif
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sport</label>
              {isEditing ? (
                <input type="text" name="sport" value={formValues.sport} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.sport || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Poste/Spécialité</label>
              {isEditing ? (
                <input type="text" name="sport_position" value={formValues.sport_position} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.sport_position || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau Sportif</label>
              {isEditing ? (
                <select name="sport_level" value={formValues.sport_level} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Sélectionner</option>
                  <option value="recreational">Loisir</option>
                  <option value="amateur_competitive">Amateur Compétitif</option>
                  <option value="semi_professional">Semi-Professionnel</option>
                  <option value="professional">Professionnel</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.sport_level || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fréquence d'entraînement (par semaine)</label>
              {isEditing ? (
                <input type="number" name="training_frequency" value={formValues.training_frequency} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.training_frequency || 'Non défini'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Période de la Saison</label>
              {isEditing ? (
                <select name="season_period" value={formValues.season_period} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Sélectionner</option>
                  <option value="off_season">Hors saison</option>
                  <option value="pre_season">Pré-saison</option>
                  <option value="in_season">En saison</option>
                  <option value="recovery">Récupération</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800 font-medium">{appStoreUser.season_period || 'Non défini'}</p>
              )}
            </div>
          </div>
        </div>


        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mt-6"
          >
            <PlusCircle size={20} className="mr-2" />
            Sauvegarder les modifications
          </button>
        )}

        {/* Section Stats Rapides (basées sur le store) */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-purple-600" size={20} /> Mes Statistiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <Zap size={20} className="text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Niveau</p>
                <p className="font-semibold text-gray-800">{appStoreUser.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <Clock size={20} className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">XP Total</p>
                <p className="font-semibold text-gray-800">{appStoreUser.totalPoints}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <Calendar size={20} className="text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="font-semibold text-gray-800">{appStoreUser.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Profile;