import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Moon,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWearableSync, WearableData } from '@/hooks/useWearableSync';
import { AnalyticsService } from '@/lib/analytics';

interface WearableStatsProps {
  userId?: string;
  className?: string;
}

const WearableStats: React.FC<WearableStatsProps> = ({ userId = 'current-user-id', className }) => {
  const { getCachedData } = useWearableSync();
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(7);

  useEffect(() => {
    loadWearableData();
  }, [selectedPeriod]);

  const loadWearableData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les données mises en cache
      const cachedData = getCachedData();
      if (cachedData) {
        setWearableData(cachedData);
      }
      
      // Charger les statistiques depuis Supabase
      const wearableStats = await AnalyticsService.getWearableStats(userId, selectedPeriod);
      setStats(wearableStats);
    } catch (error) {
      console.error('Erreur lors du chargement des données wearables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSleepQuality = (quality: number) => {
    if (quality >= 3.5) return { text: 'Excellente', color: 'text-green-600' };
    if (quality >= 2.5) return { text: 'Bonne', color: 'text-blue-600' };
    if (quality >= 1.5) return { text: 'Correcte', color: 'text-yellow-600' };
    return { text: 'Mauvaise', color: 'text-red-600' };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getStepsProgress = (steps: number) => {
    const target = 10000;
    return Math.min((steps / target) * 100, 100);
  };

  const getHeartRateZone = (avgHeartRate: number) => {
    if (avgHeartRate >= 150) return { zone: 'Intense', color: 'bg-red-500' };
    if (avgHeartRate >= 120) return { zone: 'Modérée', color: 'bg-orange-500' };
    if (avgHeartRate >= 90) return { zone: 'Légère', color: 'bg-yellow-500' };
    return { zone: 'Repos', color: 'bg-green-500' };
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!wearableData && !stats) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Activity className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
        <p className="text-sm text-gray-600 mb-4">
          Synchronisez vos appareils connectés pour voir vos statistiques
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sélecteur de période */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Données Wearables</h2>
        <div className="flex space-x-2">
          {[7, 30, 90].map(period => (
            <Button
              key={period}
              onClick={() => setSelectedPeriod(period as 7 | 30 | 90)}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
            >
              {period}j
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pas quotidiens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pas aujourd'hui</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wearableData?.steps?.toLocaleString() || stats?.totalSteps?.toLocaleString() || 0}
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepsProgress(wearableData?.steps || stats?.totalSteps || 0)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Objectif: 10,000 pas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fréquence cardiaque */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rythme cardiaque</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats?.avgHeartRate || 0)} BPM
            </div>
            <div className="mt-2">
              {stats?.avgHeartRate && (
                <Badge 
                  variant="secondary" 
                  className={`${getHeartRateZone(stats.avgHeartRate).color} text-white`}
                >
                  {getHeartRateZone(stats.avgHeartRate).zone}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Moyenne sur {selectedPeriod} jours
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sommeil */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sommeil</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats?.avgSleepDuration || 0)}
            </div>
            <div className="mt-2">
              {stats?.avgSleepQuality && (
                <Badge 
                  variant="secondary" 
                  className={formatSleepQuality(stats.avgSleepQuality).color}
                >
                  {formatSleepQuality(stats.avgSleepQuality).text}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Qualité moyenne
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Calories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wearableData?.caloriesBurned || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs hier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails du sommeil */}
      {wearableData?.sleepSessions && wearableData.sleepSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="mr-2" size={20} />
              Dernière nuit de sommeil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wearableData.sleepSessions.map((session, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {session.startTime.toLocaleTimeString()} - {session.endTime.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDuration(session.duration)}
                    </p>
                  </div>
                  <Badge variant="secondary" className={formatSleepQuality(
                    session.quality === 'excellent' ? 4 :
                    session.quality === 'good' ? 3 :
                    session.quality === 'fair' ? 2 : 1
                  ).color}>
                    {session.quality}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      {formatDuration(session.deepSleepDuration || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Sommeil profond</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">
                      {formatDuration(session.remSleepDuration || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Sommeil REM</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600">
                      {session.awakenings || 0}
                    </div>
                    <div className="text-xs text-gray-500">Réveils</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Activité de la journée */}
      {wearableData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Résumé d'activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {((wearableData.distance || 0) / 1000).toFixed(1)} km
                </div>
                <div className="text-xs text-gray-500">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {wearableData.activeMinutes || 0} min
                </div>
                <div className="text-xs text-gray-500">Activité</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {Math.max(...(wearableData.heartRate || [0]))} BPM
                </div>
                <div className="text-xs text-gray-500">FC max</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {Math.min(...(wearableData.heartRate || [100]))} BPM
                </div>
                <div className="text-xs text-gray-500">FC repos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dernière synchronisation */}
      {wearableData?.lastSync && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-500" size={16} />
                <span className="text-sm text-gray-600">
                  Dernière synchronisation: {wearableData.lastSync.toLocaleString()}
                </span>
              </div>
              <Badge variant="outline">
                Synchronisé
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WearableStats;
