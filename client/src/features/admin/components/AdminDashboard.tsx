// client/src/features/admin/components/AdminDashboard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AdminDashboardProps {
  userProfile?: {
    id: string;
    role: string;
    email?: string;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userProfile }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
          <p className="text-gray-600 mt-2">Gestion et administration de MyFitHero</p>
        </div>

        {userProfile && (
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Profil Administrateur</h2>
                <p className="text-gray-600">{userProfile.email || userProfile.id}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userProfile.role}
              </Badge>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Utilisateurs</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total utilisateurs</span>
                <Badge variant="outline">--</Badge>
              </div>
              <div className="flex justify-between">
                <span>Nouveaux (7j)</span>
                <Badge variant="outline">--</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Gérer les utilisateurs
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Workouts</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total workouts</span>
                <Badge variant="outline">--</Badge>
              </div>
              <div className="flex justify-between">
                <span>Aujourd&apos;hui</span>
                <Badge variant="outline">--</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Voir les statistiques
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Système</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <Badge variant="outline">v4.0</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Paramètres système
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                📊 Voir les analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                👥 Gérer les utilisateurs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                💳 Gestion des paiements
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📱 Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🎯 Support utilisateurs
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium">Nouveau utilisateur inscrit</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm font-medium">Workout complété</p>
                <p className="text-xs text-gray-500">Il y a 3 heures</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm font-medium">Erreur système résolue</p>
                <p className="text-xs text-gray-500">Il y a 5 heures</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
