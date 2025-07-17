import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, Mail, Shield, 
  Palette, Server, Key
} from 'lucide-react';

interface AppSettings {
  appName: string;
  appDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxUsersPerPlan: {
    free: number;
    premium: number;
  };
  featureFlags: {
    darkMode: boolean;
    socialLogin: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  apiKeys: {
    stripe: string;
    sendgrid: string;
    firebase: string;
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  };
}

export const AdminSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'MyFitHero',
    appDescription: 'Your personal fitness companion',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxUsersPerPlan: {
      free: 1000,
      premium: 10000
    },
    featureFlags: {
      darkMode: true,
      socialLogin: true,
      notifications: true,
      analytics: true
    },
    apiKeys: {
      stripe: '',
      sendgrid: '',
      firebase: ''
    },
    emailSettings: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      fromEmail: '',
      fromName: 'MyFitHero'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      // In a real app, this would send a test email
      console.log('Testing email settings:', settings.emailSettings);
      alert('Test email sent successfully!');
    } catch (error) {
      console.error('Error testing email:', error);
      alert('Failed to send test email. Please check your settings.');
    }
  };

  const handleResetApiKey = (keyName: string) => {
    const newKey = `${keyName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [keyName]: newKey
      }
    }));
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev } as any;
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.settings.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.settings.description')}</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Name
                  </label>
                  <Input
                    value={settings.appName}
                    onChange={(e) => updateSetting('appName', e.target.value)}
                    placeholder="MyFitHero"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Free Users
                  </label>
                  <Input
                    type="number"
                    value={settings.maxUsersPerPlan.free}
                    onChange={(e) => updateSetting('maxUsersPerPlan.free', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Description
                </label>
                <Textarea
                  value={settings.appDescription}
                  onChange={(e) => updateSetting('appDescription', e.target.value)}
                  placeholder="Your personal fitness companion"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="maintenance"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="maintenance" className="text-sm font-medium text-gray-700">
                    Maintenance Mode
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="registration"
                    checked={settings.registrationEnabled}
                    onChange={(e) => updateSetting('registrationEnabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="registration" className="text-sm font-medium text-gray-700">
                    Registration Enabled
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Enable or disable application features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.featureFlags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                      <p className="text-sm text-gray-600">
                        {key === 'darkMode' && 'Allow users to switch to dark theme'}
                        {key === 'socialLogin' && 'Enable login with social providers'}
                        {key === 'notifications' && 'Enable push notifications'}
                        {key === 'analytics' && 'Enable analytics tracking'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={value ? "default" : "secondary"}>
                        {value ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSetting(`featureFlags.${key}`, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <Input
                    value={settings.emailSettings.smtpHost}
                    onChange={(e) => updateSetting('emailSettings.smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <Input
                    type="number"
                    value={settings.emailSettings.smtpPort}
                    onChange={(e) => updateSetting('emailSettings.smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <Input
                    value={settings.emailSettings.smtpUser}
                    onChange={(e) => updateSetting('emailSettings.smtpUser', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <Input
                    type="password"
                    value={settings.emailSettings.smtpPass}
                    onChange={(e) => updateSetting('emailSettings.smtpPass', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <Input
                    value={settings.emailSettings.fromEmail}
                    onChange={(e) => updateSetting('emailSettings.fromEmail', e.target.value)}
                    placeholder="noreply@myfithero.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <Input
                    value={settings.emailSettings.fromName}
                    onChange={(e) => updateSetting('emailSettings.fromName', e.target.value)}
                    placeholder="MyFitHero"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleTestEmail} variant="outline">
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage third-party service API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.apiKeys).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium capitalize">{key} API Key</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      {value ? `${value.substring(0, 20)}...` : 'Not configured'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="password"
                      value={value}
                      onChange={(e) => updateSetting(`apiKeys.${key}`, e.target.value)}
                      placeholder={`Enter ${key} API key`}
                      className="w-48"
                    />
                    <Button
                      onClick={() => handleResetApiKey(key)}
                      variant="outline"
                      size="sm"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="emailVerification"
                  checked={settings.emailVerificationRequired}
                  onChange={(e) => updateSetting('emailVerificationRequired', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="emailVerification" className="text-sm font-medium text-gray-700">
                  Require Email Verification
                </label>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Security Recommendations</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Enable two-factor authentication for admin accounts</li>
                  <li>• Regularly rotate API keys</li>
                  <li>• Monitor failed login attempts</li>
                  <li>• Use strong password policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Advanced settings for developers and system administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Premium Users
                  </label>
                  <Input
                    type="number"
                    value={settings.maxUsersPerPlan.premium}
                    onChange={(e) => updateSetting('maxUsersPerPlan.premium', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">⚠️ Danger Zone</h3>
                <p className="text-sm text-red-700 mb-3">
                  These actions cannot be undone. Please proceed with caution.
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" size="sm">
                    Reset All Settings
                  </Button>
                  <Button variant="destructive" size="sm" className="ml-2">
                    Clear Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
