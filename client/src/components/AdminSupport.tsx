import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  MessageCircle, Clock, CheckCircle, AlertCircle, 
  Search, Reply, User, Calendar
} from 'lucide-react';

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'bug' | 'feature' | 'account' | 'payment' | 'other';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses?: SupportResponse[];
}

interface SupportResponse {
  id: string;
  ticketId: string;
  message: string;
  isFromUser: boolean;
  createdAt: string;
  authorName: string;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  avgResponseTime: number;
  resolutionRate: number;
}

export const AdminSupport = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    totalTickets: 0,
    openTickets: 0,
    avgResponseTime: 0,
    resolutionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTickets();
    fetchSupportStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_user_id_fkey (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets: SupportTicket[] = data?.map(ticket => ({
        id: ticket.id,
        userId: ticket.user_id,
        userEmail: ticket.profiles?.email || 'Unknown',
        userName: ticket.profiles?.full_name || 'Unknown User',
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        assignedTo: ticket.assigned_to,
        responses: []
      })) || [];

      setTickets(formattedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Mock data for demo
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          userId: 'user1',
          userEmail: 'john@example.com',
          userName: 'John Doe',
          subject: 'Cannot sync workouts',
          message: 'My workouts are not syncing properly with the app.',
          status: 'open',
          priority: 'high',
          category: 'bug',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          responses: []
        },
        {
          id: '2',
          userId: 'user2',
          userEmail: 'jane@example.com',
          userName: 'Jane Smith',
          subject: 'Feature request: Dark mode',
          message: 'It would be great to have a dark mode option.',
          status: 'in-progress',
          priority: 'medium',
          category: 'feature',
          createdAt: '2024-01-14T15:30:00Z',
          updatedAt: '2024-01-14T16:00:00Z',
          assignedTo: 'Admin',
          responses: []
        },
        {
          id: '3',
          userId: 'user3',
          userEmail: 'bob@example.com',
          userName: 'Bob Johnson',
          subject: 'Payment issue',
          message: 'I was charged twice for my subscription.',
          status: 'resolved',
          priority: 'urgent',
          category: 'payment',
          createdAt: '2024-01-13T09:00:00Z',
          updatedAt: '2024-01-13T11:30:00Z',
          assignedTo: 'Support Team',
          responses: []
        }
      ];
      setTickets(mockTickets);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupportStats = async () => {
    try {
      // In a real app, these would be calculated from your support database
      const mockStats: SupportStats = {
        totalTickets: 847,
        openTickets: 23,
        avgResponseTime: 2.4,
        resolutionRate: 92.5
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching support stats:', error);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus as any, updatedAt: new Date().toISOString() }
            : ticket
        )
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleUpdatePriority = async (ticketId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, priority: newPriority as any, updatedAt: new Date().toISOString() }
            : ticket
        )
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, priority: newPriority as any } : null);
      }
    } catch (error) {
      console.error('Error updating ticket priority:', error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('support_responses')
        .insert([{
          ticket_id: selectedTicket.id,
          message: replyMessage,
          is_from_user: false,
          author_name: 'Support Team'
        }]);

      if (error) throw error;

      // Update ticket status to in-progress if it was open
      if (selectedTicket.status === 'open') {
        await handleUpdateStatus(selectedTicket.id, 'in-progress');
      }

      setReplyMessage('');
      // In a real app, you'd refresh the responses here
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.support.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.support.description')}</p>
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.3h</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>
                {filteredTickets.length} ticket(s) found
              </CardDescription>
              {/* Filters */}
              <div className="flex items-center space-x-4 pt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paginatedTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(ticket.status)}
                          <h3 className="font-medium text-sm">{ticket.subject}</h3>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{ticket.userName}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{ticket.userEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge variant="secondary" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ticket.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedTicket.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reply
                    </label>
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                    />
                    <Button 
                      onClick={handleSendReply}
                      className="mt-2"
                      disabled={!replyMessage.trim()}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a ticket to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
