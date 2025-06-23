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
  Plus
} from 'lucide-react';

const Dashboard = () => {
  // Données mockées (plus tard on les récupérera d'une API/store)
  const stats = {
    steps: { current: 8420, goal: 10000, unit: 'pas' },
    calories: { current: 1850, goal: 2200, unit: 'kcal' },
    workouts: { current: 3, goal: 5, unit: 'séances' },
    water: { current: 1.8, goal: 2.5, unit: 'L' },
    sleep: { current: 7.2, goal: 8, unit: 'h' }
  };

  const recentWorkouts = [
    { name: 'Push Day', duration: '45min', calories: 320, date: 'Aujourd\'hui' },
    { name: 'Cardio HIIT', duration: '25min', calories: 280, date: 'Hier' },
    { name: 'Pull Day', duration: '50min', calories: 350, date: 'Il y a 2 jours' }
  ];

  const achievements = [
    { title: 'Semaine parfaite', description: '7 jours d\'entraînement', icon: '🔥', date: 'Il y a 2 jours' },
    { title: 'Hydratation Pro', description: 'Objectif eau atteint 5 jours', icon: '💧', date: 'Il y a 3 jours' },
    { title: 'Lève-tôt', description: 'Workout matinal', icon: '🌅', date: 'Il y a 5 jours' }
  ];

  const StatCard = ({ title, icon: Icon, current, goal, unit, color, bgColor }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    
    return (
      <div className={`${bgColor} p-4 rounded-xl shadow-sm border border-white/20`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg bg-white/20`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className="text-white/80 text-sm">{percentage.toFixed(0)}%</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <div className="flex items-baseline space-x-1">
            <span className="text-white text-xl font-bold">{current.toLocaleString()}</span>
            <span className="text-white/70 text-sm">/ {goal.toLocaleString()} {unit}</span>
          </div>
          
          {/* Barre de progression */}
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

  const QuickAction = ({ title, icon: Icon, color, onClick }) => (
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
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Bonjour ! Voici votre progression aujourd'hui</p>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Calendar size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Statistiques principales */}
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

        {/* Actions rapides */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Target size={20} className="mr-2 text-fitness-energy" />
            Actions rapides
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <QuickAction
              title="Nouveau workout"
              icon={Plus}
              color="bg-fitness-energy"
              onClick={() => console.log('Nouveau workout')}
            />
            <QuickAction
              title="Log repas"
              icon={Plus}
              color="bg-fitness-growth"
              onClick={() => console.log('Log repas')}
            />
            <QuickAction
              title="Ajouter eau"
              icon={Droplets}
              color="bg-fitness-hydration"
              onClick={() => console.log('Ajouter eau')}
            />
          </div>
        </div>

        {/* Workouts récents */}
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

        {/* Achievements récents */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Award size={20} className="mr-2 text-fitness-motivation" />
            Achievements récents
          </h2>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
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

        {/* Espace pour la bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Dashboard;
