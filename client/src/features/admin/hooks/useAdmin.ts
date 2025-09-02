import { useState, useCallback } from 'react';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWorkouts: number;
  totalSessions: number;
  averageSessionDuration: number;
  popularExercises: Array<{ name: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

export interface UserManagement {
  users: Array<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
    lastActive: string;
    status: 'active' | 'inactive' | 'suspended';
    role: 'user' | 'admin' | 'moderator';
  }>;
  totalUsers: number;
  filters: {
    status?: string;
    role?: string;
    search?: string;
  };
}

export interface UseAdminReturn {
  // Stats
  stats: AdminStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // User Management
  users: UserManagement;
  usersLoading: boolean;
  usersError: string | null;

  // Actions
  loadStats: () => Promise<void>;
  loadUsers: (filters?: UserManagement['filters']) => Promise<void>;
  updateUserStatus: (
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
  ) => Promise<boolean>;
  updateUserRole: (userId: string, role: 'user' | 'admin' | 'moderator') => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Bulk actions
  bulkUpdateUsers: (
    userIds: string[],
    updates: { status?: string; role?: string }
  ) => Promise<boolean>;

  // System actions
  sendSystemNotification: (message: string, targetUsers: string[]) => Promise<boolean>;
  exportUserData: (format: 'csv' | 'json') => Promise<boolean>;
  generateReport: (type: 'users' | 'activities' | 'performance') => Promise<boolean>;
}

export const useAdmin = (): UseAdminReturn => {
  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<UserManagement>({
    users: [],
    totalUsers: 0,
    filters: {},
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Load admin stats
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      // Mock data - replace with actual API call
      const mockStats: AdminStats = {
        totalUsers: 1250,
        activeUsers: 342,
        totalWorkouts: 8750,
        totalSessions: 3420,
        averageSessionDuration: 45,
        popularExercises: [
          { name: 'Push-ups', count: 450 },
          { name: 'Squats', count: 380 },
          { name: 'Pull-ups', count: 320 },
          { name: 'Deadlifts', count: 290 },
          { name: 'Bench Press', count: 260 },
        ],
        userGrowth: [
          { date: '2025-08-01', count: 1100 },
          { date: '2025-08-15', count: 1150 },
          { date: '2025-09-01', count: 1250 },
        ],
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(mockStats);
    } catch {
      setStatsError(error instanceof Error ? error.message : 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async (filters: UserManagement['filters'] = {}): Promise<void> => {
    try {
      setUsersLoading(true);
      setUsersError(null);

      // Mock data - replace with actual API call
      const mockUsers = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['active', 'inactive', 'suspended'][Math.floor(Math.random() * 3)] as
          | 'active'
          | 'inactive'
          | 'suspended',
        role: ['user', 'admin', 'moderator'][Math.floor(Math.random() * 3)] as
          | 'user'
          | 'admin'
          | 'moderator',
      }));

      // Apply filters
      let filteredUsers = mockUsers;
      if (filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setUsers({
        users: filteredUsers,
        totalUsers: filteredUsers.length,
        filters,
      });
    } catch {
      setUsersError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Update user status
  const updateUserStatus = useCallback(
    async (userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setUsers(prev => ({
          ...prev,
          users: prev.users.map(user => (user.id === userId ? { ...user, status } : user)),
        }));

        return true;
      } catch {
        console.error('Failed to update user status:', error);
        return false;
      }
    },
    []
  );

  // Update user role
  const updateUserRole = useCallback(
    async (userId: string, role: 'user' | 'admin' | 'moderator'): Promise<boolean> => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setUsers(prev => ({
          ...prev,
          users: prev.users.map(user => (user.id === userId ? { ...user, role } : user)),
        }));

        return true;
      } catch {
        console.error('Failed to update user role:', error);
        return false;
      }
    },
    []
  );

  // Delete user
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsers(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId),
        totalUsers: prev.totalUsers - 1,
      }));

      return true;
    } catch {
      console.error('Failed to delete user:', error);
      return false;
    }
  }, []);

  // Bulk update users
  const bulkUpdateUsers = useCallback(
    async (userIds: string[], updates: { status?: string; role?: string }): Promise<boolean> => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setUsers(prev => ({
          ...prev,
          users: prev.users.map(user => {
            if (userIds.includes(user.id)) {
              return {
                ...user,
                ...(updates.status && {
                  status: updates.status as 'active' | 'inactive' | 'suspended',
                }),
                ...(updates.role && { role: updates.role as 'user' | 'admin' | 'moderator' }),
              };
            }
            return user;
          }),
        }));

        return true;
      } catch {
        console.error('Failed to bulk update users:', error);
        return false;
      }
    },
    []
  );

  // Send system notification
  const sendSystemNotification = useCallback(
    async (message: string, targetUsers: string[]): Promise<boolean> => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Sending notification to users:', targetUsers, 'Message:', message);
        return true;
      } catch {
        console.error('Failed to send notification:', error);
        return false;
      }
    },
    []
  );

  // Export user data
  const exportUserData = useCallback(
    async (format: 'csv' | 'json'): Promise<boolean> => {
      try {
        // Mock export
        await new Promise(resolve => setTimeout(resolve, 1500));

        const data = users.users;
        const filename = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;

        if (format === 'csv') {
          const csvContent = [
            'ID,Email,Name,Created At,Last Active,Status,Role',
            ...data.map(
              user =>
                `${user.id},${user.email},${user.name},${user.createdAt},${user.lastActive},${user.status},${user.role}`
            ),
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const jsonContent = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonContent], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }

        return true;
      } catch {
        console.error('Failed to export data:', error);
        return false;
      }
    },
    [users.users]
  );

  // Generate report
  const generateReport = useCallback(
    async (type: 'users' | 'activities' | 'performance'): Promise<boolean> => {
      try {
        // Mock report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Generating ${type} report...`);
        return true;
      } catch {
        console.error('Failed to generate report:', error);
        return false;
      }
    },
    []
  );

  return {
    // Stats
    stats,
    statsLoading,
    statsError,

    // Users
    users,
    usersLoading,
    usersError,

    // Actions
    loadStats,
    loadUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    bulkUpdateUsers,
    sendSystemNotification,
    exportUserData,
    generateReport,
  };
};

export default useAdmin;
