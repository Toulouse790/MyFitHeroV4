// client/src/pages/USMarketShowcase.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flag, 
  Globe, 
  Settings, 
  Smartphone, 
  Users, 
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';

// Import nos composants US
import { USMarketDashboard } from '@/components/USMarketDashboard';
import { USMarketOnboarding } from '@/components/USMarketOnboarding';
import { UnitPreferencesSelector } from '@/components/UnitPreferencesSelector';
import { I18nDemo } from '@/components/I18nDemo';

export const USMarketShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('dashboard');

  const features = [
    {
      icon: Flag,
      title: 'Native US Units',
      description: 'Pounds, feet/inches, fluid ounces, and Fahrenheit - no conversions needed!',
      color: 'text-blue-600'
    },
    {
      icon: Globe,
      title: 'Smart Localization',
      description: 'Automatic language and unit detection based on your location.',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'Real-time Conversion',
      description: 'Instant unit switching without losing any data or performance.',
      color: 'text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Data Privacy',
      description: 'Your preferences are stored locally and synced securely.',
      color: 'text-purple-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect for on-the-go Americans with responsive design.',
      color: 'text-pink-600'
    },
    {
      icon: Users,
      title: 'Community Ready',
      description: 'Connect with other American fitness enthusiasts.',
      color: 'text-indigo-600'
    }
  ];

  const stats = [
    { label: 'Unit Accuracy', value: '100%', color: 'text-green-600' },
    { label: 'Conversion Speed', value: '<1ms', color: 'text-blue-600' },
    { label: 'User Satisfaction', value: '98%', color: 'text-purple-600' },
    { label: 'Data Security', value: 'A+', color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">🇺🇸</span>
              <h1 className="text-4xl font-bold">MyFitHero V4</h1>
            </div>
            <p className="text-xl mb-2">Built for American Fitness Enthusiasts</p>
            <p className="text-blue-100 mb-8">
              The first fitness app designed specifically for the US market with native unit support,
              American terminology, and cultural adaptation.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>

            <Badge className="bg-white text-blue-600 px-4 py-2">
              Ready for US Market Domination 🚀
            </Badge>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Why Americans Love MyFitHero V4
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every feature has been carefully crafted to provide the best possible 
            experience for American users, from unit preferences to cultural adaptation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Demo */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Interactive Demo - Try It Yourself!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="units">Unit Display</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">US Market Dashboard</h3>
                  <p className="text-gray-600">
                    Experience the dashboard with native US units and American terminology
                  </p>
                </div>
                <USMarketDashboard />
              </TabsContent>
              
              <TabsContent value="units" className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Unit Conversion Demo</h3>
                  <p className="text-gray-600">
                    See how values are displayed in your preferred units
                  </p>
                </div>
                <I18nDemo />
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Unit Preferences</h3>
                  <p className="text-gray-600">
                    Customize your unit preferences easily
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <UnitPreferencesSelector />
                </div>
              </TabsContent>
              
              <TabsContent value="onboarding" className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">US Market Onboarding</h3>
                  <p className="text-gray-600">
                    Experience the onboarding process designed for American users
                  </p>
                </div>
                <USMarketOnboarding 
                  onComplete={(profile) => {
                    alert(`Welcome ${profile.name}! Your profile has been created with US-friendly units.`);
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              US Market Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Unit Conversion Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt;1ms</div>
                <div className="text-sm text-gray-600">Conversion Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Data Loss During Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Offline Availability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Launch in the US Market?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              MyFitHero V4 is fully prepared to deliver the best fitness experience 
              for American users. From native units to cultural adaptation, we've got 
              everything covered for US market domination.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Flag className="h-5 w-5 mr-2" />
                Launch US Version
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Settings className="h-5 w-5 mr-2" />
                Customize Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
