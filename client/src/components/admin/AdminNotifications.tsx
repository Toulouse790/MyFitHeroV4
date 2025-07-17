// client/src/components/admin/AdminNotifications.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Target,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'workout' | 'nutrition' | 'achievement' | 'reminder';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  target_audience: 'all' | 'premium' | 'pro' | 'inactive' | 'custom';
  scheduled_at: string | null;
  sent_at: string | null;
  recipients_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
}

interface NotificationStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
  activeNotifications: number;
}

const AdminNotifications: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    averageOpenRate: 0,
    averageClickRate: 0,
    activeNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    target_audience: 'all',
    scheduled_at: ''
  });

  useEffect(() => {
    loadNotificationsData();
  }, []);

  const loadNotificationsData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données de notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          title: 'Nouveau défi disponible!',
          message: 'Relevez le défi "30 jours d\'abdos" et gagnez des récompenses!',
          type: 'workout',
          status: 'sent',
          target_audience: 'all',
          scheduled_at: null,
          sent_at: '2024-01-15T10:00:00Z',
          recipients_count: 1250,
          opened_count: 875,
          clicked_count: 234,
          created_at: '2024-01-15T09:30:00Z'
        },
        {
          id: '2',
          title: 'Rappel nutrition',
          message: 'N\'oubliez pas de boire vos 8 verres d\'eau aujourd\'hui!',
          type: 'nutrition',
          status: 'sent',
          target_audience: 'premium',
          scheduled_at: null,
          sent_at: '2024-01-14T08:00:00Z',
          recipients_count: 420,
          opened_count: 315,
          clicked_count: 89,
          created_at: '2024-01-14T07:30:00Z'
        },
        {
          id: '3',
          title: 'Félicitations!',
          message: 'Vous avez atteint votre objectif de la semaine!',
          type: 'achievement',
          status: 'scheduled',
          target_audience: 'all',
          scheduled_at: '2024-01-16T18:00:00Z',
          sent_at: null,
          recipients_count: 0,
          opened_count: 0,
          clicked_count: 0,
          created_at: '2024-01-15T14:00:00Z'
        },
        {
          id: '4',
          title: 'Mise à jour premium',
          message: 'Découvrez les nouvelles fonctionnalités premium!',
          type: 'general',
          status: 'draft',
          target_audience: 'pro',
          scheduled_at: null,
          sent_at: null,
          recipients_count: 0,
          opened_count: 0,
          clicked_count: 0,
          created_at: '2024-01-15T16:00:00Z'
        }
      ];

      const mockStats: NotificationStats = {
        totalSent: 12450,
        totalOpened: 8920,
        totalClicked: 2340,
        averageOpenRate: 71.6,
        averageClickRate: 18.8,
        activeNotifications: 8
      };

      setNotifications(mockNotifications);
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'bg-blue-100 text-blue-800';
      case 'nutrition':
        return 'bg-green-100 text-green-800';
      case 'achievement':
        return 'bg-purple-100 text-purple-800';
      case 'reminder':
        return 'bg-orange-100 text-orange-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateNotification = () => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type as any,
      status: newNotification.scheduled_at ? 'scheduled' : 'draft',
      target_audience: newNotification.target_audience as any,
      scheduled_at: newNotification.scheduled_at || null,
      sent_at: null,
      recipients_count: 0,
      opened_count: 0,
      clicked_count: 0,
      created_at: new Date().toISOString()
    };

    setNotifications([notification, ...notifications]);
    setShowCreateModal(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'general',
      target_audience: 'all',
      scheduled_at: ''
    });
  };

  const calculateOpenRate = (opened: number, recipients: number) => {
    return recipients > 0 ? ((opened / recipients) * 100).toFixed(1) : '0';
  };

  const calculateClickRate = (clicked: number, recipients: number) => {
    return recipients > 0 ? ((clicked / recipients) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">{t('admin.loadingNotifications')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('admin.notifications')}
        </h2>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadNotificationsData}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.refresh')}
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.createNotification')}
          </Button>
        </div>
      </div>

      {/* Statistiques de notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-600" />
              {t('admin.totalSent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              {t('admin.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              {t('admin.openRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.averageOpenRate}%
            </div>
            <p className="text-xs text-gray-600">
              {stats.totalOpened.toLocaleString()} ouvertures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              {t('admin.clickRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageClickRate}%
            </div>
            <p className="text-xs text-gray-600">
              {stats.totalClicked.toLocaleString()} clics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.searchNotifications')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">{t('admin.allTypes')}</option>
              <option value="general">{t('admin.general')}</option>
              <option value="workout">{t('admin.workout')}</option>
              <option value="nutrition">{t('admin.nutrition')}</option>
              <option value="achievement">{t('admin.achievement')}</option>
              <option value="reminder">{t('admin.reminder')}</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">{t('admin.allStatuses')}</option>
            <option value="draft">{t('admin.draft')}</option>
            <option value="scheduled">{t('admin.scheduled')}</option>
            <option value="sent">{t('admin.sent')}</option>
            <option value="failed">{t('admin.failed')}</option>
          </select>
        </div>
      </div>

      {/* Tableau des notifications */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.notification')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.audience')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.performance')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {t('admin.noNotifications')}
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {notification.message}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex items-center ${getStatusColor(notification.status)}`}>
                          {getStatusIcon(notification.status)}
                          <span className="ml-1">{notification.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.target_audience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notification.status === 'sent' ? (
                          <div className="text-sm">
                            <div className="text-gray-900">
                              {notification.recipients_count} envoyés
                            </div>
                            <div className="text-gray-500">
                              {calculateOpenRate(notification.opened_count, notification.recipients_count)}% ouvert • {calculateClickRate(notification.clicked_count, notification.recipients_count)}% cliqué
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.sent_at 
                          ? new Date(notification.sent_at).toLocaleDateString()
                          : notification.scheduled_at
                          ? new Date(notification.scheduled_at).toLocaleDateString()
                          : new Date(notification.created_at).toLocaleDateString()
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('admin.createNotification')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.title')}
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('admin.enterTitle')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.message')}
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('admin.enterMessage')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.type')}
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="workout">Workout</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="achievement">Achievement</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.audience')}
                </label>
                <select
                  value={newNotification.target_audience}
                  onChange={(e) => setNewNotification({...newNotification, target_audience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="pro">Pro Users</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.scheduleDate')} ({t('admin.optional')})
                </label>
                <input
                  type="datetime-local"
                  value={newNotification.scheduled_at}
                  onChange={(e) => setNewNotification({...newNotification, scheduled_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                {t('admin.cancel')}
              </Button>
              <Button
                onClick={handleCreateNotification}
                disabled={!newNotification.title || !newNotification.message}
              >
                {t('admin.create')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
