import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// Types pour les balances connectées
export interface ScaleDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  batteryLevel?: number;
  isConnected: boolean;
  lastSync?: string;
  connectionType: 'bluetooth' | 'wifi' | 'api';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour l'historique du poids
export interface WeightEntry {
  id?: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercentage?: number;
  visceralFat?: number;
  bmr?: number;
  source: 'manual' | 'scale' | 'import';
  scaleId?: string;
  userId: string;
  createdAt?: string;
}

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
  gender?: 'male' | 'female' | 'null';
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

// Types pour les lectures de balance
export interface ScaleReading {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercentage?: number;
  visceralFat?: number;
  bmr?: number;
  timestamp: string;
  deviceId: string;
}

// Interface principale du store
interface AppStore {
  // État utilisateur
  user: any;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // État des balances connectées
  connectedScales: ScaleDevice[];
  weightHistory: WeightEntry[];
  isScanning: boolean;
  isSyncing: boolean;
  lastScaleSync: string | null;

  // Actions utilisateur
  setUser: (user: any) => void;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;

  // Actions balances connectées
  connectScale: (device: Omit<ScaleDevice, 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  disconnectScale: (scaleId: string) => Promise<void>;
  syncScaleWeight: (scaleId: string) => Promise<number>;
  loadConnectedScales: (userId: string) => Promise<void>;
  updateScaleStatus: (scaleId: string, updates: Partial<ScaleDevice>) => Promise<void>;

  // Actions historique du poids
  addWeightEntry: (entry: Omit<WeightEntry, 'userId' | 'createdAt'>) => Promise<void>;
  updateWeightEntry: (entryId: string, updates: Partial<WeightEntry>) => Promise<void>;
  deleteWeightEntry: (entryId: string) => Promise<void>;
  loadWeightHistory: (userId: string, limit?: number) => Promise<void>;

  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  calculateBMI: () => number | null;
  getWeightTrend: () => { type: 'up' | 'down' | 'stable'; diff: number } | null;
  getLatestWeight: () => number | null;

  // Actions de synchronisation
  scanForScales: () => Promise<ScaleDevice[]>;
  syncAllScales: () => Promise<void>;
  importWeightData: (data: WeightEntry[]) => Promise<void>;
}

// Service de gestion des balances (simulé)
class ScaleService {
  static async scanForDevices(): Promise<ScaleDevice[]> {
    // Simuler la recherche de balances
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockDevices: Omit<ScaleDevice, 'userId' | 'createdAt' | 'updatedAt'>[] = [
      {
        id: `xiaomi-${Date.now()}`,
        name: 'Mi Body Composition Scale 2',
        brand: 'Xiaomi',
        model: 'XMTZC05HM',
        connectionType: 'bluetooth',
        batteryLevel: 78,
        isConnected: false,
      },
      {
        id: `withings-${Date.now()}`,
        name: 'Body+ WiFi Scale',
        brand: 'Withings',
        model: 'WBS05',
        connectionType: 'wifi',
        isConnected: false,
      },
    ];

    return mockDevices;
  }

  static async connectToDevice(deviceId: string): Promise<boolean> {
    // Simuler la connexion
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.2; // 80% de chance de succès
  }

  static async syncWeight(deviceId: string): Promise<ScaleReading> {
    // Simuler la lecture du poids
    await new Promise(resolve => setTimeout(resolve, 1500));

    const baseWeight = 70 + Math.random() * 30; // Entre 70 et 100kg

    return {
      weight: Math.round(baseWeight * 10) / 10,
      bodyFat: Math.round((10 + Math.random() * 20) * 10) / 10,
      muscleMass: Math.round((30 + Math.random() * 20) * 10) / 10,
      boneMass: Math.round((2 + Math.random() * 2) * 10) / 10,
      waterPercentage: Math.round((50 + Math.random() * 15) * 10) / 10,
      visceralFat: Math.round((5 + Math.random() * 10) * 10) / 10,
      bmr: Math.round(1200 + Math.random() * 800),
      timestamp: new Date().toISOString(),
      deviceId,
    };
  }
}

// Création du store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      userProfile: null,
      isLoading: false,
      error: null,
      connectedScales: [],
      weightHistory: [],
      isScanning: false,
      isSyncing: false,
      lastScaleSync: null,

      // Actions utilisateur
      setUser: user => {
        set({ user });
      },

      setUserProfile: profile => {
        set({ userProfile: profile });
      },

      updateUserProfile: async updates => {
        const { userProfile, user } = get();
        if (!userProfile || !user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          const updatedProfile = {
            ...userProfile,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // Mise à jour en base de données
          const { error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', user.id);

          if (error) throw error;

          set({ userProfile: updatedProfile });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadUserProfile: async userId => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          set({ userProfile: data });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Actions balances connectées
      connectScale: async device => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          // Tenter la connexion
          const connected = await ScaleService.connectToDevice(device.id);
          if (!connected) throw new Error('Échec de la connexion à la balance');

          const newScale: ScaleDevice = {
            ...device,
            isConnected: true,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Sauvegarder en base de données
          const { error } = await supabase.from('connected_scales').insert([newScale]);

          if (error) throw error;

          set(state => ({
            connectedScales: [...state.connectedScales, newScale],
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      disconnectScale: async scaleId => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          // Supprimer de la base de données
          const { error } = await supabase
            .from('connected_scales')
            .delete()
            .eq('id', scaleId)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            connectedScales: state.connectedScales.filter(scale => scale.id !== scaleId),
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      syncScaleWeight: async scaleId => {
        const { user, connectedScales } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        const scale = connectedScales.find(s => s.id === scaleId);
        if (!scale) throw new Error('Balance non trouvée');

        set({ isSyncing: true, error: null });

        try {
          // Synchroniser avec la balance
          const reading = await ScaleService.syncWeight(scaleId);

          // Créer une entrée de poids
          const weightEntry: Omit<WeightEntry, 'userId' | 'createdAt'> = {
            date: reading.timestamp,
            weight: reading.weight,
            bodyFat: reading.bodyFat,
            muscleMass: reading.muscleMass,
            boneMass: reading.boneMass,
            waterPercentage: reading.waterPercentage,
            visceralFat: reading.visceralFat,
            bmr: reading.bmr,
            source: 'scale',
            scaleId: scaleId,
          };

          await get().addWeightEntry(weightEntry);

          // Mettre à jour la dernière synchronisation
          const now = new Date().toISOString();
          await get().updateScaleStatus(scaleId, { lastSync: now });

          set({ lastScaleSync: now });

          return reading.weight;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      loadConnectedScales: async userId => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('connected_scales')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ connectedScales: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      updateScaleStatus: async (scaleId, updates) => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        try {
          const { error } = await supabase
            .from('connected_scales')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', scaleId)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            connectedScales: state.connectedScales.map(scale =>
              scale.id === scaleId ? { ...scale, ...updates } : scale
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      // Actions historique du poids
      addWeightEntry: async entry => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          const newEntry: WeightEntry = {
            ...entry,
            userId: user.id,
            createdAt: new Date().toISOString(),
          };

          // Sauvegarder en base de données
          const { data, error } = await supabase
            .from('weight_entries')
            .insert([newEntry])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            weightHistory: [data, ...state.weightHistory].slice(0, 100), // Garder 100 entrées max
          }));

          // Mettre à jour le profil avec le nouveau poids si c'est plus récent
          const { userProfile } = get();
          if (
            userProfile &&
            (!userProfile.weight_kg || new Date(entry.date) > new Date(userProfile.updatedAt || 0))
          ) {
            await get().updateUserProfile({ weight_kg: entry.weight });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateWeightEntry: async (entryId, updates) => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase
            .from('weight_entries')
            .update(updates)
            .eq('id', entryId)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            weightHistory: state.weightHistory.map(entry =>
              entry.id === entryId ? { ...entry, ...updates } : entry
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteWeightEntry: async entryId => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase
            .from('weight_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            weightHistory: state.weightHistory.filter(entry => entry.id !== entryId),
          }));
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadWeightHistory: async (userId, limit = 50) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('weight_entries')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(limit);

          if (error) throw error;

          set({ weightHistory: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Actions utilitaires
      setLoading: loading => {
        set({ isLoading: loading });
      },

      setError: error => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      calculateBMI: () => {
        const { userProfile } = get();
        if (!userProfile?.weight_kg || !userProfile?.height_cm) return null;

        const heightInMeters = userProfile.height_cm / 100;
        return Math.round((userProfile.weight_kg / (heightInMeters * heightInMeters)) * 10) / 10;
      },

      getWeightTrend: () => {
        const { weightHistory } = get();
        if (weightHistory.length < 2) return null;

        const latest = weightHistory[0].weight;
        const previous = weightHistory[1].weight;
        const diff = latest - previous;

        if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 };
        return {
          type: diff > 0 ? 'up' : 'down',
          diff: Math.abs(diff),
        };
      },

      getLatestWeight: () => {
        const { weightHistory, userProfile } = get();
        if (weightHistory.length > 0) return weightHistory[0].weight;
        return userProfile?.weight_kg || null;
      },

      // Actions de synchronisation
      scanForScales: async () => {
        set({ isScanning: true, error: null });

        try {
          const devices = await ScaleService.scanForDevices();
          return devices;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isScanning: false });
        }
      },

      syncAllScales: async () => {
        const { connectedScales } = get();
        const connectedDevices = connectedScales.filter(scale => scale.isConnected);

        if (connectedDevices.length === 0) return;

        set({ isSyncing: true, error: null });

        try {
          const syncPromises = connectedDevices.map(scale =>
            get()
              .syncScaleWeight(scale.id)
              .catch(error => {
                console.error(`Erreur sync ${scale.name}:`, error);
                return null;
              })
          );

          await Promise.all(syncPromises);
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isSyncing: false });
        }
      },

      importWeightData: async data => {
        const { user } = get();
        if (!user) throw new Error('Utilisateur non connecté');

        set({ isLoading: true, error: null });

        try {
          const entries = data.map(entry => ({
            ...entry,
            userId: user.id,
            source: 'import' as const,
            createdAt: new Date().toISOString(),
          }));

          const { error } = await supabase.from('weight_entries').insert(entries);

          if (error) throw error;

          // Recharger l'historique
          await get().loadWeightHistory(user.id);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'myfit-hero-store',
      partialize: state => ({
        user: state.user,
        userProfile: state.userProfile,
        connectedScales: state.connectedScales,
        weightHistory: state.weightHistory.slice(0, 20), // Persister seulement les 20 dernières entrées
        lastScaleSync: state.lastScaleSync,
      }),
    }
  )
);

// Hook personnalisé pour les balances
export const useScales = () => {
  const {
    connectedScales,
    isScanning,
    isSyncing,
    lastScaleSync,
    connectScale,
    disconnectScale,
    syncScaleWeight,
    scanForScales,
    syncAllScales,
    loadConnectedScales,
    updateScaleStatus,
  } = useAppStore();

  return {
    connectedScales,
    isScanning,
    isSyncing,
    lastScaleSync,
    connectScale,
    disconnectScale,
    syncScaleWeight,
    scanForScales,
    syncAllScales,
    loadConnectedScales,
    updateScaleStatus,
  };
};

// Hook personnalisé pour le poids
export const useWeight = () => {
  const {
    weightHistory,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    loadWeightHistory,
    importWeightData,
    calculateBMI,
    getWeightTrend,
    getLatestWeight,
  } = useAppStore();

  return {
    weightHistory,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    loadWeightHistory,
    importWeightData,
    calculateBMI,
    getWeightTrend,
    getLatestWeight,
  };
};

// Hook personnalisé pour le profil
export const useProfile = () => {
  const { userProfile, updateUserProfile, loadUserProfile, isLoading, error } = useAppStore();

  return {
    userProfile,
    updateUserProfile,
    loadUserProfile,
    isLoading,
    error,
  };
};

export default useAppStore;
