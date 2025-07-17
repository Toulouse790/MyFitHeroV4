// client/src/components/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Shield, 
  CreditCard,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  Download,
  Bell,
  Globe,
  Database,
  Server
} from 'lucide-react';

interface AppSettings {
  // Paramètres généraux
  appName: string;
  appDescription: string;
  appVersion: string;
  maintenanceMode: boolean;
  
  // Paramètres de sécurité
  requireEmailVerification: boolean;
  passwordMinLength: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  
  // Paramètres de notification
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  defaultNotificationPrefs: {
    workout: boolean;
    nutrition: boolean;
    achievements: boolean;
    reminders: boolean;
  };
  
  // Paramètres de paiement
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalClientId: string;
  enablePayments: boolean;
  
  // Paramètres de localisation
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultTimezone: string;
  defaultCurrency: string;
  
  // Paramètres de base de données
  databaseUrl: string;
  backupFrequency: string;
  dataRetentionPeriod: number;
  
  // Paramètres d'analyse
  enableAnalytics: boolean;
  googleAnalyticsId: string;
  enableErrorTracking: boolean;
  sentryDsn: string;
}

const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'MyFitHero',
    appDescription: 'Your personal fitness companion',
    appVersion: '4.0.0',
    maintenanceMode: false,
    requireEmailVerification: true,
    passwordMinLength: 8,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enablePushNotifications: true,
    enableEmailNotifications: true,
    defaultNotificationPrefs: {
      workout: true,
      nutrition: true,
      achievements: true,
      reminders: false
    },
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    enablePayments: true,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'fr', 'es', 'de'],
    defaultTimezone: 'UTC',
    defaultCurrency: 'USD',
    databaseUrl: '',
    backupFrequency: 'daily',
    dataRetentionPeriod: 365,
    enableAnalytics: true,
    googleAnalyticsId: '',
    enableErrorTracking: true,
    sentryDsn: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Les paramètres sont déjà initialisés dans le state
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasChanges(false);
      console.log('Paramètres sauvegardés:', settings);
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof AppSettings] as object),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'myfithero-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          setHasChanges(true);
        } catch (error) {
          console.error('Erreur import paramètres:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'general', label: t('admin.general'), icon: Settings },
    { id: 'security', label: t('admin.security'), icon: Shield },
    { id: 'notifications', label: t('admin.notifications'), icon: Bell },
    { id: 'payments', label: t('admin.payments'), icon: CreditCard },
    { id: 'localization', label: t('admin.localization'), icon: Globe },
    { id: 'database', label: t('admin.database'), icon: Database },
    { id: 'analytics', label: t('admin.analytics'), icon: Server }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">{t('admin.loadingSettings')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('admin.settings')}
        </h2>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
            id="import-settings"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-settings')?.click()}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('admin.import')}
          </Button>
          
          <Button
            variant="outline"
            onClick={exportSettings}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('admin.export')}
          </Button>

          <Button
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="flex items-center"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('admin.save')}
          </Button>
        </div>
      </div>

      {/* Mode maintenance warning */}
      {settings.maintenanceMode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-orange-800 font-medium">
                {t('admin.maintenanceModeActive')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar avec onglets */}
        <div className="col-span-12 md:col-span-3">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="col-span-12 md:col-span-9">
          <Card>
            <CardContent className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.generalSettings')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.appName')}
                      </label>
                      <input
                        type="text"
                        value={settings.appName}
                        onChange={(e) => handleSettingChange('appName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.appVersion')}
                      </label>
                      <input
                        type="text"
                        value={settings.appVersion}
                        onChange={(e) => handleSettingChange('appVersion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.appDescription')}
                    </label>
                    <textarea
                      value={settings.appDescription}
                      onChange={(e) => handleSettingChange('appDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('admin.maintenanceMode')}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t('admin.maintenanceModeDesc')}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.securitySettings')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.passwordMinLength')}
                      </label>
                      <input
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                        min="6"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.sessionTimeout')} (heures)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        min="1"
                        max="168"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.maxLoginAttempts')}
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('admin.requireEmailVerification')}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t('admin.requireEmailVerificationDesc')}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.notificationSettings')}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.enablePushNotifications')}
                        </label>
                        <p className="text-sm text-gray-500">
                          {t('admin.enablePushNotificationsDesc')}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enablePushNotifications}
                        onChange={(e) => handleSettingChange('enablePushNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.enableEmailNotifications')}
                        </label>
                        <p className="text-sm text-gray-500">
                          {t('admin.enableEmailNotificationsDesc')}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableEmailNotifications}
                        onChange={(e) => handleSettingChange('enableEmailNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      {t('admin.defaultNotificationPreferences')}
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(settings.defaultNotificationPrefs).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {key}
                          </label>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNestedSettingChange('defaultNotificationPrefs', key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.paymentSettings')}</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('admin.enablePayments')}
                      </label>
                      <p className="text-sm text-gray-500">
                        {t('admin.enablePaymentsDesc')}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enablePayments}
                      onChange={(e) => handleSettingChange('enablePayments', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stripe Publishable Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          value={settings.stripePublishableKey}
                          onChange={(e) => handleSettingChange('stripePublishableKey', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="pk_test_..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets(!showSecrets)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stripe Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          value={settings.stripeSecretKey}
                          onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="sk_test_..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets(!showSecrets)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PayPal Client ID
                      </label>
                      <input
                        type="text"
                        value={settings.paypalClientId}
                        onChange={(e) => handleSettingChange('paypalClientId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="AYjnxKDjGZbvOplqxzPSsJr..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'localization' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.localizationSettings')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.defaultLanguage')}
                      </label>
                      <select
                        value={settings.defaultLanguage}
                        onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.defaultCurrency')}
                      </label>
                      <select
                        value={settings.defaultCurrency}
                        onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.defaultTimezone')}
                      </label>
                      <select
                        value={settings.defaultTimezone}
                        onChange={(e) => handleSettingChange('defaultTimezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.databaseSettings')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.backupFrequency')}
                      </label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.dataRetentionPeriod')} (jours)
                      </label>
                      <input
                        type="number"
                        value={settings.dataRetentionPeriod}
                        onChange={(e) => handleSettingChange('dataRetentionPeriod', parseInt(e.target.value))}
                        min="30"
                        max="2555"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">{t('admin.analyticsSettings')}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.enableAnalytics')}
                        </label>
                        <p className="text-sm text-gray-500">
                          {t('admin.enableAnalyticsDesc')}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableAnalytics}
                        onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        value={settings.googleAnalyticsId}
                        onChange={(e) => handleSettingChange('googleAnalyticsId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('admin.enableErrorTracking')}
                        </label>
                        <p className="text-sm text-gray-500">
                          {t('admin.enableErrorTrackingDesc')}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableErrorTracking}
                        onChange={(e) => handleSettingChange('enableErrorTracking', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sentry DSN
                      </label>
                      <input
                        type="text"
                        value={settings.sentryDsn}
                        onChange={(e) => handleSettingChange('sentryDsn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
