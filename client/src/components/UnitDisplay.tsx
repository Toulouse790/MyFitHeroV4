// client/src/components/UnitDisplay.tsx
import React from 'react';
import { useUnitPreferences } from '@/hooks/useUnitPreferences';
import { convertWeight, convertHeight, convertLiquid, convertTemperature } from '@/lib/unitConversions';

interface UnitDisplayProps {
  value: number;
  type: 'weight' | 'height' | 'liquid' | 'temperature';
  className?: string;
  showUnit?: boolean;
  precision?: number;
}

export const UnitDisplay: React.FC<UnitDisplayProps> = ({
  value,
  type,
  className = '',
  showUnit = true,
  precision = 1
}) => {
  const { preferences } = useUnitPreferences();

  const getDisplayValue = () => {
    switch (type) {
      case 'weight':
        if (preferences.weight === 'lbs') {
          return convertWeight(value, 'kg', 'lbs');
        }
        return value;
      
      case 'height':
        if (preferences.height === 'ft/in') {
          return convertHeight(value, 'cm', 'ft/in');
        }
        return value;
      
      case 'liquid':
        if (preferences.liquid === 'fl_oz') {
          return convertLiquid(value, 'ml', 'fl_oz');
        }
        return value;
      
      case 'temperature':
        if (preferences.temperature === 'fahrenheit') {
          return convertTemperature(value, 'celsius', 'fahrenheit');
        }
        return value;
      
      default:
        return value;
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'weight':
        return preferences.weight === 'lbs' ? 'lbs' : 'kg';
      
      case 'height':
        return preferences.height === 'ft/in' ? 'ft' : 'cm';
      
      case 'liquid':
        return preferences.liquid === 'fl_oz' ? 'fl oz' : 'ml';
      
      case 'temperature':
        return preferences.temperature === 'fahrenheit' ? '°F' : '°C';
      
      default:
        return '';
    }
  };

  const formatValue = (val: number) => {
    if (type === 'height' && preferences.height === 'ft/in') {
      const feet = Math.floor(val);
      const inches = Math.round((val % 1) * 12);
      return `${feet}'${inches}"`;
    }
    return val.toFixed(precision);
  };

  const displayValue = getDisplayValue();
  const unit = getUnit();

  return (
    <span className={className}>
      {formatValue(displayValue)}
      {showUnit && unit && (
        <span className="text-gray-500 ml-1">{unit}</span>
      )}
    </span>
  );
};

// Hook pour utiliser facilement les conversions
export const useUnitDisplay = () => {
  const { preferences } = useUnitPreferences();

  const formatWeight = (value: number, showUnit = true) => {
    const converted = preferences.weight === 'lbs' ? convertWeight(value, 'kg', 'lbs') : value;
    const unit = preferences.weight === 'lbs' ? 'lbs' : 'kg';
    return showUnit ? `${converted.toFixed(1)} ${unit}` : converted.toFixed(1);
  };

  const formatHeight = (value: number, showUnit = true) => {
    if (preferences.height === 'ft/in') {
      const converted = convertHeight(value, 'cm', 'ft/in');
      const feet = Math.floor(converted);
      const inches = Math.round((converted % 1) * 12);
      return showUnit ? `${feet}'${inches}"` : `${feet}.${inches}`;
    }
    return showUnit ? `${value} cm` : value.toString();
  };

  const formatLiquid = (value: number, showUnit = true) => {
    const converted = preferences.liquid === 'fl_oz' ? convertLiquid(value, 'ml', 'fl_oz') : value;
    const unit = preferences.liquid === 'fl_oz' ? 'fl oz' : 'ml';
    return showUnit ? `${converted.toFixed(0)} ${unit}` : converted.toFixed(0);
  };

  return {
    formatWeight,
    formatHeight,
    formatLiquid,
    preferences
  };
};
