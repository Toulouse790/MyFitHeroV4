import React, { useState, useEffect } from 'react';
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
  Fire
} from 'lucide-react';

interface SmartDashboardProps {
  userProfile: any;
}

interface DailyProgram {
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

const SmartDashboard: React.FC<SmartDashboardProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Salut ${userProfile?.username || 'Champion'} ! 🔥 Prêt pour ta séance de ${getTodayWorkout()} ? J'ai adapté ton programme selon tes dernières performances.`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Programme du jour basé sur le profil utilisateur
  const dailyProgram: DailyProgram = {
    workout: {
      name: getTodayWorkout(),
      duration: 45,
      exercises: getPersonalizedExercises(),
      completed: false
    },
    nutrition: {
      calories_target: 2200,
      calories_current: 1450,
      next_meal: "Collation protéinée (16h)"
    },
    hydration: {
      target_ml: 2500,
      current_ml: 1200,
      percentage: 48
    },
    sleep: {
      target_hours: 8,
      last_night_hours: 7.5,
      quality: 4
    }
  };

  // Détermine le workout du jour selon le profil
  function getTodayWorkout() {
    if (userProfile?.sport === 'rugby' && userProfile?.sport_position === 'pilier') {
      return 'Force Explosive - Mêlée';
    }
    if (userProfile?.fitness_goal === 'muscle_gain') {
      return 'Hypertrophie Haut du Corps';
    }
    return 'Entraînement Personnalisé';
  }

  // Exercices personnalisés selon le profil
  function getPersonalizedExercises() {
    const sport = userProfile?.sport;
    const goal = userProfile?.primary_goals?.[0];
    
    if (sport === 'rugby') {
      return ['Squat lourd', 'Développé couché', 'Rowing barre', 'Poussée traîneau'];
    }
    if (goal === 'weight_loss') {
      return ['HIIT 20min', 'Burpees', 'Mountain climbers', 'Planches'];
    }
    return ['Squats', 'Push-ups', 'Planches', 'Fentes'];
  }

  // Configuration de l'API n8n (à ajuster avec ton URL)
  const N8N_WEBHOOK_URL = 'https://ton-n8n.app/webhook/89a7eb7b-c4d4-4461-aa1a-cd1214ad0d30';

  // Gestion des messages IA via ton workflow n8n
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Appel à ton workflow n8n
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userProfile?.id || 'anonymous',
          message: inputMessage,
          type_demande: detectMessageType(inputMessage),
          statut: 'en_attente'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur réseau');
      }

      const data = await response.json();
      
      // Attendre la réponse du workflow (tu peux implémenter un polling ou websocket)
      setTimeout(async () => {
        const aiResponse = await getAIResponse(userMessage.id);
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Désolé, je rencontre un problème technique. Réessayez dans un moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Détecte le type de demande pour router vers le bon agent
  const detectMessageType = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('workout') || lowerMessage.includes('musculation') || lowerMessage.includes('exercice')) {
      return 'sport';
    }
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('manger') || lowerMessage.includes('calories')) {
      return 'nutrition';
    }
    if (lowerMessage.includes('sommeil') || lowerMessage.includes('dormir') || lowerMessage.includes('repos')) {
      return 'sommeil';
    }
    if (lowerMessage.includes('eau') || lowerMessage.includes('hydratation') || lowerMessage.includes('boire')) {
      return 'hydratation';
    }
    
    return 'general'; // Pour l'IA de coordination
  };

  // Récupère la réponse IA depuis Supabase (générée par ton workflow)
  const getAIResponse = async (messageId: number) => {
    try {
      // Simulation - remplace par une vraie requête à ta table recommendations
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data[0]) {
        return {
          id: messageId + 1,
          type: 'ai',
          content: data[0].content,
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Erreur récupération IA:', error);
    }

    // Fallback
    return {
      id: messageId + 1,
      type: 'ai',
      content: "Je réfléchis à votre demande... 🤔",
      timestamp: new Date()
    };
  };

  // Navigation entre piliers
  const pillarActions = [
    {
      id: 'workout',
      icon: Dumbbell,
      label: 'Sport',
      color: 'bg-red-500',
      progress: dailyProgram.workout.completed ? 100 : 0,
      action: 'Commencer workout'
    },
    {
      id: 'nutrition',
      icon: Apple,
      label: 'Nutrition',
      color: 'bg-green-500',
      progress: Math.round((dailyProgram.nutrition.calories_current / dailyProgram.nutrition.calories_target) * 100),
      action: 'Logger repas'
    },
    {
      id: 'hydration',
      icon: Droplets,
      label: 'Hydratation',
      color: 'bg-blue-500',
      progress: dailyProgram.hydration.percentage,
      action: 'Boire eau'
    },
    {
      id: 'sleep',
      icon: Moon,
      label: 'Sommeil',
      color: 'bg-purple-500',
      progress: Math.round((dailyProgram.sleep.last_night_hours / dailyProgram.sleep.target_hours) * 100),
      action: 'Analyser sommeil'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compact */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={16} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">MyFitHero</h1>
              <p className="text-xs text-gray-500">Assistant IA Personnel</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <User size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Programme du jour */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-2 text-blue-600" size={24} />
              Programme du jour
            </h2>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pillarActions.map((pillar) => (
              <div key={pillar.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
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
                    style={{ width: `${pillar.progress}%` }}
                  />
                </div>
                <button className="text-xs text-gray-600 hover:text-gray-800 font-medium">
                  {pillar.action}
                </button>
              </div>
            ))}
          </div>
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
