import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  Award,
  Crown,
  Zap,
  Shield,
  Heart,
  Calendar,
  Lock,
  Unlock,
  Moon
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  target?: number;
  category: 'fitness' | 'consistency' | 'achievement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeSystemProps {
  showProgress?: boolean;
  compact?: boolean;
}

const BadgeSystem: React.FC<BadgeSystemProps> = ({ showProgress = true, compact = false }) => {
  const { appStoreUser } = useAppStore();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const predefinedBadges: Badge[] = [
    // Badges de consistance
    {
      id: 'first_week',
      title: 'Première Semaine',
      description: 'Complétez 7 jours consécutifs',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      earned: false,
      target: 7,
      category: 'consistency',
      rarity: 'common'
    },
    {
      id: 'hydration_master',
      title: 'Maître Hydratation',
      description: 'Atteignez votre objectif d\'hydratation 30 jours',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      earned: false,
      target: 30,
      category: 'consistency',
      rarity: 'rare'
    },
    {
      id: 'workout_warrior',
      title: 'Guerrier Fitness',
      description: 'Complétez 50 entraînements',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      earned: false,
      target: 50,
      category: 'fitness',
      rarity: 'epic'
    },
    {
      id: 'sleep_champion',
      title: 'Champion du Sommeil',
      description: 'Dormez 8h+ pendant 14 jours consécutifs',
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      earned: false,
      target: 14,
      category: 'consistency',
      rarity: 'rare'
    },
    {
      id: 'streak_legend',
      title: 'Légende de la Régularité',
      description: 'Maintenez une streak de 100 jours',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      earned: false,
      target: 100,
      category: 'achievement',
      rarity: 'legendary'
    },
    {
      id: 'perfect_week',
      title: 'Semaine Parfaite',
      description: 'Complétez 100% de vos objectifs 7 jours',
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      earned: false,
      target: 7,
      category: 'achievement',
      rarity: 'epic'
    },
    {
      id: 'nutrition_guru',
      title: 'Gourou Nutrition',
      description: 'Suivez votre nutrition 21 jours',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      earned: false,
      target: 21,
      category: 'consistency',
      rarity: 'rare'
    },
    {
      id: 'first_milestone',
      title: 'Premier Jalon',
      description: 'Atteignez votre premier objectif',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      earned: false,
      target: 1,
      category: 'milestone',
      rarity: 'common'
    }
  ];

  useEffect(() => {
    initializeBadges();
  }, [appStoreUser]);

  const initializeBadges = async () => {
    if (!appStoreUser?.id) return;

    setIsLoading(true);
    try {
      // Récupérer les badges de l'utilisateur
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', appStoreUser.id);

      // Récupérer les statistiques pour calculer les progrès
      const { data: stats } = await supabase
        .from('daily_check_ins')
        .select('*')
        .eq('user_id', appStoreUser.id);

      const earnedBadgeIds = userBadges?.map(b => b.badge_id) || [];
      
      const updatedBadges = predefinedBadges.map(badge => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        const progress = calculateProgress(badge.id, stats || []);
        
        return {
          ...badge,
          earned: isEarned,
          progress,
          earnedAt: isEarned ? userBadges?.find(b => b.badge_id === badge.id)?.earned_at : undefined
        };
      });

      setBadges(updatedBadges);
      
      // Vérifier si des badges peuvent être débloqués
      await checkForNewBadges(updatedBadges);
      
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (badgeId: string, stats: any[]): number => {
    switch (badgeId) {
      case 'first_week':
        return Math.min(stats.length, 7);
      case 'hydration_master':
        const hydrationDays = stats.filter(s => s.completed_goals?.includes('hydration')).length;
        return Math.min(hydrationDays, 30);
      case 'workout_warrior':
        const workoutDays = stats.filter(s => s.completed_goals?.includes('workout')).length;
        return Math.min(workoutDays, 50);
      case 'sleep_champion':
        const sleepDays = stats.filter(s => s.completed_goals?.includes('sleep')).length;
        return Math.min(sleepDays, 14);
      case 'streak_legend':
        return Math.min(calculateStreak(stats), 100);
      case 'perfect_week':
        const perfectDays = stats.filter(s => s.completion_rate === 100).length;
        return Math.min(perfectDays, 7);
      case 'nutrition_guru':
        const nutritionDays = stats.filter(s => s.completed_goals?.includes('nutrition')).length;
        return Math.min(nutritionDays, 21);
      case 'first_milestone':
        return stats.length > 0 ? 1 : 0;
      default:
        return 0;
    }
  };

  const calculateStreak = (stats: any[]): number => {
    // Logique simplifiée pour calculer la streak
    return stats.filter(s => s.completion_rate >= 75).length;
  };

  const checkForNewBadges = async (badges: Badge[]) => {
    const newlyEarned = badges.filter(badge => 
      !badge.earned && 
      badge.progress !== undefined && 
      badge.target !== undefined && 
      badge.progress >= badge.target
    );

    for (const badge of newlyEarned) {
      await awardBadge(badge);
    }
  };

  const awardBadge = async (badge: Badge) => {
    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: appStoreUser.id,
          badge_id: badge.id,
          earned_at: new Date().toISOString()
        });

      if (!error) {
        // Mise à jour locale
        setBadges(prev => prev.map(b => 
          b.id === badge.id ? { ...b, earned: true, earnedAt: new Date() } : b
        ));

        // Notification (si toast disponible)
        console.log(`Badge débloqué: ${badge.title}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution du badge:', error);
    }
  };

  const getBadgeRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const availableBadges = badges.filter(b => !b.earned);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${compact ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Badges</h2>
            <p className="text-gray-600">{earnedBadges.length} / {badges.length} débloqués</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
          <Award className="text-yellow-600" size={20} />
          <span className="font-bold text-yellow-700">{earnedBadges.length}</span>
        </div>
      </div>

      {!compact && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression globale</span>
            <span className="text-sm font-bold text-gray-900">
              {Math.round((earnedBadges.length / badges.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Badges débloqués */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Unlock className="text-green-500" size={20} />
            Badges Débloqués
          </h3>
          <div className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-3 md:grid-cols-4'} gap-3`}>
            {earnedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border-2 ${getBadgeRarityColor(badge.rarity)} ${badge.bgColor} cursor-pointer hover:shadow-md transition-all duration-300`}
                  title={badge.description}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon size={24} className={badge.color} />
                    {!compact && (
                      <div className="text-center">
                        <h4 className="font-semibold text-sm text-gray-800">{badge.title}</h4>
                        <p className="text-xs text-gray-600">{badge.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Indicateur de rareté */}
                  {badge.rarity === 'legendary' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges disponibles */}
      {showProgress && availableBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="text-gray-500" size={20} />
            Badges à Débloquer
          </h3>
          <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
            {availableBadges.slice(0, compact ? 4 : 8).map((badge) => {
              const Icon = badge.icon;
              const progressPercentage = badge.target ? ((badge.progress || 0) / badge.target) * 100 : 0;
              
              return (
                <div
                  key={badge.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={24} className="text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-700">{badge.title}</h4>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                      
                      {badge.target && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {badge.progress || 0} / {badge.target}
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-gray-400 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeSystem;
