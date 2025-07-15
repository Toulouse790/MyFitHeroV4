import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Play, 
  Calendar,
  Zap,
  User,
  Settings,
  Dumbbell,
  Apple,
  Moon,
  Droplets,
  Brain,
  Clock,
  Loader2,
  Flame,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'wouter';
import { useAppStore } from '@/stores/useAppStore';
import { SmartDashboardContext, DailyProgramDisplay } from '@/types/dashboard';
import { DailyStats, Json } from '@/lib/supabase';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { useAnimateOnMount, useHaptic } from '@/hooks/useAnimations';
import { useAdaptiveColors } from '@/components/ThemeProvider';
import AIIntelligence from '@/components/AIIntelligence';
import { DailyCheckIn } from '@/components/DailyCheckIn';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { StatsOverview } from '@/components/StatsOverview';

interface SmartDashboardProps {
  userProfile?: SupabaseAuthUserType;
}

interface ChatMessage {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface WebhookPayload {
  new: {
    status: string;
    webhook_response?: {
      recommendation?: string;
    };
  };
}

interface LocalPersonalizedWidget {
  id: string;
  title: string;
  content: string;
  icon: React.ElementType;
  color: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  path?: string;
}

const SmartDashboard: React.FC<SmartDashboardProps> = ({ userProfile }) => {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loadingDailyStats, setLoadingDailyStats] = useState(true);

  // Animations et thème
  const isVisible = useAnimateOnMount(300);
  const colors = useAdaptiveColors();
  const { clickVibration } = useHaptic();

  const {
    dailyGoals,
    fetchDailyStats,
    fetchAiRecommendations,
    appStoreUser
  } = useAppStore();

  const today = new Date().toISOString().split('T')[0];

  // ===== FONCTIONS DE PERSONNALISATION ULTRA-POUSSÉE =====

  const getPersonalizedGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const user = appStoreUser;
    const firstName = user?.username?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Champion';
    
    // Salutations selon l'heure ET le profil sportif
    if (hour < 6) {
      return `🌙 ${firstName}, encore debout ? ${user?.sport === 'rugby' ? 'Les piliers se lèvent tôt !' : 'Repos = gains !'}`;
    } else if (hour < 12) {
      if (user?.sport === 'rugby' && user?.sport_position === 'pilier') {
        return `🏉 Bonjour ${firstName} ! Prêt à dominer la mêlée aujourd'hui ?`;
      } else if (user?.primary_goals?.includes('weight_loss')) {
        return `🔥 Salut ${firstName} ! Ready to burn some calories ?`;
      } else if (user?.primary_goals?.includes('muscle_gain')) {
        return `💪 Morning ${firstName} ! Time to build that muscle !`;
      } else {
        return `☀️ Bonjour ${firstName} ! Prêt à conquérir cette journée ?`;
      }
    } else if (hour < 18) {
      return `👋 Salut ${firstName} ! ${user?.sport ? 'Comment se passe ta prep ?' : 'Tu gères ta journée !'}`;
    } else {
      return `🌆 Bonsoir ${firstName} ! ${user?.primary_goals?.includes('sleep_quality') ? 'Time to wind down ?' : 'Fini ta journée fitness ?'}`;
    }
  }, [appStoreUser]);

  const getPersonalizedWorkout = useCallback((profile: UserProfile | null) => {
    if (!profile) return 'Entraînement Général';
    
    const day = new Date().getDay(); // 0 = dimanche, 1 = lundi, etc.
    
    // Programme ultra-spécifique selon sport + poste + jour
    if (profile.sport === 'rugby') {
      if (profile.sport_position === 'pilier') {
        if ([1, 3, 5].includes(day)) { // Lun, Mer, Ven
          return '🏉 Force Explosive - Mêlée';
        } else if ([2, 4].includes(day)) { // Mar, Jeu
          return '🏃 Mobilité & Cardio Rugby';
        } else {
          return '😌 Récupération Active - Pilier';
        }
      } else if (profile.sport_position?.includes('arrière')) {
        return '⚡ Vitesse & Agilité - Arrière';
      } else {
        return '🏉 Entraînement Rugby - ' + (profile.sport_position || 'All Positions');
      }
    }
    
    // Programme selon objectifs
    if (profile.primary_goals?.includes('muscle_gain')) {
      const workouts = ['💪 Hypertrophie Pectoraux', '🎯 Dos & Largeur', '🦵 Leg Day Intense', '🔥 Bras & Épaules'];
      return workouts[day % workouts.length];
    }
    
    if (profile.primary_goals?.includes('weight_loss')) {
      const workouts = ['🔥 HIIT Cardio', '⚡ Métabolique Intense', '🏃 Circuit Training', '💥 Tabata Express'];
      return workouts[day % workouts.length];
    }
    
    if (profile.primary_goals?.includes('endurance')) {
      return '🏃 Cardio Endurance - Zone 2';
    }
    
    return 'Entraînement Personnalisé';
  }, []);

  const getPersonalizedExercises = useCallback((profile: UserProfile | null) => {
    if (!profile) return ['Squats', 'Push-ups', 'Planches', 'Fentes'];
    
    // Exercices spécifiques au sport
    if (profile.sport === 'rugby' && profile.sport_position === 'pilier') {
      return ['Squat lourd 5x3', 'Développé couché 4x6', 'Rowing barre 4x8', 'Poussée traîneau 3x20m'];
    }
    
    if (profile.sport === 'rugby' && profile.sport_position?.includes('arrière')) {
      return ['Sprint 40m x6', 'Pliométrie', 'Agilité échelle', 'Récupération ballon'];
    }
    
    // Exercices selon objectifs
    if (profile.primary_goals?.includes('weight_loss')) {
      return ['HIIT 20min', 'Burpees 4x15', 'Mountain climbers 3x30s', 'Jump squats 4x12'];
    }
    
    if (profile.primary_goals?.includes('muscle_gain')) {
      return ['Squat 4x8', 'Développé 4x10', 'Tractions 4x8', 'Dips 3x12'];
    }
    
    return ['Squats', 'Push-ups', 'Planches', 'Fentes'];
  }, []);

  const getSmartReminders = useCallback((profile: UserProfile | null, stats: DailyStats | null) => {
    const reminders: LocalPersonalizedWidget[] = [];
    const firstName = profile?.username?.split(' ')[0] || 'Champion';
    
    // Reminders hyper-contextuels
    if (!stats?.workouts_completed) {
      if (profile?.sport === 'rugby' && profile?.sport_position === 'pilier') {
        reminders.push({
          id: 'workout_rugby',
          title: '🏉 Ton pack d\'avant t\'attend !',
          content: `${firstName}, la mêlée ne se gagnera pas toute seule ! Time to hit the gym 💪`,
          icon: Dumbbell,
          color: 'bg-red-500',
          priority: 'high',
          action: 'Commencer',
          path: '/workout'
        });
      } else if (profile?.primary_goals?.includes('weight_loss')) {
        reminders.push({
          id: 'workout_weightloss',
          title: '🔥 Brûle-graisse mode ON',
          content: `${firstName}, chaque calorie compte ! Ready for some HIIT ?`,
          icon: Flame,
          color: 'bg-orange-500',
          priority: 'high',
          action: 'Let\'s go',
          path: '/workout'
        });
      } else {
        reminders.push({
          id: 'workout_general',
          title: '💪 Workout Time !',
          content: `${firstName}, ton corps attend ton signal ! Let's move`,
          icon: Zap,
          color: 'bg-blue-500',
          priority: 'medium',
          action: 'Start',
          path: '/workout'
        });
      }
    }
    
    // Hydratation contextuelle
    const waterMl = stats?.water_intake_ml || 0;
    const waterGoal = dailyGoals.water * 1000;
    if (waterMl < waterGoal * 0.5) {
      reminders.push({
        id: 'hydration',
        title: '💧 Hydrate-toi !',
        content: `${firstName}, tu n'as bu que ${Math.round(waterMl/1000*10)/10}L sur ${dailyGoals.water}L`,
        icon: Droplets,
        color: 'bg-cyan-500',
        priority: 'medium',
        action: 'Boire',
        path: '/hydration'
      });
    }
    
    // Nutrition contextuelle
    const cals = stats?.total_calories || 0;
    const calorieGoal = dailyGoals.calories;
    if (cals > calorieGoal * 1.1) {
      reminders.push({
        id: 'calories_over',
        title: '⚠️ Calories dépassées',
        content: `${firstName}, +${cals - calorieGoal} kcal. Un petit HIIT ce soir ?`,
        icon: AlertCircle,
        color: 'bg-yellow-500',
        priority: 'low',
        action: 'Cardio',
        path: '/workout'
      });
    } else if (cals < calorieGoal * 0.7) {
      reminders.push({
        id: 'calories_under',
        title: '🍎 Tu manques d\'énergie',
        content: `${firstName}, seulement ${cals} kcal. Mange pour performer !`,
        icon: Apple,
        color: 'bg-green-500',
        priority: 'medium',
        action: 'Manger',
        path: '/nutrition'
      });
    }
    
    return reminders.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    }).slice(0, 2); // Max 2 reminders
  }, [dailyGoals]);

  const getPersonalizedMotivation = useCallback((profile: UserProfile | null, stats: DailyStats | null) => {
    const firstName = profile?.username?.split(' ')[0] || 'Champion';
    const motivations: string[] = [];
    
    // Motivation selon progression
    if (stats?.workouts_completed && stats.workouts_completed > 0) {
      if (profile?.sport === 'rugby') {
        motivations.push(`🏉 ${firstName}, encore un workout de warrior ! La mêlée sera à toi !`);
      } else {
        motivations.push(`🔥 ${firstName}, encore une victoire ! Tu es unstoppable !`);
      }
    }
    
    // Motivation selon objectifs
    if (profile?.primary_goals?.includes('performance') && stats?.workouts_completed) {
      motivations.push(`⚡ Performance mode ON ! ${firstName}, tu repousses tes limites !`);
    }
    
    if (profile?.primary_goals?.includes('weight_loss') && (stats?.total_calories || 0) < dailyGoals.calories) {
      motivations.push(`🎯 ${firstName}, tu contrôles ton alimentation comme un pro !`);
    }
    
    // Motivation par défaut
    if (motivations.length === 0) {
      const hour = new Date().getHours();
      if (hour < 12) {
        motivations.push(`💪 ${firstName}, prêt à transformer cette journée en victoire ?`);
      } else {
        motivations.push(`🌟 ${firstName}, continue comme ça, tu es sur la bonne voie !`);
      }
    }
    
    return motivations[0];
  }, [dailyGoals]);

  // ===== ÉTAT INITIAL ET DONNÉES =====

  const [dailyProgram, setDailyProgram] = useState<DailyProgramDisplay>({
    workout: {
      name: getPersonalizedWorkout(appStoreUser),
      duration: 45,
      exercises: getPersonalizedExercises(appStoreUser),
      completed: false
    },
    nutrition: {
      calories_target: appStoreUser?.primary_goals?.includes('muscle_gain') ? 2800 : 
                      appStoreUser?.primary_goals?.includes('weight_loss') ? 1800 : 2200,
      calories_current: 0,
      next_meal: "Chargement..."
    },
    hydration: {
      target_ml: dailyGoals.water * 1000,
      current_ml: 0,
      percentage: 0
    },
    sleep: {
      target_hours: dailyGoals.sleep,
      last_night_hours: 0,
      quality: 0
    }
  });

  const loadInitialData = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoadingDailyStats(true);
    try {
      const fetchedDailyStats = await fetchDailyStats(userProfile.id, today);
      setDailyStats(fetchedDailyStats);

      if (fetchedDailyStats) {
        setDailyProgram(prev => ({
          ...prev,
          workout: {
            ...prev.workout,
            completed: (fetchedDailyStats.workouts_completed || 0) > 0,
            name: getPersonalizedWorkout(appStoreUser)
          },
          nutrition: {
            ...prev.nutrition,
            calories_current: fetchedDailyStats.total_calories || 0
          },
          hydration: {
            ...prev.hydration,
            current_ml: fetchedDailyStats.water_intake_ml || 0,
            percentage: Math.round(((fetchedDailyStats.water_intake_ml || 0) / (fetchedDailyStats.hydration_goal_ml || dailyGoals.water * 1000)) * 100)
          },
          sleep: {
            ...prev.sleep,
            last_night_hours: fetchedDailyStats.sleep_duration_minutes ? (fetchedDailyStats.sleep_duration_minutes / 60) : 0,
            quality: fetchedDailyStats.sleep_quality || 0
          }
        }));
      }

      const recentAiRecs = await fetchAiRecommendations(userProfile.id, 'general', 3);
      if (recentAiRecs.length > 0) {
        setMessages(recentAiRecs.map((rec, index) => ({
          id: index + 1,
          type: 'ai',
          content: rec.content,
          timestamp: new Date(rec.created_at || new Date())
        })));
      } else {
        // Message d'accueil ultra-personnalisé
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: getPersonalizedGreeting(),
            timestamp: new Date()
          }
        ]);
      }

    } catch (error) {
      console.error('Erreur chargement données dashboard:', error);
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: getPersonalizedGreeting(),
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoadingDailyStats(false);
    }
  }, [userProfile?.id, today, fetchDailyStats, fetchAiRecommendations, appStoreUser, dailyGoals, getPersonalizedWorkout, getPersonalizedGreeting]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !userProfile?.id) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const contextData: SmartDashboardContext = {
          user: {
            id: userProfile.id,
            username: appStoreUser.username,
            age: appStoreUser.age,
            gender: appStoreUser.gender,
            fitness_goal: appStoreUser.goal,
            primary_goals: appStoreUser.primary_goals,
            sport: appStoreUser.sport,
            sport_position: appStoreUser.sport_position,
            fitness_experience: appStoreUser.fitness_experience,
            lifestyle: appStoreUser.lifestyle,
            available_time_per_day: appStoreUser.available_time_per_day,
            training_frequency: appStoreUser.training_frequency,
            season_period: appStoreUser.season_period,
            injuries: appStoreUser.injuries,
          },
          dailyStats: dailyStats,
          currentDate: new Date().toISOString().split('T')[0],
          currentTime: new Date().toLocaleTimeString(),
          isWeekend: [0, 6].includes(new Date().getDay()),
          weatherContext: 'normal',
          motivationLevel: 'normal',
          recentActivity: 'none',
          upcomingEvents: [],
          personalizedTips: messages.filter(m => m.type === 'ai').map(m => m.content).slice(-3),
      };

      const { data: requestData, error: requestError } = await supabase
        .from('ai_requests')
        .insert({
          user_id: userProfile.id,
          pillar_type: detectMessageType(inputMessage),
          prompt: inputMessage,
          context: contextData as unknown as Json,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      const subscription = supabase
        .channel(`ai_request:${requestData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ai_requests',
            filter: `id=eq.${requestData.id}`
          },
          (payload: WebhookPayload) => {
            if (payload.new.status === 'completed' && payload.new.webhook_response) {
              const aiResponseContent = payload.new.webhook_response.recommendation || 'Je réfléchis...';
              const aiResponse: ChatMessage = {
                id: messages.length + 2,
                type: 'ai',
                content: aiResponseContent,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, aiResponse]);
              setIsLoading(false);
              subscription.unsubscribe();
            }
          }
        )
        .subscribe();

      setTimeout(() => {
        if (isLoading) {
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'ai',
            content: 'Désolé, le traitement prend plus de temps que prévu. Réessayez dans un moment.',
            timestamp: new Date()
          }]);
          setIsLoading(false);
          subscription.unsubscribe();
        }
      }, 30000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        type: 'ai',
        content: 'Désolé, je rencontre un problème technique. Réessayez dans un moment.',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };

  const detectMessageType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sport') || lowerMessage.includes('workout') || lowerMessage.includes('musculation') || lowerMessage.includes('exercice') || lowerMessage.includes('entraînement')) {
      return 'workout';
    }
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('manger') || lowerMessage.includes('calories') || lowerMessage.includes('repas')) {
      return 'nutrition';
    }
    if (lowerMessage.includes('sommeil') || lowerMessage.includes('dormir') || lowerMessage.includes('repos') || lowerMessage.includes('nuit')) {
      return 'sleep';
    }
    if (lowerMessage.includes('eau') || lowerMessage.includes('hydratation') || lowerMessage.includes('boire')) {
      return 'hydration';
    }
    
    return 'general';
  };

  // Calcul des actions avec progression dynamique
  const pillarActions = [
    {
      id: 'workout',
      icon: Dumbbell,
      label: 'Sport',
      subtitle: dailyProgram.workout.name,
      color: 'bg-red-500',
      progress: dailyProgram.workout.completed ? 100 : 0,
      action: dailyProgram.workout.completed ? 'Workout fait ✓' : 'Commencer',
      path: '/workout',
      status: dailyProgram.workout.completed ? 'completed' : 'pending'
    },
    {
      id: 'nutrition',
      icon: Apple,
      label: 'Nutrition',
      subtitle: `${dailyProgram.nutrition.calories_current}/${dailyProgram.nutrition.calories_target} kcal`,
      color: 'bg-green-500',
      progress: Math.round((dailyProgram.nutrition.calories_current / dailyProgram.nutrition.calories_target) * 100),
      action: 'Logger repas',
      path: '/nutrition',
      status: dailyProgram.nutrition.calories_current >= dailyProgram.nutrition.calories_target * 0.8 ? 'good' : 'pending'
    },
    {
      id: 'hydration',
      icon: Droplets,
      label: 'Hydratation',
      subtitle: `${Math.round(dailyProgram.hydration.current_ml/1000*10)/10}L/${dailyProgram.hydration.target_ml/1000}L`,
      color: 'bg-blue-500',
      progress: dailyProgram.hydration.percentage,
      action: 'Boire eau',
      path: '/hydration',
      status: dailyProgram.hydration.percentage >= 80 ? 'good' : 'pending'
    },
    {
      id: 'sleep',
      icon: Moon,
      label: 'Sommeil',
      subtitle: `${dailyProgram.sleep.last_night_hours.toFixed(1)}h/${dailyProgram.sleep.target_hours}h`,
      color: 'bg-purple-500',
      progress: Math.round((dailyProgram.sleep.last_night_hours / dailyProgram.sleep.target_hours) * 100),
      action: 'Analyser',
      path: '/sleep',
      status: dailyProgram.sleep.last_night_hours >= dailyProgram.sleep.target_hours * 0.9 ? 'good' : 'pending'
    }
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const smartReminders = getSmartReminders(appStoreUser, dailyStats);
  const personalizedMotivation = getPersonalizedMotivation(appStoreUser, dailyStats);

  // Suggestions contextuelles pour le chat
  const getPersonalizedSuggestions = () => {
    const suggestions = [];
    
    if (!dailyProgram.workout.completed) {
      suggestions.push(dailyProgram.workout.name);
    }
    
    suggestions.push('Mes calories du jour');
    
    if (dailyProgram.hydration.percentage < 60) {
      suggestions.push('Rappel hydratation');
    }
    
    if (appStoreUser?.sport) {
      suggestions.push(`Conseil ${appStoreUser.sport}`);
    }
    
    suggestions.push('Ma progression');
    
    return suggestions.slice(0, 4);
  };

  return (
    <div className={`min-h-screen ${colors.background} transition-colors duration-300`}>
      {/* Header Personnalisé avec animations */}
      <div 
        className={`
          ${colors.surface} shadow-sm border-b ${colors.border} px-4 py-3
          transform transition-all duration-500 
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
        `}
      >
        <div className="flex items-center justify-between">
          <div 
            className={`
              flex items-center space-x-3
              transform transition-all duration-700 delay-200
              ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}
            `}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`font-bold ${colors.text}`}>
                {appStoreUser?.username?.split(' ')[0] || 'MyFitHero'}
                {appStoreUser?.sport === 'rugby' && ' 🏉'}
                {appStoreUser?.primary_goals?.includes('muscle_gain') && ' 💪'}
                {appStoreUser?.primary_goals?.includes('weight_loss') && ' 🔥'}
              </h1>
              <p className={`text-xs ${colors.textSecondary}`}>
                {appStoreUser?.sport && appStoreUser?.sport_position ? 
                  `${appStoreUser.sport} - ${appStoreUser.sport_position}` : 
                  'Assistant IA Personnel'
                }
              </p>
            </div>
          </div>
          <div 
            className={`
              flex items-center space-x-2
              transform transition-all duration-700 delay-300
              ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
            `}
          >
            <div className="text-right">
              <p className={`text-sm font-semibold ${colors.text}`}>Niveau {appStoreUser?.level}</p>
              <p className={`text-xs ${colors.textSecondary}`}>{appStoreUser?.totalPoints} XP</p>
            </div>
            <button 
              onClick={() => {
                clickVibration();
                navigate('/profile');
              }}
              className={`p-2 ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-110`}
            >
              <User size={20} />
            </button>
            <button 
              onClick={() => {
                clickVibration();
                handleSignOut();
              }}
              className={`p-2 ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-110`}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        
        {/* Motivation Personnalisée */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-3">
            <Star size={24} className="text-yellow-300" />
            <div>
              <p className="font-semibold text-lg">{personalizedMotivation}</p>
              <p className="text-purple-100 text-sm">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Smart Reminders */}
        {smartReminders.length > 0 && (
          <div className="mb-6 space-y-3">
            {smartReminders.map((reminder) => {
              const Icon = reminder.icon;
              return (
                <div
                  key={reminder.id}
                  onClick={() => reminder.path && navigate(reminder.path)}
                  className="bg-white rounded-xl p-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${reminder.color} p-2 rounded-lg`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                        <p className="text-sm text-gray-600">{reminder.content}</p>
                      </div>
                    </div>
                    {reminder.action && (
                      <button className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                        {reminder.action}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Daily Check-in */}
        <div className="mb-6">
          <DailyCheckIn className="w-full" />
        </div>

        {/* Programme du Jour - Version Ultra Détaillée */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {loadingDailyStats ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto mb-4" size={24} />
              <p className="text-gray-600">Chargement de ton programme personnalisé...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Calendar className="mr-2 text-blue-600" size={24} />
                  Ton Programme du Jour
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Personnaliser
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pillarActions.map((pillar) => {
                  const Icon = pillar.icon;
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'completed':
                        return <CheckCircle size={16} className="text-green-500" />;
                      case 'good':
                        return <Star size={16} className="text-yellow-500" />;
                      default:
                        return <Clock size={16} className="text-gray-400" />;
                    }
                  };

                  return (
                    <div 
                      key={pillar.id} 
                      onClick={() => navigate(pillar.path)}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:scale-105 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`${pillar.color} p-3 rounded-xl shadow-sm`}>
                            <Icon className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{pillar.label}</h3>
                            <p className="text-xs text-gray-600 mt-1">{pillar.subtitle}</p>
                          </div>
                        </div>
                        {getStatusBadge(pillar.status)}
                      </div>
                      
                      {/* Barre de progression personnalisée */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progression</span>
                          <span className="text-xs font-semibold text-gray-700">{Math.min(pillar.progress, 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${pillar.color} h-2 rounded-full transition-all duration-500 relative overflow-hidden`}
                            style={{ width: `${Math.min(pillar.progress, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center space-x-1 py-2 rounded-lg hover:bg-white transition-all">
                        <span>{pillar.action}</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Workout Preview spécifique */}
              <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Dumbbell className="mr-2 text-red-600" size={18} />
                    {dailyProgram.workout.name}
                  </h3>
                  <span className="text-sm text-red-600 font-medium">
                    ~{dailyProgram.workout.duration}min
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {dailyProgram.workout.exercises.slice(0, 3).map((exercise, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      {exercise}
                    </span>
                  ))}
                  {dailyProgram.workout.exercises.length > 3 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      +{dailyProgram.workout.exercises.length - 3} autres
                    </span>
                  )}
                </div>
                
                {!dailyProgram.workout.completed && (
                  <button 
                    onClick={() => navigate('/workout')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play size={16} />
                    <span>Commencer maintenant</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Statistiques Overview */}
        <StatsOverview className="mb-6" />

        {/* Badges récents */}
        <BadgeDisplay 
          className="mb-6" 
          maxDisplay={3}
          showProgress={false}
        />

        {/* Chat IA Ultra-Personnalisé */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-semibold">
                  Coach {appStoreUser?.sport ? `${appStoreUser.sport} ` : ''}IA
                  {appStoreUser?.sport === 'rugby' && ' 🏉'}
                </h3>
                <p className="text-sm opacity-90">
                  {appStoreUser?.sport_position ? 
                    `Spécialiste ${appStoreUser.sport_position}` : 
                    'Votre coach personnel intelligent'
                  }
                </p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">En ligne</span>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-3">
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-3 rounded-full transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={
                    appStoreUser?.sport === 'rugby' ? 
                      "Demande-moi des conseils rugby, mêlée, nutrition..." :
                    appStoreUser?.primary_goals?.includes('weight_loss') ?
                      "Conseils brûle-graisse, cardio, nutrition..." :
                    appStoreUser?.primary_goals?.includes('muscle_gain') ?
                      "Conseils musculation, prise de masse..." :
                      "Demande-moi n'importe quoi sur ton fitness..."
                  }
                  className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Suggestions ultra-personnalisées */}
            <div className="flex flex-wrap gap-2">
              {getPersonalizedSuggestions().map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputMessage(suggestion)}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Personnalisées */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="text-orange-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Calories</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {dailyProgram.nutrition.calories_current}
            </p>
            <p className="text-xs text-gray-500">sur {dailyProgram.nutrition.calories_target}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Droplets className="text-blue-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Hydratation</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {Math.round(dailyProgram.hydration.current_ml/1000*10)/10}L
            </p>
            <p className="text-xs text-gray-500">sur {dailyProgram.hydration.target_ml/1000}L</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Dumbbell className="text-red-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Workout</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {dailyProgram.workout.completed ? '✓' : '○'}
            </p>
            <p className="text-xs text-gray-500">
              {dailyProgram.workout.completed ? 'Terminé' : 'En attente'}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="text-purple-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Niveau</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{appStoreUser?.level}</p>
            <p className="text-xs text-gray-500">{appStoreUser?.totalPoints} XP</p>
          </div>
        </div>

        {/* Intelligence AI Avancée */}
        <AIIntelligence
          pillar="general"
          showPredictions={true}
          showCoaching={true}
          showRecommendations={true}
          className="mt-6"
        />

        {/* Citation motivante selon profil */}
        <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-2xl">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">
              {appStoreUser?.sport === 'rugby' ? 
                '🏉 "La mêlée se gagne avant le match"' :
              appStoreUser?.primary_goals?.includes('muscle_gain') ?
                '💪 "Les muscles se construisent dans la cuisine"' :
              appStoreUser?.primary_goals?.includes('weight_loss') ?
                '🔥 "Chaque calorie brûlée est une victoire"' :
                '⚡ "Votre seule limite, c\'est vous"'
              }
            </h3>
            <p className="text-gray-300 text-sm">
              {appStoreUser?.sport === 'rugby' ? 
                'Prépare-toi comme un warrior' :
              appStoreUser?.primary_goals?.includes('performance') ?
                'Excellence is a habit' :
                'Consistency beats perfection'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDashboard;