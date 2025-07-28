import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
  lastUpdated: Date | null;
}

// Cache simple en mémoire
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  staleTime: number;
}>();

export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const cacheKey = queryKey.join(':');

  // Vérifier le cache
  const getCachedData = useCallback(() => {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.staleTime) {
      return cached.data;
    }
    return null;
  }, [cacheKey]);

  // Mettre en cache
  const setCachedData = useCallback((newData: T) => {
    queryCache.set(cacheKey, {
      data: newData,
      timestamp: Date.now(),
      staleTime
    });
  }, [cacheKey, staleTime]);

  // Fonction de fetch avec retry
  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    // Vérifier le cache d'abord
    const cachedData = getCachedData();
    if (cachedData && !isRetry) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      setIsStale(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      const result = await queryFn();
      
      if (result.error) {
        throw new Error(result.error.message || 'Erreur lors de la requête');
      }

      setData(result.data);
      setError(null);
      setLastUpdated(new Date());
      setIsStale(false);
      retryCountRef.current = 0;

      // Mettre en cache
      if (result.data) {
        setCachedData(result.data);
      }

    } catch (err) {
      const errorObj = err as Error;
      console.error('Erreur useSupabaseQuery:', errorObj);

      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
      } else {
        setError(errorObj);
        retryCountRef.current = 0;
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [enabled, queryFn, getCachedData, setCachedData, retry, retryDelay]);

  // Refetch manuel
  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  // Effect principal
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch sur focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (!loading && enabled) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, loading, enabled, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  // Marquer comme stale après staleTime
  useEffect(() => {
    if (!lastUpdated) return;

    const timeout = setTimeout(() => {
      setIsStale(true);
    }, staleTime);

    return () => clearTimeout(timeout);
  }, [lastUpdated, staleTime]);

  // Cleanup du cache
  useEffect(() => {
    return () => {
      // Nettoyer le cache après cacheTime
      setTimeout(() => {
        const cached = queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp > cacheTime) {
          queryCache.delete(cacheKey);
        }
      }, cacheTime);
    };
  }, [cacheKey, cacheTime]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
    lastUpdated
  };
}

// Hook spécialisé pour les requêtes de table
export function useSupabaseTable<T>(
  table: string,
  queryBuilder?: (qb: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>,
  options?: UseSupabaseQueryOptions
) {
  return useSupabaseQuery<T[]>(
    ['table', table, JSON.stringify(queryBuilder?.toString() || '')],
    async () => {
      let query = supabase.from(table).select('*');
      
      if (queryBuilder) {
        query = queryBuilder(query as any);
      }
      
      return await query;
    },
    options
  );
}

// Hook pour une seule ligne
export function useSupabaseRow<T>(
  table: string,
  id: string | number,
  options?: UseSupabaseQueryOptions
) {
  return useSupabaseQuery<T>(
    ['row', table, String(id)],
    async () => {
      return await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
    },
    options
  );
}

export default useSupabaseQuery;
