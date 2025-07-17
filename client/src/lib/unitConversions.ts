// client/src/lib/unitConversions.ts

export interface UnitPreferences {
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft/in';
  liquid: 'ml' | 'fl_oz';
  temperature: 'celsius' | 'fahrenheit';
}

// Fonction pour obtenir les préférences par défaut selon la locale
export const getPreferencesForLocale = (locale: string): UnitPreferences => {
  // Locales qui utilisent le système impérial (principalement US)
  const imperialLocales = ['en-US', 'en', 'us'];
  
  const isImperial = imperialLocales.some(imperialLocale => 
    locale.toLowerCase().includes(imperialLocale.toLowerCase())
  );

  if (isImperial) {
    return {
      weight: 'lbs',
      height: 'ft/in',
      liquid: 'fl_oz',
      temperature: 'fahrenheit'
    };
  }

  // Système métrique par défaut pour le reste du monde
  return {
    weight: 'kg',
    height: 'cm',
    liquid: 'ml',
    temperature: 'celsius'
  };
};

// Conversions de poids
export const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
  if (from === to) return value;
  
  if (from === 'kg' && to === 'lbs') {
    return value * 2.20462;
  }
  
  if (from === 'lbs' && to === 'kg') {
    return value / 2.20462;
  }
  
  return value;
};

// Conversions de taille
export const convertHeight = (value: number, from: 'cm' | 'ft/in', to: 'cm' | 'ft/in'): number => {
  if (from === to) return value;
  
  if (from === 'cm' && to === 'ft/in') {
    return value / 30.48; // Convertir cm en pieds (avec décimales)
  }
  
  if (from === 'ft/in' && to === 'cm') {
    return value * 30.48; // Convertir pieds en cm
  }
  
  return value;
};

// Conversions de liquides
export const convertLiquid = (value: number, from: 'ml' | 'fl_oz', to: 'ml' | 'fl_oz'): number => {
  if (from === to) return value;
  
  if (from === 'ml' && to === 'fl_oz') {
    return value * 0.033814;
  }
  
  if (from === 'fl_oz' && to === 'ml') {
    return value / 0.033814;
  }
  
  return value;
};

// Conversions de température
export const convertTemperature = (value: number, from: 'celsius' | 'fahrenheit', to: 'celsius' | 'fahrenheit'): number => {
  if (from === to) return value;
  
  if (from === 'celsius' && to === 'fahrenheit') {
    return (value * 9/5) + 32;
  }
  
  if (from === 'fahrenheit' && to === 'celsius') {
    return (value - 32) * 5/9;
  }
  
  return value;
};

// Formatage des valeurs avec unités
export const formatWeight = (value: number, unit: 'kg' | 'lbs', precision: number = 1): string => {
  return `${value.toFixed(precision)} ${unit}`;
};

export const formatHeight = (value: number, unit: 'cm' | 'ft/in', precision: number = 1): string => {
  if (unit === 'ft/in') {
    const feet = Math.floor(value);
    const inches = Math.round((value % 1) * 12);
    return `${feet}'${inches}"`;
  }
  return `${value.toFixed(precision)} ${unit}`;
};

export const formatLiquid = (value: number, unit: 'ml' | 'fl_oz', precision: number = 0): string => {
  return `${value.toFixed(precision)} ${unit === 'fl_oz' ? 'fl oz' : unit}`;
};

export const formatTemperature = (value: number, unit: 'celsius' | 'fahrenheit', precision: number = 1): string => {
  return `${value.toFixed(precision)}°${unit === 'celsius' ? 'C' : 'F'}`;
};

// Utilitaires pour les conversions communes
export const kgToLbs = (kg: number): number => convertWeight(kg, 'kg', 'lbs');
export const lbsToKg = (lbs: number): number => convertWeight(lbs, 'lbs', 'kg');
export const cmToFeet = (cm: number): number => convertHeight(cm, 'cm', 'ft/in');
export const feetToCm = (feet: number): number => convertHeight(feet, 'ft/in', 'cm');
export const mlToFlOz = (ml: number): number => convertLiquid(ml, 'ml', 'fl_oz');
export const flOzToMl = (flOz: number): number => convertLiquid(flOz, 'fl_oz', 'ml');
export const celsiusToFahrenheit = (celsius: number): number => convertTemperature(celsius, 'celsius', 'fahrenheit');
export const fahrenheitToCelsius = (fahrenheit: number): number => convertTemperature(fahrenheit, 'fahrenheit', 'celsius');

// Constantes utiles
export const CONVERSION_FACTORS = {
  KG_TO_LBS: 2.20462,
  CM_TO_FEET: 0.0328084,
  ML_TO_FL_OZ: 0.033814,
  CELSIUS_TO_FAHRENHEIT: (c: number) => (c * 9/5) + 32
};

// Validation des valeurs
export const isValidWeight = (value: number, unit: 'kg' | 'lbs'): boolean => {
  if (unit === 'kg') {
    return value >= 20 && value <= 300; // 20kg à 300kg
  }
  return value >= 44 && value <= 660; // 44lbs à 660lbs
};

export const isValidHeight = (value: number, unit: 'cm' | 'ft/in'): boolean => {
  if (unit === 'cm') {
    return value >= 100 && value <= 250; // 100cm à 250cm
  }
  return value >= 3.28 && value <= 8.2; // 3.28ft à 8.2ft
};

export const isValidLiquid = (value: number, unit: 'ml' | 'fl_oz'): boolean => {
  if (unit === 'ml') {
    return value >= 0 && value <= 10000; // 0ml à 10L
  }
  return value >= 0 && value <= 338; // 0fl oz à 338fl oz (~10L)
};

export const isValidTemperature = (value: number, unit: 'celsius' | 'fahrenheit'): boolean => {
  if (unit === 'celsius') {
    return value >= -50 && value <= 60; // -50°C à 60°C
  }
  return value >= -58 && value <= 140; // -58°F à 140°F
};
