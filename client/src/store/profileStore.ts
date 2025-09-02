import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour le profil utilisateur
export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
  fitnessGoal?: 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle' | 'improve_fitness';
  targetWeight?: number;
  weeklyGoal?: number;
  units?: {
    weight: 'kg' | 'lb';
    height: 'cm' | 'ft';
    distance: 'km' | 'mi';
    temperature: 'c' | 'f';
  };
  notifications?: {
    workoutReminders: boolean;
    weightTracking: boolean;
    achievements: boolean;
    social: boolean;
  };
  privacy?: {
    profileVisibility: 'public' | 'friends' | 'private';
    shareWorkouts: boolean;
    shareProgress: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface ProfileActions {
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUnits: (units: UserProfile['units']) => Promise<void>;
  updateNotifications: (notifications: UserProfile['notifications']) => Promise<void>;
  updatePrivacy: (privacy: UserProfile['privacy']) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  calculateBMI: () => number | null;
  calculateBMR: () => number | null;
  getProfileCompleteness: () => number;
  resetProfile: () => void;
}

export type ProfileStore = ProfileState & ProfileActions;

// État initial
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Store de profil
export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions de base
      setProfile: profile => {
        set({
          profile,
          error: null,
          lastUpdated: new Date().toISOString(),
        });
      },

      updateProfile: async updates => {
        const { profile } = get();
        if (!profile) {
          set({ error: 'Profil non chargé' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const updatedProfile = {
            ...profile,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // Ici, intégrer l'appel API Supabase
          // await supabaseService.updateProfile(profile.userId, updates);

          set({
            profile: updatedProfile,
            lastUpdated: new Date().toISOString(),
          });
        } catch {
      // Erreur silencieuse
          set({ error: 'Erreur lors de la mise à jour du profil' });
          throw new Error('Erreur lors de la mise à jour du profil');
        } finally {
          set({ isLoading: false });
        }
      },

      updateUnits: async units => {
        if (units) {
          await get().updateProfile({ units });
        }
      },

      updateNotifications: async notifications => {
        if (notifications) {
          await get().updateProfile({ notifications });
        }
      },

      updatePrivacy: async privacy => {
        if (privacy) {
          await get().updateProfile({ privacy });
        }
      },

      loadProfile: async _userId => {
        set({ isLoading: true, error: null });

        try {
          // Ici, intégrer l'appel API Supabase
          // const profile = await supabaseService.getProfile(userId);

          // Simulation pour l'instant
          await new Promise(resolve => setTimeout(resolve, 1000));

          // set({ profile, lastUpdated: new Date().toISOString() });
        } catch {
      // Erreur silencieuse
          set({ error: 'Erreur lors du chargement du profil' });
        } finally {
          set({ isLoading: false });
        }
      },

      setLoading: isLoading => {
        set({ isLoading });
      },

      setError: error => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      // Utilitaires de calcul
      calculateBMI: () => {
        const { profile } = get();
        if (!profile?.weight_kg || !profile?.height_cm) return null;

        const heightInMeters = profile.height_cm / 100;
        return Math.round((profile.weight_kg / (heightInMeters * heightInMeters)) * 10) / 10;
      },

      calculateBMR: () => {
        const { profile } = get();
        if (!profile?.weight_kg || !profile?.height_cm || !profile?.age || !profile?.gender) {
          return null;
        }

        // Formule de Harris-Benedict révisée
        const { weight_kg, height_cm, age, gender } = profile;

        if (gender === 'male') {
          return Math.round(88.362 + 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age);
        } else {
          return Math.round(447.593 + 9.247 * weight_kg + 3.098 * height_cm - 4.33 * age);
        }
      },

      getProfileCompleteness: () => {
        const { profile } = get();
        if (!profile) return 0;

        const requiredFields = [
          'displayName',
          'weight_kg',
          'height_cm',
          'age',
          'gender',
          'activityLevel',
          'fitnessGoal',
        ] as const;

        const completedFields = requiredFields.filter(
          field => profile[field] !== null && profile[field] !== undefined && profile[field] !== ''
        );

        return Math.round((completedFields.length / requiredFields.length) * 100);
      },

      resetProfile: () => {
        set(initialState);
      },
    }),
    {
      name: 'profile-storage',
      partialize: state => ({
        profile: state.profile,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useProfileState = () =>
  useProfileStore(state => ({
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
  }));

export const useProfileActions = () =>
  useProfileStore(state => ({
    updateProfile: state.updateProfile,
    updateUnits: state.updateUnits,
    updateNotifications: state.updateNotifications,
    updatePrivacy: state.updatePrivacy,
    loadProfile: state.loadProfile,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    resetProfile: state.resetProfile,
  }));

export const useProfileMetrics = () =>
  useProfileStore(state => ({
    calculateBMI: state.calculateBMI,
    calculateBMR: state.calculateBMR,
    getProfileCompleteness: state.getProfileCompleteness,
    profile: state.profile,
  }));

export const useUserSettings = () =>
  useProfileStore(state => ({
    units: state.profile?.units,
    notifications: state.profile?.notifications,
    privacy: state.profile?.privacy,
    updateUnits: state.updateUnits,
    updateNotifications: state.updateNotifications,
    updatePrivacy: state.updatePrivacy,
  }));
