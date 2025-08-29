import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de debouncing avancé pour optimiser les appels d'API ou d'autres traitements coûteux.
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes
 * @param options - Options avancées (leading, trailing, maxWait)
 * @returns Objet avec la valeur debouncée et des utilitaires
 */
interface UseDebounceOptions {
  leading?: boolean; // Exécuter immédiatement au premier appel
  trailing?: boolean; // Exécuter à la fin du délai (défaut: true)
  maxWait?: number; // Délai maximum avant exécution forcée
}

interface UseDebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

export function useDebounce<T>(
  value: T,
  delay: number,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { leading = false, trailing = true, maxWait } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>();
  const lastInvokeTimeRef = useRef<number>(0);
  const leadingRef = useRef<boolean>(true);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
    setIsPending(false);
    leadingRef.current = true;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDebouncedValue(value);
      setIsPending(false);
      lastInvokeTimeRef.current = Date.now();
      leadingRef.current = true;
    }
  }, [value]);

  useEffect(() => {
    const now = Date.now();
    lastCallTimeRef.current = now;

    // Exécution immédiate (leading edge)
    if (leading && leadingRef.current) {
      setDebouncedValue(value);
      lastInvokeTimeRef.current = now;
      leadingRef.current = false;

      if (!trailing) {
        return;
      }
    }

    // Calculer les délais
    const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
    const remainingWait = delay - timeSinceLastInvoke;

    // Gestion du maxWait
    if (maxWait !== undefined) {
      const timeSinceLastCall = now - (lastCallTimeRef.current || 0);
      const maxDelayExpired = timeSinceLastCall >= maxWait;

      if (maxDelayExpired) {
        setDebouncedValue(value);
        lastInvokeTimeRef.current = now;
        leadingRef.current = true;
        setIsPending(false);
        return;
      }

      if (!maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          setDebouncedValue(value);
          lastInvokeTimeRef.current = Date.now();
          leadingRef.current = true;
          setIsPending(false);
          maxTimeoutRef.current = undefined;
        }, maxWait - timeSinceLastCall);
      }
    }

    // Nettoyer le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsPending(true);

    // Créer le nouveau timeout
    timeoutRef.current = setTimeout(
      () => {
        if (trailing) {
          setDebouncedValue(value);
          lastInvokeTimeRef.current = Date.now();
        }
        setIsPending(false);
        leadingRef.current = true;
        timeoutRef.current = undefined;
      },
      remainingWait > 0 ? remainingWait : delay
    );

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing, maxWait]);

  // Cleanup final
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedValue,
    isPending,
    cancel,
    flush,
  };
}

// Version simple pour compatibilité
export function useSimpleDebounce<T>(value: T, delay: number): T {
  const { debouncedValue } = useDebounce(value, delay);
  return debouncedValue;
}

export default useDebounce;
