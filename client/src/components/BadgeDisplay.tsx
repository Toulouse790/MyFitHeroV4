// client/src/components/BadgeDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Star, Zap, Target, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BadgeService, UserBadge, BadgeProgress } from '@/services/badgeService';
import { supabase } from '@/lib/supabase';

interface BadgeDisplayProps {
  className?: string;
  showProgress?: boolean;
  maxDisplay?: number;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  className = '',
  showProgress = false,
  maxDisplay = 10
}) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMaxDisplay, setCurrentMaxDisplay] = useState(maxDisplay);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await loadBadges(user.id);
    };

    initialize();
  }, []);

  const loadBadges = async (uid: string) => {
    try {
      setLoading(true);
      
      if (showProgress) {
        const progress = await BadgeService.getBadgeProgress(uid);
        setBadgeProgress(progress);
      } else {
        const badges = await BadgeService.getUserBadges(uid);
        setUserBadges(badges);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les badges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'workout':
        return <Zap className="w-4 h-4" />;
      case 'nutrition':
        return <Target className="w-4 h-4" />;
      case 'sleep':
        return <Star className="w-4 h-4" />;
      case 'hydration':
        return <Trophy className="w-4 h-4" />;
      case 'streak':
        return <Crown className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProgressPercentage = (progress: number, target: number): number => {
    return Math.min(Math.round((progress / target) * 100), 100);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            {showProgress ? 'Progrès des Badges' : 'Mes Badges'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showProgress) {
    const displayProgress = badgeProgress.slice(0, currentMaxDisplay);
    
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Progrès des Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayProgress.length === 0 ? (
              <p className="text-center text-gray-600">
                Aucun badge disponible pour le moment
              </p>
            ) : (
              displayProgress.map((item) => (
                <div 
                  key={item.badge.id}
                  className={`p-4 border-2 rounded-lg ${
                    item.isEarned 
                      ? `${getRarityColor(item.badge.rarity)} bg-opacity-20` 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        item.isEarned 
                          ? getRarityColor(item.badge.rarity)
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {getBadgeIcon(item.badge.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{item.badge.name}</h3>
                        <p className="text-xs text-gray-600">{item.badge.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={item.isEarned ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.badge.rarity}
                    </Badge>
                  </div>
                  
                  {item.isEarned ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        ✅ Obtenu
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.earnedAt && formatDate(item.earnedAt)}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progrès</span>
                        <span className="font-medium">
                          {item.progress}/{item.badge.condition_value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${getProgressPercentage(item.progress, item.badge.condition_value)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {getProgressPercentage(item.progress, item.badge.condition_value)}% complété
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Affichage des badges obtenus
  const displayBadges = userBadges.slice(0, currentMaxDisplay);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mes Badges</span>
          <Badge variant="outline">
            {userBadges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayBadges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                Aucun badge obtenu pour le moment
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Complétez vos objectifs pour gagner des badges !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {displayBadges.map((userBadge) => (
                <div 
                  key={userBadge.id}
                  className={`p-4 border-2 rounded-lg ${getRarityColor(userBadge.badge?.rarity || 'common')} bg-opacity-20`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRarityColor(userBadge.badge?.rarity || 'common')}`}>
                        {getBadgeIcon(userBadge.badge?.category || 'workout')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {userBadge.badge?.name || 'Badge'}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {userBadge.badge?.description || 'Description non disponible'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Obtenu le {formatDate(userBadge.earned_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="default"
                        className="text-xs mb-1"
                      >
                        {userBadge.badge?.rarity || 'common'}
                      </Badge>
                      <p className="text-xs text-gray-600">
                        +{userBadge.badge?.points_reward || 0} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {userBadges.length > currentMaxDisplay && (
            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentMaxDisplay(prev => prev + 10)}
                size="sm"
              >
                Voir plus de badges
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeDisplay;
