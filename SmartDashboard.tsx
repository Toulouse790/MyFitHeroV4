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
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore'; // Import du store Zustand
import { DailyStats, AiRecommendation, UserProfile as SupabaseUserProfileType } from '@/lib/supabase'; // Import des types Supabase
import { User as SupabaseUserAuthType } from '@supabase/supabase-js'; // Import du type User de Supabase pour userProfile

interface SmartDashboardProps {
  userProfile?: SupabaseUserAuthType; // Profil utilisateur de la session Supabase
}

// Interface pour la structure du programme quotidien affiché
interface DailyProgramDisplay {
  workout: {
    name: string;
    duration: number;
    exercises: string[];
    completed: boolean;
  };
  nutrition: {
    calories_target: number;
    calories_current: number;
    next_meal: string;
  };
  hydration: {
    target_ml: number;
    current_ml: number;
    percentage: number;
  };
  sleep: {
    target_hours: number;
    last_night_hours: number;
    quality: number;
  };
}

// Structure des messages dans le chat
interface ChatMessage {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

const SmartDashboard: React.FC<SmartDashboardProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Messages du chat
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false); // Pour la reconnaissance vocale
  const [isLoading, setIsLoading] = useState(false); // État de chargement de l'IA

  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null); // Statistiques quotidiennes de l'utilisateur
  const [loadingDailyStats, setLoadingDailyStats] = useState(true);

  // Accès aux fonctions du store Zustand
  const {
    dailyGoals, // Objectifs définis localement dans le store
    fetchDailyStats,
    fetchAiRecommendations,
    user: initialUserProfileFromStore // Le profil utilisateur local du store (pour les objectifs, niveaux, etc.)
  } = useAppStore();

  const today = new Date().toISOString().split('T')[0]; // Date du jour

  // Détermine le workout du jour selon le profil (utilisé pour l'affichage initial)
  // Déplacé ici pour être accessible par useCallback, et est lui-même stable
  const getTodayWorkout = useCallback((profile: typeof initialUserProfileFromStore) => {
    if (profile?.sport === 'rugby' && profile?.sport_position === 'pilier') {
      return 'Force Explosive - Mêlée';
    }
    if (profile?.fitness_goal === 'muscle_gain') {
      return 'Hypertrophie Haut du Corps';
    }
    return 'Entraînement Personnalisé';
  }, []); // Pas de dépendances internes car 'profile' est passé en argument

  // Exercices personnalisés selon le profil (utilisé pour l'affichage initial)
  // Déplacé ici pour être accessible par useCallback, et est lui-même stable
  const getPersonalizedExercises = useCallback((profile: typeof initialUserProfileFromStore) => {
    const sport = profile?.sport;
    const goals = profile?.primary_goals;
    
    if (sport === 'rugby') {
      return ['Squat lourd', 'Développé couché', 'Rowing barre', 'Poussée traîneau'];
    }
    if (goals && goals.includes('weight_loss')) {
      return ['HIIT 20min', 'Burpees', 'Mountain climbers', 'Planches'];
    }
    return ['Squats', 'Push-ups', 'Planches', 'Fentes'];
  }, []); // Pas de dépendances internes car 'profile' est passé en argument


  // Programme du jour basé sur le profil utilisateur et les stats réelles
  // Initialisé avec des valeurs par défaut qui seront mises à jour par dailyStats
  const [dailyProgram, setDailyProgram] = useState<DailyProgramDisplay>({
    workout: {
      name: getTodayWorkout(initialUserProfileFromStore), // Utilise la fonction getTodayWorkout
      duration: 45,
      exercises: getPersonalizedExercises(initialUserProfileFromStore), // Utilise la fonction getPersonalizedExercises
      completed: false
    },
    nutrition: {
      calories_target: initialUserProfileFromStore.goal === 'Prise de masse' ? 2500 : 2000,
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

  // === Chargement des données au démarrage ===
  const loadInitialData = useCallback(async () => {
    if (!userProfile?.id) return;

    setLoadingDailyStats(true);
    try {
      // Charger les stats journalières
      const fetchedDailyStats = await fetchDailyStats(userProfile.id, today);
      setDailyStats(fetchedDailyStats);

      if (fetchedDailyStats) {
        setDailyProgram(prev => ({
          ...prev,
          workout: {
            ...prev.workout,
            completed: (fetchedDailyStats.workouts_completed || 0) > 0,
            name: getTodayWorkout(initialUserProfileFromStore)
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

      // Charger les dernières recommandations IA
      const recentAiRecs = await fetchAiRecommendations(userProfile.id, 'general', 3); // 3 dernières recommandations générales
      if (recentAiRecs.length > 0) {
        setMessages(recentAiRecs.map((rec, index) => ({
          id: index + 1,
          type: 'ai',
          content: rec.recommendation,
          timestamp: new Date(rec.created_at)
        })));
      } else {
        // Message d'accueil par défaut si aucune recommandation récente
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: `Salut ${initialUserProfileFromStore?.name || 'Champion'} ! 🔥 Prêt à optimiser ta journée ? Demande-moi n'importe quoi sur ton bien-être.`,
            timestamp: new Date()
          }
        ]);
      }

    } catch (error) {
      console.error('Erreur chargement données dashboard:', error);
      // Fallback à un message par défaut si erreur
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: `Salut ${initialUserProfileFromStore?.name || 'Champion'} ! 🔥 Prêt à optimiser ta journée ? Demande-moi n'importe quoi sur ton bien-être.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoadingDailyStats(false);
    }
  }, [userProfile?.id, today, fetchDailyStats, fetchAiRecommendations, initialUserProfileFromStore, dailyGoals.water]); // getTodayWorkout et getPersonalizedExercises retirés des dépendances car ils sont stables

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  // Gestion des messages IA via le workflow n8n (via Supabase)
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
      // Créer une entrée dans ai_requests qui déclenchera le webhook n8n
      const { data: requestData, error: requestError } = await supabase
        .from('ai_requests')
        .insert({
          user_id: userProfile.id,
          pillar_type: detectMessageType(inputMessage),
          prompt: inputMessage,
          context: { // Contexte riche pour l'IA
            user_profile: {
              id: userProfile.id,
              username: initialUserProfileFromStore.name, // Utilise le nom d'utilisateur du store
              age: initialUserProfileFromStore.age,
              gender: initialUserProfileFromStore.gender,
              fitness_goal: initialUserProfileFromStore.goal, // Objectif principal
              primary_goals: initialUserProfileFromStore.primary_goals,
              sport: initialUserProfileFromStore.sport,
              sport_position: initialUserProfileFromStore.sport_position,
              fitness_experience: initialUserProfileFromStore.fitness_experience,
              lifestyle: initialUserProfileFromStore.lifestyle,
              available_time_per_day: initialUserProfileFromStore.available_time_per_day,
              training_frequency: initialUserProfileFromStore.training_frequency,
              season_period: initialUserProfileFromStore.season_period,
              injuries: initialUserProfileFromStore.injuries,
            },
            current_daily_stats: dailyStats, // Statistiques quotidiennes les plus récentes
            daily_program: dailyProgram, // Programme du jour affiché
            last_ai_recommendations: messages.filter(m => m.type === 'ai').map(m => m.content).slice(-3), // 3 dernières recos IA
          },
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Attendre la réponse via realtime ou polling
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: any) => { // Ajout du commentaire ESLint pour 'any'
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

      // Timeout de sécurité
      setTimeout(() => {
        if (isLoading) {
          setMessages(prev => [...prev, {
            id: messages.length + 2,
            type: 'ai',
            content: 'Désolé, le traitement prend plus de temps que prévu. Réessayez dans un moment.',
            timestamp: new Date()
          }]);
          setIsLoading(false);
          subscription.unsubscribe(); // Désabonnement même en cas de timeout
        }
      }, 30000); // 30 secondes de timeout

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

  // Détecte le type de demande pour router vers le bon agent (pour le champ pillar_type dans ai_requests)
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
    
    return 'general'; // Pour l'IA de coordination si la demande n'est pas spécifique
  };

  // Navigation entre piliers (utilisé pour les boutons du programme du jour)
  const pillarActions = [
    {
      id: 'workout',
      icon: Dumbbell,
      label: 'Sport',
      color: 'bg-red-500',
      progress: dailyProgram.workout.completed ? 100 : 0,
      action: 'Commencer workout',
      path: '/workout'
    },
    {
      id: 'nutrition',
      icon: Apple,
      label: 'Nutrition',
      color: 'bg-green-500',
      progress: Math.round((dailyProgram.nutrition.calories_current / dailyProgram.nutrition.calories_target) * 100),
      action: 'Logger repas',
      path: '/nutrition'
    },
    {
      id: 'hydration',
      icon: Droplets,
      label: 'Hydratation',
      color: 'bg-blue-500',
      progress: dailyProgram.hydration.percentage,
      action: 'Boire eau',
      path: '/hydration'
    },
    {
      id: 'sleep',
      icon: Moon,
      label: 'Sommeil',
      color: 'bg-purple-500',
      progress: Math.round((dailyProgram.sleep.last_night_hours / dailyProgram.sleep.target_hours) * 100),
      action: 'Analyser sommeil',
      path: '/sleep'
    }
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Recharger la page pour un reset complet de l'état
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compact */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Brain size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800">MyFitHero</h1>
            <p className="text-xs text-gray-500">Assistant IA Personnel</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <User size={20} />
          </button>
          <button 
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Programme du jour */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {loadingDailyStats ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto mb-4" size={24} />
              <p className="text-gray-600">Chargement du programme du jour...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Calendar className="mr-2 text-blue-600" size={24} />
                  Programme du jour
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pillarActions.map((pillar) => (
                  <div 
                    key={pillar.id} 
                    onClick={() => navigate(pillar.path)}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`${pillar.color} p-2 rounded-lg`}>
                        <pillar.icon className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{pillar.label}</h3>
                        <p className="text-xs text-gray-500">{pillar.progress}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className={`${pillar.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(pillar.progress, 100)}%` }}
                      />
                    </div>
                    <button className="text-xs text-gray-600 hover:text-gray-800 font-medium">
                      {pillar.action}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chat IA principal */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header chat */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Assistant IA Fitness</h3>
                <p className="text-sm opacity-90">Coach personnel intelligent</p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">En ligne</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input chat */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
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
                  placeholder="Demande-moi n'importe quoi sur ton fitness..."
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

            {/* Suggestions rapides */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Commencer workout', 'Mes calories du jour', 'Objectif hydratation', 'Qualité sommeil'].map((suggestion) => (
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
      </div>
    </div>
  );
};

export default SmartDashboard;