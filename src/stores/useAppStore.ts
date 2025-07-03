import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import type { DailyStats, AiRecommendation, HydrationEntry, Meal, Json, SleepSession, UserProfile as SupabaseDBUserProfileType } from '@/lib/supabase';

// Interface pour les objectifs quotidiens
interface DailyGoals {
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sleep: number;
  workouts: number;
}

// ... (autres interfaces comme SleepSessionInput si nécessaire)

// --- NOUVEAU : Helper pour le calcul des objectifs personnalisés ---
const calculatePersonalizedGoals = (profile: UserProfile): DailyGoals => {
  const { weight_kg, height_cm, age, gender, activity_level, fitness_goal, sport } = profile;

  // 1. Calcul du Métabolisme de Base (BMR) via la formule Mifflin-St Jeor
  let bmr = 0;
  if (weight_kg && height_cm && age && gender) {
    if (gender.toLowerCase() === 'male') {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else if (gender.toLowerCase() === 'female') {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }
  }

  // En cas de données manquantes, on retourne des valeurs par défaut sécurisées
  if (bmr <= 0) {
    return { water: 2.5, calories: 2000, protein: 120, carbs: 250, fat: 70, sleep: 8, workouts: 3 };
  }

  // 2. Calcul de la Dépense Énergétique Journalière (TDEE)
  const activityMultipliers = {
    sedentary: 1.2,       // Sédentaire
    light: 1.375,         // Léger
    moderate: 1.55,       // Modéré
    active: 1.725,        // Actif
    very_active: 1.9,     // Très actif
  };
  const multiplier = activityMultipliers[activity_level as keyof typeof activityMultipliers] || 1.4;
  let tdee = bmr * multiplier;

  // 3. Ajustement des calories selon l'objectif de fitness principal
  if (fitness_goal === 'weight_loss') {
    tdee -= 300; // Crée un déficit calorique modéré
  } else if (fitness_goal === 'muscle_gain') {
    tdee += 300; // Crée un surplus calorique modéré
  }
  
  // 4. Calcul des Macronutriments (Exemple de répartition : 40% Glucides, 30% Protéines, 30% Lipides)
  // (1g de Protéine/Glucide ≈ 4 kcal, 1g de Lipide ≈ 9 kcal)
  const proteinGrams = Math.round((tdee * 0.30) / 4);
  const carbsGrams = Math.round((tdee * 0.40) / 4);
  const fatGrams = Math.round((tdee * 0.30) / 9);

  // 5. Calcul de l'objectif de sommeil personnalisé selon le type de sport
  let sleepHours = 8;
  const sportCategory = sport?.toLowerCase() || '';
  if (sportCategory.includes('contact') || sportCategory.includes('football') || sportCategory.includes('rugby')) {
    sleepHours = 9;
  } else if (sportCategory.includes('endurance')) {
    sleepHours = 8.5;
  }

  return {
    calories: Math.round(tdee),
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    sleep: sleepHours,
    water: Math.round((weight_kg || 70) * 35) / 1000, // Objectif d'eau basé sur le poids (35ml par kg)
    workouts: profile.training_frequency || 3, // Basé sur la fréquence d'entraînement de l'utilisateur
  };
};

// --- Définition de l'interface du store ---
interface AppStore {
  user: UserProfile;
  dailyGoals: DailyGoals;
  updateProfile: (userId: string, profile: Partial<SupabaseDBUserProfileType>) => Promise<UserProfile | null>;
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  calculateAndSetDailyGoals: (profile: UserProfile) => void; // NOUVELLE ACTION
  fetchDailyStats: (userId: string, date: string) => Promise<DailyStats | null>;
  // ... (autres actions existantes)
}

const defaultUser: UserProfile = {
  // ... (votre defaultUser existant)
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      // Ces objectifs sont maintenant des valeurs initiales qui seront écrasées
      dailyGoals: {
        water: 2.5,
        calories: 2000,
        protein: 120,
        carbs: 250,
        fat: 70,
        sleep: 8,
        workouts: 1
      },

      // NOUVELLE ACTION : Calcule et met à jour les objectifs dans le store
      calculateAndSetDailyGoals: (profile: UserProfile) => {
        const newGoals = calculatePersonalizedGoals(profile);
        set({ dailyGoals: newGoals });
        console.log('✅ Objectifs journaliers personnalisés et mis à jour :', newGoals);
      },

      // MODIFIÉ : updateProfile appelle maintenant la fonction de calcul
      updateProfile: async (userId: string, profileUpdates: Partial<SupabaseDBUserProfileType>) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .update(profileUpdates)
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const updatedUserState: UserProfile = {
               ...get().user,
               ...data,
               name: data.full_name || data.username || 'Non défini',
               goal: data.fitness_goal || 'Non défini',
               joinDate: new Date(data.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            };
            set({ user: updatedUserState });

            // APPEL CLÉ : Met à jour les objectifs après la mise à jour du profil
            get().calculateAndSetDailyGoals(updatedUserState);

            return updatedUserState;
          }
           return null;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil Supabase:', error);
          throw error;
        }
      },
      
      updateDailyGoals: (goals) => {
        set(state => ({
          dailyGoals: { ...state.dailyGoals, ...goals }
        }));
      },

      // ... (toutes vos autres fonctions existantes : fetchDailyStats, fetchAiRecommendations, addHydration, etc.)
      // AUCUN AUTRE CHANGEMENT N'EST NÉCESSAIRE DANS LES AUTRES FONCTIONS

    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        dailyGoals: state.dailyGoals // Assurez-vous de persister les objectifs mis à jour
      })
    }
  )
);
