import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Target,
  TrendingUp,
  Flame,
  Star,
  Trophy,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { supabase } from '@/lib/supabase';

interface DailyGoal {
  id: string;
  title: string;
  icon: React.ElementType;
  completed: boolean;
  value?: number;
  target?: number;
  unit?: string;
  color: string;
}

interface DailyCheckInProps {
  onComplete?: (goals: DailyGoal[]) => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const { appStoreUser } = useAppStore();
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  // Initialiser les objectifs quotidiens selon le profil utilisateur
  useEffect(() => {
    const initializeGoals = () => {
      const baseGoals: DailyGoal[] = [
        {
          id: 'hydration',
          title: 'Hydratation',
          icon: Circle,
          completed: false,
          value: 0,
          target: 2500,
          unit: 'ml',
          color: 'text-blue-500'
        },
        {
          id: 'workout',
          title: 'Entraînement',
          icon: Circle,
          completed: false,
          color: 'text-red-500'
        },
        {
          id: 'nutrition',
          title: 'Nutrition',
          icon: Circle,
          completed: false,
          color: 'text-green-500'
        },
        {
          id: 'sleep',
          title: 'Sommeil',
          icon: Circle,
          completed: false,
          value: 0,
          target: 8,
          unit: 'h',
          color: 'text-purple-500'
        }
      ];

      setGoals(baseGoals);
    };

    initializeGoals();
  }, [appStoreUser]);

  const toggleGoal = async (goalId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed, icon: !goal.completed ? CheckCircle : Circle }
          : goal
      )
    );

    // Sauvegarder dans Supabase
    await saveCheckIn();
  };

  const saveCheckIn = async () => {
    if (!appStoreUser?.id) return;

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const completedGoals = goals.filter(g => g.completed).map(g => g.id);
      
      const { error } = await supabase
        .from('daily_check_ins')
        .upsert({
          user_id: appStoreUser.id,
          date: today,
          completed_goals: completedGoals,
          total_goals: goals.length,
          completion_rate: Math.round((completedGoals.length / goals.length) * 100),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur sauvegarde check-in:', error);
        return;
      }

      // Calculer la streak
      const { data: streakData } = await supabase
        .from('daily_check_ins')
        .select('date, completion_rate')
        .eq('user_id', appStoreUser.id)
        .gte('completion_rate', 75)
        .order('date', { ascending: false })
        .limit(30);

      if (streakData) {
        let currentStreak = 0;
        const today = new Date();
        
        for (const record of streakData) {
          const recordDate = new Date(record.date);
          const diffDays = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === currentStreak) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        setStreak(currentStreak);
      }

      onComplete?.(goals);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = Math.round((goals.filter(g => g.completed).length / goals.length) * 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-500" size={28} />
            Check-in Quotidien
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
            <Flame className="text-orange-500" size={20} />
            <span className="font-bold text-orange-700">{streak} jours</span>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression du jour</span>
          <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                goal.completed 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon 
                    size={24} 
                    className={`transition-colors ${
                      goal.completed ? 'text-green-500' : goal.color
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                    {goal.target && (
                      <p className="text-sm text-gray-600">
                        {goal.value || 0} / {goal.target} {goal.unit}
                      </p>
                    )}
                  </div>
                </div>
                
                {goal.completed && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">Terminé</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Récompenses */}
      {completionRate === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-600" size={24} />
            <div>
              <h3 className="font-bold text-yellow-800">Journée parfaite ! 🎉</h3>
              <p className="text-sm text-yellow-700">
                Tous vos objectifs sont atteints. Vous gagnez +50 points !
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCheckIn;
