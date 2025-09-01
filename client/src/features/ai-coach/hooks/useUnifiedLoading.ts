// hooks/useUnifiedLoading.ts - HOOK UNIFIÉ
// 🎯 Remplace les 20+ patterns de loading state dupliqués

import { useState, useCallback } from 'react';

// Interface pour l'état de loading
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastAction?: string | undefined;
  startedAt?: number | undefined;
}

// Interface pour les actions
export interface LoadingActions {
  setLoading: (loading: boolean, action?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>, action?: string) => Promise<T>;
  reset: () => void;
}

// Hook principal unifié
export const useUnifiedLoading = (initialLoading = false): [LoadingState, LoadingActions] => {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    lastAction: undefined,
    startedAt: undefined,
  });

  const setLoading = useCallback((loading: boolean, action?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      lastAction: action || prev.lastAction,
      startedAt: loading ? Date.now() : undefined,
      // Optionnel: clear error when starting loading
      error: loading ? null : prev.error,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false, // Stop loading on error
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, action?: string): Promise<T> => {
      setLoading(true, action);
      try {
        const result = await asyncFn();
        setLoading(false);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
        setError(errorMessage);
        throw error;
      }
    },
    [setLoading, setError]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastAction: undefined,
      startedAt: undefined,
    });
  }, []);

  const actions: LoadingActions = {
    setLoading,
    setError,
    clearError,
    withLoading,
    reset,
  };

  return [state, actions];
};

// Helpers spécialisés pour les patterns fréquents

// Pattern simple: juste isLoading + setLoading
export const useSimpleLoading = (initialLoading = false) => {
  const [{ isLoading }, { setLoading }] = useUnifiedLoading(initialLoading);
  return { isLoading, setLoading };
};

// Pattern avec error: isLoading + error + setError
export const useLoadingWithError = (initialLoading = false) => {
  const [{ isLoading, error }, { setLoading, setError, clearError }] =
    useUnifiedLoading(initialLoading);
  return { isLoading, error, setLoading, setError, clearError };
};

// Pattern async: withLoading wrapper
export const useAsyncLoading = () => {
  const [{ isLoading, error }, { withLoading, clearError }] = useUnifiedLoading();
  return { isLoading, error, withLoading, clearError };
};

// Pattern pour les formulaires
export const useFormLoading = () => {
  const [{ isLoading, error }, { withLoading, setError, clearError }] = useUnifiedLoading();

  const submitForm = useCallback(
    async <T>(
      submitFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ) => {
      try {
        const result = await withLoading(submitFn, 'form_submit');
        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [withLoading]
  );

  return {
    isLoading,
    error,
    submitForm,
    setError,
    clearError,
  };
};

// Pattern pour les fetch de données
export const useDataLoading = <T>() => {
  const [{ isLoading, error }, { withLoading, clearError }] = useUnifiedLoading();
  const [data, setData] = useState<T | null>(null);

  const fetchData = useCallback(
    async (fetchFn: () => Promise<T>, onSuccess?: (data: T) => void) => {
      try {
        const result = await withLoading(fetchFn, 'data_fetch');
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (error) {
        setData(null);
        throw error;
      }
    },
    [withLoading]
  );

  const refetch = useCallback(
    (fetchFn: () => Promise<T>) => {
      return fetchData(fetchFn);
    },
    [fetchData]
  );

  return {
    data,
    isLoading,
    error,
    fetchData,
    refetch,
    clearError,
  };
};

// Migrations helpers pour faciliter la transition

/** @deprecated Use useSimpleLoading instead */
export const useLoadingState = useSimpleLoading;

/** @deprecated Use useLoadingWithError instead */
export const useLoadingError = useLoadingWithError;

export default useUnifiedLoading;
