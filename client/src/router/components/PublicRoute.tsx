import React from 'react';
import { appStore } from '@/store/appStore';

interface PublicRouteProps {
  children: React.ReactNode;
  path?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { appStoreUser } = appStore();

  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (appStoreUser && appStoreUser.id) {
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
};
