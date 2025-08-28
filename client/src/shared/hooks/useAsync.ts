import { useState, useCallback, useEffect } from 'react';

export interface UseAsyncReturn<T, E = string> {
  execute: (asyncFunction?: () => Promise<T>) => Promise<T | undefined>;
  data: T | undefined;
  loading: boolean;
  error: E | undefined;
  reset: () => void;
}

function useAsync<T, E = string>(
  asyncFunction?: () => Promise<T>,
  immediate = true
): UseAsyncReturn<T, E> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<E | undefined>(undefined);

  const execute = useCallback(
    async (asyncFunc?: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true);
      setError(undefined);

      try {
        const func = asyncFunc || asyncFunction;
        if (!func) {
          throw new Error('No async function provided');
        }

        const result = await func();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage as E);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setLoading(false);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (immediate && asyncFunction) {
      execute();
    }
  }, [execute, immediate, asyncFunction]);

  return { execute, data, loading, error, reset };
}

export default useAsync;
