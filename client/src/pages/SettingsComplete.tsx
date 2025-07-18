import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Smartphone,
  Save,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';

const SettingsComplete: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { appStoreUser, updateAppStoreUserProfile } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    full_name: appStoreUser.full_name || '',
    username: appStoreUser.username || '',
    email: appStoreUser.email || '',
    phone: appStoreUser.phone || '',
    bio: appStoreUser.bio || '',
    city: appStoreUser.city || '',
    country: appStoreUser.country || ''
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    workout_reminders: true,
    hydration_reminders: true,
    meal_reminders: true,
    sleep_reminders: true,
    achievement_alerts: true,
    weekly_summary: true,
    marketing_emails: false
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profile_public: false,
    share_stats: false,
    allow_friend_requests: true,
    show_activity: true
  });

  const handleSaveProfile = async () => {
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

      updateAppStoreUserProfile(profileData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Save notification preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: appStoreUser.id,
          notifications: notifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = {
    profile: {
      icon: User,
      title: 'Profile Settings',
      description: 'Manage your personal information'
    },
    notifications: {
      icon: Bell,
      title: 'Notifications',
      description: 'Control how we communicate with you'
    },
    privacy: {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Manage your privacy settings'
    },
    preferences: {
      icon: Palette,
      title: 'Preferences',
      description: 'Customize your experience'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="mr-3 h-8 w-8" />
                Settings
              </h1>
              <p className="text-gray-600 mt-2">Manage your account and preferences</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Profile Complete
            </Badge>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.country}
                      onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <Label htmlFor={key} className="font-medium">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {key === 'workout_reminders' && 'Get reminded about your scheduled workouts'}
                        {key === 'hydration_reminders' && 'Stay hydrated with timely reminders'}
                        {key === 'meal_reminders' && 'Never miss a meal with our reminders'}
                        {key === 'sleep_reminders' && 'Get notified when it\'s time to sleep'}
                        {key === 'achievement_alerts' && 'Celebrate your achievements'}
                        {key === 'weekly_summary' && 'Receive weekly progress summaries'}
                        {key === 'marketing_emails' && 'Get updates about new features and offers'}
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
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Notifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your privacy and data sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <Label htmlFor={key} className="font-medium">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Label>
                      <p className="text-sm text-gray-600">
                        {key === 'profile_public' && 'Make your profile visible to other users'}
                        {key === 'share_stats' && 'Share your stats with the community'}
                        {key === 'allow_friend_requests' && 'Allow others to send you friend requests'}
                        {key === 'show_activity' && 'Show your activity status to friends'}
                      </p>
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
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-600">Danger Zone</h3>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your MyFitHero experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label className="font-medium">Language</Label>
                        <p className="text-sm text-gray-600">Choose your preferred language</p>
                      </div>
                    </div>
                    <select className="px-3 py-1 border rounded-md">
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Palette className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label className="font-medium">Theme</Label>
                        <p className="text-sm text-gray-600">Choose your preferred theme</p>
                      </div>
                    </div>
                    <select className="px-3 py-1 border rounded-md">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5 text-gray-600" />
                      <div>
                        <Label className="font-medium">Units</Label>
                        <p className="text-sm text-gray-600">Choose measurement units</p>
                      </div>
                    </div>
                    <select className="px-3 py-1 border rounded-md">
                      <option value="metric">Metric</option>
                      <option value="imperial">Imperial</option>
                    </select>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsComplete;
