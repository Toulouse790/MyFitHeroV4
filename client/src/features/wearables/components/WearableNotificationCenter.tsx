import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Bell,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWearableSync } from '@/features/wearables/hooks/useWearableSync';
import { useToast } from '@/shared/hooks/use-toast';

interface WearableNotification {
  id: string;
  type: 'goal' | 'achievement' | 'reminder' | 'health';
  title: string;
  message: string;
  timestamp: Date;
  icon: React.ElementType;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

const WearableNotificationCenter: React.FC = () => {
  const { getCachedData, syncAll, isLoading } = useWearableSync();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<WearableNotification[]>([]);
  const [dailyGoals] = useState({
    steps: 10000,
    calories: 500,
    activeMinutes: 30,
    heartRateZone: 120, // BPM minimum pour zone active
  });

  useEffect(() => {
    checkForNotifications();
    const interval = setInterval(checkForNotifications, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, []);

  const checkForNotifications = () => {
    const wearableData = getCachedData();
    if (!wearableData) return;

    const newNotifications: WearableNotification[] = [];

    // Vérifier les objectifs quotidiens
    if (wearableData.steps >= dailyGoals.steps) {
      newNotifications.push({
        id: 'steps-goal-' + Date.now(),
        type: 'goal',
        title: '🎯 Objectif pas atteint !',
        message: `Bravo ! Vous avez fait ${wearableData.steps.toLocaleString()} pas aujourd'hui`,
        timestamp: new Date(),
        icon: Target,
        priority: 'medium',
        read: false,
      });
    }

    if ((wearableData.caloriesBurned || 0) >= dailyGoals.calories) {
      newNotifications.push({
        id: 'calories-goal-' + Date.now(),
        type: 'goal',
        title: '🔥 Objectif calories atteint !',
        message: `Excellente journée ! ${wearableData.caloriesBurned || 0} calories brûlées`,
        timestamp: new Date(),
        icon: Zap,
        priority: 'medium',
        read: false,
      });
    }

    // Vérifier les zones de fréquence cardiaque
    if (wearableData.heartRate && wearableData.heartRate.length > 0) {
      const maxHeartRate = Math.max(...wearableData.heartRate);

      if (maxHeartRate > 180) {
        newNotifications.push({
          id: 'heart-rate-high-' + Date.now(),
          type: 'health',
          title: '⚠️ Fréquence cardiaque élevée',
          message: `Pic à ${maxHeartRate} BPM détecté. Pensez à vous reposer.`,
          timestamp: new Date(),
          icon: AlertTriangle,
          priority: 'high',
          read: false,
        });
      }
    }

    // Vérifier les réalisations
    if (wearableData.steps > 15000) {
      newNotifications.push({
        id: 'achievement-super-walker-' + Date.now(),
        type: 'achievement',
        title: '🏆 Super Marcheur !',
        message: `Incroyable ! Plus de 15,000 pas aujourd'hui !`,
        timestamp: new Date(),
        icon: Award,
        priority: 'low',
        read: false,
      });
    }

    // Rappels dd'activitéapos;activité
    const now = new Date();
    const lastActivity = wearableData.lastSync || new Date();
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastActivity > 2) {
      newNotifications.push({
        id: 'activity-reminder-' + Date.now(),
        type: 'reminder',
        title: '💪 Temps de bouger !',
        message:
          "Cela fait un moment que vous n&apos;avez pas été actif. Que diriez-vous d'une petite marche ?",
        timestamp: new Date(),
        icon: Activity,
        priority: 'low',
        read: false,
      });
    }

    // Ajouter les nouvelles notifications
    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...uniqueNew];
    });

    // Afficher les notifications toast pour les priorités élevées
    newNotifications.forEach(notification => {
      if (notification.priority === 'high') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: 'destructive',
        });
      }
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationColor = (type: WearableNotification['type']) => {
    switch (type) {
      case 'goal':
        return 'bg-green-50 border-green-200';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'reminder':
        return 'bg-blue-50 border-blue-200';
      case 'health':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationIcon = (type: WearableNotification['type']) => {
    switch (type) {
      case 'goal':
        return Target;
      case 'achievement':
        return Award;
      case 'reminder':
        return Bell;
      case 'health':
        return Heart;
      default:
        return Activity;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const wearableData = getCachedData();

  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="text-gray-600" size={24} />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Centre de notifications</h2>
            <p className="text-sm text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} nouvelle(s) notification(s)`
                : 'Aucune nouvelle notification'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => syncAll()} disabled={isLoading} size="sm" variant="outline">
            <Activity className="mr-2" size={16} />
            Synchroniser
          </Button>
          {notifications.length > 0 && (
            <Button onClick={clearAllNotifications} size="sm" variant="ghost">
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      {/* Objectifs quotidiens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2" size={20} />
            Objectifs quotidiens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pas */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(((wearableData?.steps || 0) / dailyGoals.steps) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Pas</div>
              <div className="text-xs text-gray-500">
                {(wearableData?.steps || 0).toLocaleString()} / {dailyGoals.steps.toLocaleString()}
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((wearableData?.steps || 0) / dailyGoals.steps) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Calories */}
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(((wearableData?.caloriesBurned || 0) / dailyGoals.calories) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Calories</div>
              <div className="text-xs text-gray-500">
                {wearableData?.caloriesBurned || 0} / {dailyGoals.calories}
              </div>
              <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((wearableData?.caloriesBurned || 0) / dailyGoals.calories) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Minutes actives */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((wearableData?.activeMinutes || 0) / dailyGoals.activeMinutes) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Minutes actives</div>
              <div className="text-xs text-gray-500">
                {wearableData?.activeMinutes || 0} / {dailyGoals.activeMinutes}
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((wearableData?.activeMinutes || 0) / dailyGoals.activeMinutes) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Fréquence cardiaque */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {wearableData?.heartRate
                  ? Math.round(
                      wearableData.heartRate.reduce((a, b) => a + b, 0) /
                        wearableData.heartRate.length
                    )
                  : 0}
              </div>
              <div className="text-sm text-gray-600">BPM moyen</div>
              <div className="text-xs text-gray-500">
                Zone:{' '}
                {wearableData?.heartRate &&
                wearableData.heartRate.some(hr => hr > dailyGoals.heartRateZone)
                  ? 'Active'
                  : 'Repos'}
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((wearableData?.heartRate ? Math.max(...wearableData.heartRate) : 0) / 200) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2" size={20} />
            Notifications récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">Aucune notification pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">
                Vos notifications d&apos;activité et de santé apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      notification.read ? 'opacity-60' : ''
                    } ${getNotificationColor(notification.type)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          notification.priority === 'high'
                            ? 'bg-red-100'
                            : notification.priority === 'medium'
                              ? 'bg-yellow-100'
                              : 'bg-blue-100'
                        }`}
                      >
                        <IconComponent
                          size={16}
                          className={
                            notification.priority === 'high'
                              ? 'text-red-600'
                              : notification.priority === 'medium'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendances et insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Insights et tendances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="text-blue-600" size={16} />
                <span className="text-sm font-medium">Cette semaine</span>
              </div>
              <p className="text-xs text-gray-600">
                Votre activité est en hausse de 15% par rapport à la semaine dernière !
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="text-green-600" size={16} />
                <span className="text-sm font-medium">Comparaison</span>
              </div>
              <p className="text-xs text-gray-600">
                Vous êtes plus actif que 78% des utilisateurs de votre âge !
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WearableNotificationCenter;
