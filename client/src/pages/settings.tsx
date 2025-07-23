// pages/settings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Settings as SettingsIcon,
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Heart,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Palette,
  Globe,
  Save,
  Moon,
  Sun,
  Target,
  Database,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useWearableSync } from '@/hooks/useWearableSync';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';
import { AnalyticsService } from '@/lib/analytics';
import { UniformHeader } from '@/components/UniformHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface UserPreferences {
  notifications: {
    workout_reminders: boolean;
    hydration_reminders: boolean;
    meal_reminders: boolean;
    sleep_reminders: boolean;
    achievement_alerts: boolean;
    weekly_summary: boolean;
    marketing_emails: boolean;
  };
  privacy: {
    profile_public: boolean;
    share_stats: boolean;
    allow_friend_requests: boolean;
    show_activity: boolean;
  };
  app_preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    units: 'metric' | 'imperial';
    auto_sync: boolean;
    sync_interval: number;
  };
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  
  // Wearables hooks
  const {
    isLoading: wearableLoading,
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

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [lastCachedData, setLastCachedData] = useState<any>(null);
  const [syncScheduler, setSyncScheduler] = useState<(() => void) | null>(null);
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    full_name: appStoreUser?.full_name || '',
    username: appStoreUser?.username || '',
    email: appStoreUser?.email || '',
    phone: appStoreUser?.phone || '',
    bio: appStoreUser?.bio || '',
    city: appStoreUser?.city || '',
    country: appStoreUser?.country || ''
  });

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      workout_reminders: true,
      hydration_reminders: true,
      meal_reminders: true,
      sleep_reminders: true,
      achievement_alerts: true,
      weekly_summary: true,
      marketing_emails: false
    },
    privacy: {
      profile_public: false,
      share_stats: false,
      allow_friend_requests: true,
      show_activity: true
    },
    app_preferences: {
      language: 'fr',
      theme: 'light',
      units: 'metric',
      auto_sync: false,
      sync_interval: 30
    }
  });

  // Load data on mount
  useEffect(() => {
    loadSettingsData();
  }, []);

  // Load cached wearable data
  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setLastCachedData(cached);
    }
  }, [getCachedData]);

  // Auto-sync management
  useEffect(() => {
    if (preferences.app_preferences.auto_sync && syncScheduler) {
      syncScheduler();
    }
    
    if (preferences.app_preferences.auto_sync) {
      const cleanup = scheduleSync(preferences.app_preferences.sync_interval);
      setSyncScheduler(() => cleanup);
    }

    return () => {
      if (syncScheduler) {
        syncScheduler();
      }
    };
  }, [preferences.app_preferences.auto_sync, preferences.app_preferences.sync_interval, scheduleSync, syncScheduler]);

  const loadSettingsData = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      setLoading(true);

      // Charger les préférences utilisateur
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .single();

      if (!prefsError && userPrefs) {
        setPreferences({
          notifications: userPrefs.notifications || preferences.notifications,
          privacy: userPrefs.privacy || preferences.privacy,
          app_preferences: userPrefs.app_preferences || preferences.app_preferences
        });
      }

      // Initialiser les données de profil
      setProfileData({
        full_name: appStoreUser.full_name || '',
        username: appStoreUser.username || '',
        email: appStoreUser.email || '',
        phone: appStoreUser.phone || '',
        bio: appStoreUser.bio || '',
        city: appStoreUser.city || '',
        country: appStoreUser.country || ''
      });

    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [appStoreUser, toast, preferences]);

  const handleSaveProfile = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', appStoreUser.id);

      if (error) throw error;

      updateAppStoreUserProfile(profileData);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
      });
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [appStoreUser?.id, profileData, updateAppStoreUserProfile, toast]);

  const handleSavePreferences = useCallback(async (section: keyof UserPreferences) => {
    if (!appStoreUser?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: appStoreUser.id,
          [section]: preferences[section],
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Préférences mises à jour",
        description: `${section} sauvegardées avec succès`,
      });
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [appStoreUser?.id, preferences, toast]);

  // Wearables handlers
  const handleAppleHealthSync = useCallback(async () => {
    if (!appStoreUser?.id) return;

    const data = await syncAppleHealth();
    if (data) {
      cacheData(data);
      setLastCachedData(data);
      
      // Sauvegarder dans Supabase
      await AnalyticsService.saveWearableSteps(appStoreUser.id, data.steps);
      await AnalyticsService.saveHeartRateData(appStoreUser.id, data.heartRate);
      
      if (data.sleepSessions?.length > 0) {
        for (const session of data.sleepSessions) {
          await AnalyticsService.saveSleepSession(appStoreUser.id, {
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
  }, [appStoreUser?.id, syncAppleHealth, cacheData]);

  const handleGoogleFitSync = useCallback(async () => {
    if (!appStoreUser?.id) return;

    const data = await syncGoogleFit();
    if (data) {
      cacheData(data);
      setLastCachedData(data);
      
      await AnalyticsService.saveWearableSteps(appStoreUser.id, data.steps);
      await AnalyticsService.saveHeartRateData(appStoreUser.id, data.heartRate);
      
      if (data.sleepSessions?.length > 0) {
        for (const session of data.sleepSessions) {
          await AnalyticsService.saveSleepSession(appStoreUser.id, {
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
  }, [appStoreUser?.id, syncGoogleFit, cacheData]);

  const handleSyncAll = useCallback(async () => {
    if (!appStoreUser?.id) return;

    const data = await syncAll();
    if (data) {
      cacheData(data);
      setLastCachedData(data);
      
      await AnalyticsService.saveWearableSteps(appStoreUser.id, data.steps);
      await AnalyticsService.saveHeartRateData(appStoreUser.id, data.heartRate);
      
      if (data.sleepSessions?.length > 0) {
        for (const session of data.sleepSessions) {
          await AnalyticsService.saveSleepSession(appStoreUser.id, {
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
  }, [appStoreUser?.id, syncAll, cacheData]);

  const toggleAutoSync = useCallback(() => {
    const newValue = !preferences.app_preferences.auto_sync;
    setPreferences(prev => ({
      ...prev,
      app_preferences: {
        ...prev.app_preferences,
        auto_sync: newValue
      }
    }));
    
    if (newValue) {
      toast({
        title: "Synchronisation automatique activée",
        description: `Synchronisation toutes les ${preferences.app_preferences.sync_interval} minutes`,
      });
    } else {
      toast({
        title: "Synchronisation automatique désactivée",
        description: "Synchronisation manuelle uniquement",
      });
    }
  }, [preferences.app_preferences.auto_sync, preferences.app_preferences.sync_interval, toast]);

  const handleIntervalChange = useCallback((newInterval: number) => {
    setPreferences(prev => ({
      ...prev,
      app_preferences: {
        ...prev.app_preferences,
        sync_interval: newInterval
      }
    }));
    
    toast({
      title: "Intervalle modifié",
      description: `Nouvelle fréquence: ${newInterval} minutes`,
    });
  }, [toast]);

  const formatLastSync = useCallback((date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)} heures`;
    return `Il y a ${Math.floor(diffMinutes / 1440)} jours`;
  }, []);

  const getPersonalizedMessage = useCallback(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    return `⚙️ Personnalisez votre expérience MyFitHero, ${userName}`;
  }, [appStoreUser]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'wearables', label: 'Appareils', icon: Smartphone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Palette }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UniformHeader 
          title="Paramètres"
          subtitle="Chargement..."
          showBackButton={true}
          gradient={true}
        />
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader 
        title="Paramètres"
        subtitle={getPersonalizedMessage()}
        showBackButton={true}
        gradient={true}
        rightContent={
          <Badge variant="secondary" className="bg-white/20 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Synchronisé
          </Badge>
        }
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        
        {/* Navigation par onglets */}
        <Card>
          <CardContent className="p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                      <TabIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Onglet Profil */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Informations du profil</span>
                    </CardTitle>
                    <CardDescription>Modifiez vos informations personnelles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nom complet</Label>
                        <Input
                          id="full_name"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                          placeholder="Votre nom complet"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          placeholder="Nom d'utilisateur"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Parlez-nous de vous, vos objectifs sportifs..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          placeholder="Votre ville"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Pays</Label>
                        <Input
                          id="country"
                          value={profileData.country}
                          onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                          placeholder="Votre pays"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Wearables */}
              <TabsContent value="wearables">
                <div className="space-y-6">
                  
                  {/* Synchronisation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5" />
                        <span>Synchronisation Appareils Connectés</span>
                      </CardTitle>
                      <CardDescription>Connectez et synchronisez vos données de santé</CardDescription>
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
                          disabled={!isAppleHealthAvailable || wearableLoading}
                          className="flex items-center justify-center space-x-2"
                          variant={isAppleHealthAvailable ? "default" : "outline"}
                        >
                          <Heart className="text-red-500" size={16} />
                          <span>Apple Health</span>
                          {wearableLoading && <RefreshCw className="animate-spin" size={14} />}
                        </Button>

                        <Button
                          onClick={handleGoogleFitSync}
                          disabled={!isGoogleFitAvailable || wearableLoading}
                          className="flex items-center justify-center space-x-2"
                          variant={isGoogleFitAvailable ? "default" : "outline"}
                        >
                          <Activity className="text-green-500" size={16} />
                          <span>Google Fit</span>
                          {wearableLoading && <RefreshCw className="animate-spin" size={14} />}
                        </Button>
                      </div>

                      <Button
                        onClick={handleSyncAll}
                        disabled={(!isAppleHealthAvailable && !isGoogleFitAvailable) || wearableLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <RefreshCw className="mr-2" size={16} />
                        Synchroniser Tout
                        {wearableLoading && <RefreshCw className="animate-spin ml-2" size={14} />}
                      </Button>

                      {/* Synchronisation automatique */}
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Synchronisation automatique</p>
                            <p className="text-xs text-gray-500">Synchroniser automatiquement les données</p>
                          </div>
                          <Switch
                            checked={preferences.app_preferences.auto_sync}
                            onCheckedChange={toggleAutoSync}
                          />
                        </div>

                        {preferences.app_preferences.auto_sync && (
                          <div>
                            <p className="text-sm font-medium mb-2">Intervalle de synchronisation</p>
                            <div className="flex space-x-2">
                              {[15, 30, 60, 120].map(interval => (
                                <Button
                                  key={interval}
                                  onClick={() => handleIntervalChange(interval)}
                                  variant={preferences.app_preferences.sync_interval === interval ? "default" : "outline"}
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
                        <CardTitle className="flex items-center space-x-2">
                          <Database className="h-5 w-5" />
                          <span>Données Synchronisées</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {lastCachedData.steps?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-gray-500">Pas</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {lastCachedData.heartRate?.length > 0 
                                ? Math.round(lastCachedData.heartRate.reduce((a: number, b: number) => a + b, 0) / lastCachedData.heartRate.length)
                                : 0
                              }
                            </div>
                            <div className="text-xs text-gray-500">BPM moyen</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {lastCachedData.sleepSessions?.[0]?.duration 
                                ? Math.round(lastCachedData.sleepSessions[0].duration / 60) 
                                : 0
                              }h
                            </div>
                            <div className="text-xs text-gray-500">Sommeil</div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {lastCachedData.caloriesBurned || 0}
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
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Services Disponibles</span>
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
                </div>
              </TabsContent>

              {/* Onglet Notifications */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Préférences de Notifications</span>
                    </CardTitle>
                    <CardDescription>Choisissez les notifications que vous souhaitez recevoir</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <Label htmlFor={key} className="font-medium">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Label>
                          <p className="text-sm text-gray-600">
                            {key === 'workout_reminders' && 'Rappels pour vos entraînements programmés'}
                            {key === 'hydration_reminders' && 'Rappels pour rester hydraté'}
                            {key === 'meal_reminders' && 'Rappels pour vos repas'}
                            {key === 'sleep_reminders' && 'Rappels pour aller dormir'}
                            {key === 'achievement_alerts' && 'Notifications de réussites et badges'}
                            {key === 'weekly_summary' && 'Résumé hebdomadaire de vos progrès'}
                            {key === 'marketing_emails' && 'Emails sur les nouvelles fonctionnalités'}
                          </p>
                        </div>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, [key]: checked }
                            }))
                          }
                        />
                      </div>
                    ))}
                    
                    <Button 
                      onClick={() => handleSavePreferences('notifications')} 
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les Notifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Confidentialité */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Confidentialité et Sécurité</span>
                    </CardTitle>
                    <CardDescription>Contrôlez vos données et votre vie privée</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(preferences.privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <Label htmlFor={key} className="font-medium">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Label>
                          <p className="text-sm text-gray-600">
                            {key === 'profile_public' && 'Rendre votre profil visible aux autres utilisateurs'}
                            {key === 'share_stats' && 'Partager vos statistiques avec la communauté'}
                            {key === 'allow_friend_requests' && 'Autoriser les demandes d\'amis'}
                            {key === 'show_activity' && 'Afficher votre statut d\'activité'}
                          </p>
                        </div>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, [key]: checked }
                            }))
                          }
                        />
                      </div>
                    ))}
                    
                    <Button 
                      onClick={() => handleSavePreferences('privacy')} 
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder la Confidentialité
                    </Button>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold text-red-600 flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Zone de Danger
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          <Download className="mr-2 h-4 w-4" />
                          Exporter mes données
                        </Button>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer le compte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Préférences */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Préférences de l'Application</span>
                    </CardTitle>
                    <CardDescription>Personnalisez votre expérience MyFitHero</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      
                      {/* Langue */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-5 w-5 text-gray-600" />
                          <div>
                            <Label className="font-medium">Langue</Label>
                            <p className="text-sm text-gray-600">Choisissez votre langue préférée</p>
                          </div>
                        </div>
                        <select 
                          className="px-3 py-2 border rounded-lg bg-white"
                          value={preferences.app_preferences.language}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            app_preferences: { ...prev.app_preferences, language: e.target.value }
                          }))}
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      
                      {/* Thème */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-5 w-5 text-gray-600" />
                          <div>
                            <Label className="font-medium">Thème</Label>
                            <p className="text-sm text-gray-600">Apparence de l'application</p>
                          </div>
                        </div>
                        <select 
                          className="px-3 py-2 border rounded-lg bg-white"
                          value={preferences.app_preferences.theme}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            app_preferences: { ...prev.app_preferences, theme: e.target.value as 'light' | 'dark' | 'system' }
                          }))}
                        >
                          <option value="light">Clair</option>
                          <option value="dark">Sombre</option>
                          <option value="system">Système</option>
                        </select>
                      </div>
                      
                      {/* Unités */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-gray-600" />
                          <div>
                            <Label className="font-medium">Unités de mesure</Label>
                            <p className="text-sm text-gray-600">Système métrique ou impérial</p>
                          </div>
                        </div>
                        <select 
                          className="px-3 py-2 border rounded-lg bg-white"
                          value={preferences.app_preferences.units}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            app_preferences: { ...prev.app_preferences, units: e.target.value as 'metric' | 'imperial' }
                          }))}
                        >
                          <option value="metric">Métrique (kg, cm, °C)</option>
                          <option value="imperial">Impérial (lb, ft, °F)</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleSavePreferences('app_preferences')} 
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les Préférences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
