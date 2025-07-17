// client/src/components/admin/AdminAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: { date: string; users: number; active: number }[];
  sessionStats: { date: string; sessions: number; duration: number }[];
  popularExercises: { name: string; count: number; percentage: number }[];
  retentionRate: { period: string; rate: number }[];
  revenueData: { month: string; revenue: number; subscriptions: number }[];
}

const AdminAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données d'analytics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        userGrowth: [
          { date: '2024-01-01', users: 1200, active: 890 },
          { date: '2024-01-02', users: 1250, active: 920 },
          { date: '2024-01-03', users: 1300, active: 950 },
          { date: '2024-01-04', users: 1380, active: 1020 },
          { date: '2024-01-05', users: 1420, active: 1080 },
          { date: '2024-01-06', users: 1480, active: 1150 },
          { date: '2024-01-07', users: 1520, active: 1200 }
        ],
        sessionStats: [
          { date: '2024-01-01', sessions: 450, duration: 28 },
          { date: '2024-01-02', sessions: 520, duration: 32 },
          { date: '2024-01-03', sessions: 480, duration: 30 },
          { date: '2024-01-04', sessions: 600, duration: 35 },
          { date: '2024-01-05', sessions: 650, duration: 38 },
          { date: '2024-01-06', sessions: 700, duration: 42 },
          { date: '2024-01-07', sessions: 720, duration: 45 }
        ],
        popularExercises: [
          { name: 'Push-ups', count: 2400, percentage: 35 },
          { name: 'Squats', count: 1800, percentage: 26 },
          { name: 'Plank', count: 1200, percentage: 18 },
          { name: 'Burpees', count: 800, percentage: 12 },
          { name: 'Lunges', count: 600, percentage: 9 }
        ],
        retentionRate: [
          { period: 'Day 1', rate: 100 },
          { period: 'Day 7', rate: 65 },
          { period: 'Day 30', rate: 42 },
          { period: 'Day 90', rate: 28 }
        ],
        revenueData: [
          { month: 'Jan', revenue: 12500, subscriptions: 250 },
          { month: 'Feb', revenue: 15200, subscriptions: 304 },
          { month: 'Mar', revenue: 18900, subscriptions: 378 },
          { month: 'Apr', revenue: 22100, subscriptions: 442 },
          { month: 'May', revenue: 26800, subscriptions: 536 },
          { month: 'Jun', revenue: 31200, subscriptions: 624 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '1y', label: '1 an' }
  ];

  const exportData = () => {
    // Simuler l'export des données
    const csvData = "Date,Users,Active Users,Sessions\n";
    console.log('Export des données analytics:', csvData);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg text-gray-600">{t('admin.loadingAnalytics')}</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('admin.analytics')}
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Sélecteur de période */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          {/* Boutons d'action */}
          <Button
            onClick={loadAnalyticsData}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.refresh')}
          </Button>

          <Button
            onClick={exportData}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('admin.export')}
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              {t('admin.totalUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.users.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% vs période précédente
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
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.active.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              {t('admin.totalSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData.sessionStats[analyticsData.sessionStats.length - 1]?.sessions.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              {t('admin.avgSessionDuration')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData.sessionStats[analyticsData.sessionStats.length - 1]?.duration}m
            </div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5% vs période précédente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Croissance utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {t('admin.userGrowth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600">Graphique de croissance des utilisateurs</p>
                <p className="text-sm text-gray-500 mt-2">
                  {analyticsData.userGrowth.length} points de données
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions par jour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('admin.dailySessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">Sessions quotidiennes</p>
                <p className="text-sm text-gray-500 mt-2">
                  Moyenne: {Math.round(analyticsData.sessionStats.reduce((sum, s) => sum + s.sessions, 0) / analyticsData.sessionStats.length)} sessions/jour
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercices populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('admin.popularExercises')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularExercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 bg-${['blue', 'green', 'purple', 'yellow', 'red'][index]}-500`} />
                    <span className="text-sm font-medium">{exercise.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{exercise.count.toLocaleString()}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${['blue', 'green', 'purple', 'yellow', 'red'][index]}-500`}
                        style={{ width: `${exercise.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{exercise.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Taux de rétention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('admin.retentionRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.retentionRate.map((retention, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{retention.period}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${retention.rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{retention.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('admin.revenueAnalytics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                {analyticsData.revenueData.map((data, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${(data.revenue / 1000).toFixed(1)}k
                    </div>
                    <div className="text-sm text-gray-600">{data.month}</div>
                    <div className="text-xs text-gray-500">{data.subscriptions} subs</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-600">Évolution des revenus mensuels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
