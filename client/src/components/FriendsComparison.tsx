import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, TrendingUp, TrendingDown, ChevronRight,
  Dumbbell, Apple, Droplets, Moon, Award, Star, Crown,
  Calendar, BarChart3, Target
} from 'lucide-react';
import { socialService } from '@/services/socialService';
import { useToast } from '@/hooks/use-toast';

interface FriendsComparisonProps {
  userId: string;
  period: 'week' | 'month';
  onPeriodChange: (period: 'week' | 'month') => void;
}

const FriendsComparison: React.FC<FriendsComparisonProps> = ({ 
  userId, 
  period, 
  onPeriodChange 
}) => {
  const { toast } = useToast();
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComparisonData();
  }, [userId, period]);

  const loadComparisonData = async () => {
    try {
      setIsLoading(true);
      const data = await socialService.getFriendsComparison(userId, period);
      setComparisonData(data);
    } catch (error) {
      console.error('Error loading friends comparison:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les comparaisons',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'workouts_completed':
        return <Dumbbell size={16} className="text-red-500" />;
      case 'total_calories_burned':
        return <Apple size={16} className="text-green-500" />;
      case 'water_intake_liters':
        return <Droplets size={16} className="text-blue-500" />;
      case 'sleep_hours_avg':
        return <Moon size={16} className="text-purple-500" />;
      case 'challenges_completed':
        return <Trophy size={16} className="text-yellow-500" />;
      default:
        return <BarChart3 size={16} className="text-gray-500" />;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'workouts_completed':
        return 'Entraînements';
      case 'total_calories_burned':
        return 'Calories brûlées';
      case 'water_intake_liters':
        return 'Hydratation (L)';
      case 'sleep_hours_avg':
        return 'Sommeil (h/jour)';
      case 'challenges_completed':
        return 'Défis complétés';
      default:
        return metric;
    }
  };

  const formatValue = (metric: string, value: number) => {
    switch (metric) {
      case 'total_calories_burned':
        return `${value.toLocaleString()} kcal`;
      case 'water_intake_liters':
        return `${value.toFixed(1)}L`;
      case 'sleep_hours_avg':
        return `${value.toFixed(1)}h`;
      default:
        return value.toString();
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={20} />;
      case 2:
        return <Award className="text-gray-400" size={20} />;
      case 3:
        return <Trophy className="text-orange-500" size={20} />;
      default:
        return <Star className="text-blue-500" size={20} />;
    }
  };

  const ComparisonCard = ({ metric, userValue, friends }: {
    metric: string;
    userValue: number;
    friends: any[];
  }) => {
    const allUsers = [
      { username: 'Vous', value: userValue, isUser: true },
      ...friends.map(friend => ({ 
        username: friend.username, 
        value: friend[metric], 
        isUser: false 
      }))
    ].sort((a, b) => b.value - a.value);

    const userRank = allUsers.findIndex(user => user.isUser) + 1;
    const isTop = userRank <= 3;

    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getMetricIcon(metric)}
            <h3 className="font-medium text-gray-800">{getMetricLabel(metric)}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {getRankIcon(userRank)}
            <span className={`text-sm font-medium ${isTop ? 'text-green-600' : 'text-gray-600'}`}>
              #{userRank}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {allUsers.slice(0, 4).map((user, index) => (
            <div
              key={user.username}
              className={`flex items-center justify-between p-2 rounded-lg ${
                user.isUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium w-6 text-center ${
                  index === 0 ? 'text-yellow-600' :
                  index === 1 ? 'text-gray-600' :
                  index === 2 ? 'text-orange-600' :
                  'text-blue-600'
                }`}>
                  #{index + 1}
                </span>
                <span className={`text-sm ${user.isUser ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                  {user.username}
                </span>
              </div>
              <span className={`text-sm font-medium ${user.isUser ? 'text-blue-700' : 'text-gray-600'}`}>
                {formatValue(metric, user.value)}
              </span>
            </div>
          ))}
          {allUsers.length > 4 && (
            <div className="text-center text-xs text-gray-500 pt-1">
              et {allUsers.length - 4} autres...
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Données de comparaison non disponibles</p>
          <p className="text-sm">Ajoutez des amis pour voir les comparaisons</p>
        </div>
      </div>
    );
  }

  const { user_stats, friends_stats, user_rank } = comparisonData;

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users size={24} />
            <div>
              <h2 className="text-xl font-bold">Comparaison avec vos amis</h2>
              <p className="text-blue-200">
                Votre position dans le groupe cette {period === 'week' ? 'semaine' : 'mois'}
              </p>
            </div>
          </div>
          
          <div className="flex bg-white/20 rounded-lg p-1">
            <button
              onClick={() => onPeriodChange('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === 'week' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => onPeriodChange('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === 'month' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
              }`}
            >
              Mois
            </button>
          </div>
        </div>

        {/* Position globale */}
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getRankIcon(user_rank)}
              <span className="text-2xl font-bold">#{user_rank}</span>
            </div>
            <div className="text-blue-200 text-sm">
              Position générale parmi {friends_stats.length + 1} amis
            </div>
          </div>
        </div>
      </div>

      {/* Grille de comparaisons par métrique */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(user_stats).map(metric => (
          <ComparisonCard
            key={metric}
            metric={metric}
            userValue={user_stats[metric]}
            friends={friends_stats}
          />
        ))}
      </div>

      {/* Insights et conseils */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Target className="mr-2 text-blue-600" size={20} />
          Insights de Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="text-green-600" size={16} />
              <span className="text-sm font-medium text-green-700">Points forts</span>
            </div>
            <p className="text-sm text-green-600">
              {user_rank <= 2 
                ? "Excellent ! Vous êtes dans le top du groupe" 
                : "Votre consistance en hydratation vous place bien"
              }
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-blue-700">Améliorations</span>
            </div>
            <p className="text-sm text-blue-600">
              {user_rank > 2 
                ? "Augmentez vos entraînements pour rattraper le groupe"
                : "Maintenez ce rythme pour garder votre avance"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsComparison;
