import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Dumbbell,
  Play,
  Pause,
  Target,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Save,
  Edit3,
  TrendingUp,
  Trophy,
  Square,
  Zap,
  Clock,
  Info
} from 'lucide-react';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';
import { useWorkoutSession } from '../hooks/workout/useWorkoutSession';
import type { WorkoutExercise } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    addSetToExercise,
    removeSetFromExercise,
    loadExercisesFromLastSession,
    getLastWeightForExercise,
    calculateCalories,
    formatTime
  } = useWorkoutSession();
  const [, setLocation] = useLocation();
  const [editingSet, setEditingSet] = useState<SetEditState | null>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Exercices par défaut
  const defaultExercises: WorkoutExercise[] = [
    {
      id: 'ex-1',
      name: 'Développé Couché',
      category: 'strength',
      muscle_groups: ['chest', 'shoulders', 'triceps'],
      sets: [
        { reps: 10, weight: 60, completed: false },
        { reps: 8, weight: 65, completed: false },
        { reps: 6, weight: 70, completed: false }
      ],
      completed: false,
      restTime: 120
    },
    {
      id: 'ex-2',
      name: 'Squats',
      category: 'strength',
      muscle_groups: ['quads', 'glutes', 'hamstrings'],
      sets: [
        { reps: 12, weight: 80, completed: false },
        { reps: 10, weight: 85, completed: false },
        { reps: 8, weight: 90, completed: false }
      ],
      completed: false,
      restTime: 90
    },
    {
      id: 'ex-3',
      name: 'Tractions',
      category: 'strength',
      muscle_groups: ['back', 'biceps'],
      sets: [
        { reps: 8, completed: false },
        { reps: 6, completed: false },
        { reps: 5, completed: false }
      ],
      completed: false,
      restTime: 90
    }
  ];

  // Tips d'entraînement contextuels
  const workoutTips = [
    { icon: Zap, text: "Concentrez-vous sur la forme plutôt que sur le poids", priority: "high" },
    { icon: Clock, text: "Respectez vos temps de repos pour optimiser la récupération", priority: "medium" },
    { icon: Info, text: "Chaque série compte, même si elle semble facile", priority: "high" }
  ];

  const getCurrentTip = () => {
    const highPriorityTips = workoutTips.filter(tip => tip.priority === "high");
    return highPriorityTips[Math.floor(Math.random() * highPriorityTips.length)];
  };

  const handleStartWorkout = async () => {
    const workoutName = "Entraînement Force";
    // Charger avec les données de la dernière session
    const exercisesToAdd = await loadExercisesFromLastSession(workoutName);
    
    // Démarrer la session avec les exercices
    await startSession(workoutName, {
      workout_type: 'strength',
      difficulty: 'intermediate',
      exercises: exercisesToAdd.length > 0 ? exercisesToAdd : defaultExercises
    });
    
    // Ouvrir le premier exercice par défaut
    if (exercisesToAdd.length > 0) {
      setExpandedExercise(exercisesToAdd[0].id);
    } else if (defaultExercises.length > 0) {
      setExpandedExercise(defaultExercises[0].name);
    }
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

  const handleQuickSetComplete = (exerciseId: string, setIndex: number) => {
    // En mode rapide, on valide juste la série sans édition
    updateExerciseSet(exerciseId, setIndex, { completed: true });
  };

  const handleExerciseComplete = (exerciseId: string) => {
    completeExercise(exerciseId);
    // Passer au prochain exercice non terminé
    const nextExercise = currentSession?.exercises.find(e => !e.completed && e.id !== exerciseId);
    if (nextExercise) {
      setExpandedExercise(nextExercise.id);
    }
  };

  const handleCompleteSession = () => {
    completeSession();
    setShowSessionSummary(true);
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

  // Calculer les calories brûlées (estimation basique)
  const estimatedCalories = calculateCalories ? calculateCalories(workoutTime) : Math.round(workoutTime * 0.15);

  const currentTip = getCurrentTip();

  const handleCompleteWorkout = async () => {
    if (currentSession) {
      await completeSession();
      setShowSessionSummary(true);
      setLocation('/');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                {currentSession?.status === 'active' ? 'En cours' : 'Prêt à commencer'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {formatTime(workoutTime)}
            </div>
            <p className="text-xs text-gray-500">Temps écoulé</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {!currentSession ? (
          // Écran de démarrage
          <div className="text-center py-12">
            <div className="mb-6">
              <Dumbbell size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Prêt pour l'entraînement ?</h2>
              <p className="text-gray-600">Commencez votre session d'entraînement maintenant</p>
            </div>
            <Button onClick={handleStartWorkout} size="lg" className="bg-red-600 hover:bg-red-700">
              <Play className="mr-2" size={20} />
              Commencer l'entraînement
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="mr-2" size={20} />
                    Progression: {Math.round(progressPercentage)}%
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={quickMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuickMode(!quickMode)}
                      className="text-xs"
                    >
                      {quickMode ? "Mode Rapide" : "Mode Avancé"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  {currentSession.status === 'active' ? (
                    <Button onClick={pauseSession} variant="outline" className="flex-1">
                      <Pause className="mr-2" size={16} />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeSession} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Play className="mr-2" size={16} />
                      Reprendre
                    </Button>
                  )}
                  <Button
                    onClick={handleCompleteSession}
                    className="flex-1 bg-green-600 hover:bg-green-700"
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

            {/* Tip contextuel */}
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {React.createElement(currentTip.icon, { size: 18, className: "text-blue-500 mt-0.5" })}
                  <div>
                    <h3 className="font-semibold text-blue-800 text-sm mb-1">
                      Conseil d'entraînement
                    </h3>
                    <p className="text-blue-700 text-xs">{currentTip.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exercises - ACCORDION */}
            <div className="space-y-3">
              {currentSession?.exercises.map((exercise) => (
                <Card key={exercise.id} className={exercise.completed ? 'bg-green-50 border-green-200' : ''}>
                  <Collapsible
                    open={expandedExercise === exercise.id}
                    onOpenChange={(isOpen) => setExpandedExercise(isOpen ? exercise.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Dumbbell className="text-orange-500" size={16} />
                            <span>{exercise.name}</span>
                            {exercise.completed && (
                              <CheckCircle className="text-green-600" size={18} />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {exercise.sets?.filter(s => s.completed).length || 0}/{exercise.sets?.length || 0} séries
                            </Badge>
                            {expandedExercise === exercise.id ? (
                              <ChevronUp size={20} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={20} className="text-gray-400" />
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {exercise.sets && exercise.sets.length > 0 ? (
                            exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className={`p-4 rounded-lg border-2 ${set.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium text-gray-800">Série {setIndex + 1}</span>
                                  {!set.completed && (
                                    <Button
                                      onClick={() => quickMode ? handleQuickSetComplete(exercise.id, setIndex) : handleSetComplete(exercise.id, setIndex)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 h-8"
                                    >
                                      <CheckCircle size={14} className="mr-1" />
                                      {quickMode ? "Valider" : "Terminé"}
                                    </Button>
                                  )}
                                </div>

                                {!quickMode && (
                                  <div className="flex items-center space-x-4">
                                    {/* Répétitions */}
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-gray-600 min-w-[40px]">Reps:</span>
                                      <div className="flex items-center space-x-1">
                                        <Button
                                          onClick={() => decrementSet(exercise.id, setIndex, 'reps')}
                                          size="sm"
                                          variant="outline"
                                          className="h-8 w-8 p-0"
                                        >
                                          <Minus size={14} />
                                        </Button>
                                        {editingSet?.exerciseId === exercise.id && 
                                         editingSet?.setIndex === setIndex && 
                                         editingSet?.field === 'reps' ? (
                                          <div className="flex items-center space-x-1">
                                            <Input
                                              value={editingSet.value}
                                              onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                              className="h-8 w-16 text-center text-sm"
                                            />
                                            <Button
                                              onClick={handleSetSave}
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                            >
                                              <Save size={12} />
                                            </Button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleSetEdit(exercise.id, setIndex, 'reps')}
                                            className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1 min-w-[50px] justify-center h-8 px-2 border rounded"
                                          >
                                            <span>{set.reps}</span>
                                            <Edit3 size={10} />
                                          </button>
                                        )}
                                        <Button
                                          onClick={() => incrementSet(exercise.id, setIndex, 'reps')}
                                          size="sm"
                                          variant="outline"
                                          className="h-8 w-8 p-0"
                                        >
                                          <Plus size={14} />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Poids (si applicable) */}
                                    {set.weight !== undefined && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600 min-w-[40px]">Poids:</span>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            onClick={() => decrementSet(exercise.id, setIndex, 'weight')}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                          >
                                            <Minus size={14} />
                                          </Button>
                                          {editingSet?.exerciseId === exercise.id && 
                                           editingSet?.setIndex === setIndex && 
                                           editingSet?.field === 'weight' ? (
                                            <div className="flex items-center space-x-1">
                                              <Input
                                                value={editingSet.value}
                                                onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                                className="h-8 w-16 text-center text-sm"
                                              />
                                              <Button
                                                onClick={handleSetSave}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                              >
                                                <Save size={12} />
                                              </Button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => handleSetEdit(exercise.id, setIndex, 'weight')}
                                              className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1 min-w-[60px] justify-center h-8 px-2 border rounded"
                                            >
                                              <span>{set.weight}kg</span>
                                              <Edit3 size={10} />
                                            </button>
                                          )}
                                          <Button
                                            onClick={() => incrementSet(exercise.id, setIndex, 'weight')}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                          >
                                            <Plus size={14} />
                                          </Button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Durée (si applicable) */}
                                    {set.duration !== undefined && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600 min-w-[40px]">Durée:</span>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            onClick={() => decrementSet(exercise.id, setIndex, 'duration')}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                          >
                                            <Minus size={14} />
                                          </Button>
                                          {editingSet?.exerciseId === exercise.id && 
                                           editingSet?.setIndex === setIndex && 
                                           editingSet?.field === 'duration' ? (
                                            <div className="flex items-center space-x-1">
                                              <Input
                                                value={editingSet.value}
                                                onChange={(e) => setEditingSet({...editingSet, value: e.target.value})}
                                                className="h-8 w-16 text-center text-sm"
                                              />
                                              <Button
                                                onClick={handleSetSave}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                              >
                                                <Save size={12} />
                                              </Button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => handleSetEdit(exercise.id, setIndex, 'duration')}
                                              className="text-sm font-medium hover:text-blue-600 flex items-center space-x-1 min-w-[50px] justify-center h-8 px-2 border rounded"
                                            >
                                              <span>{set.duration}s</span>
                                              <Edit3 size={10} />
                                            </button>
                                          )}
                                          <Button
                                            onClick={() => incrementSet(exercise.id, setIndex, 'duration')}
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                          >
                                            <Plus size={14} />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Mode rapide - affichage simple */}
                                {quickMode && (
                                  <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>
                                      {set.reps} reps
                                      {set.weight && ` × ${set.weight}kg`}
                                      {set.duration && ` × ${set.duration}s`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p>Aucune série configurée pour cet exercice</p>
                            </div>
                          )}

                          {/* Boutons pour ajouter/supprimer des séries */}
                          {!exercise.completed && !quickMode && (
                            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                              <Button
                                onClick={() => addSetToExercise(exercise.id)}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Plus className="mr-1" size={14} />
                                Ajouter une série
                              </Button>
                              {exercise.sets && exercise.sets.length > 1 && (
                                <Button
                                  onClick={() => removeSetFromExercise(exercise.id, exercise.sets.length - 1)}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Minus className="mr-1" size={14} />
                                  Supprimer la dernière
                                </Button>
                              )}
                            </div>
                          )}

                          {!exercise.completed && (
                            <Button
                              onClick={() => handleExerciseComplete(exercise.id)}
                              className="w-full bg-green-600 hover:bg-green-700 mt-4"
                            >
                              <CheckCircle className="mr-2" size={16} />
                              Marquer comme terminé
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Card */}
        {currentSession && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Statistiques de la session
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
                  <div className="text-2xl font-bold text-orange-600">{estimatedCalories}</div>
                  <div className="text-xs text-gray-500">Calories estimées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Summary Modal */}
        <Dialog open={showSessionSummary} onOpenChange={setShowSessionSummary}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Trophy className="mr-2 text-yellow-500" size={24} />
                Bravo ! Session terminée
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatTime(workoutTime)}
                </div>
                <p className="text-gray-600">Temps d'entraînement</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{completedExercises}</div>
                  <div className="text-xs text-gray-500">Exercices</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-600">{estimatedCalories}</div>
                  <div className="text-xs text-gray-500">Calories</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-green-800 font-medium">
                  🎉 Excellent travail ! Vous avez terminé {Math.round(progressPercentage)}% de votre programme.
                </p>
              </div>

              <Button 
                onClick={() => setShowSessionSummary(false)} 
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkoutPage;
