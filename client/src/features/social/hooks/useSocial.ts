import { useState, useEffect, useCallback } from 'react';
import { SocialService } from '../services/social.service';

export interface UseSocialReturn {
  data: any;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (data: any) => Promise<void>;
}

export function useSocial(userId?: string): UseSocialReturn {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || 'current-user';

  const loadData = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SocialService.getSocialData(currentUserId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const update = useCallback(async (newData: any) => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SocialService.updateSocial(currentUserId, newData);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

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
    update
  };
}
