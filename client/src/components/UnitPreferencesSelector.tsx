// client/src/components/UnitPreferencesSelector.tsx
import React from 'react';
import { useUnitPreferences } from '@/hooks/useUnitPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Scale, Ruler, Thermometer, Waves } from 'lucide-react';

interface UnitPreferencesSelectorProps {
  onClose?: () => void;
}

export const UnitPreferencesSelector: React.FC<UnitPreferencesSelectorProps> = ({ onClose }) => {
  const { preferences, updatePreferences, resetToDefault } = useUnitPreferences();

  const handleUnitChange = (category: string, value: string) => {
    updatePreferences({ [category]: value });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language & Units
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Poids */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Scale className="h-4 w-4" />
            Weight
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={preferences.weight === 'kg' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('weight', 'kg')}
              size="sm"
            >
              kg
            </Button>
            <Button
              variant={preferences.weight === 'lbs' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('weight', 'lbs')}
              size="sm"
            >
              lbs
            </Button>
          </div>
        </div>

        {/* Taille */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            Height
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={preferences.height === 'cm' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('height', 'cm')}
              size="sm"
            >
              cm
            </Button>
            <Button
              variant={preferences.height === 'ft/in' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('height', 'ft/in')}
              size="sm"
            >
              ft/in
            </Button>
          </div>
        </div>

        {/* Liquides */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Waves className="h-4 w-4" />
            Liquids
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={preferences.liquid === 'ml' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('liquid', 'ml')}
              size="sm"
            >
              ml
            </Button>
            <Button
              variant={preferences.liquid === 'fl_oz' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('liquid', 'fl_oz')}
              size="sm"
            >
              fl oz
            </Button>
          </div>
        </div>

        {/* Température */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Thermometer className="h-4 w-4" />
            Temperature
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={preferences.temperature === 'celsius' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('temperature', 'celsius')}
              size="sm"
            >
              °C
            </Button>
            <Button
              variant={preferences.temperature === 'fahrenheit' ? 'default' : 'outline'}
              onClick={() => handleUnitChange('temperature', 'fahrenheit')}
              size="sm"
            >
              °F
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={resetToDefault}
            className="flex-1"
          >
            Reset to Default
          </Button>
          {onClose && (
            <Button 
              onClick={onClose}
              className="flex-1"
            >
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
