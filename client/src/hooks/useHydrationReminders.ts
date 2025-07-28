import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/app-store';
import { useToast } from './use-toast';

interface HydrationEntry {
  id: string;
  user_id: string;
  amount_ml: number;
  timestamp: string;
  drink_type: 'water' | 'tea' | 'coffee' | 'juice' | 'sports_drink' | 'other';
  temperature: 'cold' | 'room' | 'warm' | 'hot';
}

interface HydrationGoal {
  daily_target_ml: number;
  reminder_interval_minutes: number;
  start_time: string; // "07:00"
  end_time: string; // "22:00"
  enabled: boolean;
}

interface HydrationStats {
  today_consumed: number;
  today_target: number;
  completion_percentage: number;
  average_per_hour: number;
  remaining_ml: number;
  estimated_completion_time: string | null;
  streak_days: number;
}

export function useHydrationReminders() {
  const { appStoreUser } = useAppStore();
  const { showToast } = useToast();
  
  const [hydrationEntries, setHydrationEntries] = useState<HydrationEntry[]>([]);
  const [hydrationGoal, setHydrationGoal] = useState<HydrationGoal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reminderPermission, setReminderPermission] = useState<NotificationPermission>('default');
  
  const reminderIntervalRef = useRef<NodeJS.Timeout>();
  const lastReminderRef = useRef<number>(0);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setReminderPermission(permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  // Envoyer une notification de rappel
  const sendHydrationReminder = useCallback((remainingMl: number) => {
    if (reminderPermission !== 'granted') return;

    const now = Date.now();
    const timeSinceLastReminder = now - lastReminderRef.current;
    
    // Éviter les notifications trop fréquentes (minimum 30 minutes)
    if (timeSinceLastReminder < 30 * 60 * 1000) return;

    const messages = [
      `💧 Il est temps de boire ! Il vous reste ${Math.round(remainingMl)}ml à boire aujourd'hui.`,
      `🚰 N'oubliez pas de vous hydrater ! Objectif restant: ${Math.round(remainingMl)}ml`,
      `💦 Votre corps a besoin d'eau ! Plus que ${Math.round(remainingMl)}ml pour atteindre votre objectif.`,
      `🌊 Pause hydratation ! Buvez un verre d'eau maintenant.`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    new Notification('MyFitHero - Rappel Hydratation', {
      body: randomMessage,
      icon: '/icons/water-drop.png',
      badge: '/icons/badge.png',
      tag: 'hydration-reminder',
      requireInteraction: false,
      silent: false
    });

    lastReminderRef.current = now;
  }, [reminderPermission]);

  // Calculer les statistiques d'hydratation
  const hydrationStats = useCallback((): HydrationStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = hydrationEntries.filter(entry => 
      entry.timestamp.startsWith(today)
    );

    const todayConsumed = todayEntries.reduce((sum, entry) => sum + entry.amount_ml, 0);
    const target = hydrationGoal?.daily_target_ml || 2000;
    const completionPercentage = Math.min((todayConsumed / target) * 100, 100);
    const remaining = Math.max(target - todayConsumed, 0);

    // Calculer la moyenne par heure
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
    const hoursElapsed = Math.max((now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60), 1);
    const averagePerHour = todayConsumed / hoursElapsed;

    // Estimer l'heure de completion
    let estimatedCompletionTime: string | null = null;
    if (remaining > 0 && averagePerHour > 0) {
      const hoursToComplete = remaining / averagePerHour;
      const completionDate = new Date(now.getTime() + hoursToComplete * 60 * 60 * 1000);
      estimatedCompletionTime = completionDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }

    // Calculer la streak (jours consécutifs d'objectif atteint)
    // Simplifié pour l'exemple
    const streakDays = 0; // À implémenter avec l'historique

    return {
      today_consumed: todayConsumed,
      today_target: target,
      completion_percentage: Math.round(completionPercentage),
      average_per_hour: Math.round(averagePerHour),
      remaining_ml: remaining,
      estimated_completion_time: estimatedCompletionTime,
      streak_days: streakDays
    };
  }, [hydrationEntries, hydrationGoal]);

  // Ajouter une entrée d'hydratation
  const addHydrationEntry = useCallback(async (
    amount: number, 
    drinkType: HydrationEntry['drink_type'] = 'water',
    temperature: HydrationEntry['temperature'] = 'room'
  ) => {
    if (!appStoreUser?.id) {
      showToast('Erreur: Utilisateur non connecté', 'error');
      return false;
    }

    setIsLoading(true);
    try {
      const newEntry: Omit<HydrationEntry, 'id'> = {
        user_id: appStoreUser.id,
        amount_ml: amount,
        timestamp: new Date().toISOString(),
        drink_type: drinkType,
        temperature
      };

      const { data, error } = await supabase
        .from('hydration_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      setHydrationEntries(prev => [...prev, data]);
      
      // Feedback positif
      const stats = hydrationStats();
      if (stats.completion_percentage >= 100) {
        showToast('🎉 Objectif d\'hydratation atteint !', 'success');
      } else {
        showToast(`💧 +${amount}ml ajouté ! (${stats.completion_percentage}% de l'objectif)`, 'success');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      showToast('Erreur lors de l\'ajout', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, showToast, hydrationStats]);

  // Raccourcis pour les quantités courantes
  const addQuickAmount = useCallback((amount: number) => {
    return addHydrationEntry(amount);
  }, [addHydrationEntry]);

  // Supprimer une entrée
  const deleteHydrationEntry = useCallback(async (entryId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('hydration_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setHydrationEntries(prev => prev.filter(entry => entry.id !== entryId));
      showToast('Entrée supprimée', 'success');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Mettre à jour les objectifs d'hydratation
  const updateHydrationGoal = useCallback(async (newGoal: Partial<HydrationGoal>) => {
    if (!appStoreUser?.id) return false;

    setIsLoading(true);
    try {
      const updatedGoal = { ...hydrationGoal, ...newGoal };
      
      const { data, error } = await supabase
        .from('user_hydration_goals')
        .upsert({
          user_id: appStoreUser.id,
          ...updatedGoal
        })
        .select()
        .single();

      if (error) throw error;

      setHydrationGoal(data);
      showToast('Objectifs mis à jour', 'success');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showToast('Erreur lors de la mise à jour', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [appStoreUser?.id, hydrationGoal, showToast]);

  // Configurer les rappels automatiques
  const setupReminders = useCallback(() => {
    if (!hydrationGoal?.enabled || !hydrationGoal.reminder_interval_minutes) return;

    // Nettoyer l'ancien interval
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
    }

    const intervalMs = hydrationGoal.reminder_interval_minutes * 60 * 1000;
    
    reminderIntervalRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      
      // Vérifier si on est dans la plage horaire
      if (currentTime >= hydrationGoal.start_time && currentTime <= hydrationGoal.end_time) {
        const stats = hydrationStats();
        if (stats.remaining_ml > 0) {
          sendHydrationReminder(stats.remaining_ml);
        }
      }
    }, intervalMs);
  }, [hydrationGoal, hydrationStats, sendHydrationReminder]);

  // Charger les données initiales
  useEffect(() => {
    const loadHydrationData = async () => {
      if (!appStoreUser?.id) return;

      setIsLoading(true);
      try {
        // Charger les entrées des 7 derniers jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [entriesResult, goalResult] = await Promise.all([
          supabase
            .from('hydration_entries')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .gte('timestamp', sevenDaysAgo.toISOString())
            .order('timestamp', { ascending: false }),
          
          supabase
            .from('user_hydration_goals')
            .select('*')
            .eq('user_id', appStoreUser.id)
            .single()
        ]);

        if (entriesResult.data) {
          setHydrationEntries(entriesResult.data);
        }

        if (goalResult.data) {
          setHydrationGoal(goalResult.data);
        } else {
          // Créer des objectifs par défaut
          const defaultGoal: HydrationGoal = {
            daily_target_ml: Math.max(2000, (appStoreUser.weight_kg || 70) * 35),
            reminder_interval_minutes: 60,
            start_time: '07:00',
            end_time: '22:00',
            enabled: true
          };
          setHydrationGoal(defaultGoal);
        }

      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHydrationData();
  }, [appStoreUser?.id]);

  // Configurer les rappels quand les objectifs changent
  useEffect(() => {
    setupReminders();
    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, [setupReminders]);

  // Vérifier les permissions de notification au montage
  useEffect(() => {
    if ('Notification' in window) {
      setReminderPermission(Notification.permission);
    }
  }, []);

  return {
    // État
    hydrationEntries,
    hydrationGoal,
    isLoading,
    reminderPermission,
    
    // Statistiques
    stats: hydrationStats(),
    
    // Actions
    addHydrationEntry,
    addQuickAmount,
    deleteHydrationEntry,
    updateHydrationGoal,
    requestNotificationPermission,
    
    // Raccourcis
    addGlass: () => addQuickAmount(250),
    addBottle: () => addQuickAmount(500),
    addLargeBottle: () => addQuickAmount(750),
    addCup: () => addQuickAmount(200)
  };
}

export default useHydrationReminders;
