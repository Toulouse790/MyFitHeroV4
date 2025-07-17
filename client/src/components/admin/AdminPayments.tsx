// client/src/components/admin/AdminPayments.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PaymentData {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  plan_type: 'free' | 'premium' | 'pro';
  payment_method: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  created_at: string;
  expires_at: string;
  transaction_id: string;
}

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

const AdminPayments: React.FC = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    averageRevenuePerUser: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données de paiement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPayments: PaymentData[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          amount: 9.99,
          currency: 'USD',
          status: 'completed',
          plan_type: 'premium',
          payment_method: 'card',
          created_at: '2024-01-15T10:30:00Z',
          expires_at: '2024-02-15T10:30:00Z',
          transaction_id: 'txn_1234567890'
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          amount: 19.99,
          currency: 'USD',
          status: 'completed',
          plan_type: 'pro',
          payment_method: 'paypal',
          created_at: '2024-01-14T15:45:00Z',
          expires_at: '2024-02-14T15:45:00Z',
          transaction_id: 'txn_0987654321'
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Bob Johnson',
          user_email: 'bob@example.com',
          amount: 9.99,
          currency: 'USD',
          status: 'failed',
          plan_type: 'premium',
          payment_method: 'card',
          created_at: '2024-01-13T09:20:00Z',
          expires_at: '2024-02-13T09:20:00Z',
          transaction_id: 'txn_1122334455'
        }
      ];

      const mockStats: PaymentStats = {
        totalRevenue: 125430.50,
        monthlyRevenue: 15670.25,
        totalSubscriptions: 1250,
        activeSubscriptions: 980,
        churnRate: 5.2,
        averageRevenuePerUser: 127.99
      };

      setPayments(mockPayments);
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || payment.plan_type === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const exportPayments = () => {
    // Simuler l'export des paiements
    const csvData = "User,Email,Amount,Status,Plan,Date\n";
    console.log('Export des paiements:', csvData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">{t('admin.loadingPayments')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('admin.payments')}
        </h2>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadPaymentsData}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.refresh')}
          </Button>

          <Button
            onClick={exportPayments}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('admin.export')}
          </Button>
        </div>
      </div>

      {/* Statistiques de paiement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              {t('admin.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +18% vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              {t('admin.monthlyRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% vs mois précédent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              {t('admin.activeSubscriptions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeSubscriptions.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% vs mois précédent
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
              placeholder={t('admin.searchPayments')}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">{t('admin.allStatuses')}</option>
              <option value="completed">{t('admin.completed')}</option>
              <option value="pending">{t('admin.pending')}</option>
              <option value="failed">{t('admin.failed')}</option>
              <option value="refunded">{t('admin.refunded')}</option>
            </select>
          </div>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">{t('admin.allPlans')}</option>
            <option value="free">{t('admin.free')}</option>
            <option value="premium">{t('admin.premium')}</option>
            <option value="pro">{t('admin.pro')}</option>
          </select>
        </div>
      </div>

      {/* Tableau des paiements */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.plan')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.paymentMethod')}
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
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {t('admin.noPayments')}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${payment.amount}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex items-center ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPlanColor(payment.plan_type)}>
                          {payment.plan_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.subscriptionBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Free</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gray-500" style={{ width: '60%' }} />
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Premium</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '30%' }} />
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pro</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: '10%' }} />
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.paymentMethods')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Credit Card</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PayPal</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Apple Pay</span>
                <span className="text-sm font-medium">10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Google Pay</span>
                <span className="text-sm font-medium">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;
