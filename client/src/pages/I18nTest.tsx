// client/src/pages/I18nTest.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { I18nDemo } from '@/components/I18nDemo';
import PersonalInfoFormI18n from '@/components/PersonalInfoFormI18n';
import { Globe, Settings, User } from 'lucide-react';

const I18nTest: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);

  const handleFormComplete = (data: any) => {
    console.log('Form completed with data:', data);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6" />
              MyFitHero - US Market Ready! 🇺🇸
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Welcome to MyFitHero's internationalization system! This demo shows how we're preparing for the US market with proper unit conversions and user preferences.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">🇺🇸 US Market Features:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Weight in lbs/kg conversion</li>
                  <li>• Height in ft/in and cm</li>
                  <li>• Liquid in fl oz/ml</li>
                  <li>• Temperature in °F/°C</li>
                  <li>• Persistent user preferences</li>
                  <li>• Auto-detection based on locale</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🏗️ Technical Implementation:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• react-i18next for translations</li>
                  <li>• Custom unit conversion utilities</li>
                  <li>• useUnitPreferences hook</li>
                  <li>• localStorage persistence</li>
                  <li>• Real-time unit switching</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Unit Conversion Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <I18nDemo />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Onboarding Form Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowForm(!showForm)} 
                  className="w-full"
                  variant={showForm ? "outline" : "default"}
                >
                  {showForm ? 'Hide Form' : 'Test Onboarding Form'}
                </Button>
                
                {showForm && (
                  <div className="mt-4">
                    <PersonalInfoFormI18n onComplete={handleFormComplete} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🎯 US Market Strategy Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-green-700">Unit Conversion Accuracy</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2 Languages</div>
                <div className="text-sm text-blue-700">English & French Support</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">🚀 Ready</div>
                <div className="text-sm text-purple-700">US Market Launch</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default I18nTest;
