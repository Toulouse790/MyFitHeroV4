// client/src/hooks/useUnitPreferences.ts
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UnitPreferences, getPreferencesForLocale } from '@/lib/unitConversions';

const STORAGE_KEY = 'unit_preferences';

export const useUnitPreferences = () => {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState<UnitPreferences>(() => {
    // Charger depuis le localStorage ou utiliser les préférences par défaut
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Si parsing échoue, utiliser les préférences par défaut
      }
    }
    return getPreferencesForLocale(i18n.language);
  });

  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Mettre à jour les préférences quand la langue change
  useEffect(() => {
    const newPreferences = getPreferencesForLocale(i18n.language);
    setPreferences((prev: UnitPreferences) => ({
      ...prev,
      ...newPreferences
    }));
  }, [i18n.language]);

  const updatePreferences = (newPreferences: Partial<UnitPreferences>) => {
    setPreferences((prev: UnitPreferences) => ({ ...prev, ...newPreferences }));
  };

  const resetToDefault = () => {
    const defaultPrefs = getPreferencesForLocale(i18n.language);
    setPreferences(defaultPrefs);
  };

  return {
    preferences,
    updatePreferences,
    resetToDefault
  };
};
