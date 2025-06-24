import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Play, 
  Pause, 
  Square, 
  Timer, 
  Target, 
  TrendingUp,
  Users,
  User,
  Activity,
  Brain,
  Zap,
  Award,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Search,
  Heart,
  Flame
} from 'lucide-react';

// Types pour l'architecture multi-sports
interface SportProfile {
  sport: string;
  position?: string;
  level: 'amateur' | 'semi_pro' | 'professional';
  experience_years: number;
  training_frequency: number; // fois par semaine
}

interface WorkoutRecommendation {
  id: string;
  title: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sport_specific' | 'recovery';
  duration_minutes: number;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  target_muscles: string[];
  sport_relevance: number; // 0-100%
  recovery_time_hours: number;
  ai_reasoning: string;
}

interface TrainingLoad {
  current_load: number;
  optimal_range: [number, number];
  fatigue_level: 'low' | 'moderate' | 'high' | 'critical';
  recovery_recommendation: string;
}

const WorkoutPage: React.FC = () => {
  // États pour la logique workout
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRecommendation | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [userLevel, setUserLevel] = useState<string>('amateur');
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  
  // Données de démonstration (sera remplacé par l'IA)
  const sportsData = {
    'rugby': {
      positions: ['Pilier', 'Talonneur', 'Deuxième ligne', 'Troisième ligne', 'Mêlée', 'Ouverture', 'Centre', 'Ailier', 'Arrière'],
      focus: ['Force', 'Puissance', 'Endurance', 'Contact', 'Agilité']
    },
    'football': {
      positions: ['Gardien', 'Défenseur central', 'Latéral', 'Milieu défensif', 'Milieu offensif', 'Ailier', 'Attaquant'],
      focus: ['Endurance', 'Vitesse', 'Technique', 'Détente', 'Agilité']
    },
    'basketball': {
      positions: ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'],
      focus: ['Détente', 'Vitesse', 'Agilité', 'Endurance', 'Force']
    },
    'tennis': {
      positions: ['Simple', 'Double'],
      focus: ['Explosivité', 'Endurance', 'Agilité', 'Force du core', 'Flexibilité']
    },
    'natation': {
      positions: ['Nage libre', 'Brasse', 'Dos crawlé', 'Papillon', 'Quatre nages'],
      focus: ['Endurance cardiovasculaire', 'Force du haut du corps', 'Technique', 'Flexibilité']
    },
    'musculation': {
      positions: ['Général', 'Powerlifting', 'Bodybuilding', 'CrossFit'],
      focus: ['Force', 'Hypertrophie', 'Puissance', 'Endurance musculaire']
    }
  };

  // Simulation de charge d'entraînement
  const trainingLoad: TrainingLoad = {
    current_load: 75,
    optimal_range: [65, 85],
    fatigue_level: 'moderate',
    recovery_recommendation: 'Séance de récupération active recommandée demain'
  };

  // Recommandations IA simulées
  const mockRecommendations: WorkoutRecommendation[] = [
    {
      id: '1',
      title: 'Force Explosive - Spécial Rugby Pilier',
      type: 'strength',
      duration_minutes: 45,
      intensity: 'high',
      target_muscles: ['quadriceps', 'ischio', 'dorsaux', 'trapèzes'],
      sport_relevance: 95,
      recovery_time_hours: 48,
      ai_reasoning: 'Optimisé pour la mêlée et les touches. Focus sur la puissance du bas du corps et la stabilité du tronc.'
    },
    {
      id: '2',
      title: 'Cardio Intervalle - Endurance Match',
      type: 'cardio',
      duration_minutes: 30,
      intensity: 'very_high',
      target_muscles: ['cardiovasculaire'],
      sport_relevance: 90,
      recovery_time_hours: 24,
      ai_reasoning: 'Simulation des efforts répétés en match. Améliore la capacité à répéter des efforts intenses.'
    },
    {
      id: '3',
      title: 'Récupération Active - Mobilité',
      type: 'recovery',
      duration_minutes: 25,
      intensity: 'low',
      target_muscles: ['tout le corps'],
      sport_relevance: 80,
      recovery_time_hours: 0,
      ai_reasoning: 'Favorise la récupération musculaire et prévient les blessures. Recommandé après vos séances intensives.'
    }
  ];

  // Simulation timer workout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  // Formatage du temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = (workout: WorkoutRecommendation) => {
    setActiveWorkout(workout);
    setIsWorkoutActive(true);
    setWorkoutTimer(0);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(!isWorkoutActive);
  };

  const stopWorkout = () => {
    setIsWorkoutActive(false);
    setWorkoutTimer(0);
    setActiveWorkout(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec profil sportif */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Dumbbell className="mr-3 text-blue-600" size={28} />
                Espace Sport & Entraînement
              </h1>
              <p className="text-gray-600 mt-1">IA multi-sports adaptée à votre profil</p>
            </div>
            
            {/* Indicateur de charge d'entraînement */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Activity className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Charge d'entraînement</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          trainingLoad.fatigue_level === 'low' ? 'bg-green-500' :
                          trainingLoad.fatigue_level === 'moderate' ? 'bg-yellow-500' :
                          trainingLoad.fatigue_level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${trainingLoad.current_load}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{trainingLoad.current_load}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Configuration du profil sportif */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profil sportif */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Target className="mr-2 text-blue-600" size={20} />
              Profil Sportif
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sport principal</label>
                <select 
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un sport</option>
                  {Object.keys(sportsData).map(sport => (
                    <option key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSport && sportsData[selectedSport as keyof typeof sportsData] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Spécialité</label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Sélectionner un poste</option>
                    {sportsData[selectedSport as keyof typeof sportsData].positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                <select 
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="amateur">Amateur</option>
                  <option value="semi_pro">Semi-professionnel</option>
                  <option value="professional">Professionnel</option>
                </select>
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Brain className="mr-2" size={18} />
              Mettre à jour l'IA
            </button>
          </div>

          {/* Workout actuel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Timer className="mr-2 text-green-600" size={20} />
              Séance en cours
            </h3>

            {activeWorkout ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{activeWorkout.title}</h4>
                  <p className="text-sm text-gray-600">{activeWorkout.ai_reasoning}</p>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatTime(workoutTimer)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Durée prévue: {activeWorkout.duration_minutes}min
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={pauseWorkout}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center ${
                      isWorkoutActive 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isWorkoutActive ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={stopWorkout}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                  >
                    <Square size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>Aucune séance en cours</p>
                <p className="text-sm">Sélectionnez une recommandation ci-dessous</p>
              </div>
            )}
          </div>

          {/* Stats rapides */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="mr-2 text-purple-600" size={20} />
              Cette semaine
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Séances</span>
                <span className="font-semibold text-gray-800">3/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Temps total</span>
                <span className="font-semibold text-gray-800">2h 45min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Calories</span>
                <span className="font-semibold text-gray-800">1,240</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Récupération</span>
                <span className="font-semibold text-green-600">Optimale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations IA */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Brain className="mr-3 text-purple-600" size={24} />
                Recommandations IA Personnalisées
              </h2>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Filter size={16} />
                  <span>Filtrer</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus size={16} />
                  <span>Nouvelle séance</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{recommendation.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>{recommendation.duration_minutes} min</span>
                        <div className={`w-2 h-2 rounded-full ${
                          recommendation.intensity === 'low' ? 'bg-green-400' :
                          recommendation.intensity === 'moderate' ? 'bg-yellow-400' :
                          recommendation.intensity === 'high' ? 'bg-orange-400' : 'bg-red-400'
                        }`} />
                        <span className="capitalize">{recommendation.intensity.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="text-yellow-500" size={16} />
                      <span className="text-sm font-semibold text-gray-700">{recommendation.sport_relevance}%</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {recommendation.ai_reasoning}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Heart size={12} />
                      <span>Récup: {recommendation.recovery_time_hours}h</span>
                    </div>
                    <button
                      onClick={() => startWorkout(recommendation)}
                      disabled={!!activeWorkout}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                        activeWorkout 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Play size={16} />
                      <span>Commencer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerte récupération si nécessaire */}
        {trainingLoad.fatigue_level === 'high' && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Zap className="text-orange-600" size={20} />
              <div>
                <h4 className="font-semibold text-orange-800">Attention à la récupération</h4>
                <p className="text-sm text-orange-700">{trainingLoad.recovery_recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPage;
