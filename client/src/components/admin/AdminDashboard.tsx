// client/src/components/admin/AdminDashboard.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Image, 
  BarChart3, 
  CreditCard, 
  Bell, 
  MessageSquare, 
  Settings,
  Shield,
  Activity,
  TrendingUp
} from 'lucide-react';

import AdminUsers from './AdminUsers';
import AdminMedia from './AdminMedia';
import AdminAnalytics from './AdminAnalytics';
import AdminPayments from './AdminPayments';
import AdminNotifications from './AdminNotifications';
import AdminSupport from './AdminSupport';
import AdminSettings from './AdminSettings';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: t('admin.overview'),
      icon: BarChart3,
      description: 'Vue d\'ensemble des statistiques'
    },
    {
      id: 'users',
      label: t('admin.users'),
      icon: Users,
      description: 'Gestion des utilisateurs'
    },
    {
      id: 'media',
      label: t('admin.media'),
      icon: Image,
      description: 'Gestion des médias'
    },
    {
      id: 'analytics',
      label: t('admin.analytics'),
      icon: Activity,
      description: 'Analyses et rapports'
    },
    {
      id: 'payments',
      label: t('admin.payments'),
      icon: CreditCard,
      description: 'Gestion des paiements'
    },
    {
      id: 'notifications',
      label: t('admin.notifications'),
      icon: Bell,
      description: 'Système de notifications'
    },
    {
      id: 'support',
      label: t('admin.support'),
      icon: MessageSquare,
      description: 'Support client'
    },
    {
      id: 'settings',
      label: t('admin.settings'),
      icon: Settings,
      description: 'Configuration'
    }
  ];

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              {t('admin.totalUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12,548</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              {t('admin.activeUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8,420</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              {t('admin.revenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">$45,320</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-600" />
              {t('admin.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-red-600">
              Alertes actives
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Nouvel utilisateur inscrit</span>
                </div>
                <span className="text-xs text-gray-500">Il y a 2 min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Paiement reçu</span>
                </div>
                <span className="text-xs text-gray-500">Il y a 5 min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Nouveau ticket de support</span>
                </div>
                <span className="text-xs text-gray-500">Il y a 10 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tâches prioritaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="text-sm">Répondre aux tickets urgents</span>
                </div>
                <span className="text-xs text-red-500">Urgent</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="text-sm">Analyser les métriques mensuelles</span>
                </div>
                <span className="text-xs text-yellow-500">Moyen</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="text-sm">Nettoyer les médias inutilisés</span>
                </div>
                <span className="text-xs text-green-500">Faible</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'users':
        return <AdminUsers />;
      case 'media':
        return <AdminMedia />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'payments':
        return <AdminPayments />;
      case 'notifications':
        return <AdminNotifications />;
      case 'support':
        return <AdminSupport />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.dashboard')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('admin.dashboardDescription')}
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={tab.description}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
