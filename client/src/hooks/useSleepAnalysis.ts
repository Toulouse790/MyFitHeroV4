import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/app-store';
import { useToast } from './use-toast';

interface SleepEntry {
  id: string;
  user_id: string;
  sleep_date: string; // YYYY-MM-DD
  bedtime: string; // HH:MM
  wake_time: string; // HH:MM
  sleep_duration_minutes: number;
  sleep_quality: 1 | 2 | 3 | 4 | 5; // 1 = très mauvais, 5 = excellent
  deep_sleep_minutes?: number;
  light_sleep_minutes?: number;
  rem_sleep_minutes?: number;
  awakenings_count: number;
  sleep_latency_minutes: number; // Temps pour s'endormir
  notes?: string;
  mood_on_waking: 1 | 2 | 3 | 4 | 5; // 1 = très mauvais, 5 = excellent
  created_at: string;
}

interface SleepGoals {
  target_duration_hours: number;
  target_bedtime: string; // HH:MM
  target_wake_time: string; // HH:MM
  min_sleep_quality: number;
}

interface SleepStats {
  average_duration: number;
  average_quality: number;
  average_bedtime: string;
  average_wake_time: string;
  sleep_debt_hours: number;
  consistency_score: number; // 0-100
  trend_direction: 'improving' | 'declining' | 'stable';
  weekly_average: number;
  best_sleep_day: string;
  worst_sleep_day: string;
}

interface SleepRecommendation {
  type: 'bedtime' | 'duration' | 'quality' | 'consistency';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable_tip: string;
}

export function useSleepAnalysis() {
  const { appStoreUser } = useAppStore();
  const { showToast } = useToast();

  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [sleepGoals, setSleepGoals] = useState<SleepGoals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months'>('week');

  // Calculer la durée de sommeil entre deux heures
  const calculateSleepDuration = useCallback((bedtime: string, wakeTime: string): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    // Si l'heure de réveil est plus petite, c'est le lendemain
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return wakeMinutes - bedMinutes;
  }, []);

  // Convertir les minutes en format lisible
  const formatDuration = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }, []);

  // Calculer les statistiques de sommeil
  const sleepStats = useMemo((): SleepStats => {
    if (sleepEntries.length === 0) {
      return {
        average_duration: 0,
        average_quality: 0,
        average_bedtime: '00:00',
        average_wake_time: '00:00',
        sleep_debt_hours: 0,
        consistency_score: 0,
        trend_direction: 'stable',
        weekly_average: 0,
        best_sleep_day: '',
        worst_sleep_day: '',
      };
    }

    const recentEntries = sleepEntries.slice(0, 30); // 30 derniers jours

    // Moyennes
    const avgDuration =
      recentEntries.reduce((sum, entry) => sum + entry.sleep_duration_minutes, 0) /
      recentEntries.length;
    const avgQuality =
      recentEntries.reduce((sum, entry) => sum + entry.sleep_quality, 0) / recentEntries.length;

    // Calcul des heures moyennes de coucher et réveil
    const bedtimes = recentEntries.map(entry => {
      const [hour, min] = entry.bedtime.split(':').map(Number);
      return hour * 60 + min;
    });
    const waketimes = recentEntries.map(entry => {
      const [hour, min] = entry.wake_time.split(':').map(Number);
      return hour * 60 + min;
    });

    const avgBedtimeMinutes = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const avgWaketimeMinutes = waketimes.reduce((sum, time) => sum + time, 0) / waketimes.length;

    const avgBedtime = `${Math.floor(avgBedtimeMinutes / 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(avgBedtimeMinutes % 60)
      .toString()
      .padStart(2, '0')}`;
    const avgWaketime = `${Math.floor(avgWaketimeMinutes / 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(avgWaketimeMinutes % 60)
      .toString()
      .padStart(2, '0')}`;

    // Dette de sommeil
    const targetDuration = (sleepGoals?.target_duration_hours || 8) * 60;
    const sleepDebt =
      recentEntries.reduce((debt, entry) => {
        return debt + Math.max(0, targetDuration - entry.sleep_duration_minutes);
      }, 0) / 60; // en heures

    // Score de consistance (basé sur la régularité des heures de coucher/réveil)
    const bedtimeVariance =
      bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtimeMinutes, 2), 0) /
      bedtimes.length;
    const waketimeVariance =
      waketimes.reduce((sum, time) => sum + Math.pow(time - avgWaketimeMinutes, 2), 0) /
      waketimes.length;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(bedtimeVariance + waketimeVariance) / 10);

    // Tendance (comparaison première moitié vs deuxième moitié)
    const firstHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
    const secondHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, entry) => sum + entry.sleep_quality, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, entry) => sum + entry.sleep_quality, 0) / secondHalf.length;

    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg + 0.3) trendDirection = 'improving';
    else if (secondHalfAvg < firstHalfAvg - 0.3) trendDirection = 'declining';

    // Meilleur et pire jour
    const sortedByQuality = [...recentEntries].sort((a, b) => b.sleep_quality - a.sleep_quality);
    const bestDay = sortedByQuality[0]?.sleep_date || '';
    const worstDay = sortedByQuality[sortedByQuality.length - 1]?.sleep_date || '';

    // Moyenne hebdomadaire
    const weeklyEntries = recentEntries.slice(0, 7);
    const weeklyAverage =
      weeklyEntries.reduce((sum, entry) => sum + entry.sleep_duration_minutes, 0) /
      weeklyEntries.length;

    return {
      average_duration: avgDuration,
      average_quality: avgQuality,
      average_bedtime: avgBedtime,
      average_wake_time: avgWaketime,
      sleep_debt_hours: sleepDebt,
      consistency_score: consistencyScore,
      trend_direction: trendDirection,
      weekly_average: weeklyAverage,
      best_sleep_day: bestDay,
      worst_sleep_day: worstDay,
    };
  }, [sleepEntries, sleepGoals]);

  // Générer des recommandations personnalisées
  const sleepRecommendations = useMemo((): SleepRecommendation[] => {
    const recommendations: SleepRecommendation[] = [];
    const stats = sleepStats;

    // Recommandation sur la durée
    if (stats.average_duration < (sleepGoals?.target_duration_hours || 8) * 60 - 30) {
      recommendations.push({
        type: 'duration',
        title: 'Augmentez votre temps de sommeil',
        description: `Vous dormez en moyenne ${formatDuration(stats.average_duration)}, soit moins que votre objectif.`,
        priority: 'high',
        actionable_tip: 'Essayez de vous coucher 15-30 minutes plus tôt chaque soir.',
      });
    }

    // Recommandation sur la qualité
    if (stats.average_quality < 3.5) {
      recommendations.push({
        type: 'quality',
        title: 'Améliorez la qualité de votre sommeil',
        description: "Votre qualité de sommeil moyenne est en dessous de l'optimal.",
        priority: 'high',
        actionable_tip:
          'Évitez les écrans 1h avant le coucher et maintenez une température fraîche dans la chambre.',
      });
    }

    // Recommandation sur la consistance
    if (stats.consistency_score < 70) {
      recommendations.push({
        type: 'consistency',
        title: 'Régularisez vos horaires de sommeil',
        description: 'Vos heures de coucher et réveil varient beaucoup.',
        priority: 'medium',
        actionable_tip: 'Essayez de vous coucher et vous lever à la même heure, même le week-end.',
      });
    }

    // Recommandation sur l'heure de coucher
    if (sleepGoals?.target_bedtime) {
      const [targetHour, targetMin] = sleepGoals.target_bedtime.split(':').map(Number);
      const [avgHour, avgMin] = stats.average_bedtime.split(':').map(Number);
      const targetMinutes = targetHour * 60 + targetMin;
      const avgMinutes = avgHour * 60 + avgMin;

      if (Math.abs(avgMinutes - targetMinutes) > 30) {
        recommendations.push({
          type: 'bedtime',
          title: 'Ajustez votre heure de coucher',
          description: `Vous vous couchez en moyenne à ${stats.average_bedtime}, votre objectif est ${sleepGoals.target_bedtime}.`,
          priority: 'medium',
          actionable_tip: 'Créez une routine de coucher relaxante pour vous préparer au sommeil.',
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [sleepStats, sleepGoals, formatDuration]);

  // Ajouter une entrée de sommeil
  const addSleepEntry = useCallback(
    async (entry: Omit<SleepEntry, 'id' | 'user_id' | 'created_at' | 'sleep_duration_minutes'>) => {
      if (!appStoreUser?.id) {
        showToast('Erreur: Utilisateur non connecté', 'error');
        return false;
      }

      setIsLoading(true);
      try {
        const duration = calculateSleepDuration(entry.bedtime, entry.wake_time);

        const newEntry: Omit<SleepEntry, 'id' | 'created_at'> = {
          ...entry,
          user_id: appStoreUser.id,
          sleep_duration_minutes: duration,
        };

        const { data, error } = await supabase
          .from('sleep_entries')
          .insert(newEntry)
          .select()
          .single();

        if (error) throw error;

        setSleepEntries(prev => [data, ...prev]);
        showToast(`Sommeil enregistré: ${formatDuration(duration)}`, 'success');
        return true;
      } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
        showToast("Erreur lors de l'enregistrement", 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [appStoreUser?.id, calculateSleepDuration, formatDuration, showToast]
  );

  // Mettre à jour une entrée existante
  const updateSleepEntry = useCallback(
    async (entryId: string, updates: Partial<SleepEntry>) => {
      setIsLoading(true);
      try {
        // Recalculer la durée si bedtime ou wake_time changent
        const entry = sleepEntries.find(e => e.id === entryId);
        if (!entry) throw new Error('Entrée non trouvée');

        const updatedEntry = { ...entry, ...updates };
        if (updates.bedtime || updates.wake_time) {
          updatedEntry.sleep_duration_minutes = calculateSleepDuration(
            updatedEntry.bedtime,
            updatedEntry.wake_time
          );
        }

        const { data, error } = await supabase
          .from('sleep_entries')
          .update(updatedEntry)
          .eq('id', entryId)
          .select()
          .single();

        if (error) throw error;

        setSleepEntries(prev => prev.map(entry => (entry.id === entryId ? data : entry)));
        showToast('Entrée mise à jour', 'success');
        return true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        showToast('Erreur lors de la mise à jour', 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [sleepEntries, calculateSleepDuration, showToast]
  );

  // Supprimer une entrée
  const deleteSleepEntry = useCallback(
    async (entryId: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase.from('sleep_entries').delete().eq('id', entryId);

        if (error) throw error;

        setSleepEntries(prev => prev.filter(entry => entry.id !== entryId));
        showToast('Entrée supprimée', 'success');
        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showToast('Erreur lors de la suppression', 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Mettre à jour les objectifs de sommeil
  const updateSleepGoals = useCallback(
    async (newGoals: Partial<SleepGoals>) => {
      if (!appStoreUser?.id) return false;

      setIsLoading(true);
      try {
        const updatedGoals = { ...sleepGoals, ...newGoals };

        const { data, error } = await supabase
          .from('user_sleep_goals')
          .upsert({
            user_id: appStoreUser.id,
            ...updatedGoals,
          })
          .select()
          .single();

        if (error) throw error;

        setSleepGoals(data);
        showToast('Objectifs de sommeil mis à jour', 'success');
        return true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        showToast('Erreur lors de la mise à jour', 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [appStoreUser?.id, sleepGoals, showToast]
  );

  // Charger les données initiales
  useEffect(() => {
    const loadSleepData = async () => {
      if (!appStoreUser?.id) return;

      setIsLoading(true);
      try {
        // Déterminer la période à charger
        const daysToLoad = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToLoad);

        const [entriesResult, goalsResult] = await Promise.all([
          supabase
            .from('sleep_entries')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .gte('sleep_date', startDate.toISOString().split('T')[0])
            .order('sleep_date', { ascending: false }),

          supabase.from('user_sleep_goals').select('*').eq('user_id', appStoreUser.id).single(),
        ]);

        if (entriesResult.data) {
          setSleepEntries(entriesResult.data);
        }

        if (goalsResult.data) {
          setSleepGoals(goalsResult.data);
        } else {
          // Créer des objectifs par défaut
          const defaultGoals: SleepGoals = {
            target_duration_hours: 8,
            target_bedtime: '23:00',
            target_wake_time: '07:00',
            min_sleep_quality: 4,
          };
          setSleepGoals(defaultGoals);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSleepData();
  }, [appStoreUser?.id, selectedPeriod]);

  return {
    // État
    sleepEntries,
    sleepGoals,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,

    // Statistiques et analyses
    sleepStats,
    sleepRecommendations,

    // Actions
    addSleepEntry,
    updateSleepEntry,
    deleteSleepEntry,
    updateSleepGoals,

    // Utilitaires
    calculateSleepDuration,
    formatDuration,
  };
}

export default useSleepAnalysis;
