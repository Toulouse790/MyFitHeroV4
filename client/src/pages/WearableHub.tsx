// pages/WearableHub.tsx
import React, { useState, useEffect, useCallback } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  Heart,
  Settings as SettingsIcon,
  Bell,
  TrendingUp,
  Watch,
  Smartphone,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import WearableStats from '@/components/WearableStats';
import WearableNotificationCenter from '@/components/WearableNotificationCenter';
import Settings from '@/pages/settings';
import { useAppStore } from '@/store/useAppStore';

interface WearableDevice {
  id: string;
  name: string;
  type: 'watch' | 'fitness_tracker' | 'heart_monitor' | 'smart_scale';
  brand: string;
  model: string;
  connected: boolean;
  battery_level?: number;
  last_sync: string;
  sync_status: 'synced' | 'syncing' | 'error' | 'pending';
}

interface WearableError {
  device_id: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const WearableHub: React.FC = () => {
  const { appStoreUser } = useAppStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [errors, setErrors] = useState<WearableError[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  // Chargement des appareils connectés
  const loadDevices = useCallback(async () => {
    try {
      // Simulation des appareils connectés
      const mockDevices: WearableDevice[] = [
        {
          id: '1',
          name: 'Apple Watch Series 9',
          type: 'watch',
          brand: 'Apple',
          model: 'Series 9',
          connected: true,
          battery_level: 78,
          last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          sync_status: 'synced',
        },
        {
          id: '2',
          name: 'Google Fit',
          type: 'fitness_tracker',
          brand: 'Google',
          model: 'Fit App',
          connected: true,
          last_sync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          sync_status: 'synced',
        },
        {
          id: '3',
          name: 'Polar H10',
          type: 'heart_monitor',
          brand: 'Polar',
          model: 'H10',
          connected: false,
          last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sync_status: 'error',
        },
      ];

      setDevices(mockDevices);

      // Simulation d'erreurs
      const mockErrors: WearableError[] = [
        {
          device_id: '3',
          message: 'Connexion Bluetooth perdue avec Polar H10',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false,
        },
      ];

      setErrors(mockErrors);
    } catch (error) {
      console.error('Erreur chargement appareils:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos appareils connectés',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Synchronisation manuelle
  const handleManualSync = useCallback(async () => {
    setSyncLoading(true);

    try {
      // Simulation de la synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mise à jour des statuts
      setDevices(prev =>
        prev.map(device => ({
          ...device,
          last_sync: new Date().toISOString(),
          sync_status: device.connected ? 'synced' : 'error',
        }))
      );

      toast({
        title: 'Synchronisation réussie',
        description: 'Toutes vos données wearables sont à jour.',
      });

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'wearable_manual_sync', {
          event_category: 'engagement',
          event_label: 'manual_sync',
          value: devices.filter(d => d.connected).length,
        });
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      toast({
        title: 'Erreur de synchronisation',
        description: 'Impossible de synchroniser vos appareils.',
        variant: 'destructive',
      });
    } finally {
      setSyncLoading(false);
    }
  }, [devices, appStoreUser?.id, toast]);

  // Reconnexion d'un appareil
  const handleReconnectDevice = useCallback(
    async (deviceId: string) => {
      try {
        setDevices(prev =>
          prev.map(device =>
            device.id === deviceId ? { ...device, sync_status: 'syncing' } : device
          )
        );

        // Simulation reconnexion
        await new Promise(resolve => setTimeout(resolve, 3000));

        setDevices(prev =>
          prev.map(device =>
            device.id === deviceId
              ? {
                  ...device,
                  connected: true,
                  sync_status: 'synced',
                  last_sync: new Date().toISOString(),
                }
              : device
          )
        );

        // Résoudre les erreurs liées à cet appareil
        setErrors(prev =>
          prev.map(error => (error.device_id === deviceId ? { ...error, resolved: true } : error))
        );

        const device = devices.find(d => d.id === deviceId);
        toast({
          title: 'Appareil reconnecté',
          description: `${device?.name} est maintenant connecté et synchronisé.`,
        });
      } catch (error) {
        console.error('Erreur reconnexion:', error);
        setDevices(prev =>
          prev.map(device =>
            device.id === deviceId ? { ...device, sync_status: 'error' } : device
          )
        );
      }
    },
    [devices, toast]
  );

  // Résoudre une erreur
  const handleResolveError = useCallback((errorIndex: number) => {
    setErrors(prev =>
      prev.map((error, index) => (index === errorIndex ? { ...error, resolved: true } : error))
    );
  }, []);

  // Chargement initial
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!syncLoading) {
          loadDevices();
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [loadDevices, syncLoading]);

  const connectedDevices = devices.filter(d => d.connected);
  const hasErrors = errors.some(e => !e.resolved);

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
                <p className="text-gray-600">Centre de contrôle pour vos appareils connectés</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleManualSync}
                disabled={syncLoading}
                variant="outline"
                size="sm"
                aria-label="Synchroniser manuellement tous les appareils"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                {syncLoading ? 'Sync...' : 'Synchroniser'}
              </Button>

              <Badge
                variant={connectedDevices.length > 0 ? 'default' : 'destructive'}
                className={connectedDevices.length > 0 ? 'text-green-600 border-green-600' : ''}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    connectedDevices.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                {connectedDevices.length > 0 ? 'En ligne' : 'Hors ligne'}
              </Badge>

              <Badge variant="secondary">
                <Activity size={12} className="mr-1" />
                {connectedDevices.length}/{devices.length} appareils
              </Badge>
            </div>
          </div>

          {/* Alertes d'erreur */}
          {hasErrors && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {errors.filter(e => !e.resolved).length} problème(s) détecté(s)
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {errors
                  .filter(e => !e.resolved)
                  .map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm text-red-700"
                    >
                      <span>{error.message}</span>
                      <Button
                        onClick={() => handleResolveError(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        Résoudre
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
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
              <SettingsIcon size={16} />
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
                    {devices.map(device => (
                      <div key={device.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {device.type === 'watch' && <Watch className="text-blue-500" size={16} />}
                          {device.type === 'fitness_tracker' && (
                            <Activity className="text-green-500" size={16} />
                          )}
                          {device.type === 'heart_monitor' && (
                            <Heart className="text-red-500" size={16} />
                          )}
                          <div>
                            <span className="text-sm font-medium">{device.name}</span>
                            {device.battery_level && (
                              <div className="text-xs text-gray-500">
                                Batterie: {device.battery_level}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {device.connected ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Wifi className="h-3 w-3 mr-1" />
                              Connecté
                            </Badge>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <WifiOff className="h-3 w-3 mr-1" />
                                Déconnecté
                              </Badge>
                              <Button
                                onClick={() => handleReconnectDevice(device.id)}
                                size="sm"
                                variant="outline"
                                disabled={device.sync_status === 'syncing'}
                              >
                                {device.sync_status === 'syncing' ? 'Connexion...' : 'Reconnecter'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
                    <li>
                      • Les jours avec plus de sommeil REM correspondent à de meilleures
                      performances
                    </li>
                    <li>• Votre fréquence cardiaque de repos s'améliore constamment</li>
                    <li>• Les entraînements matinaux donnent les meilleurs résultats</li>
                  </ul>
                </div>

                {/* Graphiques de tendances */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Fréquence cardiaque (7 derniers jours)</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      Graphique FC - Intégration Chart.js à venir
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Pas quotidiens</h4>
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      Graphique Pas - Intégration Chart.js à venir
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WearableHub;
