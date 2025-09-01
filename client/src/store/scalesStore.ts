import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface ScalesState {
  connectedScales: ScaleDevice[];
  weightHistory: WeightEntry[];
  isScanning: boolean;
  isSyncing: boolean;
  lastScaleSync: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ScalesActions {
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

  // Actions de synchronisation
  scanForScales: () => Promise<ScaleDevice[]>;
  syncAllScales: () => Promise<void>;
  importWeightData: (data: WeightEntry[]) => Promise<void>;

  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getWeightTrend: () => { type: 'up' | 'down' | 'stable'; diff: number } | null;
  getLatestWeight: () => number | null;
  getWeightStats: () => { min: number; max: number; avg: number; entries: number };
}

export type ScalesStore = ScalesState & ScalesActions;

// Service de gestion des balances (simulé pour l'instant)
class ScaleService {
  static async scanForDevices(): Promise<
    Omit<ScaleDevice, 'userId' | 'createdAt' | 'updatedAt'>[]
  > {
    await new Promise(resolve => setTimeout(resolve, 3000));

    return [
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
  }

  static async connectToDevice(_deviceId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.2; // 80% de chance de succès
  }

  static async syncWeight(deviceId: string): Promise<ScaleReading> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const baseWeight = 70 + Math.random() * 30;

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

// État initial
const initialState: ScalesState = {
  connectedScales: [],
  weightHistory: [],
  isScanning: false,
  isSyncing: false,
  lastScaleSync: null,
  isLoading: false,
  error: null,
};

// Store des balances et poids
export const useScalesStore = create<ScalesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions balances connectées
      connectScale: async device => {
        set({ isLoading: true, error: null });

        try {
          const connected = await ScaleService.connectToDevice(device.id);
          if (!connected) throw new Error('Échec de la connexion à la balance');

          const newScale: ScaleDevice = {
            ...device,
            isConnected: true,
            userId: 'current-user-id', // À remplacer par l'ID utilisateur réel
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Ici, sauvegarder en base de données
          // await supabaseService.insertScale(newScale);

          set(state => ({
            connectedScales: [...state.connectedScales, newScale],
          }));
        } catch {
          set({ error: 'Erreur lors de la connexion à la balance' });
          throw new Error('Erreur lors de la connexion à la balance');
        } finally {
          set({ isLoading: false });
        }
      },

      disconnectScale: async scaleId => {
        set({ isLoading: true, error: null });

        try {
          // Ici, supprimer de la base de données
          // await supabaseService.deleteScale(scaleId);

          set(state => ({
            connectedScales: state.connectedScales.filter(scale => scale.id !== scaleId),
          }));
        } catch {
          set({ error: 'Erreur lors de la déconnexion de la balance' });
          throw new Error('Erreur lors de la déconnexion de la balance');
        } finally {
          set({ isLoading: false });
        }
      },

      syncScaleWeight: async scaleId => {
        const { connectedScales } = get();
        const scale = connectedScales.find(s => s.id === scaleId);
        if (!scale) throw new Error('Balance non trouvée');

        set({ isSyncing: true, error: null });

        try {
          const reading = await ScaleService.syncWeight(scaleId);

          const weightEntry: Omit<WeightEntry, 'userId' | 'createdAt'> = {
            date: reading.timestamp,
            weight: reading.weight,
            bodyFat: reading.bodyFat || undefined,
            muscleMass: reading.muscleMass || undefined,
            boneMass: reading.boneMass || undefined,
            waterPercentage: reading.waterPercentage || undefined,
            visceralFat: reading.visceralFat || undefined,
            bmr: reading.bmr || undefined,
            source: 'scale',
            scaleId: scaleId,
          };

          await get().addWeightEntry(weightEntry);

          const now = new Date().toISOString();
          await get().updateScaleStatus(scaleId, { lastSync: now });

          set({ lastScaleSync: now });

          return reading.weight;
        } catch {
          set({ error: 'Erreur lors de la synchronisation du poids' });
          throw new Error('Erreur lors de la synchronisation du poids');
        } finally {
          set({ isSyncing: false });
        }
      },

      loadConnectedScales: async _userId => {
        set({ isLoading: true, error: null });

        try {
          // Ici, charger depuis la base de données
          // const scales = await supabaseService.getScales(userId);
          // set({ connectedScales: scales });
        } catch {
          set({ error: 'Erreur lors du chargement des balances' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateScaleStatus: async (scaleId, updates) => {
        try {
          // Ici, mettre à jour en base de données
          // await supabaseService.updateScale(scaleId, updates);

          set(state => ({
            connectedScales: state.connectedScales.map(scale =>
              scale.id === scaleId ? { ...scale, ...updates } : scale
            ),
          }));
        } catch {
          set({ error: 'Erreur lors de la mise à jour de la balance' });
          throw new Error('Erreur lors de la mise à jour de la balance');
        }
      },

      // Actions historique du poids
      addWeightEntry: async entry => {
        set({ isLoading: true, error: null });

        try {
          const newEntry: WeightEntry = {
            ...entry,
            id: `weight-${Date.now()}`,
            userId: 'current-user-id', // À remplacer
            createdAt: new Date().toISOString(),
          };

          // Ici, sauvegarder en base de données
          // await supabaseService.insertWeightEntry(newEntry);

          set(state => ({
            weightHistory: [newEntry, ...state.weightHistory].slice(0, 100),
          }));
        } catch {
          set({ error: "Erreur lors de l'ajout du poids" });
          throw new Error("Erreur lors de l'ajout du poids");
        } finally {
          set({ isLoading: false });
        }
      },

      updateWeightEntry: async (entryId, updates) => {
        set({ isLoading: true, error: null });

        try {
          // Ici, mettre à jour en base de données
          // await supabaseService.updateWeightEntry(entryId, updates);

          set(state => ({
            weightHistory: state.weightHistory.map(entry =>
              entry.id === entryId ? { ...entry, ...updates } : entry
            ),
          }));
        } catch {
          set({ error: 'Erreur lors de la mise à jour du poids' });
          throw new Error('Erreur lors de la mise à jour du poids');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteWeightEntry: async entryId => {
        set({ isLoading: true, error: null });

        try {
          // Ici, supprimer de la base de données
          // await supabaseService.deleteWeightEntry(entryId);

          set(state => ({
            weightHistory: state.weightHistory.filter(entry => entry.id !== entryId),
          }));
        } catch {
          set({ error: 'Erreur lors de la suppression du poids' });
          throw new Error('Erreur lors de la suppression du poids');
        } finally {
          set({ isLoading: false });
        }
      },

      loadWeightHistory: async (_userId, _limit = 50) => {
        set({ isLoading: true, error: null });

        try {
          // Ici, charger depuis la base de données
          // const history = await supabaseService.getWeightHistory(userId, limit);
          // set({ weightHistory: history });
        } catch {
          set({ error: "Erreur lors du chargement de l'historique" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Actions de synchronisation
      scanForScales: async () => {
        set({ isScanning: true, error: null });

        try {
          return await ScaleService.scanForDevices();
        } catch {
          set({ error: 'Erreur lors de la recherche de balances' });
          throw new Error('Erreur lors de la recherche de balances');
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
          const syncPromises = connectedDevices.map(
            scale =>
              get()
                .syncScaleWeight(scale.id)
                .catch(() => null) // Ignore les erreurs individuelles
          );

          await Promise.all(syncPromises);
        } catch {
          set({ error: 'Erreur lors de la synchronisation' });
        } finally {
          set({ isSyncing: false });
        }
      },

      importWeightData: async data => {
        set({ isLoading: true, error: null });

        try {
          const importPromises = data.map(entry => get().addWeightEntry(entry));
          await Promise.all(importPromises);
        } catch {
          set({ error: "Erreur lors de l'importation des données" });
          throw new Error("Erreur lors de l'importation des données");
        } finally {
          set({ isLoading: false });
        }
      },

      // Actions utilitaires
      setLoading: isLoading => {
        set({ isLoading });
      },

      setError: error => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      getWeightTrend: () => {
        const { weightHistory } = get();
        if (weightHistory.length < 2) return null;

        const latest = weightHistory[0]?.weight;
        const previous = weightHistory[1]?.weight;

        if (!latest || !previous) return null;

        const diff = latest - previous;

        if (Math.abs(diff) < 0.1) return { type: 'stable', diff: 0 };
        return {
          type: diff > 0 ? 'up' : 'down',
          diff: Math.abs(diff),
        };
      },

      getLatestWeight: () => {
        const { weightHistory } = get();
        return weightHistory.length > 0 ? weightHistory[0]?.weight || null : null;
      },

      getWeightStats: () => {
        const { weightHistory } = get();
        if (weightHistory.length === 0) {
          return { min: 0, max: 0, avg: 0, entries: 0 };
        }

        const weights = weightHistory.map(entry => entry.weight);
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const avg = Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10) / 10;

        return { min, max, avg, entries: weights.length };
      },
    }),
    {
      name: 'scales-storage',
      partialize: state => ({
        connectedScales: state.connectedScales,
        weightHistory: state.weightHistory.slice(0, 20), // Persister seulement les 20 dernières
        lastScaleSync: state.lastScaleSync,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useScalesState = () =>
  useScalesStore(state => ({
    connectedScales: state.connectedScales,
    isScanning: state.isScanning,
    isSyncing: state.isSyncing,
    lastScaleSync: state.lastScaleSync,
    isLoading: state.isLoading,
    error: state.error,
  }));

export const useWeightHistory = () =>
  useScalesStore(state => ({
    weightHistory: state.weightHistory,
    addWeightEntry: state.addWeightEntry,
    updateWeightEntry: state.updateWeightEntry,
    deleteWeightEntry: state.deleteWeightEntry,
    loadWeightHistory: state.loadWeightHistory,
    importWeightData: state.importWeightData,
    getLatestWeight: state.getLatestWeight,
    getWeightTrend: state.getWeightTrend,
    getWeightStats: state.getWeightStats,
  }));

export const useScaleActions = () =>
  useScalesStore(state => ({
    connectScale: state.connectScale,
    disconnectScale: state.disconnectScale,
    syncScaleWeight: state.syncScaleWeight,
    scanForScales: state.scanForScales,
    syncAllScales: state.syncAllScales,
    updateScaleStatus: state.updateScaleStatus,
    loadConnectedScales: state.loadConnectedScales,
  }));
