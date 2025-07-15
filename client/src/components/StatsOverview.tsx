// client/src/components/StatsOverview.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  Flame, 
  Target, 
  Calendar,
  Dumbbell,
  Apple,
  Moon,
  Droplets,
  Trophy,
  Star,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserDataService, UserStats } from '@/services/userDataService';
import { BadgeService } from '@/services/badgeService';
import { supabase } from '@/lib/supabase';

interface StatsOverviewProps {
  className?: string;
  showDetailed?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  className = '',
  showDetailed = false
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badgeStats, setBadgeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      await loadStats(user.id);
    };

    initialize();
  }, []);

  const loadStats = async (uid: string) => {
    try {
      setLoading(true);
      
      const [userStats, badgeStatsData] = await Promise.all([
        UserDataService.getUserStats(uid),
        BadgeService.getBadgeStats(uid)
      ]);

      setStats(userStats);
      setBadgeStats(badgeStatsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (experience: number): number => {
    return Math.floor(experience / 1000) + 1;
  };

  const getExperienceForNextLevel = (experience: number): number => {
    const currentLevel = getLevel(experience);
    return currentLevel * 1000 - experience;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return 'text-purple-600 bg-purple-100';
    if (streak >= 14) return 'text-blue-600 bg-blue-100';
    if (streak >= 7) return 'text-green-600 bg-green-100';
    if (streak >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '🌟';
    if (streak >= 3) return '💪';
    return '🎯';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Aucune statistique disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Vos Statistiques</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Streak et Niveau */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${getStreakColor(stats.current_streak)}`}>
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-6 h-6" />
                <span className="text-2xl">{getStreakEmoji(stats.current_streak)}</span>
              </div>
              <p className="text-sm font-medium mb-1">Streak actuelle</p>
              <p className="text-2xl font-bold">{stats.current_streak}</p>
              <p className="text-xs opacity-75">
                Record: {stats.longest_streak} jours
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-6 h-6 text-purple-600" />
                <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                  Niveau {stats.level}
                </Badge>
              </div>
              <p className="text-sm font-medium mb-1 text-purple-700">Expérience</p>
              <p className="text-2xl font-bold text-purple-800">{stats.experience_points}</p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((stats.experience_points % 1000) / 1000) * 100}%` 
                  }}
                />
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {getExperienceForNextLevel(stats.experience_points)} XP pour le niveau {getLevel(stats.experience_points) + 1}
              </p>
            </div>
          </div>

          {/* Statistiques des piliers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Dumbbell className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Workouts</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{stats.total_workouts}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Apple className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Nutrition</span>
              </div>
              <p className="text-xl font-bold text-green-600">{stats.total_nutrition_logs}</p>
            </div>
            
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Sommeil</span>
              </div>
              <p className="text-xl font-bold text-indigo-600">{stats.total_sleep_hours}h</p>
            </div>
            
            <div className="p-3 bg-cyan-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <span className="text-sm font-medium text-cyan-800">Hydratation</span>
              </div>
              <p className="text-xl font-bold text-cyan-600">{stats.total_hydration_logs}</p>
            </div>
          </div>

          {/* Badges */}
          {badgeStats && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Badges</span>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {badgeStats.earnedBadges}/{badgeStats.totalBadges}
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-600">{badgeStats.commonBadges}</p>
                  <p className="text-xs text-gray-500">Communs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{badgeStats.rareBadges}</p>
                  <p className="text-xs text-blue-500">Rares</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{badgeStats.epicBadges}</p>
                  <p className="text-xs text-purple-500">Épiques</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-600">{badgeStats.legendaryBadges}</p>
                  <p className="text-xs text-yellow-500">Légendaires</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-700">Points totaux</span>
                  <span className="font-bold text-yellow-800">{badgeStats.totalPoints} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques détaillées */}
          {showDetailed && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Meilleure streak</span>
                  <span className="font-semibold">{stats.longest_streak} jours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Badges gagnés</span>
                  <span className="font-semibold">{stats.badges_earned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Niveau actuel</span>
                  <span className="font-semibold">{stats.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">XP total</span>
                  <span className="font-semibold">{stats.experience_points}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsOverview;
