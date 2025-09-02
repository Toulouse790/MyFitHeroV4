import { useState, useCallback } from 'react';

// Types pour l'état de chargement
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface UseLoadingStateOptions {
  initialLoading?: boolean;
  initialError?: string | null;
  initialData?: any;
}

export interface UseLoadingStateReturn<T = any> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (data: T | null) => void;
  clearError: () => void;
  reset: () => void;
  execute: <R = T>(asyncFn: () => Promise<R>) => Promise<R | null>;
  executeWithData: <R = T>(asyncFn: () => Promise<R>) => Promise<R | null>;
}

/**
 * Hook personnalisé pour gérer l'état de chargement
 * Élimine la duplication des patterns useState pour loading/error
 */
export function useLoadingState<T = any>(
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn<T> {
  const { initialLoading = false, initialError = null, initialData = null } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError);
  const [data, setData] = useState<T | null>(initialData);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const setDataState = useCallback((data: T | null) => {
    setData(data);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(initialLoading);
    setError(initialError);
    setData(initialData);
  }, [initialLoading, initialError, initialData]);

  // Exécute une fonction async avec gestion automatique du loading/error
  const execute = useCallback(async <R = T>(asyncFn: () => Promise<R>): Promise<R | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  // Exécute une fonction async et stocke le résultat dans data
  const executeWithData = useCallback(
    async <R = T>(asyncFn: () => Promise<R>): Promise<R | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result as T);
        setIsLoading(false);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  return {
    isLoading,
    error,
    data,
    setLoading,
    setError: setErrorState,
    setData: setDataState,
    clearError,
    reset,
    execute,
    executeWithData,
  };
}

// Hook spécialisé pour les formulaires
export interface UseFormLoadingReturn {
  isSubmitting: boolean;
  error: string | null;
  submitForm: <T>(submitFn: () => Promise<T>) => Promise<T | null>;
  clearError: () => void;
}

export function useFormLoading(): UseFormLoadingReturn {
  const { isLoading, error, clearError, execute } = useLoadingState();

  const submitForm = useCallback(
    async <T>(submitFn: () => Promise<T>): Promise<T | null> => {
      return await execute(submitFn);
    },
    [execute]
  );

  return {
    isSubmitting: isLoading,
    error,
    submitForm,
    clearError,
  };
}

// Hook spécialisé pour les appels API
export interface UseApiLoadingReturn<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  refetch: () => Promise<T | null>;
  mutate: (newData: T | null) => void;
  clearError: () => void;
}

export function useApiLoading<T = any>(
  apiFn: () => Promise<T>,
  deps: unknown[] = []
): UseApiLoadingReturn<T> {
  const { isLoading, error, data, clearError, executeWithData, setData } = useLoadingState<T>();

  const refetch = useCallback(async () => {
    return await executeWithData(apiFn);
  }, [executeWithData, apiFn]);

  const mutate = useCallback(
    (newData: T | null) => {
      setData(newData);
    },
    [setData]
  );

  // Auto-fetch au montage du composant
  const [hasFetched, setHasFetched] = useState(false);

  React.useEffect(() => {
    if (!hasFetched) {
      refetch();
      setHasFetched(true);
    }
  }, deps);

  return {
    isLoading,
    error,
    data,
    refetch,
    mutate,
    clearError,
  };
}

// Types d'export pour réutilisation
export type LoadingHook<T = any> = UseLoadingStateReturn<T>;
export type FormLoadingHook = UseFormLoadingReturn;
export type ApiLoadingHook<T = any> = UseApiLoadingReturn<T>;

// Pattern commun: loading avec timeout
export function useLoadingWithTimeout<T = any>(
  timeoutMs: number = 10000
): UseLoadingStateReturn<T> & { isTimeout: boolean } {
  const loadingState = useLoadingState<T>();
  const [isTimeout, setIsTimeout] = useState(false);

  const executeWithTimeout = useCallback(
    async <R = T>(asyncFn: () => Promise<R>): Promise<R | null> => {
      setIsTimeout(false);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          setIsTimeout(true);
          reject(new Error("Délai d'attente dépassé"));
        }, timeoutMs);
      });

      try {
        return await Promise.race([asyncFn(), timeoutPromise]);
      } catch (err) {
        if (err instanceof Error && err.message === "Délai d'attente dépassé") {
          loadingState.setError("Délai d'attente dépassé");
        } else {
          loadingState.setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        return null;
      } finally {
        loadingState.setLoading(false);
      }
    },
    [loadingState, timeoutMs]
  );

  return {
    ...loadingState,
    isTimeout,
    execute: executeWithTimeout,
  };
}

export default useLoadingState;
