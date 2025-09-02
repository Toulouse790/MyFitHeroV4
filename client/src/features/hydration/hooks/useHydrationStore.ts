import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { HydrationStore, HydrationEntry, HydrationGoal, HydrationStats } from '../types';

export const useHydrationStore = create<HydrationStore>()(
  persist(
    (set, get) => ({
      // État initial
      entries: [],
      goals: [],
      currentGoal: null,
      stats: null,
      isLoading: false,
      error: null,

      // Actions - Entries
      addEntry: async entryData => {
        set({ isLoading: true, error: null });

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Utilisateur non authentifié');

          const newEntry: Omit<HydrationEntry, 'id'> = {
            ...entryData,
            userId: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('hydration_entries')
            .insert([newEntry])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            entries: [...state.entries, data],
            isLoading: false,
          }));

          // Recalculer les stats après ajout
          get().calculateStats('daily');
        } catch {
          const message = error instanceof Error ? error.message : "Erreur lors de l'ajout";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateEntry: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('hydration_entries')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            entries: state.entries.map(entry => (entry.id === id ? data : entry)),
            isLoading: false,
          }));

          get().calculateStats('daily');
        } catch {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deleteEntry: async id => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.from('hydration_entries').delete().eq('id', id);

          if (error) throw error;

          set(state => ({
            entries: state.entries.filter(entry => entry.id !== id),
            isLoading: false,
          }));

          get().calculateStats('daily');
        } catch {
          const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      loadEntries: async (startDate, endDate) => {
        set({ isLoading: true, error: null });

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Utilisateur non authentifié');

          let query = supabase
            .from('hydration_entries')
            .select('*')
            .eq('userId', user.id)
            .order('timestamp', { ascending: false });

          if (startDate) {
            query = query.gte('timestamp', startDate);
          }
          if (endDate) {
            query = query.lte('timestamp', endDate);
          }

          const { data, error } = await query;

          if (error) throw error;

          set({
            entries: data || [],
            isLoading: false,
          });
        } catch {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // Actions - Goals
      setGoal: async dailyTarget => {
        set({ isLoading: true, error: null });

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Utilisateur non authentifié');

          // Désactiver l'ancien objectif
          await supabase
            .from('hydration_goals')
            .update({ isActive: false })
            .eq('userId', user.id)
            .eq('isActive', true);

          // Créer le nouveau
          const newGoal: Omit<HydrationGoal, 'id'> = {
            userId: user.id,
            dailyTarget,
            isActive: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('hydration_goals')
            .insert([newGoal])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            goals: [...state.goals, data],
            currentGoal: data,
            isLoading: false,
          }));
        } catch {
          const message =
            error instanceof Error ? error.message : "Erreur lors de la définition de l'objectif";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateGoal: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('hydration_goals')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            goals: state.goals.map(goal => (goal.id === id ? data : goal)),
            currentGoal: data.isActive ? data : state.currentGoal,
            isLoading: false,
          }));
        } catch {
          const message =
            error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'objectif";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      loadGoals: async () => {
        set({ isLoading: true, error: null });

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error('Utilisateur non authentifié');

          const { data, error } = await supabase
            .from('hydration_goals')
            .select('*')
            .eq('userId', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const activeGoal = data?.find(goal => goal.isActive) || null;

          set({
            goals: data || [],
            currentGoal: activeGoal,
            isLoading: false,
          });
        } catch {
          const message =
            error instanceof Error ? error.message : 'Erreur lors du chargement des objectifs';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // Actions - Stats
      calculateStats: async period => {
        const { entries, currentGoal } = get();

        if (!entries.length || !currentGoal) {
          set({ stats: null });
          return;
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Stats quotidiennes
        const todayEntries = entries.filter(entry => entry.timestamp.split('T')[0] === today);

        const dailyAmount = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const dailyPercentage = (dailyAmount / currentGoal.dailyTarget) * 100;

        // Stats hebdomadaires
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);

        const weekEntries = entries.filter(entry => new Date(entry.timestamp) >= weekStart);

        const weeklyTotal = weekEntries.reduce((sum, entry) => sum + entry.amount, 0);
        const weeklyAverage = weeklyTotal / 7;
        const weeklyTarget = currentGoal.dailyTarget * 7;
        const weeklyPercentage = (weeklyTotal / weeklyTarget) * 100;

        const stats: HydrationStats = {
          daily: {
            current: dailyAmount,
            target: currentGoal.dailyTarget,
            percentage: dailyPercentage,
            entries: todayEntries,
          },
          weekly: {
            total: weeklyTotal,
            average: weeklyAverage,
            target: weeklyTarget,
            percentage: weeklyPercentage,
            dailyBreakdown: [], // À implémenter selon les besoins
          },
          monthly: {
            total: 0, // À implémenter
            average: 0,
            bestDay: { date: '', amount: 0 },
            worstDay: { date: '', amount: 0 },
          },
        };

        set({ stats });
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      resetStore: () => {
        set({
          entries: [],
          goals: [],
          currentGoal: null,
          stats: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'hydration-storage',
      partialize: state => ({
        entries: state.entries,
        goals: state.goals,
        currentGoal: state.currentGoal,
        stats: state.stats,
      }),
    }
  )
);
