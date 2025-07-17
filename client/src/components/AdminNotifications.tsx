import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Bell, Send, Users, Target, 
  Mail, MessageCircle, Smartphone, Settings
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'push' | 'email' | 'in-app';
  title: string;
  message: string;
  isActive: boolean;
  scheduledFor?: string;
  targetAudience: 'all' | 'premium' | 'free' | 'inactive';
  createdAt: string;
}

interface NotificationStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
}

export const AdminNotifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribeRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState<Partial<NotificationTemplate>>({
    name: '',
    type: 'push',
    title: '',
    message: '',
    targetAudience: 'all',
    isActive: true
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications: NotificationTemplate[] = data?.map(notif => ({
        id: notif.id,
        name: notif.name,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isActive: notif.is_active,
        scheduledFor: notif.scheduled_for,
        targetAudience: notif.target_audience,
        createdAt: notif.created_at
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Mock data for demo
      const mockNotifications: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Welcome New Users',
          type: 'email',
          title: 'Welcome to MyFitHero!',
          message: 'Start your fitness journey with personalized workouts.',
          isActive: true,
          targetAudience: 'all',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Workout Reminder',
          type: 'push',
          title: 'Time to workout!',
          message: 'Your scheduled workout is starting in 15 minutes.',
          isActive: true,
          targetAudience: 'all',
          createdAt: '2024-01-14T15:30:00Z'
        },
        {
          id: '3',
          name: 'Premium Upgrade',
          type: 'in-app',
          title: 'Upgrade to Premium',
          message: 'Unlock advanced features and personalized coaching.',
          isActive: true,
          targetAudience: 'free',
          createdAt: '2024-01-13T09:00:00Z'
        }
      ];
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      // In a real app, these would come from your notification service
      const mockStats: NotificationStats = {
        totalSent: 15847,
        openRate: 24.5,
        clickRate: 3.2,
        unsubscribeRate: 0.8
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .insert([{
          name: newNotification.name,
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message,
          target_audience: newNotification.targetAudience,
          is_active: newNotification.isActive
        }]);

      if (error) throw error;

      setShowCreateModal(false);
      setNewNotification({
        name: '',
        type: 'push',
        title: '',
        message: '',
        targetAudience: 'all',
        isActive: true
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // In a real app, this would trigger your notification service
      console.log('Sending notification:', notification);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleToggleActive = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const { error } = await supabase
        .from('notification_templates')
        .update({ is_active: !notification.isActive })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isActive: !n.isActive }
            : n
        )
      );
    } catch (error) {
      console.error('Error toggling notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'in-app': return <MessageCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'push': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'in-app': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'all': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'free': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.notifications.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.notifications.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Bell className="h-4 w-4 mr-2" />
          {t('admin.notifications.create')}
        </Button>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unsubscribeRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+0.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>
            Manage your notification templates and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{notification.name}</h3>
                    <p className="text-sm text-gray-600">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant="secondary" className={getAudienceColor(notification.targetAudience)}>
                        {notification.targetAudience}
                      </Badge>
                      <Badge variant={notification.isActive ? "default" : "secondary"}>
                        {notification.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(notification.id)}
                  >
                    {notification.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendNotification(notification.id)}
                    disabled={!notification.isActive}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={newNotification.name}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter notification name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="push">Push Notification</option>
                  <option value="email">Email</option>
                  <option value="in-app">In-App</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={newNotification.targetAudience}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="free">Free Users</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotification}>
                Create Notification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
