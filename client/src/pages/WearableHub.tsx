import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Settings, 
  Bell, 
  TrendingUp, 
  Watch,
  Smartphone,
  BarChart3
} from 'lucide-react';
import WearableStats from '@/components/WearableStats';
import WearableNotificationCenter from '@/components/WearableNotificationCenter';
import SettingsPageImproved from '@/pages/SettingsPageImproved';

const WearableHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Watch className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MyFitHero Wearables</h1>
                <p className="text-gray-600">
                  Centre de contrôle pour vos appareils connectés
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                En ligne
              </Badge>
              <Badge variant="secondary">
                <Activity size={12} className="mr-1" />
                Synchronisé
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp size={16} />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings size={16} />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Statistiques principales */}
              <div className="lg:col-span-2">
                <WearableStats />
              </div>
              
              {/* Résumé rapide */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2" size={20} />
                      Résumé rapide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">État de santé</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Excellent
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Niveau d'activité</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Très actif
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tendance</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        ↗️ En hausse
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Smartphone className="mr-2" size={20} />
                      Appareils connectés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="text-red-500" size={16} />
                        <span className="text-sm">Apple Watch</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connecté
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="text-blue-500" size={16} />
                        <span className="text-sm">Google Fit</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connecté
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <WearableNotificationCenter />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Analytics avancés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-gray-600">Objectifs atteints</div>
                    <div className="text-xs text-gray-500">Ce mois</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+12%</div>
                    <div className="text-sm text-gray-600">Amélioration</div>
                    <div className="text-xs text-gray-500">vs mois dernier</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">Jours actifs</div>
                    <div className="text-xs text-gray-500">Série actuelle</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">4.2</div>
                    <div className="text-sm text-gray-600">Score santé</div>
                    <div className="text-xs text-gray-500">/ 5.0</div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Insights personnalisés</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Votre activité est optimale entre 10h et 16h</li>
                    <li>• Les jours avec plus de sommeil REM correspondent à de meilleures performances</li>
                    <li>• Votre fréquence cardiaque de repos s'améliore constamment</li>
                    <li>• Les entraînements matinaux donnent les meilleurs résultats</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings">
            <SettingsPageImproved />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WearableHub;
