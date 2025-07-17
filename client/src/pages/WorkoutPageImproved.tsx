import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Target,
  Clock,
  Play,
  CheckCircle,
  TrendingUp,
  Plus,
  Minus,
  Edit3,
  Save,
  Pause,
  Square
} from 'lucide-react';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { useWorkoutSession, WorkoutExercise } from '@/hooks/useWorkoutSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkoutPageProps {
  userProfile?: SupabaseAuthUserType;
}

interface SetEditState {
  exerciseId: string;
  setIndex: number;
  field: 'reps' | 'weight' | 'duration';
  value: string;
}

const WorkoutPage: React.FC<WorkoutPageProps> = () => {
  const {
    currentSession,
    isSessionActive,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    addExercise,
    updateExerciseSet,
    completeExercise,
    loadExercisesFromLastSession
  } = useWorkoutSession();

  const [editingSet, setEditingSet] = useState<SetEditState | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  
  // Définir les exercices par défaut
  const defaultExercises: Omit<WorkoutExercise, 'id'>[] = [
    { 
      name: 'Squats', 
      sets: [
        { reps: 12, weight: 0, completed: false },
        { reps: 12, weight: 0, completed: false },
        { reps: 12, weight: 0, completed: false }
      ], 
      completed: false, 
      restTime: 60 
    },
    { 
      name: 'Pompes', 
      sets: [
        { reps: 10, completed: false },
        { reps: 10, completed: false },
        { reps: 10, completed: false }
      ], 
      completed: false, 
      restTime: 60 
    },
    { 
      name: 'Fentes', 
      sets: [
        { reps: 10, completed: false },
        { reps: 10, completed: false },
        { reps: 10, completed: false }
      ], 
      completed: false, 
      restTime: 60 
    },
    { 
      name: 'Planche', 
      sets: [
        { reps: 1, duration: 30, completed: false },
        { reps: 1, duration: 30, completed: false },
        { reps: 1, duration: 30, completed: false }
      ], 
      completed: false, 
      restTime: 60 
    }
  ];

  const handleStartWorkout = () => {
    const workoutName = 'Entraînement du jour';
    
    // Charger les exercices avec les données de la dernière séance
    const exercisesToAdd = loadExercisesFromLastSession(workoutName, defaultExercises);
    
    // Démarrer la session
    startSession(workoutName, 45);
    
    // Ajouter les exercices à la session
    setTimeout(() => {
      exercisesToAdd.forEach(exercise => {
        addExercise(exercise);
      });
    }, 100);
  };

  const handleSetEdit = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'duration') => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets[setIndex];
    
    if (set) {
      setEditingSet({
        exerciseId,
        setIndex,
        field,
        value: (set[field] || 0).toString()
      });
    }
  };

  const handleSetSave = () => {
    if (editingSet) {
      const numValue = parseFloat(editingSet.value) || 0;
      updateExerciseSet(editingSet.exerciseId, editingSet.setIndex, {
        [editingSet.field]: numValue
      });
      setEditingSet(null);
    }
  };

  const handleSetComplete = (exerciseId: string, setIndex: number) => {
    updateExerciseSet(exerciseId, setIndex, { completed: true });
  };

  const handleExerciseComplete = (exerciseId: string) => {
    completeExercise(exerciseId);
  };

  const incrementSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'duration') => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets[setIndex];
    
    if (set) {
      const currentValue = set[field] || 0;
      const increment = field === 'weight' ? 2.5 : 1;
      updateExerciseSet(exerciseId, setIndex, {
        [field]: currentValue + increment
      });
    }
  };

  const decrementSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'duration') => {
    const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
    const set = exercise?.sets[setIndex];
    
    if (set) {
      const currentValue = set[field] || 0;
      const decrement = field === 'weight' ? 2.5 : 1;
      const newValue = Math.max(0, currentValue - decrement);
      updateExerciseSet(exerciseId, setIndex, {
        [field]: newValue
      });
    }
  };

  // Timer pour suivre le temps d'entraînement
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isSessionActive && currentSession?.status === 'active') {
      intervalId = setInterval(() => {
        setWorkoutTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isSessionActive, currentSession?.status]);

  // Calculer les statistiques
  const completedExercises = currentSession?.exercises.filter(e => e.completed).length || 0;
  const totalExercises = currentSession?.exercises.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Dumbbell className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentSession?.name || 'Entraînement'}
              </h1>
              <p className="text-sm text-gray-600">
                {isSessionActive ? 'En cours' : 'Prêt à commencer'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-gray-500">Temps</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="text-blue-600" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Workout Controls */}
      <div className="px-4 py-6">
        {!isSessionActive ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2" size={20} />
                Entraînement du jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durée estimée</span>
                  <span className="font-medium">45 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exercices</span>
                  <span className="font-medium">{defaultExercises.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Difficulté</span>
                  <span className="font-medium text-orange-600">Intermédiaire</span>
                </div>
                <Button 
                  onClick={handleStartWorkout}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Play className="mr-2" size={16} />
                  Commencer l'entraînement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Progress Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium">{completedExercises}/{totalExercises}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Session Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex space-x-2">
                  <Button
                    onClick={currentSession?.status === 'active' ? pauseSession : resumeSession}
                    variant="outline"
                    className="flex-1"
                  >
                    {currentSession?.status === 'active' ? (
                      <>
                        <Pause className="mr-2" size={16} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2" size={16} />
                        Reprendre
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={completeSession}
                    variant="outline"
                    className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    Terminer
                  </Button>
                  <Button
                    onClick={cancelSession}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Square className="mr-2" size={16} />
                    Arrêter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exercises */}
            <div className="space-y-4">
              {currentSession?.exercises.map((exercise) => (
                <Card key={exercise.id} className={exercise.completed ? 'bg-green-50 border-green-200' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Dumbbell className="mr-2" size={16} />
                        {exercise.name}
                      </span>
                      {exercise.completed && (
                        <CheckCircle className="text-green-600" size={20} />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className={`p-3 rounded-lg border ${set.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Série {setIndex + 1}</span>
                            {!set.completed && (
                              <Button
                                onClick={() => handleSetComplete(exercise.id, setIndex)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle size={14} />
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            {/* Répétitions */}
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Reps:</span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  onClick={() => decrementSet(exercise.id, setIndex, 'reps')}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus size={12} />
                                </Button>
                                {editingSet?.exerciseId === exercise.id && 
                                 editingSet?.setIndex === setIndex && 
                                 editingSet?.field === 'reps' ? (
                                  <div className="flex items-center space-x-1">
                                    <Input
                                      value={editingSet.value}
                                      onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                      className="h-6 w-12 text-center text-xs"
                                    />
                                    <Button
                                      onClick={handleSetSave}
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Save size={10} />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleSetEdit(exercise.id, setIndex, 'reps')}
                                    className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1"
                                  >
                                    <span>{set.reps}</span>
                                    <Edit3 size={10} />
                                  </button>
                                )}
                                <Button
                                  onClick={() => incrementSet(exercise.id, setIndex, 'reps')}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus size={12} />
                                </Button>
                              </div>
                            </div>

                            {/* Poids (si applicable) */}
                            {set.weight !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Poids:</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    onClick={() => decrementSet(exercise.id, setIndex, 'weight')}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus size={12} />
                                  </Button>
                                  {editingSet?.exerciseId === exercise.id && 
                                   editingSet?.setIndex === setIndex && 
                                   editingSet?.field === 'weight' ? (
                                    <div className="flex items-center space-x-1">
                                      <Input
                                        value={editingSet.value}
                                        onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                        className="h-6 w-12 text-center text-xs"
                                      />
                                      <Button
                                        onClick={handleSetSave}
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <Save size={10} />
                                      </Button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleSetEdit(exercise.id, setIndex, 'weight')}
                                      className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1"
                                    >
                                      <span>{set.weight}kg</span>
                                      <Edit3 size={10} />
                                    </button>
                                  )}
                                  <Button
                                    onClick={() => incrementSet(exercise.id, setIndex, 'weight')}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus size={12} />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Durée (si applicable) */}
                            {set.duration !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Durée:</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    onClick={() => decrementSet(exercise.id, setIndex, 'duration')}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Minus size={12} />
                                  </Button>
                                  {editingSet?.exerciseId === exercise.id && 
                                   editingSet?.setIndex === setIndex && 
                                   editingSet?.field === 'duration' ? (
                                    <div className="flex items-center space-x-1">
                                      <Input
                                        value={editingSet.value}
                                        onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                        className="h-6 w-12 text-center text-xs"
                                      />
                                      <Button
                                        onClick={handleSetSave}
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <Save size={10} />
                                      </Button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleSetEdit(exercise.id, setIndex, 'duration')}
                                      className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1"
                                    >
                                      <span>{set.duration}s</span>
                                      <Edit3 size={10} />
                                    </button>
                                  )}
                                  <Button
                                    onClick={() => incrementSet(exercise.id, setIndex, 'duration')}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                  >
                                    <Plus size={12} />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {!exercise.completed && (
                        <Button
                          onClick={() => handleExerciseComplete(exercise.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2" size={16} />
                          Marquer comme terminé
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Statistics */}
      {currentSession && (
        <div className="px-4 pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" size={16} />
                Statistiques de la séance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.floor(workoutTime / 60)}</div>
                  <div className="text-xs text-gray-500">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedExercises}</div>
                  <div className="text-xs text-gray-500">Exercices terminés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentSession.caloriesBurned}</div>
                  <div className="text-xs text-gray-500">Calories brûlées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkoutPage;
