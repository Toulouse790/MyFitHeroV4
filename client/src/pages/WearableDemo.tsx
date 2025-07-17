import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Watch, 
  Trophy, 
  TrendingUp, 
  Settings,
  Smartphone
} from 'lucide-react';
import WearableStats from '@/components/WearableStats';

const WearableDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Démonstration Wearables</h1>
              <p className="text-gray-600 mt-2">
                Intégration complète avec Apple Health et Google Fit
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Activity size={12} className="mr-1" />
                Actif
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                <Watch size={12} className="mr-1" />
                Synchronisé
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Statistiques Wearables */}
          <div className="lg:col-span-2">
            <WearableStats />
          </div>

          {/* Colonne latérale - Actions et paramètres */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="mr-2" size={20} />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Activity className="mr-2" size={16} />
                  Synchroniser maintenant
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2" size={16} />
                  Voir fréquence cardiaque
                </Button>
                <Button variant="outline" className="w-full">
                  <Trophy className="mr-2" size={16} />
                  Objectifs quotidiens
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2" size={16} />
                  Rapports détaillés
                </Button>
              </CardContent>
            </Card>

            {/* Statut des appareils */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Watch className="mr-2" size={20} />
                  Appareils connectés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                      <Watch size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Apple Watch</p>
                      <p className="text-sm text-gray-500">Dernière sync: 2 min</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connecté
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                      <Activity size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Google Fit</p>
                      <p className="text-sm text-gray-500">Dernière sync: 5 min</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Connecté
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-md flex items-center justify-center">
                      <Heart size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Fitbit</p>
                      <p className="text-sm text-gray-500">Non connecté</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Disponible
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de synchronisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Synchronisation automatique</p>
                    <p className="text-sm text-gray-500">Toutes les 15 minutes</p>
                  </div>
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-gray-500">Rappels d'activité</p>
                  </div>
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sauvegarde cloud</p>
                    <p className="text-sm text-gray-500">Historique sécurisé</p>
                  </div>
                  <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Settings className="mr-2" size={16} />
                  Paramètres avancés
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section d'informations */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Intégration Wearables Complete
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              MyFitHero V4 s'intègre parfaitement avec vos appareils connectés pour un suivi 
              complet de votre activité physique. Synchronisez vos données de santé et 
              optimisez vos performances avec des insights personnalisés.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2">
                <Activity size={16} className="text-blue-600" />
                <span className="text-sm font-medium">Activité en temps réel</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2">
                <Heart size={16} className="text-red-600" />
                <span className="text-sm font-medium">Fréquence cardiaque</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2">
                <Watch size={16} className="text-purple-600" />
                <span className="text-sm font-medium">Synchronisation automatique</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm font-medium">Analytics avancés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WearableDemo;
