import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';

interface RealtimeSyncOptions {
  pillar: 'hydration' | 'nutrition' | 'sleep' | 'workout';
  userId?: string;
  onUpdate?: (data: any) => void;
}

export const useRealtimeSync = ({ pillar, userId, onUpdate }: RealtimeSyncOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const { appStoreUser } = useAppStore();
  const activeUserId = userId || appStoreUser?.id;

  useEffect(() => {
    if (!activeUserId) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Configuration des tables à surveiller selon le pilier
    const tableConfig = {
      hydration: 'hydration_logs',
      nutrition: 'nutrition_logs', 
      sleep: 'sleep_sessions',
      workout: 'workout_sessions'
    };

    const tableName = tableConfig[pillar];

    // Abonnement aux changements en temps réel
    const subscription = supabase
      .channel(`${pillar}_realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${activeUserId}`
        },
        (payload) => {
          console.log(`🔄 ${pillar} update:`, payload);
          if (onUpdate) {
            onUpdate(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats',
          filter: `user_id=eq.${activeUserId} AND date=eq.${today}`
        },
        (payload) => {
          console.log('📊 Daily stats update:', payload);
          if (onUpdate) {
            onUpdate(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log(`✅ ${pillar} realtime connected`);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error(`❌ ${pillar} realtime error`);
        }
      });

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [activeUserId, pillar, onUpdate]);

  return { isConnected };
};

// Hook spécialisé pour la synchronisation des stats quotidiennes
export const useDailyStatsSync = (userId?: string) => {
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { appStoreUser } = useAppStore();
  const activeUserId = userId || appStoreUser?.id;

  const fetchDailyStats = async () => {
    if (!activeUserId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', activeUserId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      setDailyStats(data || null);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStats();
  }, [activeUserId]);

  // Synchronisation en temps réel
  useRealtimeSync({
    pillar: 'hydration', // On utilise hydration comme pillar de base
    userId: activeUserId,
    onUpdate: () => {
      fetchDailyStats(); // Recharger les stats à chaque update
    }
  });

  return { dailyStats, loading, refetch: fetchDailyStats };
};
