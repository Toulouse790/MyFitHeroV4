import { useState, useEffect, useRef } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  // State et setter pour la valeur debouncée
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Mettre à jour la valeur debouncée après le délai
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timeout si value change (aussi sur le unmount)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]); // Exécuter seulement si value ou delay change

  return debouncedValue;
}

export default useDebounce;
