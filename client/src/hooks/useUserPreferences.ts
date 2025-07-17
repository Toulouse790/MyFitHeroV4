import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UnitSystem, UnitPreferences, getUnitSystemFromLocale, getUnitPreferences } from '@/utils/unitConversion';

export interface UserPreferences {
  language: string;
  unitSystem: UnitSystem;
  units: UnitPreferences;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  unitSystem: 'imperial',
  units: getUnitPreferences('imperial'),
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'USD',
  theme: 'system'
};

export const useUserPreferences = () => {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des préférences au montage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem('userPreferences');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
        } else {
          // Détection automatique basée sur la locale
          const detectedSystem = getUnitSystemFromLocale(i18n.language);
          const detectedPrefs: UserPreferences = {
            ...DEFAULT_PREFERENCES,
            language: i18n.language,
            unitSystem: detectedSystem,
            units: getUnitPreferences(detectedSystem),
            dateFormat: detectedSystem === 'imperial' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
            currency: detectedSystem === 'imperial' ? 'USD' : 'EUR'
          };
          setPreferences(detectedPrefs);
          localStorage.setItem('userPreferences', JSON.stringify(detectedPrefs));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [i18n.language]);

  // Sauvegarde des préférences
  const savePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('userPreferences', JSON.stringify(updated));
    
    // Changer la langue si nécessaire
    if (newPreferences.language && newPreferences.language !== i18n.language) {
      i18n.changeLanguage(newPreferences.language);
    }
  };

  // Changer le système d'unités
  const changeUnitSystem = (system: UnitSystem) => {
    const newUnits = getUnitPreferences(system);
    const updates: Partial<UserPreferences> = {
      unitSystem: system,
      units: newUnits,
      dateFormat: system === 'imperial' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
      timeFormat: system === 'imperial' ? '12h' : '24h',
      currency: system === 'imperial' ? 'USD' : 'EUR'
    };
    savePreferences(updates);
  };

  // Changer la langue
  const changeLanguage = (language: string) => {
    const system = getUnitSystemFromLocale(language);
    const updates: Partial<UserPreferences> = {
      language,
      unitSystem: system,
      units: getUnitPreferences(system),
      dateFormat: system === 'imperial' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
      currency: system === 'imperial' ? 'USD' : 'EUR'
    };
    savePreferences(updates);
  };

  // Formatage de la date selon les préférences
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    switch (preferences.dateFormat) {
      case 'MM/DD/YYYY':
        return date.toLocaleDateString('en-US', options);
      case 'DD/MM/YYYY':
        return date.toLocaleDateString('en-GB', options);
      case 'YYYY-MM-DD':
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString();
    }
  };

  // Formatage de l'heure selon les préférences
  const formatTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: preferences.timeFormat === '12h'
    };
    return date.toLocaleTimeString(preferences.language, options);
  };

  // Formatage de la monnaie
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(preferences.language, {
      style: 'currency',
      currency: preferences.currency
    }).format(amount);
  };

  // Formatage des nombres
  const formatNumber = (number: number, decimals: number = 2): string => {
    return new Intl.NumberFormat(preferences.language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  };

  // Détection si l'utilisateur est aux US
  const isUSUser = (): boolean => {
    return preferences.unitSystem === 'imperial' && 
           preferences.language.startsWith('en') && 
           preferences.currency === 'USD';
  };

  return {
    preferences,
    isLoading,
    savePreferences,
    changeUnitSystem,
    changeLanguage,
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
    isUSUser
  };
};
