// pages/settings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { 
  Settings as SettingsIcon, 
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
  RefreshCw,
  Save,
  Globe,
  Palette,
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWearableSync } from '@/hooks/useWearableSync';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { UniformHeader } from '@/components/UniformHeader';
import { AnalyticsService } from '@/lib/analytics';

interface NotificationSettings {
  workout_reminders: boolean;
  hydration_reminders: boolean;
  meal_reminders: boolean;
  sleep_reminders: boolean;
  achievement_alerts: boolean;
  weekly_summary: boolean;
  marketing_emails: boolean;
}

interface PrivacySettings {
  profile_public: boolean;
  share_stats: boolean;
  allow_friend_requests: boolean;
  show_activity: boolean;
}

const Settings: React.FC = () => {
  const [location, setLocation] = useLocation(); // Corrigé pour Wouter
  const { toast } = useToast();
  const { appStoreUser, setAppStoreUser } = useAppStore();
  
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

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30);
  const [lastCachedData, setLastCachedData] = useState<any>(null);
  
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

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    workout_reminders: true,
    hydration_reminders: true,
    meal_reminders: true,
    sleep_reminders: true,
    achievement_alerts: true,
    weekly_summary: true,
    marketing_emails: false
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_public: false,
    share_stats: false,
    allow_friend_requests: true,
    show_activity: true
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    language: 'fr',
    theme: 'light',
    units: 'metric',
    currency: 'EUR'
  });

  // Chargement des préférences
  const loadSettings = useCallback(async () => {
    if (!appStoreUser?.id) return;

    try {
      // Charger les préférences utilisateur
      const { data: prefs, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .single();

      if (!error && prefs) {
        setNotifications(prefs.notifications || notifications);
        setPrivacy(prefs.privacy || privacy);
        setPreferences(prefs.app_preferences || preferences);
      }

      // Charger les données wearables en cache
      const cached = getCachedData();
      if (cached) {
        setLastCachedData(cached);
      }

      // Charger les préférences de sync
      const savedAutoSync = localStorage.getItem('autoSyncEnabled');
      const savedInterval = localStorage.getItem('syncInterval');
      
      if (savedAutoSync) {
        setAutoSyncEnabled(JSON.parse(savedAutoSync));
      }
      if (savedInterval) {
        setSyncInterval(parseInt(savedInterval));
      }

    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  }, [appStoreUser?.id, getCachedData, notifications, privacy, preferences]);

  // Sauvegarde profil
  const handleSaveProfile = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', appStoreUser.id);

      if (error) throw error;

      setAppStoreUser({ ...appStoreUser, ...profileData });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });

      // Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'profile_updated', {
          user_id: appStoreUser.id,
          section: 'settings'
        });
      }

    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [appStoreUser, profileData, setAppStoreUser, toast]);

  // Sauvegarde notifications
  const handleSaveNotifications = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: appStoreUser.id,
          notifications,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Notifications mises à jour",
        description: "Vos préférences de notification ont été sauvegardées.",
      });

    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notifications.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [appStoreUser?.id, notifications, toast]);

  // 🆕 NOUVELLE FONCTION : Sauvegarde des préférences
  const handleSavePreferences = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: appStoreUser.id,
          app_preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences d'application ont été sauvegardées.",
      });

    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [appStoreUser?.id, preferences, toast]);

  // 🆕 NOUVELLE FONCTION : Sauvegarde de la confidentialité
  const handleSavePrivacy = useCallback(async () => {
    if (!appStoreUser?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: appStoreUser.id,
          privacy,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Confidentialité mise à jour",
        description: "Vos paramètres de confidentialité ont été sauvegardés.",
      });

    } catch (error) {
      console.error('Erreur sauvegarde confidentialité:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la confidentialité.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [appStoreUser?.id, privacy, toast]);

  // Synchronisation wearables
  const handleAppleHealthSync = useCallback(async () => {
    const data = await syncAppleHealth();
    if (data && appStoreUser?.id) {
      cacheData(data);
      setLastCachedData(data);
      
      // Sauvegarder dans Supabase
      if (data.steps) {
        await AnalyticsService.saveWearableSteps(appStoreUser.id, data.steps);
      }
      if (data.heartRate && data.heartRate.length > 0) {
        await AnalyticsService.saveHeartRateData(appStoreUser.id, data.heartRate);
      }
      
      toast({
        title: "Apple Health synchronisé",
        description: "Vos données ont été mises à jour.",
      });
    }
  }, [syncAppleHealth, cacheData, appStoreUser?.id, toast]);

  const handleGoogleFitSync = useCallback(async () => {
    const data = await syncGoogleFit();
    if (data && appStoreUser?.id) {
      cacheData(data);
      setLastCachedData(data);
      
      toast({
        title: "Google Fit synchronisé",
        description: "Vos données ont été mises à jour.",
      });
    }
  }, [syncGoogleFit, cacheData, appStoreUser?.id, toast]);

  const handleSyncAll = useCallback(async () => {
    const data = await syncAll();
    if (data && appStoreUser?.id) {
      cacheData(data);
      setLastCachedData(data);
      
      toast({
        title: "Synchronisation complète",
        description: "Tous vos appareils ont été synchronisés.",
      });
    }
  }, [syncAll, cacheData, appStoreUser?.id, toast]);

  const toggleAutoSync = useCallback(() => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    localStorage.setItem('autoSyncEnabled', JSON.stringify(newValue));
    
    toast({
      title: newValue ? "Auto-sync activé" : "Auto-sync désactivé",
      description: newValue 
        ? `Synchronisation toutes les ${syncInterval} minutes`
        : "Vous pouvez toujours synchroniser manuellement",
    });
  }, [autoSyncEnabled, syncInterval, toast]);

  const formatLastSync = useCallback((date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffMinutes / 1440)}j`;
  }, []);

  const getPersonalizedMessage = useCallback(() => {
    const userName = appStoreUser?.first_name || appStoreUser?.username || 'Champion';
    return `⚙️ Gérez vos préférences MyFitHero, ${userName}`;
  }, [appStoreUser]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Auto-sync effect
  useEffect(() => {
    if (autoSyncEnabled) {
      const cleanup = scheduleSync(syncInterval);
      return cleanup;
    }
  }, [autoSyncEnabled, syncInterval, scheduleSync]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'wearables', label: 'Appareils', icon: Smartphone },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UniformHeader 
        title="Paramètres"
        subtitle={getPersonalizedMessage()}
        showBackButton={true}
        gradient={true}
        rightContent={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')} // Corrigé pour Wouter
            className="text-white hover:bg-white/20"
          >
            <User className="w-4 h-4 mr-2" />
            Profil
          </Button>
        }
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        
        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card>
            <CardContent className="p-2">
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
            </CardContent>
          </Card>

          {/* Onglet Profil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
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
                      placeholder="Nom d'utilisateur unique"
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
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Parlez-nous de vous, vos objectifs..."
                    rows={3}
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
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder le profil'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>Choisissez les notifications que vous souhaitez recevoir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label htmlFor={key} className="font-medium">
                        {key === 'workout_reminders' && 'Rappels d\'entraînement'}
                        {key === 'hydration_reminders' && 'Rappels d\'hydratation'}
                        {key === 'meal_reminders' && 'Rappels de repas'}
                        {key === 'sleep_reminders' && 'Rappels de sommeil'}
                        {key === 'achievement_alerts' && 'Alertes de réussite'}
                        {key === 'weekly_summary' && 'Résumé hebdomadaire'}
                        {key === 'marketing_emails' && 'Emails marketing'}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {key === 'workout_reminders' && 'Recevez des rappels pour vos entraînements programmés'}
                        {key === 'hydration_reminders' && 'Restez hydraté avec des rappels réguliers'}
                        {key === 'meal_reminders' && 'Ne manquez jamais un repas'}
                        {key === 'sleep_reminders' && 'Notifications pour optimiser votre sommeil'}
                        {key === 'achievement_alerts' && 'Célébrez vos réussites et objectifs atteints'}
                        {key === 'weekly_summary' && 'Recevez votre résumé de progression hebdomadaire'}
                        {key === 'marketing_emails' && 'Nouvelles fonctionnalités et offres spéciales'}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, [key]: checked})
                      }
                    />
                  </div>
                ))}
                
                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les notifications'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Wearables */}
          <TabsContent value="wearables">
            <div className="space-y-6">
              {/* Statut de synchronisation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="mr-2" size={20} />
                    Appareils connectés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Dernière sync */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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

                  {/* Erreur de sync */}
                  {syncError && (
                    <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="text-red-500" size={16} />
                      <div>
                        <p className="text-sm font-medium text-red-800">Erreur de synchronisation</p>
                        <p className="text-xs text-red-600">{syncError}</p>
                      </div>
                    </div>
                  )}

                  {/* Boutons de sync */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={handleAppleHealthSync}
                      disabled={!isAppleHealthAvailable || wearableLoading}
                      variant={isAppleHealthAvailable ? "default" : "outline"}
                      className="flex items-center space-x-2"
                    >
                      <Heart className="text-red-500" size={16} />
                      <span>Apple Health</span>
                      {wearableLoading && <RefreshCw className="animate-spin" size={14} />}
                    </Button>
                    
                    <Button
                      onClick={handleGoogleFitSync}
                      disabled={!isGoogleFitAvailable || wearableLoading}
                      variant={isGoogleFitAvailable ? "default" : "outline"}
                      className="flex items-center space-x-2"
                    >
                      <Activity className="text-green-500" size={16} />
                      <span>Google Fit</span>
                      {wearableLoading && <RefreshCw className="animate-spin" size={14} />}
                    </Button>
                    
                    <Button
                      onClick={handleSyncAll}
                      disabled={(!isAppleHealthAvailable && !isGoogleFitAvailable) || wearableLoading}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <RefreshCw className={wearableLoading ? "animate-spin" : ""} size={16} />
                      <span>Tout synchroniser</span>
                    </Button>
                  </div>

                  {/* Paramètres de sync automatique */}
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Synchronisation automatique</Label>
                        <p className="text-sm text-gray-600">Synchroniser automatiquement vos appareils</p>
                      </div>
                      <Switch
                        checked={autoSyncEnabled}
                        onCheckedChange={toggleAutoSync}
                      />
                    </div>
                    
                    {autoSyncEnabled && (
                      <div>
                        <Label className="text-sm">Intervalle (minutes)</Label>
                        <div className="flex space-x-2 mt-2">
                          {[15, 30, 60, 120].map((interval) => (
                            <Button
                              key={interval}
                              variant={syncInterval === interval ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSyncInterval(interval)}
                            >
                              {interval}min
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Données en cache */}
                  {lastCachedData && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Dernières données synchronisées</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700">Pas: {lastCachedData.steps?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Calories: {lastCachedData.caloriesBurned || 0}</p>
                        </div>
                        <div>
                          <p className="text-blue-700">FC moy: {lastCachedData.avgHeartRate || 0} bpm</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Minutes actives: {lastCachedData.activeMinutes || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Confidentialité */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Confidentialité et sécurité</CardTitle>
                <CardDescription>Contrôlez vos paramètres de confidentialité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {key === 'profile_public' && <Eye className="text-gray-500" size={16} />}
                      {key === 'share_stats' && <Activity className="text-gray-500" size={16} />}
                      {key === 'allow_friend_requests' && <User className="text-gray-500" size={16} />}
                      {key === 'show_activity' && <CheckCircle className="text-gray-500" size={16} />}
                      <div>
                        <Label htmlFor={key} className="font-medium">
                          {key === 'profile_public' && 'Profil public'}
                          {key === 'share_stats' && 'Partager les statistiques'}
                          {key === 'allow_friend_requests' && 'Demandes d\'amis'}
                          {key === 'show_activity' && 'Afficher l\'activité'}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {key === 'profile_public' && 'Rendre votre profil visible aux autres utilisateurs'}
                          {key === 'share_stats' && 'Partager vos statistiques avec la communauté'}
                          {key === 'allow_friend_requests' && 'Permettre aux autres de vous envoyer des demandes d\'amis'}
                          {key === 'show_activity' && 'Afficher votre statut d\'activité aux amis'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, [key]: checked})
                      }
                    />
                  </div>
                ))}
                
                {/* 🆕 BOUTON DE SAUVEGARDE CONFIDENTIALITÉ */}
                <Button 
                  onClick={handleSavePrivacy} 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder la confidentialité'}
                </Button>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-red-600 flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    Zone de danger
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 mb-3">
                      Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                    </p>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer définitivement mon compte
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
                <CardTitle>Préférences de l'application</CardTitle>
                <CardDescription>Personnalisez votre expérience MyFitHero</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label className="font-medium">Langue</Label>
                          <p className="text-sm text-gray-600">Choisissez votre langue préférée</p>
                        </div>
                      </div>
                      <select 
                        className="px-3 py-2 border rounded-md"
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Palette className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label className="font-medium">Thème</Label>
                          <p className="text-sm text-gray-600">Apparence de l'application</p>
                        </div>
                      </div>
                      <select 
                        className="px-3 py-2 border rounded-md"
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                      >
                        <option value="light">Clair</option>
                        <option value="dark">Sombre</option>
                        <option value="system">Système</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label className="font-medium">Unités</Label>
                          <p className="text-sm text-gray-600">Système de mesure</p>
                        </div>
                      </div>
                      <select 
                        className="px-3 py-2 border rounded-md"
                        value={preferences.units}
                        onChange={(e) => setPreferences({...preferences, units: e.target.value})}
                      >
                        <option value="metric">Métrique (kg, cm)</option>
                        <option value="imperial">Impérial (lbs, ft)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label className="font-medium">Devise</Label>
                          <p className="text-sm text-gray-600">Monnaie pour les abonnements</p>
                        </div>
                      </div>
                      <select 
                        className="px-3 py-2 border rounded-md"
                        value={preferences.currency}
                        onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                        <option value="GBP">Livre (£)</option>
                        <option value="CAD">Dollar canadien</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* 🆕 BOUTON DE SAUVEGARDE PRÉFÉRENCES BRANCHÉ */}
                <Button 
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
