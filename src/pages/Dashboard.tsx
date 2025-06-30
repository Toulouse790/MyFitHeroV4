
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  Droplets, 
  Moon, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Zap,
  Brain,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  todayWorkouts: number;
  todayCalories: number;
  todayHydration: number;
  todaySleep: number;
  weeklyProgress: number;
  currentStreak: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayWorkouts: 0,
    todayCalories: 1250,
    todayHydration: 1500,
    todaySleep: 7.5,
    weeklyProgress: 78,
    currentStreak: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Simuler le chargement des données
        setTimeout(() => {
          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const quickActions = [
    {
      icon: Dumbbell,
      label: 'Workout',
      color: 'bg-red-500',
      path: '/workout',
      progress: 60
    },
    {
      icon: Apple,
      label: 'Nutrition',
      color: 'bg-green-500',
      path: '/nutrition',
      progress: 45
    },
    {
      icon: Droplets,
      label: 'Hydratation',
      color: 'bg-blue-500',
      path: '/hydration',
      progress: 75
    },
    {
      icon: Moon,
      label: 'Sommeil',
      color: 'bg-purple-500',
      path: '/sleep',
      progress: 85
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre progression aujourd'hui
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Dumbbell className="text-red-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {stats.todayWorkouts}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Workouts aujourd'hui
            </h3>
            <p className="text-xs text-green-600">+2 cette semaine</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Apple className="text-green-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {stats.todayCalories}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Calories consommées
            </h3>
            <p className="text-xs text-blue-600">Objectif: 2000 kcal</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Droplets className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {stats.todayHydration}ml
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Hydratation
            </h3>
            <p className="text-xs text-blue-600">Objectif: 2000ml</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Moon className="text-purple-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {stats.todaySleep}h
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Sommeil (hier)
            </h3>
            <p className="text-xs text-green-600">Qualité: Excellente</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Zap className="mr-2 text-yellow-500" size={24} />
              Actions rapides
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md"
                >
                  <div className={`${action.color} p-3 rounded-full w-fit mx-auto mb-3`}>
                    <action.icon className="text-white" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">
                    {action.label}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${action.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${action.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.progress}% complété
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="mr-2 text-green-500" size={24} />
              Progression hebdomadaire
            </h2>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.weeklyProgress / 100)}`}
                    className="text-blue-600 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {stats.weeklyProgress}%
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-2">
                Objectifs hebdomadaires atteints
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Award className="mr-1 text-yellow-500" size={16} />
                  Série: {stats.currentStreak} jours
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assistant IA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <Brain className="mr-2" size={24} />
                Assistant IA Personnel
              </h2>
              <p className="text-blue-100 mb-4">
                Prêt à optimiser votre journée ? Demandez-moi des conseils personnalisés !
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                Commencer la conversation
              </button>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Brain size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
