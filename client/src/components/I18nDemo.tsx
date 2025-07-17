// client/src/components/I18nDemo.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUnitPreferences } from '@/hooks/useUnitPreferences';
import { convertWeight, convertHeight } from '@/lib/unitConversions';
import { UnitPreferencesSelector } from './UnitPreferencesSelector';
import { Globe, Settings } from 'lucide-react';

export const I18nDemo: React.FC = () => {
  const { preferences } = useUnitPreferences();
  const [showPreferences, setShowPreferences] = React.useState(false);

  // Données d'exemple
  const sampleWeight = 70; // kg
  const sampleHeight = 175; // cm

  // Conversion pour l'affichage
  const displayWeight = preferences.weight === 'lbs' 
    ? convertWeight(sampleWeight, 'kg', 'lbs') 
    : sampleWeight;
  
  const displayHeight = preferences.height === 'ft/in' 
    ? convertHeight(sampleHeight, 'cm', 'ft/in') 
    : sampleHeight;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            i18n & Unit Conversion Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight</label>
              <div className="text-2xl font-bold text-blue-600">
                {displayWeight.toFixed(1)} {preferences.weight === 'lbs' ? 'lbs' : 'kg'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Height</label>
              <div className="text-2xl font-bold text-blue-600">
                {preferences.height === 'ft/in' 
                  ? `${Math.floor(displayHeight)}'${Math.round((displayHeight % 1) * 12)}"` 
                  : `${displayHeight} cm`
                }
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Current Preferences:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Weight: {preferences.weight}</span>
              <span>Height: {preferences.height}</span>
              <span>Liquid: {preferences.liquid}</span>
              <span>Temperature: {preferences.temperature}</span>
            </div>
          </div>

          <Button 
            onClick={() => setShowPreferences(!showPreferences)}
            className="w-full"
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showPreferences ? 'Hide' : 'Show'} Preferences
          </Button>
        </CardContent>
      </Card>

      {showPreferences && (
        <UnitPreferencesSelector onClose={() => setShowPreferences(false)} />
      )}
    </div>
  );
};
