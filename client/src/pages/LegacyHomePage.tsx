import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Target, 
  Heart, 
  Activity, 
  TrendingUp, 
  Watch,
  ChevronRight,
  Settings,
  Bell,
  Award
} from 'lucide-react';
import SmartHealthDashboard from '@/components/SmartHealthDashboard';
import { useWearableSync } from '@/hooks/useWearableSync';

const HomePage: React.FC = () => {
  const { getCachedData, isLoading } = useWearableSync();
  const wearableData = getCachedData();

  const quickStats = [
    {
      title: 'Pas aujourd\'hui',
      value: wearableData?.steps?.toLocaleString() || '0',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Calories brûlées',
      value: wearableData?.caloriesBurned?.toString() || '0',
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'FC moyenne',
      value: wearableData?.heartRate ? `${Math.round(wearableData.heartRate.reduce((a, b) => a + b, 0) / wearableData.heartRate.length)} BPM` : '0 BPM',
      icon: Heart,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Minutes actives',
      value: wearableData?.activeMinutes?.toString() || '0',
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  const navigationCards = [
    {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble de vos métriques',
      icon: TrendingUp,
      color: 'bg-blue-500',
      href: '/dashboard'
    },
    {
      title: 'Wearables',
      description: 'Gérer vos appareils connectés',
      icon: Watch,
      color: 'bg-purple-500',
      href: '/wearables'
    },
    {
      title: 'Notifications',
      description: 'Centre de notifications',
      icon: Bell,
      color: 'bg-green-500',
      href: '/notifications'
    },
    {
      title: 'Paramètres',
      description: 'Configuration et préférences',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue sur MyFitHero V4
              </h1>
              <p className="text-gray-600 mt-2">
                Votre compagnon intelligent pour la santé et la forme
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Wearables connectés
              </Badge>
              <Badge variant="secondary">
                {isLoading ? 'Synchronisation...' : 'Dernière sync: maintenant'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={stat.color} size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dashboard principal */}
          <div className="lg:col-span-2">
            <SmartHealthDashboard />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Navigation rapide */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {navigationCards.map((card, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <card.icon className="text-white" size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{card.title}</h4>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                    <ChevronRight className="text-gray-400" size={16} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Réalisations récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2" size={20} />
                  Réalisations récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Target className="text-yellow-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Objectif 10K pas</p>
                    <p className="text-xs text-gray-500">Atteint aujourd'hui</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Série active</p>
                    <p className="text-xs text-gray-500">7 jours consécutifs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="text-green-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Zone cardio</p>
                    <p className="text-xs text-gray-500">30 min aujourd'hui</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Activity className="mr-2" size={16} />
                  Démarrer entraînement
                </Button>
                <Button variant="outline" className="w-full">
                  <Watch className="mr-2" size={16} />
                  Synchroniser wearables
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2" size={16} />
                  Voir les tendances
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer avec informations */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Intégration Wearables Complète !
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              MyFitHero V4 est maintenant parfaitement intégré avec vos appareils connectés. 
              Profitez d'un suivi complet de votre santé et de performances optimisées grâce à 
              l'intelligence artificielle.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="bg-white">
                ✅ Sessions d'entraînement améliorées
              </Badge>
              <Badge variant="outline" className="bg-white">
                ⌚ Synchronisation Apple Health & Google Fit
              </Badge>
              <Badge variant="outline" className="bg-white">
                📊 Analytics temps réel
              </Badge>
              <Badge variant="outline" className="bg-white">
                🎯 Objectifs personnalisés
              </Badge>
              <Badge variant="outline" className="bg-white">
                🔔 Notifications intelligentes
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
