import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnitPreferences } from '@/hooks/useUnitPreferences';
import { UnitDisplay } from '@/components/UnitDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Weight, Ruler, Thermometer, Droplets, 
  Globe, Settings, ArrowLeftRight 
} from 'lucide-react';

export const UnitSystemDemo = () => {
  const { t, i18n } = useTranslation();
  const { preferences, updatePreferences } = useUnitPreferences();
  
  const [testValues] = useState({
    weight: 75, // kg
    height: 180, // cm
    liquid: 500, // ml
    temperature: 20 // °C
  });

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const toggleWeightUnit = () => {
    updatePreferences({ weight: preferences.weight === 'kg' ? 'lbs' : 'kg' });
  };

  const toggleHeightUnit = () => {
    updatePreferences({ height: preferences.height === 'cm' ? 'ft/in' : 'cm' });
  };

  const toggleLiquidUnit = () => {
    updatePreferences({ liquid: preferences.liquid === 'ml' ? 'fl_oz' : 'ml' });
  };

  const toggleTemperatureUnit = () => {
    updatePreferences({ temperature: preferences.temperature === 'celsius' ? 'fahrenheit' : 'celsius' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('unitSystem.title', 'Unit System Demo')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('unitSystem.description', 'Demonstrating automatic unit conversion for the US market')}
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={toggleLanguage} variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              {i18n.language === 'en' ? 'Switch to French' : 'Passer en anglais'}
            </Button>
            <Badge variant="secondary" className="flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              Locale: {i18n.language.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Unit Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              {t('unitSystem.preferences', 'Unit Preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Weight className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Weight</span>
                </div>
                <Button onClick={toggleWeightUnit} size="sm" variant="outline">
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  {preferences.weight}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Ruler className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Height</span>
                </div>
                <Button onClick={toggleHeightUnit} size="sm" variant="outline">
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  {preferences.height}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Liquid</span>
                </div>
                <Button onClick={toggleLiquidUnit} size="sm" variant="outline">
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  {preferences.liquid}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <Button onClick={toggleTemperatureUnit} size="sm" variant="outline">
                  <ArrowLeftRight className="h-3 w-3 mr-1" />
                  {preferences.temperature}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unit Display Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Weight className="h-5 w-5 mr-2" />
                Weight Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Body Weight:</span>
                <UnitDisplay 
                  value={testValues.weight}
                  type="weight"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dumbbell:</span>
                <UnitDisplay 
                  value={15}
                  type="weight"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Barbell:</span>
                <UnitDisplay 
                  value={45}
                  type="weight"
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ruler className="h-5 w-5 mr-2" />
                Height Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Height:</span>
                <UnitDisplay 
                  value={testValues.height}
                  type="height"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jump Height:</span>
                <UnitDisplay 
                  value={60}
                  type="height"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reach:</span>
                <UnitDisplay 
                  value={185}
                  type="height"
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="h-5 w-5 mr-2" />
                Liquid Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Water Bottle:</span>
                <UnitDisplay 
                  value={testValues.liquid}
                  type="liquid"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Protein Shake:</span>
                <UnitDisplay 
                  value={250}
                  type="liquid"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Intake:</span>
                <UnitDisplay 
                  value={2000}
                  type="liquid"
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2" />
                Temperature Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Room Temp:</span>
                <UnitDisplay 
                  value={testValues.temperature}
                  type="temperature"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Body Temp:</span>
                <UnitDisplay 
                  value={37}
                  type="temperature"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Workout Temp:</span>
                <UnitDisplay 
                  value={25}
                  type="temperature"
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Readiness Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              US Market Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Imperial Units Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Automatic Locale Detection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Real-time Unit Conversion</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Persistent User Preferences</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Bilingual Interface</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Admin Dashboard</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
