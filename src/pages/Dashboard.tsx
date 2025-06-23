import React from 'react';
import { 
  Activity, 
  Flame, 
  Dumbbell, 
  Droplets, 
  Moon, 
  TrendingUp,
  Target,
  Calendar,
  Award,
  ChevronRight,
  Plus,
  Heart,
  Coffee
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const Dashboard = () => {
  // === CONNEXION AU STORE ===
  const {
    user,
    dailyGoals,
    hydrationEntries,
    workoutSessions,
    achievements,
    getTodayHydration,
    getTodayCalories,
    getTodayWorkouts,
    getWeeklyStats,
    addWorkout,
    addHydration
  } = useAppStore();

  // === DONNÉES EN TEMPS RÉEL ===
  const todayHydration = getTodayHydration();
  const todayCalories = getTodayCalories();
  const todayWorkouts = getTodayWorkouts();
  const weeklyStats = getWeeklyStats();

  // Statistiques avec vraies données
  const stats = {
    steps: { current: 8420, goal: 10000, unit: 'pas' }, // Mock pour l'instant
    calories: { current: todayCalories, goal: dailyGoals.calories, unit: 'kcal' },
    workouts: { current: todayWorkouts, goal: dailyGoals.workouts, unit: 'séances' },
    water: { current: todayHydration, goal: dailyGoals.water, unit: 'L' }
  };

  // Workouts récents (vraies données)
  const recentWorkouts = workoutSessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(workout => ({
      name: workout.name,
      duration: `${workout.duration}min`,
      calories: workout.calories,
      date: formatDate(workout.date)
    }));

  // Achievements débloqués récemment
  const recentAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlockedDate || 0).getTime() - new Date(a.unlockedDate || 0).getTime())
    .slice(0, 3)
    .map(achievement => ({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.emoji,
      date: achievement.unlockedDate ? formatDate(achievement.unlockedDate) : 'Récemment'
    }));

  // === FONCTIONS UTILITAIRES ===
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return `Il y a ${Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} jours`;
    }
  };

  const formatNumber = (num: number): string => {
    return (Math.round(num * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
  };

  // === ACTIONS RAPIDES ===
  const handleQuickWorkout = () => {
    addWorkout({
      name: 'Workout Express',
      duration: 30,
      calories: 250,
      exercises: 5,
      date: new Date().toISOString()
    });
  };

  const handleQuickWater = () => {
    addHydration(250);
  };

  const StatCard = ({ title, icon: Icon, current, goal, unit, color, bgColor }: any) => {
    const percentage = Math.min((current / goal) * 100, 100);
    
    return (
      <div className={`${bgColor} p-4 rounded-xl shadow-sm border border-white/20`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg bg-white/20`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className="text-white/80 text-sm">{Math.round(percentage)}%</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <div className="flex items-baseline space-x-1">
            <span className="text-white text-xl font-bold">
              {typeof current === 'number' && unit === 'L' ? formatNumber(current) : current.toLocaleString()}
            </span>
            <span className="text-white/70 text-sm">/ {goal.toLocaleString()} {unit}</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const QuickAction = ({ title, icon: Icon, color, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105"
    >
      <div className={`p-3 rounded-full ${color} mb-2`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-gray-700 font-medium text-sm text-center">{title}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        
        {/* Header avec vraies données utilisateur */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Salut {user.name} ! Niveau {user.level} • {user.totalPoints} XP
            </p>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Calendar size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Statistiques principales - DONNÉES RÉELLES */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <TrendingUp size={20} className="mr-2 text-fitness-hydration" />
            Statistiques du jour
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Pas"
              icon={Activity}
              current={stats.steps.current}
              goal={stats.steps.goal}
              unit={stats.steps.unit}
              color="text-fitness-energy"
              bgColor="bg-gradient-energy"
            />
            <StatCard
              title="Calories"
              icon={Flame}
              current={stats.calories.current}
              goal={stats.calories.goal}
              unit={stats.calories.unit}
              color="text-fitness-motivation"
              bgColor="bg-gradient-motivation"
            />
            <StatCard
              title="Entraînements"
              icon={Dumbbell}
              current={stats.workouts.current}
              goal={stats.workouts.goal}
              unit={stats.workouts.unit}
              color="text-fitness-growth"
              bgColor="bg-gradient-growth"
            />
            <StatCard
              title="Hydratation"
              icon={Droplets}
              current={stats.water.current}
              goal={stats.water.goal}
              unit={stats.water.unit}
              color="text-fitness-hydration"
              bgColor="bg-gradient-hydration"
            />
          </div>
        </div>

        {/* Actions rapides - FONCTIONNELLES */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Target size={20} className="mr-2 text-fitness-energy" />
            Actions rapides
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <QuickAction
              title="Workout 30min"
              icon={Plus}
              color="bg-fitness-energy"
              onClick={handleQuickWorkout}
            />
            <QuickAction
              title="Eau 250ml"
              icon={Droplets}
              color="bg-fitness-hydration"
              onClick={handleQuickWater}
            />
            <QuickAction
              title="Log repas"
              icon={Plus}
              color="bg-fitness-growth"
              onClick={() => console.log('Log repas')}
            />
          </div>
        </div>

        {/* Stats hebdomadaires - VRAIES DONNÉES */}
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Cette semaine</h3>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{weeklyStats.workouts}</div>
              <div className="text-gray-600 text-sm">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{Math.round(weeklyStats.totalDuration)}min</div>
              <div className="text-gray-600 text-sm">Temps total</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              🔥 {weeklyStats.totalCalories} kcal brûlées
            </div>
            <div className="text-sm text-gray-600">
              💧 {formatNumber(weeklyStats.avgHydration)}L/jour moy.
            </div>
          </div>
        </div>

        {/* Workouts récents - VRAIES DONNÉES */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Dumbbell size={20} className="mr-2 text-fitness-energy" />
                Entraînements récents
              </h2>
              <button className="text-fitness-energy text-sm font-medium flex items-center">
                Voir tout <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-fitness-energy/10 rounded-lg">
                        <Dumbbell size={16} className="text-fitness-energy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{workout.name}</h3>
                        <p className="text-gray-600 text-sm">{workout.duration} • {workout.calories} kcal</p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">{workout.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements récents - VRAIES DONNÉES */}
        {recentAchievements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Award size={20} className="mr-2 text-fitness-motivation" />
              Achievements récents
            </h2>
            
            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                      <p className="text-gray-600 text-sm">{achievement.description}</p>
                    </div>
                    <span className="text-gray-500 text-xs">{achievement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message si pas de données */}
        {recentWorkouts.length === 0 && recentAchievements.length === 0 && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-semibold text-blue-800 mb-2">Commencez votre aventure !</h3>
            <p className="text-blue-700 text-sm mb-4">
              Ajoutez de l'eau, faites un workout ou loggez un repas pour voir vos progrès ici.
            </p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={handleQuickWater}
                className="bg-fitness-hydration text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                💧 Boire 250ml
              </button>
              <button 
                onClick={handleQuickWorkout}
                className="bg-fitness-energy text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🏋️ Workout express
              </button>
            </div>
          </div>
        )}

        {/* Debug info */}
        <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600">
          <p>
            🔧 Debug: {hydrationEntries.length} entrées eau • {workoutSessions.length} workouts • 
            {achievements.filter(a => a.unlocked).length}/{achievements.length} achievements
          </p>
        </div>

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Dashboard;
