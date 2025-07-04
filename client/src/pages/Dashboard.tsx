import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Dumbbell, 
  Apple, 
  Droplets, 
  Moon, 
  User, 
  Settings,
  Calendar,
  Target,
  Star,
  Flame,
  Heart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { appStoreUser, dailyGoals } = useAppStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Message personnalisé
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = appStoreUser?.username?.split(' ')[0] || appStoreUser?.full_name?.split(' ')[0] || 'Champion';
    
    if (hour < 12) {
      return `Bonjour ${firstName} ! 🌅`;
    } else if (hour < 18) {
      return `Salut ${firstName} ! ☀️`;
    } else {
      return `Bonsoir ${firstName} ! 🌙`;
    }
  };

  // Configuration des modules
  const moduleConfig = [
    {
      id: 'sport',
      title: 'Sport',
      icon: Dumbbell,
      color: 'bg-red-500',
      path: '/workout',
      description: 'Entraînements personnalisés',
      emoji: '🏋️'
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      icon: Apple,
      color: 'bg-green-500',
      path: '/nutrition',
      description: 'Suivi alimentaire',
      emoji: '🍎'
    },
    {
      id: 'hydration',
      title: 'Hydratation',
      icon: Droplets,
      color: 'bg-blue-500',
      path: '/hydration',
      description: 'Suivi hydrique',
      emoji: '💧'
    },
    {
      id: 'sleep',
      title: 'Sommeil',
      icon: Moon,
      color: 'bg-purple-500',
      path: '/sleep',
      description: 'Récupération',
      emoji: '😴'
    }
  ];

  // Filtrer les modules actifs
  const activeModules = moduleConfig.filter(module => 
    appStoreUser?.active_modules?.includes(module.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">MyFitHero</h1>
              <p className="text-xs text-gray-500">
                {appStoreUser?.sport || 'Votre coach personnel'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Niveau {appStoreUser?.level || 1}</p>
              <p className="text-xs text-gray-500">{appStoreUser?.totalPoints || 0} XP</p>
            </div>
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
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Message d'accueil */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl mb-6">
          <div className="flex items-center space-x-3">
            <Star size={24} className="text-yellow-300" />
            <div>
              <p className="font-semibold text-lg">{getGreeting()}</p>
              <p className="text-purple-100 text-sm">
                Prêt à atteindre tes objectifs aujourd'hui ?
              </p>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-2 text-blue-600" size={24} />
              Votre Profil
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Âge</p>
              <p className="font-bold text-gray-800">{appStoreUser?.age || '?'} ans</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Sport</p>
              <p className="font-bold text-gray-800">{appStoreUser?.sport?.replace('_', ' ') || 'Non défini'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="font-bold text-gray-800">{appStoreUser?.fitness_experience || 'Débutant'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Modules</p>
              <p className="font-bold text-gray-800">{appStoreUser?.active_modules?.length || 0}/4</p>
            </div>
          </div>

          {appStoreUser?.primary_goals && appStoreUser.primary_goals.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Vos Objectifs :</h3>
              <div className="flex flex-wrap gap-2">
                {appStoreUser.primary_goals.map((goal, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {goal.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Objectifs quotidiens */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
            <Target className="mr-2 text-green-600" size={24} />
            Objectifs du Jour
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <Dumbbell className="mx-auto mb-2 text-red-600" size={24} />
              <p className="text-sm text-gray-600">Entraînements</p>
              <p className="font-bold text-red-600">{dailyGoals.workouts}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <Apple className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-sm text-gray-600">Calories</p>
              <p className="font-bold text-green-600">{dailyGoals.calories}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Droplets className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-sm text-gray-600">Hydratation</p>
              <p className="font-bold text-blue-600">{dailyGoals.water}L</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <Moon className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="text-sm text-gray-600">Sommeil</p>
              <p className="font-bold text-purple-600">{dailyGoals.sleep}h</p>
            </div>
          </div>
        </div>

        {/* Modules actifs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Vos Modules Actifs</h2>
          
          {activeModules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucun module activé</p>
              <button 
                onClick={() => navigate('/profile')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Activer des modules
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeModules.map((module) => {
                const Icon = module.icon;
                return (
                  <div 
                    key={module.id}
                    onClick={() => navigate(module.path)}
                    className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${module.color} p-3 rounded-xl`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          {module.emoji} {module.title}
                        </h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="text-orange-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Progression</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {appStoreUser?.level || 1}
            </p>
            <p className="text-xs text-gray-500">Niveau actuel</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="text-yellow-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Points</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {appStoreUser?.totalPoints || 0}
            </p>
            <p className="text-xs text-gray-500">XP total</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="text-red-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Depuis</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {appStoreUser?.joinDate?.split(' ')[0] || 'Nouveau'}
            </p>
            <p className="text-xs text-gray-500">membre</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="text-blue-500" size={16} />
              <span className="text-sm font-medium text-gray-600">Profil</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {appStoreUser?.profile_type || 'Standard'}
            </p>
            <p className="text-xs text-gray-500">configuration</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actions Rapides</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-left"
            >
              <User className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-800">Modifier le Profil</h3>
              <p className="text-sm text-gray-600">Ajuster vos informations et modules</p>
            </button>
            
            {appStoreUser?.active_modules?.includes('sport') && (
              <button 
                onClick={() => navigate('/workout')}
                className="p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors text-left"
              >
                <Dumbbell className="text-red-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-800">Commencer l'Entraînement</h3>
                <p className="text-sm text-gray-600">Votre programme du jour</p>
              </button>
            )}
            
            {appStoreUser?.active_modules?.includes('nutrition') && (
              <button 
                onClick={() => navigate('/nutrition')}
                className="p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors text-left"
              >
                <Apple className="text-green-600 mb-2" size={24} />
                <h3 className="font-semibold text-gray-800">Logger un Repas</h3>
                <p className="text-sm text-gray-600">Suivre votre alimentation</p>
              </button>
            )}
          </div>
        </div>

        {/* Citation motivante */}
        <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-2xl text-center">
          <h3 className="font-bold text-lg mb-2">
            {appStoreUser?.primary_goals?.includes('muscle_gain') ? 
              '💪 "Les muscles se construisent dans la cuisine"' :
            appStoreUser?.primary_goals?.includes('weight_loss') ?
              '🔥 "Chaque calorie brûlée est une victoire"' :
            appStoreUser?.sport === 'basketball' ?
              '🏀 "Ball is life, dedication is everything"' :
              '⚡ "Votre seule limite, c\'est vous"'
            }
          </h3>
          <p className="text-gray-300 text-sm">
            Restez motivé et atteignez vos objectifs !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
