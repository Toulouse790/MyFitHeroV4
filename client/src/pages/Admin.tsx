// client/src/pages/Admin.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '@/components/admin';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading, isAuthenticated } = useAuthStatus();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      // Vérifier si l'utilisateur est admin
      // Dans un vrai système, vous vérifieriez le rôle depuis la base de données
      if (session?.user?.email !== 'admin@myfithero.com') {
        navigate('/');
        return;
      }
    }
  }, [session, loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminDashboard />;
};

export default Admin;
