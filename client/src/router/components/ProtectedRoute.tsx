import React from 'react';
import { useAppStore } from '@/store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  path?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminRequired = false
}) => {
  const { appStoreUser } = useAppStore();

  // Vérifier si l'utilisateur est connecté
  if (!appStoreUser || !appStoreUser.id) {
    // Rediriger vers l'authentification
    window.location.href = '/auth';
    return null;
  }

  // Vérifier les droits admin si nécessaire
  if (adminRequired && appStoreUser.profile_type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
