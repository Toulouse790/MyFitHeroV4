import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Calendar,
  Target,
  Zap,
  Dumbbell,
  Apple,
  Moon,
  Droplets,
  Loader2,
  Flame,
  Heart,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAppStore } from '@/stores/useAppStore';

interface SmartDashboardProps {
  userProfile?: any;
}

interface ChatMessage {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
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

  const {
    dailyGoals,
    appStoreUser
  } = useAppStore();

  // ===== FONCTIONS DE PERSONNALISATION =====

  const getPersonalizedGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const user = appStoreUser;
    const firstName = user?.username?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Champion';
    
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

  const getPersonalizedWorkout = useCallback((profile: any) => {
    if (!profile) return 'Entraînement Général';
    
    const day = new Date().getDay();
    
    if (profile.sport === 'rugby') {
      if (profile.sport_position === 'pilier') {
        if ([1, 3, 5].includes(day)) {
          return '🏉 Force Explosive - Mêlée';
        } else if ([2, 4].includes(day)) {
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
    
    if (profile.primary_goals?.includes('muscle_gain')) {
      const workouts = ['💪 Hypertrophie Pectoraux', '🎯 Dos & Largeur', '🦵 Leg Day Intense', '🔥 Bras & Épaules'];
      return workouts[day % workouts.length];
    }
    
    if (profile.primary_goals?.includes('weight_loss')) {
      const workouts = ['🔥 HIIT Cardio', '⚡ Métabolique Intense', '🏃 Circuit Training', '💥 Tabata Express'];
      return workouts[day % workouts.length];
    }
    
    return 'Entraînement Personnalisé';
  }, []);

  const getPersonalizedExercises = useCallback((profile: any) => {
    if (!profile) return ['Squats', 'Push-ups', 'Planches', 'Fentes'];
    
    if (profile.sport === 'rugby' && profile.sport_position === 'pilier') {
      return ['Squat lourd 5x3', 'Développé couché 4x6', 'Rowing barre 4x8', 'Poussée traîneau 3x20m'];
    }
    
    if (profile.sport === 'rugby' && profile.sport_position?.includes('arrière')) {
      return ['Sprint 40m x6', 'Pliométrie', 'Agilité échelle', 'Récupération ballon'];
    }
    
    if (profile.primary_goals?.includes('weight_loss')) {
      return ['HIIT 20min', 'Burpees 4x15', 'Mountain climbers 3x30s', 'Jump squats 4x12'];
    }
    
    if (profile.primary_goals?.includes('muscle_gain')) {
      return ['Squat 4x8', 'Développé 4x10', 'Tractions 4x8', 'Dips 3x12'];
    }
    
    return ['Squats', 'Push-ups', 'Planches', 'Fentes'];
  }, []);

  const getSmartReminders = useCallback((profile: any) => {
    const reminders: PersonalizedWidget[] = [];
    const firstName = profile?.username?.split(' ')[0] || 'Champion';
    
    // Workout reminder
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

    // Hydration reminder
    reminders.push({
      id: 'hydration',
      title: '💧 Hydrate-toi !',
      content: `${firstName}, pense à boire régulièrement !`,
      icon: Droplets,
      color: 'bg-cyan-500',
      priority: 'medium',
      action: 'Boire',
      path: '/hydration'
    });
    
    return reminders.slice(0, 2);
  }, []);

  const getPersonalizedMotivation = useCallback((profile: any) => {
    const firstName = profile?.username?.split(' ')[0] || 'Champion';
    
    if (profile?.sport === 'rugby') {
      return `🏉 ${firstName}, encore un workout de warrior ! La mêlée sera à toi !`;
    } else if (profile?.primary_goals?.includes('weight_loss')) {
      return `🎯 ${firstName}, tu contrôles ton alimentation comme un pro !`;
    } else {
      const hour = new Date().getHours();
      if (hour < 12) {
        return `💪 ${firstName}, prêt à transformer cette journée en victoire ?`;
      } else {
        return `🌟 ${firstName}, continue comme ça, tu es sur la bonne voie !`;
      }
    }
  }, []);

  // ===== CHAT IA =====

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

    // Simulation d'une réponse IA personnalisée
    setTimeout(() => {
      const firstName = appStoreUser?.username?.split(' ')[0] || 'Champion';
      let aiResponseContent = `Hey ${firstName} ! `;
      
      if (message.toLowerCase().includes('workout') || message.toLowerCase().includes('entrainement')) {
        aiResponseContent += appStoreUser?.sport === 'rugby' 
          ? `Parfait pour un guerrier du rugby ! Ton programme de ${getPersonalizedWorkout(appStoreUser)} va te préparer pour dominer la mêlée ! 🏉💪`
          : `Ton programme du jour est ${getPersonalizedWorkout(appStoreUser)}. Tu vas tout déchirer ! 💪`;
      } else if (message.toLowerCase().includes('nutrition') || message.toLowerCase().includes('manger')) {
        aiResponseContent += `Pour tes objectifs${appStoreUser?.primary_goals?.includes('muscle_gain') ? ' de prise de masse' : appStoreUser?.primary_goals?.includes('weight_loss') ? ' de perte de poids' : ''}, je recommande de suivre ton plan nutrition. Tu es sur la bonne voie ! 🍎`;
      } else if (message.toLowerCase().includes('hydrat')) {
        aiResponseContent += `L'hydratation est cruciale${appStoreUser?.sport ? ` pour un athlète de ${appStoreUser.sport}` : ''} ! Assure-toi de boire régulièrement. 💧`;
      } else {
        aiResponseContent += `Je suis là pour t'accompagner${appStoreUser?.sport ? ` dans ta préparation ${appStoreUser.sport}` : ' dans tes objectifs fitness'} ! Continue comme ça, tu es unstoppable ! 🔥`;
      }
      
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  }, [isLoading, appStoreUser, getPersonalizedWorkout]);

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

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    }
  }, []);

  const smartReminders = getSmartReminders(appStoreUser);
  const personalizedMotivation = getPersonalizedMotivation(appStoreUser);
  const workoutName = getPersonalizedWorkout(appStoreUser);
  const exercises = getPersonalizedExercises(appStoreUser);

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

        {/* Programme du jour */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {appStoreUser?.sport === 'rugby' ? '🏉' : '💪'} Ton programme aujourd'hui
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
              <h3 className="font-semibold text-gray-900">{workoutName}</h3>
              <span className="text-sm text-gray-500">45 min</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {exercises.map((exercise, index) => (
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
              Commencer l'entraînement
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Apple className="text-green-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Calories</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                0 / {dailyGoals.calories}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Eau</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                0L / {dailyGoals.water}L
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="text-purple-600" size={16} />
                <span className="text-sm font-medium text-gray-700">Sommeil</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {dailyGoals.sleep}h
              </p>
            </div>
          </div>
        </div>

        {/* Chat IA personnalisé */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
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