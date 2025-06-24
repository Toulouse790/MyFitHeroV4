
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Edit,
  Camera,
  Trophy,
  Target,
  Calendar,
  Activity,
  Heart,
  Zap,
  Award,
  ChevronRight,
  Share2,
  Download,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Crown,
  Flame,
  TrendingUp,
  Dumbbell,
  Clock,
  Droplets
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('stats');

  // === CONNEXION AU STORE ===
  const {
    user,
    achievements,
    workoutSessions,
    hydrationEntries,
    getWeeklyStats,
    updateProfile,
    resetAllData
  } = useAppStore();

  // === DONNÉES CALCULÉES ===
  const weeklyStats = getWeeklyStats();
  const totalCaloriesBurned = workoutSessions.reduce((total, w) => total + w.calories, 0);
  const averageWorkoutTime = workoutSessions.length > 0 
    ? Math.round(workoutSessions.reduce((total, w) => total + w.duration, 0) / workoutSessions.length)
    : 0;
  
  // Calcul de la série actuelle (jours consécutifs avec au moins une action)
  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      const hasActivity = 
        workoutSessions.some(w => new Date(w.date).toDateString() === dateString) ||
        hydrationEntries.some(h => new Date(h.time).toDateString() === dateString);
      
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Stats pour affichage
  const stats = [
    { 
      label: 'Workouts terminés', 
      value: workoutSessions.length, 
      icon: Dumbbell,
      color: 'text-blue-600'
    },
    { 
      label: 'Calories brûlées', 
      value: totalCaloriesBurned, 
      icon: Flame,
      color: 'text-red-600'
    },
    { 
      label: 'Temps moyen', 
      value: `${averageWorkoutTime}min`, 
      icon: Clock,
      color: 'text-green-600'
    },
    { 
      label: 'Série actuelle', 
      value: `${currentStreak} jours`, 
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Profile */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{user?.name || 'Utilisateur'}</h1>
                <p className="text-gray-600">Niveau {user?.level || 1} • {user?.level ? user.level * 100 : 0} points</p>
                <div className="flex items-center mt-2">
                  <Crown className="text-yellow-500 mr-1" size={16} />
                  <span className="text-sm text-gray-600">{achievements.length} achievements</span>
                </div>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center">
              <Edit size={16} className="mr-2" />
              Modifier
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                  <IconComponent className={`${stat.color} mx-auto mb-2`} size={24} />
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'stats', label: 'Statistiques', icon: Activity },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center p-4 transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <IconComponent size={20} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Statistiques détaillées</h3>
                
                {/* Graphique des performances (placeholder) */}
                <div className="bg-gray-50 rounded-xl p-6 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Activity size={48} className="mx-auto mb-4" />
                    <p>Graphique des performances</p>
                    <p className="text-sm">Bientôt disponible</p>
                  </div>
                </div>

                {/* Statistiques hebdomadaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 font-semibold">Cette semaine</p>
                        <p className="text-2xl font-bold text-blue-800">{weeklyStats.workouts} workouts</p>
                      </div>
                      <Dumbbell className="text-blue-600" size={32} />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 font-semibold">Hydratation</p>
                        <p className="text-2xl font-bold text-green-800">{weeklyStats.hydration}L</p>
                      </div>
                      <Droplets className="text-green-600" size={32} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Mes achievements</h3>
                
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center">
                          <div className="bg-yellow-400 text-white p-3 rounded-full mr-4">
                            <Trophy size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{achievement.title || 'Achievement'}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy size={48} className="mx-auto mb-4" />
                    <p>Aucun achievement débloqué pour le moment</p>
                    <p className="text-sm">Continuez vos efforts pour débloquer vos premiers achievements !</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Paramètres</h3>
                
                <div className="space-y-4">
                  {[
                    { icon: Bell, label: 'Notifications', action: 'Gérer' },
                    { icon: Shield, label: 'Confidentialité', action: 'Modifier' },
                    { icon: Download, label: 'Exporter mes données', action: 'Télécharger' },
                    { icon: Share2, label: 'Partager l\'app', action: 'Partager' },
                    { icon: HelpCircle, label: 'Aide & Support', action: 'Voir' },
                    { icon: LogOut, label: 'Déconnexion', action: 'Se déconnecter', danger: true }
                  ].map((setting, index) => {
                    const IconComponent = setting.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <IconComponent 
                            className={`mr-3 ${setting.danger ? 'text-red-600' : 'text-gray-600'}`} 
                            size={20} 
                          />
                          <span className={`font-medium ${setting.danger ? 'text-red-600' : 'text-gray-800'}`}>
                            {setting.label}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm mr-2 ${setting.danger ? 'text-red-600' : 'text-blue-600'}`}>
                            {setting.action}
                          </span>
                          <ChevronRight 
                            className={setting.danger ? 'text-red-600' : 'text-gray-400'} 
                            size={16} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
