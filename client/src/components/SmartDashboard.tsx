import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Play, 
  Calendar,
  Target,
  TrendingUp,
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
  Award,
  Flame,
  Heart,
  Shield,
  Sun,
  Coffee,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'wouter';
import { useAppStore } from '@/stores/useAppStore';
import { SmartDashboardContext, DailyProgramDisplay } from '@/types/dashboard';
import { DailyStats, AiRecommendation, Json } from '@/lib/supabase';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';

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

interface PersonalizedWidget {
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

  const {
    dailyGoals,
    fetchDailyStats,
    fetchAiRecommendations,
    user: appStoreUser
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
    const reminders: PersonalizedWidget[] = [];
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
    } catch (error) {
      console.error('Error loading daily stats:', error);
    } finally {
      setLoadingDailyStats(false);
    }
  }, [userProfile, today, fetchDailyStats, appStoreUser, dailyGoals, getPersonalizedWorkout]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ===== CHAT ET IA =====

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const contextData: SmartDashboardContext = {
        userProfile: appStoreUser,
        dailyStats: dailyStats,
        currentGoals: dailyGoals,
        currentProgram: dailyProgram,
        personalizedGreeting: getPersonalizedGreeting(),
        personalizedWorkout: getPersonalizedWorkout(appStoreUser),
        personalizedExercises: getPersonalizedExercises(appStoreUser),
        smartReminders: getSmartReminders(appStoreUser, dailyStats),
        personalizedMotivation: getPersonalizedMotivation(appStoreUser, dailyStats)
      };

      const { data, error } = await supabase
        .from('ai_requests')
        .insert({
          user_id: userProfile?.id,
          pillar_type: 'dashboard',
          context: contextData,
          request_details: {
            message: message,
            timestamp: new Date().toISOString()
          },
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Écouter les réponses de l'IA
      const channel = supabase
        .channel('ai_responses')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'ai_requests', filter: `id=eq.${data.id}` },
          (payload: WebhookPayload) => {
            if (payload.new.status === 'completed' && payload.new.webhook_response?.recommendation) {
              const aiResponse: ChatMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: payload.new.webhook_response.recommendation,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, aiResponse]);
              setIsLoading(false);
            }
          }
        )
        .subscribe();

      // Nettoyage après 30 secondes
      setTimeout(() => {
        channel.unsubscribe();
        setIsLoading(false);
      }, 30000);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }, [isLoading, userProfile, appStoreUser, dailyStats, dailyGoals, dailyProgram, getPersonalizedGreeting, getPersonalizedWorkout, getPersonalizedExercises, getSmartReminders, getPersonalizedMotivation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // ===== RECONNAISSANCE VOCALE =====

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  }, []);

  // ===== INTERFACES =====

  interface SportConfig {
    emoji: string;
    positions: string[];
    workoutTypes: string[];
    motivationalPhrases: string[];
    specificExercises: string[];
  }

  const getSportConfig = useCallback((sport: string | null | undefined): SportConfig => {
    const configs: Record<string, SportConfig> = {
      rugby: {
        emoji: '🏉',
        positions: ['pilier', 'talonneur', 'deuxième ligne', 'troisième ligne', 'mêlée', 'ouverture', 'centre', 'ailier', 'arrière'],
        workoutTypes: ['Force explosive', 'Endurance musculaire', 'Agilité', 'Récupération'],
        motivationalPhrases: [
          'La mêlée se gagne avant le match !',
          'Chaque plaquage compte !',
          'Force, vitesse, rugby !',
          'Ensemble on est plus forts !'
        ],
        specificExercises: ['Squat explosif', 'Développé couché', 'Rowing', 'Burpees', 'Sprint', 'Planche']
      },
      football: {
        emoji: '⚽',
        positions: ['gardien', 'défenseur', 'milieu', 'attaquant'],
        workoutTypes: ['Endurance', 'Vitesse', 'Agilité', 'Technique'],
        motivationalPhrases: [
          'Chaque touche compte !',
          'Vitesse et précision !',
          'Le terrain t\'attend !',
          'Champion attitude !'
        ],
        specificExercises: ['Course d\'endurance', 'Sprints', 'Agilité', 'Frappes', 'Passes', 'Coordination']
      },
      basketball: {
        emoji: '🏀',
        positions: ['meneur', 'arrière', 'ailier', 'pivot'],
        workoutTypes: ['Détente', 'Agilité', 'Endurance', 'Précision'],
        motivationalPhrases: [
          'Shoot your shot !',
          'Défense aggressive !',
          'Chaque panier compte !',
          'Hustle and flow !'
        ],
        specificExercises: ['Sauts', 'Sprints', 'Dribbles', 'Tirs', 'Passes', 'Défense']
      },
      musculation: {
        emoji: '💪',
        positions: ['débutant', 'intermédiaire', 'avancé'],
        workoutTypes: ['Hypertrophie', 'Force', 'Endurance', 'Définition'],
        motivationalPhrases: [
          'No pain, no gain !',
          'Chaque rep compte !',
          'Build your body !',
          'Stronger every day !'
        ],
        specificExercises: ['Squat', 'Développé couché', 'Soulevé de terre', 'Tractions', 'Dips', 'Rowing']
      }
    };

    return configs[sport || 'musculation'] || configs.musculation;
  }, []);

  const smartReminders = getSmartReminders(appStoreUser, dailyStats);
  const personalizedMotivation = getPersonalizedMotivation(appStoreUser, dailyStats);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header personnalisé */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPersonalizedGreeting()}
              </h1>
              <p className="text-gray-600 mt-1">{personalizedMotivation}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Streak</p>
                <p className="text-lg font-bold text-green-600">7 jours</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Widgets de rappel intelligents */}
        {smartReminders.length > 0 && (
          <div className="mb-6 space-y-3">
            {smartReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`${reminder.color} text-white p-4 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                onClick={() => reminder.path && navigate(reminder.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <reminder.icon size={24} />
                    <div>
                      <h3 className="font-bold text-lg">{reminder.title}</h3>
                      <p className="text-sm opacity-90">{reminder.content}</p>
                    </div>
                  </div>
                  {reminder.action && (
                    <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium">{reminder.action}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Programme du jour ultra-personnalisé */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {getSportConfig(appStoreUser?.sport).emoji} Ton programme aujourd'hui
            </h2>
            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-400" size={16} />
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>

          {/* Workout personnalisé */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{dailyProgram.workout.name}</h3>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={14} />
                <span className="text-sm text-gray-500">{dailyProgram.workout.duration} min</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {dailyProgram.workout.exercises.map((exercise, index) => (
                <span
                  key={index}
                  className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                >
                  {exercise}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate('/workout')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {dailyProgram.workout.completed ? '✓ Terminé' : 'Commencer l\'entraînement'}
            </button>
          </div>

          {/* Nutrition intelligente */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Apple className="text-green-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Calories</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {dailyProgram.nutrition.calories_current} / {dailyProgram.nutrition.calories_target}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((dailyProgram.nutrition.calories_current / dailyProgram.nutrition.calories_target) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Hydratation</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(dailyProgram.hydration.current_ml / 1000 * 10) / 10}L / {Math.round(dailyProgram.hydration.target_ml / 1000 * 10) / 10}L
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(dailyProgram.hydration.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sommeil */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Moon className="text-purple-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Sommeil</span>
              </div>
              <span className="text-sm text-gray-500">
                {dailyProgram.sleep.last_night_hours.toFixed(1)}h / {dailyProgram.sleep.target_hours}h
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((dailyProgram.sleep.last_night_hours / dailyProgram.sleep.target_hours) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {dailyProgram.sleep.quality > 0 ? `${Math.round(dailyProgram.sleep.quality * 100)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat IA personnalisé */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="text-blue-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">
              {appStoreUser?.sport === 'rugby' ? 'Ton coach rugby' : 'Ton coach IA'}
            </h2>
          </div>

          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm">Ton coach réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Demande conseil à ton coach ${appStoreUser?.sport || 'fitness'}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={startListening}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={isLoading}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="text-green-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Objectifs</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {appStoreUser?.primary_goals?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Actifs</p>
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