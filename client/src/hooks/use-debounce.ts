// client/src/hooks/use-debounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook de debouncing pour optimiser les appels d'API
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes
 * @returns La valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Créer un timer qui mettra à jour la valeur debouncée après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timeout si value change (effet de nettoyage)
    // Cela évite que la valeur debouncée soit mise à jour si value change dans le délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Se réexécute seulement si value ou delay change

  return debouncedValue;
}

export default useDebounce;
