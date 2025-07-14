import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  TrendingUp, 
  Brain,
  ChevronRight,
  Calendar,
  Award,
  Flame
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';
import { useAnimateOnMount, useProgressAnimation, useHaptic } from '@/hooks/useAnimations';

interface PillarHeaderProps {
  pillar: 'hydration' | 'nutrition' | 'sleep' | 'workout';
  title: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  emoji: string;
  motivationalMessage?: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  showAIRecommendation?: boolean;
}

interface AIRecommendation {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

const PillarHeader: React.FC<PillarHeaderProps> = ({
  pillar,
  title,
  icon: Icon,
  color,
  bgGradient,
  emoji,
  motivationalMessage,
  currentValue = 0,
  targetValue = 100,
  unit = '',
  showAIRecommendation = true
}) => {
  const { appStoreUser } = useAppStore();
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [dailyGoal, setDailyGoal] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Animations et interactions
  const isVisible = useAnimateOnMount(200);
  const animatedProgress = useProgressAnimation(currentValue, 1500);
  const { successVibration, clickVibration } = useHaptic();

  useEffect(() => {
    if (appStoreUser?.id) {
      loadAIRecommendation();
      loadDailyGoal();
      calculateProgress();
      loadStreak();
    }
  }, [appStoreUser, pillar, currentValue, targetValue]);

  const loadAIRecommendation = async () => {
    if (!showAIRecommendation || !appStoreUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .eq('pillar_type', pillar)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur récupération recommandation IA:', error);
        return;
      }

      if (data) {
        setAiRecommendation({
          id: data.id,
          title: data.title || 'Conseil IA',
          message: data.recommendation || 'Continuez vos efforts !',
          priority: data.priority || 'medium',
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Erreur chargement recommandation IA:', error);
    }
  };

  const loadDailyGoal = async () => {
    if (!appStoreUser?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', appStoreUser.id)
        .eq('pillar_type', pillar)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur récupération objectif quotidien:', error);
        return;
      }

      if (data) {
        setDailyGoal(data.goal_description || getDefaultGoal());
      } else {
        setDailyGoal(getDefaultGoal());
      }
    } catch (error) {
      console.error('Erreur chargement objectif quotidien:', error);
      setDailyGoal(getDefaultGoal());
    }
  };

  const getDefaultGoal = (): string => {
    switch (pillar) {
      case 'hydration':
        return 'Boire 2.5L d\'eau aujourd\'hui';
      case 'nutrition':
        return 'Respecter vos macros quotidiennes';
      case 'sleep':
        return 'Dormir 8h de qualité';
      case 'workout':
        return 'Compléter votre entraînement';
      default:
        return 'Atteindre votre objectif quotidien';
    }
  };

  const calculateProgress = () => {
    if (targetValue > 0) {
      const newPercentage = Math.min((animatedProgress / targetValue) * 100, 100);
      setProgressPercentage(newPercentage);
      
      // Vibration de succès quand l'objectif est atteint
      if (newPercentage >= 100 && currentValue >= targetValue) {
        successVibration();
      }
    }
  };

  const loadStreak = async () => {
    if (!appStoreUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('daily_check_ins')
        .select('date, completed_goals')
        .eq('user_id', appStoreUser.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Erreur récupération streak:', error);
        return;
      }

      if (data) {
        let currentStreak = 0;
        const today = new Date();
        
        for (const record of data) {
          const recordDate = new Date(record.date);
          const diffDays = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === currentStreak && record.completed_goals?.includes(pillar)) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        setStreak(currentStreak);
      }
    } catch (error) {
      console.error('Erreur calcul streak:', error);
    }
  };

  const getBadgeForProgress = () => {
    if (progressPercentage >= 100) return { icon: Trophy, color: 'text-yellow-500', label: 'Objectif atteint !' };
    if (progressPercentage >= 75) return { icon: Star, color: 'text-purple-500', label: 'Excellent progrès' };
    if (progressPercentage >= 50) return { icon: Target, color: 'text-blue-500', label: 'Bon rythme' };
    if (progressPercentage >= 25) return { icon: TrendingUp, color: 'text-green-500', label: 'En progression' };
    return { icon: Zap, color: 'text-orange-500', label: 'Commencez maintenant' };
  };

  const badge = getBadgeForProgress();
  const BadgeIcon = badge.icon;

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl ${bgGradient} text-white shadow-2xl
        transform transition-all duration-500 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      {/* Fond évolutif avec motifs animés */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 transform rotate-45 translate-x-32 -translate-y-32 animate-pulse">
          <div className="w-full h-full bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-48 h-48 transform -rotate-45 -translate-x-24 translate-y-24 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="w-full h-full bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header supérieur avec animation */}
        <div 
          className={`
            flex items-center justify-between mb-6 
            transform transition-all duration-700 delay-200
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
          `}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-110"
              onClick={clickVibration}
            >
              <Icon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {title}
                <span className="text-3xl animate-bounce" style={{ animationDelay: '1s' }}>{emoji}</span>
              </h1>
              <p className="text-white text-opacity-90 text-sm">
                {motivationalMessage || `Optimisez votre ${title.toLowerCase()}`}
              </p>
            </div>
          </div>

          {/* Badge de progression animé */}
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
            <BadgeIcon size={20} className={badge.color} />
            <span className="text-sm font-medium">{badge.label}</span>
          </div>
        </div>

        {/* Objectif du jour */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-white text-opacity-80" />
            <span className="text-sm font-medium text-white text-opacity-80">Objectif du jour</span>
          </div>
          <p className="text-lg font-semibold">{dailyGoal}</p>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white text-opacity-80">Progression</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">
                {currentValue} / {targetValue} {unit}
              </span>
              <span className="text-sm font-bold">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3 backdrop-blur-sm">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Statistiques et streak */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-300" />
              <span className="text-sm font-medium text-white text-opacity-80">Streak</span>
            </div>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-white text-opacity-70">jours consécutifs</p>
          </div>
          
          <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-blue-300" />
              <span className="text-sm font-medium text-white text-opacity-80">Cette semaine</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-white text-opacity-70">objectifs atteints</p>
          </div>
        </div>

        {/* Recommandation IA */}
        {showAIRecommendation && aiRecommendation && (
          <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-purple-300" />
              <span className="text-sm font-medium text-white text-opacity-80">Conseil IA</span>
              <div className={`w-2 h-2 rounded-full ${
                aiRecommendation.priority === 'high' ? 'bg-red-400' : 
                aiRecommendation.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
            </div>
            <p className="text-sm text-white text-opacity-95 mb-2">
              {aiRecommendation.message}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white text-opacity-70">
                {new Date(aiRecommendation.created_at).toLocaleDateString('fr-FR')}
              </span>
              <button className="flex items-center gap-1 text-xs text-white text-opacity-80 hover:text-opacity-100 transition-colors">
                <span>Voir plus</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PillarHeader;
