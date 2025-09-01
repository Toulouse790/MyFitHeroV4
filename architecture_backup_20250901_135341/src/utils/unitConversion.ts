// Utilitaires de conversion pour le marché US
export type UnitSystem = 'metric' | 'imperial';

export interface UnitConversion {
  weight: (value: number, from: UnitSystem, to: UnitSystem) => number;
  height: (value: number, from: UnitSystem, to: UnitSystem) => number;
  distance: (value: number, from: UnitSystem, to: UnitSystem) => number;
  liquid: (value: number, from: UnitSystem, to: UnitSystem) => number;
  temperature: (value: number, from: UnitSystem, to: UnitSystem) => number;
}

export const convertUnits: UnitConversion = {
  // Conversion poids : kg <-> lbs
  weight: (value: number, from: UnitSystem, to: UnitSystem): number => {
    if (from === to) return value;

    if (from === 'metric' && to === 'imperial') {
      return Number((value * 2.20462).toFixed(1)); // kg -> lbs
    } else {
      return Number((value / 2.20462).toFixed(1)); // lbs -> kg
    }
  },

  // Conversion taille : cm <-> ft/in
  height: (value: number, from: UnitSystem, to: UnitSystem): number => {
    if (from === to) return value;

    if (from === 'metric' && to === 'imperial') {
      return Number((value / 2.54).toFixed(1)); // cm -> inches
    } else {
      return Number((value * 2.54).toFixed(1)); // inches -> cm
    }
  },

  // Conversion distance : km <-> miles
  distance: (value: number, from: UnitSystem, to: UnitSystem): number => {
    if (from === to) return value;

    if (from === 'metric' && to === 'imperial') {
      return Number((value * 0.621371).toFixed(2)); // km -> miles
    } else {
      return Number((value / 0.621371).toFixed(2)); // miles -> km
    }
  },

  // Conversion liquide : ml <-> fl oz
  liquid: (value: number, from: UnitSystem, to: UnitSystem): number => {
    if (from === to) return value;

    if (from === 'metric' && to === 'imperial') {
      return Number((value * 0.033814).toFixed(1)); // ml -> fl oz
    } else {
      return Number((value / 0.033814).toFixed(1)); // fl oz -> ml
    }
  },

  // Conversion température : °C <-> °F
  temperature: (value: number, from: UnitSystem, to: UnitSystem): number => {
    if (from === to) return value;

    if (from === 'metric' && to === 'imperial') {
      return Number(((value * 9) / 5 + 32).toFixed(1)); // °C -> °F
    } else {
      return Number((((value - 32) * 5) / 9).toFixed(1)); // °F -> °C
    }
  },
};

// Formatage des unités selon le système
export const formatUnit = (value: number, unit: string, system: UnitSystem): string => {
  switch (unit) {
    case 'weight':
      return system === 'imperial' ? `${value} lbs` : `${value} kg`;
    case 'height':
      if (system === 'imperial') {
        const feet = Math.floor(value / 12);
        const inches = Math.round(value % 12);
        return `${feet}'${inches}"`;
      } else {
        return `${value} cm`;
      }
    case 'distance':
      return system === 'imperial' ? `${value} miles` : `${value} km`;
    case 'liquid':
      return system === 'imperial' ? `${value} fl oz` : `${value} ml`;
    case 'temperature':
      return system === 'imperial' ? `${value}°F` : `${value}°C`;
    default:
      return `${value}`;
  }
};

// Conversion automatique basée sur la locale
export const getUnitSystemFromLocale = (locale: string): UnitSystem => {
  const imperialLocales = ['en-US', 'en-GB', 'en-CA'];
  return imperialLocales.includes(locale) ? 'imperial' : 'metric';
};

// Validation des valeurs selon le système
export const validateUnitRange = (value: number, unit: string, system: UnitSystem): boolean => {
  switch (unit) {
    case 'weight':
      if (system === 'imperial') {
        return value >= 99 && value <= 441; // 99-441 lbs (45-200 kg)
      } else {
        return value >= 45 && value <= 200; // 45-200 kg
      }
    case 'height':
      if (system === 'imperial') {
        return value >= 47 && value <= 91; // 47-91 inches (120-230 cm)
      } else {
        return value >= 120 && value <= 230; // 120-230 cm
      }
    default:
      return true;
  }
};

// Conversion intelligente pour affichage
export const displayValue = (
  value: number,
  unit: string,
  targetSystem: UnitSystem,
  sourceSystem: UnitSystem = 'metric'
): string => {
  const convertedValue = convertUnits[unit as keyof UnitConversion](
    value,
    sourceSystem,
    targetSystem
  );
  return formatUnit(convertedValue, unit, targetSystem);
};

// Helpers pour les placeholders
export const getPlaceholderValue = (unit: string, system: UnitSystem): string => {
  switch (unit) {
    case 'weight':
      return system === 'imperial' ? '155' : '70';
    case 'height':
      return system === 'imperial' ? '69' : '175'; // 69 inches = 5'9"
    default:
      return '';
  }
};

// Export du type pour utilisation dans les composants
export interface UnitPreferences {
  system: UnitSystem;
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft/in';
  distance: 'km' | 'miles';
  liquid: 'ml' | 'fl_oz';
  temperature: 'celsius' | 'fahrenheit';
}

export const getUnitPreferences = (system: UnitSystem): UnitPreferences => ({
  system,
  weight: system === 'imperial' ? 'lbs' : 'kg',
  height: system === 'imperial' ? 'ft/in' : 'cm',
  distance: system === 'imperial' ? 'miles' : 'km',
  liquid: system === 'imperial' ? 'fl_oz' : 'ml',
  temperature: system === 'imperial' ? 'fahrenheit' : 'celsius',
});
