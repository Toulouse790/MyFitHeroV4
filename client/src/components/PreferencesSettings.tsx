import React from 'react';
import { Globe, Settings, Clock, Calendar, DollarSign, Sun, Moon, Monitor } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { UnitSystem } from '@/utils/unitConversion';

interface PreferencesSettingsProps {
  onClose?: () => void;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ onClose }) => {
  const { preferences, changeLanguage, changeUnitSystem, savePreferences } = useUserPreferences();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const unitSystems = [
    { 
      system: 'imperial' as UnitSystem, 
      name: 'Imperial (US)', 
      description: 'Pounds, feet, Fahrenheit' 
    },
    { 
      system: 'metric' as UnitSystem, 
      name: 'Metric', 
      description: 'Kilograms, centimeters, Celsius' 
    }
  ];

  const dateFormats = [
    { format: 'MM/DD/YYYY' as const, name: 'MM/DD/YYYY', example: '12/25/2024' },
    { format: 'DD/MM/YYYY' as const, name: 'DD/MM/YYYY', example: '25/12/2024' },
    { format: 'YYYY-MM-DD' as const, name: 'YYYY-MM-DD', example: '2024-12-25' }
  ];

  const timeFormats = [
    { format: '12h' as const, name: '12-hour', example: '2:30 PM' },
    { format: '24h' as const, name: '24-hour', example: '14:30' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
  ];

  const themes = [
    { theme: 'light' as const, name: 'Light', icon: Sun },
    { theme: 'dark' as const, name: 'Dark', icon: Moon },
    { theme: 'system' as const, name: 'System', icon: Monitor }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Preferences
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Language Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Language
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.language === lang.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Unit System */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Unit System</h3>
        <div className="space-y-3">
          {unitSystems.map((system) => (
            <button
              key={system.system}
              onClick={() => changeUnitSystem(system.system)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                preferences.unitSystem === system.system
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{system.name}</div>
              <div className="text-sm text-gray-600">{system.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Date Format */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Date Format
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {dateFormats.map((format) => (
            <button
              key={format.format}
              onClick={() => savePreferences({ dateFormat: format.format })}
              className={`p-3 rounded-lg border-2 transition-all ${
                preferences.dateFormat === format.format
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{format.name}</div>
              <div className="text-xs text-gray-600">{format.example}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Format */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Format
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {timeFormats.map((format) => (
            <button
              key={format.format}
              onClick={() => savePreferences({ timeFormat: format.format })}
              className={`p-3 rounded-lg border-2 transition-all ${
                preferences.timeFormat === format.format
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{format.name}</div>
              <div className="text-sm text-gray-600">{format.example}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Currency
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => savePreferences({ currency: currency.code })}
              className={`p-3 rounded-lg border-2 transition-all ${
                preferences.currency === currency.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{currency.symbol}</span>
                <span className="text-sm">{currency.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.theme}
                onClick={() => savePreferences({ theme: theme.theme })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  preferences.theme === theme.theme
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-6 h-6" />
                  <span className="font-medium">{theme.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
