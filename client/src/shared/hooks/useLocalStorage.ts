import { useState, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  // State pour stocker notre valeur
  // Transmet un fonction initialState à useState pour que la logique ne s'exécute qu'une fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Obtenir depuis localStorage par la clé
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou si aucun retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Retourne une version wrapped de la setter function de useState qui ...
  // ... persiste la nouvelle valeur dans localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permet à la valeur d'être une fonction pour avoir la même API que useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Sauvegarder dans le state
        setStoredValue(valueToStore);

        // Sauvegarder dans localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;
