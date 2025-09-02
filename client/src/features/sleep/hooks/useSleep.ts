import { useState, useEffect, useCallback } from 'react';
import { SleepService } from '../services/sleep.service';
import { SleepEntry } from '../../../shared/types/sleep.types';

export interface UseSleepReturn {
  data: SleepEntry | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (data: SleepEntry) => Promise<void>;
}

export function useSleep(userId?: string): UseSleepReturn {
  const [data, setData] = useState<SleepEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || 'current-user';

  const loadData = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await SleepService.getSleepData(currentUserId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const update = useCallback(
    async (newData: SleepEntry) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await SleepService.updateSleep(currentUserId, newData);
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    update,
  };
}
