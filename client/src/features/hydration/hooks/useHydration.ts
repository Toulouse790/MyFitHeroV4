import { useState, useEffect, useCallback } from 'react';
import { HydrationService } from '../services/hydration.service';

export interface UseHydrationReturn {
  data: any;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (data: any) => Promise<void>;
}

export function useHydration(userId?: string): UseHydrationReturn {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || 'current-user';

  const loadData = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await HydrationService.getHydrationData(currentUserId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const update = useCallback(
    async (newData: any) => {
      if (!currentUserId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await HydrationService.updateHydration(currentUserId, newData);
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
