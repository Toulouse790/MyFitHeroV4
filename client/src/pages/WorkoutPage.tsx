import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  MoreHorizontal,
  Activity,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Watch
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWearableSync } from '@/hooks/useWearableSync';
import WearableStats from '@/components/WearableStats';

const WorkoutPage: React.FC = () => {
  const { 
    currentSession, 
    isSessionActive, 
    startSession, 
    pauseSession, 
    resumeSession, 
    completeSession,
    updateExerciseSet,
    completeExercise,
    loadExercisesFromLastSession
  } = useWorkoutSession();
  
  const { syncAll, isAppleHealthAvailable } = useWearableSync();
  const [selectedTab, setSelectedTab] = useState('workout');
  const [sessionTimer, setSessionTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const handleStartWorkout = () => {
    startSession("Mon Entraînement", 60);
    // Synchroniser avec les wearables au début
    if (isAppleHealthAvailable) {
      syncAll();
    }
  };

  const handleStopWorkout = () => {
    completeSession();
    setSessionTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (!currentSession?.exercises?.length) return 0;
    const completed = currentSession.exercises.filter(ex => ex.completed).length;
    return (completed / currentSession.exercises.length) * 100;
  };

  const getSessionStats = () => {
    if (!currentSession) return null;
    
    const totalSets = currentSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = currentSession.exercises.reduce((acc, ex) => 
      acc + ex.sets.filter(set => set.completed).length, 0
    );
    const totalWeight = currentSession.exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight || 0) * (set.reps || 0), 0), 0
    );
    
    return {
      totalSets,
      completedSets,
      totalWeight,
      exercisesCompleted: currentSession.exercises.filter(ex => ex.completed).length,
      totalExercises: currentSession.exercises.length
    };
  };

  const stats = getSessionStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statut de session */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Entraînement</h1>
              {isSessionActive && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Session active</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-mono">{formatTime(sessionTimer)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isAppleHealthAvailable && (
                <Badge variant="outline" className="text-blue-600">
                  <Watch size={12} className="mr-1" />
                  Apple Health
                </Badge>
              )}
              
              {!isSessionActive ? (
                <Button onClick={handleStartWorkout} className="bg-blue-600 hover:bg-blue-700">
                  <Play size={16} className="mr-2" />
                  Commencer l'entraînement
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => isSessionActive ? pauseSession() : resumeSession()}
                    variant="outline"
                  >
                    {isSessionActive ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <Button onClick={handleStopWorkout} variant="destructive">
                    <Square size={16} className="mr-2" />
                    Terminer
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Barre de progression */}
          {isSessionActive && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm text-gray-500">
                  {Math.round(calculateProgress())}%
                </span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workout">Entraînement</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="wearables">Wearables</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workout" className="mt-6">
            {/* Métriques de session en temps réel */}
            {isSessionActive && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Exercices</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.exercisesCompleted}/{stats.totalExercises}
                        </p>
                      </div>
                      <Target className="text-blue-600" size={24} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Séries</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.completedSets}/{stats.totalSets}
                        </p>
                      </div>
                      <Activity className="text-green-600" size={24} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Volume</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.totalWeight.toFixed(0)}kg
                        </p>
                      </div>
                      <Zap className="text-purple-600" size={24} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Temps</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatTime(sessionTimer)}
                        </p>
                      </div>
                      <Clock className="text-orange-600" size={24} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Liste des exercices */}
            <div className="space-y-4">
              {currentSession?.exercises?.map((exercise) => (
                <Card key={exercise.id} className={`${exercise.completed ? 'bg-green-50 border-green-200' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className={exercise.completed ? 'text-green-700' : ''}>{exercise.name}</span>
                      <div className="flex items-center space-x-2">
                        {exercise.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Terminé
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className={`flex items-center space-x-4 p-3 rounded-lg ${
                          set.completed ? 'bg-green-100' : 'bg-gray-50'
                        }`}>
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Série</div>
                              <div className="font-medium">{setIndex + 1}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Répétitions</div>
                              <div className="font-medium">{set.reps || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Poids</div>
                              <div className="font-medium">{set.weight || '-'}kg</div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => updateExerciseSet(exercise.id, setIndex, { completed: !set.completed })}
                            variant={set.completed ? "default" : "outline"}
                            size="sm"
                          >
                            {set.completed ? '✓' : '○'}
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {isSessionActive && !exercise.completed && (
                      <div className="mt-4 flex justify-between">
                        <Button 
                          onClick={() => completeExercise(exercise.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Terminer l'exercice
                        </Button>
                        <Button variant="outline">
                          <SkipForward size={16} className="mr-2" />
                          Passer
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Actions rapides */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button 
                onClick={() => loadExercisesFromLastSession("Mon Entraînement", [])}
                variant="outline"
              >
                Charger dernière session
              </Button>
              <Button variant="outline">
                Ajouter exercice
              </Button>
              <Button variant="outline">
                Modèle d'entraînement
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Statistiques d'entraînement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Consultez vos performances et progressions d'entraînement
                  </p>
                  {/* Intégration future avec les analytics */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wearables" className="mt-6">
            <WearableStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkoutPage;
