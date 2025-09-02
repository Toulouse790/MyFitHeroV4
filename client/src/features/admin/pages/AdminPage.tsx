// client/src/pages/Admin.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AdminDashboard } from '../components';
import { useAuthStatus } from '@/features/auth/hooks/useAuthStatus';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/shared/hooks/use-toast';

interface UserProfile {
  id: string;
  role: string;
  email?: string;
}

const Admin: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { session, loading, isAuthenticated } = useAuthStatus();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Récupérer le profil utilisateur avec le rôle
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur récupération profil:', error);
        return null;
      }

      return data;
    } catch {
      console.error('Erreur fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Si pas encore chargé, on attend
      if (loading) return;

      // Si pas authentifié, redirection vers login
      if (!isAuthenticated || !session?.user) {
        setLocation('/login');
        return;
      }

      // Récupérer le profil avec le rôle
      setProfileLoading(true);
      const profile = await fetchUserProfile(session.user.id);

      if (!profile) {
        toast({
          title: "Erreur d'accès",
          description: 'Impossible de vérifier vos permissions',
          variant: 'destructive',
        });
        setLocation('/');
        return;
      }

      setUserProfile(profile);

      // Vérifier si l'utilisateur est admin
      if (profile.role !== 'admin') {
        toast({
          title: 'Accès refusé',
          description: "Vous n'avez pas les permissions pour accéder à cette page",
          variant: 'destructive',
        });
        setLocation('/');
        return;
      }

      setProfileLoading(false);
    };

    checkAdminAccess();
  }, [session, loading, isAuthenticated, setLocation, toast]);

  // Affichage du loader pendant la vérification
  if (loading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-sm">
          {loading ? "Vérification de l'authentification..." : 'Vérification des permissions...'}
        </p>
        <span className="sr-only">Chargement de la page d\'administration</span>
      </div>
    );
  }

  // Si pas authentifié ou pas admin, ne rien afficher
  // (la redirection est déjà en cours)
  if (!isAuthenticated || !userProfile || userProfile.role !== 'admin') {
    return null;
  }

  // Afficher le dashboard admin
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header optionnel pour indiquer le mode admin */}
      <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
        🔒 Mode Administrateur - Accès restreint
      </div>

      <AdminDashboard />
    </div>
  );
};

export default Admin;
