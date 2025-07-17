// client/src/components/admin/AdminSupport.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  MessageCircle,
  User,
  Calendar,
  Plus,
  RefreshCw,
  Star,
  Mail
} from 'lucide-react';

interface TicketData {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'bug' | 'feature' | 'account' | 'payment' | 'general';
  user_id: string;
  user_name: string;
  user_email: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  messages_count: number;
  rating: number | null;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}

const AdminSupport: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    customerSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données de support
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTickets: TicketData[] = [
        {
          id: '1',
          subject: 'Problème de synchronisation des données',
          description: 'Les données d\'entraînement ne se synchronisent pas correctement entre les appareils.',
          status: 'open',
          priority: 'high',
          category: 'bug',
          user_id: 'user1',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          assigned_to: 'support1',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T14:20:00Z',
          messages_count: 3,
          rating: null
        },
        {
          id: '2',
          subject: 'Demande de fonctionnalité: Mode sombre',
          description: 'Serait-il possible d\'ajouter un mode sombre à l\'application?',
          status: 'in_progress',
          priority: 'medium',
          category: 'feature',
          user_id: 'user2',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          assigned_to: 'dev1',
          created_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-15T11:30:00Z',
          messages_count: 5,
          rating: null
        },
        {
          id: '3',
          subject: 'Impossible de changer d\'abonnement',
          description: 'Je n\'arrive pas à passer de Premium à Pro dans les paramètres.',
          status: 'resolved',
          priority: 'high',
          category: 'account',
          user_id: 'user3',
          user_name: 'Bob Johnson',
          user_email: 'bob@example.com',
          assigned_to: 'support2',
          created_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-14T10:20:00Z',
          messages_count: 4,
          rating: 5
        },
        {
          id: '4',
          subject: 'Problème de facturation',
          description: 'J\'ai été facturé deux fois pour le même abonnement ce mois-ci.',
          status: 'open',
          priority: 'urgent',
          category: 'payment',
          user_id: 'user4',
          user_name: 'Alice Brown',
          user_email: 'alice@example.com',
          assigned_to: null,
          created_at: '2024-01-15T12:00:00Z',
          updated_at: '2024-01-15T12:00:00Z',
          messages_count: 1,
          rating: null
        }
      ];

      const mockStats: SupportStats = {
        totalTickets: 156,
        openTickets: 23,
        resolvedTickets: 133,
        averageResponseTime: 2.4,
        averageResolutionTime: 18.6,
        customerSatisfaction: 4.2
      };

      setTickets(mockTickets);
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur chargement support:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-blue-100 text-blue-800';
      case 'account':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleTicketClick = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">{t('admin.loadingSupport')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('admin.support')}
        </h2>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadSupportData}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.refresh')}
          </Button>

          <Button
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.createTicket')}
          </Button>
        </div>
      </div>

      {/* Statistiques de support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              {t('admin.totalTickets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalTickets}
            </div>
            <p className="text-xs text-gray-600">
              {stats.openTickets} ouverts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              {t('admin.avgResponseTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageResponseTime}h
            </div>
            <p className="text-xs text-gray-600">
              Temps moyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              {t('admin.customerSatisfaction')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.customerSatisfaction}/5
            </div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(stats.customerSatisfaction))}
            </div>
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
              placeholder={t('admin.searchTickets')}
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
              <option value="open">{t('admin.open')}</option>
              <option value="in_progress">{t('admin.inProgress')}</option>
              <option value="resolved">{t('admin.resolved')}</option>
              <option value="closed">{t('admin.closed')}</option>
            </select>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">{t('admin.allPriorities')}</option>
            <option value="urgent">{t('admin.urgent')}</option>
            <option value="high">{t('admin.high')}</option>
            <option value="medium">{t('admin.medium')}</option>
            <option value="low">{t('admin.low')}</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">{t('admin.allCategories')}</option>
            <option value="bug">{t('admin.bug')}</option>
            <option value="feature">{t('admin.feature')}</option>
            <option value="account">{t('admin.account')}</option>
            <option value="payment">{t('admin.payment')}</option>
            <option value="general">{t('admin.general')}</option>
          </select>
        </div>
      </div>

      {/* Tableau des tickets */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.ticket')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.priority')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.created')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.rating')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      {t('admin.noTickets')}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {ticket.messages_count} messages
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`inline-flex items-center ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(ticket.category)}>
                          {ticket.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.rating ? (
                          <div className="flex items-center">
                            {renderStars(ticket.rating)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleTicketClick(ticket)}
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

      {/* Modal de détail ticket */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                <p className="text-sm text-gray-500">Ticket #{selectedTicket.id}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.user')}
                </label>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">{selectedTicket.user_name}</div>
                    <div className="text-sm text-gray-500">{selectedTicket.user_email}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.status')}
                </label>
                <Badge className={`inline-flex items-center ${getStatusColor(selectedTicket.status)}`}>
                  {getStatusIcon(selectedTicket.status)}
                  <span className="ml-1">{selectedTicket.status}</span>
                </Badge>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.priority')}
                </label>
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.category')}
                </label>
                <Badge className={getCategoryColor(selectedTicket.category)}>
                  {selectedTicket.category}
                </Badge>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.description')}
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <Calendar className="h-4 w-4 inline mr-1" />
                Créé le {new Date(selectedTicket.created_at).toLocaleDateString()}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  {t('admin.reply')}
                </Button>
                <Button size="sm">
                  {t('admin.resolve')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
