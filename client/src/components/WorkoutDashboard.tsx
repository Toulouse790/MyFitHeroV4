// client/src/components/WorkoutDashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Calendar,
  Clock,
  Dumbbell,
  LineChart,
  Play,
  Settings,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  BarChart3,
  Timer,
  CheckCircle,
  PlusCircle,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

/* ================================================================== */
/*                           INTERFACES                               */
/* ================================================================== */

interface WorkoutSession {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  calories_burned?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  started_at?: Date;
  completed_at?: Date;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  completed?: boolean;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  avgDuration: number;
  weeklyProgress: number;
  currentStreak: number;
  favoriteExercise: string;
  strongestLift: { exercise: string; weight: number };
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  difficulty: string;
  workouts_per_week: number;
  target_muscles: string[];
  created_at: Date;
  is_active: boolean;
}

/* ================================================================== */
/*                        COMPOSANT PRINCIPAL                         */
/* ================================================================== */

export default function WorkoutDashboard() {
  /* ========================== HOOKS ET STATE ========================= */
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  /* ========================= COMPUTED VALUES ========================== */

  const tabs = useMemo(() => [
    { 
      id: 'overview', 
      label: 'Vue d\'ensemble', 
      icon: BarChart3,
      description: 'Statistiques et résumé'
    },
    { 
      id: 'session', 
      label: 'Entraînement', 
      icon: Dumbbell,
      description: 'Session en cours'
    },
    { 
      id: 'plans', 
      label: 'Plans', 
      icon: Calendar,
      description: 'Programmes d\'entraînement'
    },
    { 
      id: 'progress', 
      label: 'Progrès', 
      icon: TrendingUp,
      description: 'Suivi des performances'
    },
    { 
      id: 'history', 
      label: 'Historique', 
      icon: Clock,
      description: 'Séances passées'
    },
    { 
      id: 'settings', 
      label: 'Réglages', 
      icon: Settings,
      description: 'Configuration'
    }
  ], []);

  const progressPercentage = useMemo(() => {
    if (!workoutStats) return 0;
    const weeklyGoal = 4; // 4 workouts per week
    return Math.min(100, (workoutStats.weeklyProgress / weeklyGoal) * 100);
  }, [workoutStats]);

  /* ========================== EFFECTS ========================== */

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  /* ========================= FONCTIONS ========================= */

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les statistiques avec SQL optimisé
      const [statsResult, workoutsResult, plansResult] = await Promise.all([
        loadWorkoutStats(user.id),
        loadRecentWorkouts(user.id),
        loadWorkoutPlans(user.id)
      ]);

      setWorkoutStats(statsResult);
      setRecentWorkouts(workoutsResult);
      setWorkoutPlans(plansResult);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'entraînement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadWorkoutStats = async (userId: string): Promise<WorkoutStats> => {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id,
        duration_minutes,
        calories_burned,
        completed_at,
        exercises
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Calculs statistiques avec JavaScript optimisé
    const totalWorkouts = data.length;
    const totalMinutes = data.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const totalCalories = data.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const avgDuration = totalWorkouts > 0 ? totalMinutes / totalWorkouts : 0;
    
    // Progression hebdomadaire
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyProgress = data.filter(w => 
      new Date(w.completed_at) >= weekAgo
    ).length;

    return {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      avgDuration,
      weeklyProgress,
      currentStreak: calculateStreak(data),
      favoriteExercise: 'Développé couché', // À calculer depuis exercises
      strongestLift: { exercise: 'Squat', weight: 120 } // À calculer
    };
  };

  const loadRecentWorkouts = async (userId: string): Promise<WorkoutSession[]> => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  const loadWorkoutPlans = async (userId: string): Promise<WorkoutPlan[]> => {
    // Simulation - À adapter selon votre structure de table
    return [
      {
        id: '1',
        name: 'Force & Puissance',
        description: 'Programme de 8 semaines pour développer la force',
        duration_weeks: 8,
        difficulty: 'intermediate',
        workouts_per_week: 4,
        target_muscles: ['chest', 'back', 'legs'],
        created_at: new Date(),
        is_active: true
      }
    ];
  };

  const calculateStreak = (workouts: any[]): number => {
    // Logique de calcul de série
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasWorkout = workouts.some(w => {
        const workoutDate = new Date(w.completed_at);
        return workoutDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const startWorkoutSession = useCallback(async (workout: WorkoutSession) => {
    setCurrentSession(workout);
    setIsSessionActive(true);
    setSessionTimer(0);
    setActiveTab('session');
    
    toast({
      title: "Entraînement démarré",
      description: `${workout.name} - Bon entraînement !`,
    });
  }, [toast]);

  const endWorkoutSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_minutes: Math.floor(sessionTimer / 60)
        })
        .eq('id', currentSession.id);

      setIsSessionActive(false);
      setCurrentSession(null);
      setSessionTimer(0);
      
      await loadDashboardData(); // Recharger les stats
      
      toast({
        title: "Entraînement terminé !",
        description: `Bien joué ! ${Math.floor(sessionTimer / 60)} minutes d'effort.`,
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la session",
        variant: "destructive",
      });
    }
  }, [currentSession, sessionTimer, loadDashboardData, toast]);

  /* ========================= RENDER HELPERS ========================= */

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Entraînements</p>
                <p className="text-2xl font-bold">{workoutStats?.totalWorkouts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Minutes totales</p>
                <p className="text-2xl font-bold">{workoutStats?.totalMinutes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Calories brûlées</p>
                <p className="text-2xl font-bold">{workoutStats?.totalCalories || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Série actuelle</p>
                <p className="text-2xl font-bold">{workoutStats?.currentStreak || 0} jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression hebdomadaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-5 w-5" />
            <span>Progression cette semaine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Objectif: 4 entraînements</span>
              <span>{workoutStats?.weeklyProgress || 0}/4</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600">
              {progressPercentage >= 100 ? '🎉 Objectif atteint !' : `Plus que ${4 - (workoutStats?.weeklyProgress || 0)} séances`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Entraînements récents */}
      <Card>
        <CardHeader>
          <CardTitle>Entraînements récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkouts.slice(0, 5).map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{workout.name}</p>
                  <p className="text-sm text-gray-600">
                    {workout.duration_minutes} min • {workout.workout_type}
                  </p>
                </div>
                <Badge variant={workout.completed_at ? 'default' : 'secondary'}>
                  {workout.completed_at ? 'Terminé' : 'En cours'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSessionTab = () => (
    <div className="space-y-6">
      {isSessionActive && currentSession ? (
        // Session active
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <span>{currentSession.name}</span>
              </span>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span className="font-mono text-lg">
                  {Math.floor(sessionTimer / 60).toString().padStart(2, '0')}:
                  {(sessionTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Progression</span>
                <span>3/8 exercices</span>
              </div>
              <Progress value={37.5} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button onClick={endWorkoutSession} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer l'entraînement
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Démarrer une session
        <Card>
          <CardHeader>
            <CardTitle>Commencer un entraînement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentWorkouts.slice(0, 4).map((workout) => (
                <Button
                  key={workout.id}
                  variant="outline"
                  onClick={() => startWorkoutSession(workout)}
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                >
                  <span className="font-medium">{workout.name}</span>
                  <span className="text-sm text-gray-600">
                    {workout.duration_minutes} min • {workout.difficulty}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPlansTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plans d'entraînement</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Créer un plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workoutPlans.map((plan) => (
          <Card key={plan.id} className={plan.is_active ? 'border-blue-200 bg-blue-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                {plan.is_active && <Badge>Actif</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{plan.description}</p>
                <div className="flex justify-between text-sm">
                  <span>{plan.duration_weeks} semaines</span>
                  <span>{plan.workouts_per_week}x/semaine</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {plan.target_muscles.map((muscle) => (
                    <Badge key={muscle} variant="outline" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Suivi des progrès</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Développé couché</span>
                <span className="font-bold">85kg x 5</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Squat</span>
                <span className="font-bold">120kg x 3</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Soulevé de terre</span>
                <span className="font-bold">140kg x 1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution du poids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-gray-500">
              Graphique des performances
              {/* Ici intégrer Chart.js ou Recharts */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Historique</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {recentWorkouts.map((workout) => (
          <Card key={workout.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{workout.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{workout.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{workout.duration_minutes} min</span>
                    <span>{workout.calories_burned} cal</span>
                    <span className="capitalize">{workout.difficulty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={workout.completed_at ? 'default' : 'secondary'}>
                    {workout.completed_at ? 'Terminé' : 'En cours'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {workout.completed_at ? 
                      new Date(workout.completed_at).toLocaleDateString() : 
                      'En cours'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Réglages</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Préférences d'entraînement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Objectif hebdomadaire</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>4 entraînements</option>
                <option>3 entraînements</option>
                <option>5 entraînements</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Durée moyenne souhaitée</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option>45 minutes</option>
                <option>30 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Rappels d'entraînement</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex justify-between items-center">
              <span>Résumé hebdomadaire</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex justify-between items-center">
              <span>Nouveaux records</span>
              <input type="checkbox" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  /* ========================== RENDER PRINCIPAL ======================= */

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord Entraînement
          </h1>
          <p className="text-gray-600">
            Suivez vos progrès et gérez vos séances d'entraînement
          </p>
        </div>

        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
          <TabsContent value="session">{renderSessionTab()}</TabsContent>
          <TabsContent value="plans">{renderPlansTab()}</TabsContent>
          <TabsContent value="progress">{renderProgressTab()}</TabsContent>
          <TabsContent value="history">{renderHistoryTab()}</TabsContent>
          <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
