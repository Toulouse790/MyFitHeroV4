import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from '@/shared/hooks/use-toast';

export interface NutritionEntry {
  id: string;
  user_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string;
}

export interface NutritionGoals {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function useNutritionTracking() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les entrées du jour
  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data: _data, error: _error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('consumed_at', `${today}T00:00:00.000Z`)
      .lte('consumed_at', `${today}T23:59:59.999Z`)
      .order('consumed_at', { ascending: true });
    if (!error && data) setEntries(data);
    setLoading(false);
  }, [user]);

  // Charger les objectifs
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_nutrition_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setGoals(data);
  }, [user]);

  useEffect(() => {
    fetchEntries();
    fetchGoals();
  }, [fetchEntries, fetchGoals]);

  // Ajouter une entrée
  const addEntry = useCallback(
    async (entry: Omit<NutritionEntry, 'id' | 'user_id'>) => {
      if (!user) return;
      setLoading(true);
      const { error } = await supabase
        .from('nutrition_entries')
        .insert({ ...entry, user_id: user.id });
      if (!error) {
        showToast('Aliment ajouté !', 'success');
        fetchEntries();
      } else {
        showToast("Erreur lors de l'ajout", 'error');
      }
      setLoading(false);
    },
    [user, fetchEntries, showToast]
  );

  // Supprimer une entrée
  const deleteEntry = useCallback(
    async (id: string) => {
      setLoading(true);
      const { error } = await supabase.from('nutrition_entries').delete().eq('id', id);
      if (!error) {
        showToast('Entrée supprimée', 'success');
        fetchEntries();
      } else {
        showToast('Erreur lors de la suppression', 'error');
      }
      setLoading(false);
    },
    [fetchEntries, showToast]
  );

  // Calcul des totaux du jour
  const dailyTotals = useMemo(() => {
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  return {
    entries,
    goals,
    loading,
    addEntry,
    deleteEntry,
    dailyTotals,
    fetchEntries,
    fetchGoals,
  };
}

export default useNutritionTracking;
