import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Smartphone,
  Heart,
  Moon,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useWearableSync } from '@/hooks/useWearableSync';
import { AnalyticsService } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const {
    isLoading,
    lastSyncTime,
    syncError,
    isAppleHealthAvailable,
    isGoogleFitAvailable,
    syncAppleHealth,
    syncGoogleFit,
    syncAll,
    scheduleSync,
    getCachedData,
    cacheData
  } = useWearableSync();

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30); // minutes
  const [lastCachedData, setLastCachedData] = useState<any>(null);
  const [syncScheduler, setSyncScheduler] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Charger les données mises en cache au démarrage
    const cached = getCachedData();
    if (cached) {
      setLastCachedData(cached);
    }

    // Charger les préférences de synchronisation
    const savedAutoSync = localStorage.getItem('autoSyncEnabled');
    const savedInterval = localStorage.getItem('syncInterval');
    
    if (savedAutoSync) {
      setAutoSyncEnabled(JSON.parse(savedAutoSync));
    }
    if (savedInterval) {
      setSyncInterval(parseInt(savedInterval));
    }
  }, [getCachedData]);

  useEffect(() => {
    // Gérer la synchronisation automatique
    if (autoSyncEnabled && syncScheduler) {
      syncScheduler();
    }
    
    if (autoSyncEnabled) {
      const cleanup = scheduleSync(syncInterval);
      setSyncScheduler(() => cleanup);
    }

    return () => {
      if (syncScheduler) {
        syncScheduler();
      }
    };
  }, [autoSyncEnabled, syncInterval, scheduleSync, syncScheduler]);

  const handleAppleHealthSync = async () => {
    const data = await syncAppleHealth();
    if (data) {
      cacheData(data);
      setLastCachedData(data);
      
      // Sauvegarder dans Supabase (simulation avec un userId)
      const userId = 'current-user-id'; // Dans un vrai projet, cela viendrait de l'auth
      await AnalyticsService.saveWearableSteps(userId, data.steps);
      await AnalyticsService.saveHeartRateData(userId, data.heartRate);
      
      if (data.sleepSessions.length > 0) {
        for (const session of data.sleepSessions) {
          await AnalyticsService.saveSleepSession(userId, {
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            quality: session.quality,
            deepSleepDuration: session.deepSleepDuration,
            remSleepDuration: session.remSleepDuration,
            awakenings: session.awakenings
          });
        }
      }
    }
  };

  const handleGoogleFitSync = async () => {
    const data = await syncGoogleFit();
    if (data) {
      cacheData(data);
      setLastCachedData(data);
      
      // Sauvegarder dans Supabase (simulation avec un userId)
      const userId = 'current-user-id'; // Dans un vrai projet, cela viendrait de l'auth
      await AnalyticsService.saveWearableSteps(userId, data.steps);
      await AnalyticsService.saveHeartRateData(userId, data.heartRate);
      
      if (data.sleepSessions.length > 0) {
        for (const session of data.sleepSessions) {
          await AnalyticsService.saveSleepSession(userId, {
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            quality: session.quality,
            deepSleepDuration: session.deepSleepDuration,
            remSleepDuration: session.remSleepDuration,
            awakenings: session.awakenings
          });
        }
      }
    }
  };

  const handleSyncAll = async () => {
    const data = await syncAll();
    if (data) {
      cacheData(data);
      setLastCachedData(data);
      
      // Sauvegarder dans Supabase
      const userId = 'current-user-id';
      await AnalyticsService.saveWearableSteps(userId, data.steps);
      await AnalyticsService.saveHeartRateData(userId, data.heartRate);
      
      if (data.sleepSessions.length > 0) {
        for (const session of data.sleepSessions) {
          await AnalyticsService.saveSleepSession(userId, {
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            quality: session.quality,
            deepSleepDuration: session.deepSleepDuration,
            remSleepDuration: session.remSleepDuration,
            awakenings: session.awakenings
          });
        }
      }
    }
  };

  const toggleAutoSync = () => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    localStorage.setItem('autoSyncEnabled', JSON.stringify(newValue));
    
    if (newValue) {
      toast({
        title: "Synchronisation automatique activée",
        description: `Synchronisation toutes les ${syncInterval} minutes`,
        variant: "default"
      });
    } else {
      toast({
        title: "Synchronisation automatique désactivée",
        description: "Vous pouvez toujours synchroniser manuellement",
        variant: "default"
      });
    }
  };

  const handleIntervalChange = (newInterval: number) => {
    setSyncInterval(newInterval);
    localStorage.setItem('syncInterval', newInterval.toString());
    
    toast({
      title: "Intervalle de synchronisation modifié",
      description: `Nouvelle fréquence: ${newInterval} minutes`,
      variant: "default"
    });
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)} heures`;
    return `Il y a ${Math.floor(diffMinutes / 1440)} jours`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Paramètres</h1>
            <p className="text-sm text-gray-600">Gérer vos préférences et synchronisations</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Synchronisation Wearables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2" size={20} />
              Synchronisation Appareils Connectés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status de synchronisation */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="text-gray-500" size={16} />
                <div>
                  <p className="text-sm font-medium">Dernière synchronisation</p>
                  <p className="text-xs text-gray-500">{formatLastSync(lastSyncTime)}</p>
                </div>
              </div>
              <Badge variant={lastSyncTime ? "default" : "secondary"}>
                {lastSyncTime ? 'Synchronisé' : 'Jamais synchronisé'}
              </Badge>
            </div>

            {/* Erreur de synchronisation */}
            {syncError && (
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-500" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur de synchronisation</p>
                  <p className="text-xs text-red-600">{syncError}</p>
                </div>
              </div>
            )}

            {/* Boutons de synchronisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleAppleHealthSync}
                disabled={!isAppleHealthAvailable || isLoading}
                className="flex items-center justify-center space-x-2"
                variant={isAppleHealthAvailable ? "default" : "outline"}
              >
                <Heart className="text-red-500" size={16} />
                <span>Synchroniser Apple Health</span>
                {isLoading && <RefreshCw className="animate-spin" size={14} />}
              </Button>

              <Button
                onClick={handleGoogleFitSync}
                disabled={!isGoogleFitAvailable || isLoading}
                className="flex items-center justify-center space-x-2"
                variant={isGoogleFitAvailable ? "default" : "outline"}
              >
                <Activity className="text-green-500" size={16} />
                <span>Synchroniser Google Fit</span>
                {isLoading && <RefreshCw className="animate-spin" size={14} />}
              </Button>
            </div>

            <Button
              onClick={handleSyncAll}
              disabled={(!isAppleHealthAvailable && !isGoogleFitAvailable) || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <RefreshCw className="mr-2" size={16} />
              Synchroniser Tout
              {isLoading && <RefreshCw className="animate-spin ml-2" size={14} />}
            </Button>

            {/* Synchronisation automatique */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Synchronisation automatique</p>
                  <p className="text-xs text-gray-500">Synchroniser automatiquement les données</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={toggleAutoSync}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${autoSyncEnabled ? 'bg-blue-600' : ''}`}></div>
                </label>
              </div>

              {autoSyncEnabled && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Intervalle de synchronisation</p>
                  <div className="flex space-x-2">
                    {[15, 30, 60, 120].map(interval => (
                      <Button
                        key={interval}
                        onClick={() => handleIntervalChange(interval)}
                        variant={syncInterval === interval ? "default" : "outline"}
                        size="sm"
                      >
                        {interval} min
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Données synchronisées */}
        {lastCachedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2" size={20} />
                Données Synchronisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {lastCachedData.steps?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Pas</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(lastCachedData.heartRate?.reduce((a: number, b: number) => a + b, 0) / lastCachedData.heartRate?.length || 0)}
                  </div>
                  <div className="text-xs text-gray-500">BPM moyen</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((lastCachedData.sleepSessions?.[0]?.duration || 0) / 60)}h
                  </div>
                  <div className="text-xs text-gray-500">Sommeil</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {lastCachedData.caloriesBurned}
                  </div>
                  <div className="text-xs text-gray-500">Calories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disponibilité des services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2" size={20} />
              Disponibilité des Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Heart className="text-red-500" size={16} />
                  <span className="text-sm">Apple Health</span>
                </div>
                <Badge variant={isAppleHealthAvailable ? "default" : "secondary"}>
                  {isAppleHealthAvailable ? (
                    <><CheckCircle className="mr-1" size={12} /> Disponible</>
                  ) : (
                    <><AlertCircle className="mr-1" size={12} /> Indisponible</>
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity className="text-green-500" size={16} />
                  <span className="text-sm">Google Fit</span>
                </div>
                <Badge variant={isGoogleFitAvailable ? "default" : "secondary"}>
                  {isGoogleFitAvailable ? (
                    <><CheckCircle className="mr-1" size={12} /> Disponible</>
                  ) : (
                    <><AlertCircle className="mr-1" size={12} /> Indisponible</>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autres paramètres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2" size={20} />
              Paramètres Généraux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-gray-500">Recevoir des notifications push</p>
                </div>
                <Bell className="text-gray-400" size={16} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode sombre</p>
                  <p className="text-xs text-gray-500">Activer le thème sombre</p>
                </div>
                <Moon className="text-gray-400" size={16} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Confidentialité</p>
                  <p className="text-xs text-gray-500">Gérer vos données personnelles</p>
                </div>
                <Shield className="text-gray-400" size={16} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
