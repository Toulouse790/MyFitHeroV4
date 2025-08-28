import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

// Hooks refactorisés
import { useWorkoutTimer } from '@/features/workout/hooks/useWorkoutTimer';
import { useWorkoutExercises } from '@/features/workout/hooks/useWorkoutExercises';

// Store unifié
import { 
  useWorkoutSession, 
  useWorkoutSettings, 
  useWorkoutStats 
} from '@/store/index';

// Services
import { WorkoutService } from '@/services/workout.service';

// Composants refactorisés
import { WorkoutSessionHeader } from '@/features/workout/components/WorkoutSessionHeader';
import { WorkoutProgressCard } from '@/features/workout/components/WorkoutProgressCard';
import { WorkoutTipCard } from '@/features/workout/components/WorkoutTipCard';
import { ExerciseCard } from '@/features/workout/components/ExerciseCard';
import { WorkoutStatsCard } from '@/features/workout/components/WorkoutStatsCard';
import { WorkoutSessionSummary } from '@/features/workout/components/WorkoutSessionSummary';
import { WorkoutStartScreen } from '@/features/workout/components/WorkoutStartScreen';

// Types
import { WorkoutExercise } from '@/types/workout.types';

interface WorkoutPageProps {
  initialExercises?: WorkoutExercise[];
  workoutName?: string;
}

// Helpers
const getCurrentTip = () => ({
  title: "Conseil d'entraînement",
  description: "Gardez une bonne posture pendant tous vos exercices pour éviter les blessures.",
  category: "Sécurité",
  importance: 'medium' as const
});

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  initialExercises = [],
  workoutName = 'Entraînement'
}) => {
  const [location, setLocation] = useLocation();
  
  // Store hooks
  const {
    currentSession,
    isSessionActive,
    startWorkoutSession,
    pauseWorkoutSession,
    resumeWorkoutSession,
    completeWorkoutSession,
    cancelWorkoutSession
  } = useWorkoutSession();

  const {
    quickModeEnabled,
    setQuickMode
  } = useWorkoutSettings();

  const {
    addTimeSpent,
    addCaloriesBurned
  } = useWorkoutStats();

  // Hooks refactorisés
  const timer = useWorkoutTimer();
  const exerciseManager = useWorkoutExercises(currentSession?.exercises || initialExercises);

  // État local
  const [showSummary, setShowSummary] = useState(false);
  const [currentTip] = useState(getCurrentTip());

  // Synchronisation du timer avec la session
  useEffect(() => {
    if (isSessionActive) {
      timer.start();
    } else {
      timer.pause();
    }
  }, [isSessionActive, timer]);

  // Calculs mémorisés
  const progressPercentage = useMemo(() => {
    return exerciseManager.getProgressPercentage();
  }, [exerciseManager]);

  const estimatedCalories = useMemo(() => {
    return WorkoutService.calculateCalories({
      type: 'strength',
      totalTime: timer.workoutTime
    } as any);
  }, [timer.workoutTime]);

  const completedExercisesCount = useMemo(() => {
    return exerciseManager.getCompletedExercisesCount();
  }, [exerciseManager]);

  // Actions de session
  const handleStartWorkout = useCallback(async () => {
    try {
      const exercises = initialExercises.length > 0 
        ? initialExercises 
        : await loadDefaultExercises();

      startWorkoutSession(workoutName, exercises);
      exerciseManager.setExercises(exercises);
      timer.start();

      toast.success('Entraînement commencé !');
    } catch (error) {
      console.error('Erreur lors du démarrage:', error);
      toast.error('Impossible de commencer l\'entraînement');
    }
  }, [initialExercises, workoutName, startWorkoutSession, exerciseManager, timer]);

  const handlePauseWorkout = useCallback(() => {
    pauseWorkoutSession();
    timer.pause();
    toast.info('Entraînement mis en pause');
  }, [pauseWorkoutSession, timer]);

  const handleResumeWorkout = useCallback(() => {
    resumeWorkoutSession();
    timer.resume();
    toast.success('Entraînement repris !');
  }, [resumeWorkoutSession, timer]);

  const handleCompleteWorkout = useCallback(async () => {
    try {
      // Sauvegarder la session
      if (currentSession) {
        await WorkoutService.updateSession(currentSession.id, {
          status: 'completed',
          endTime: new Date(),
          totalTime: timer.workoutTime,
          actualCalories: estimatedCalories,
          exercises: exerciseManager.exercises
        });
      }

      // Mettre à jour les statistiques
      addTimeSpent(timer.workoutTime);
      addCaloriesBurned(estimatedCalories);

      completeWorkoutSession();
      timer.pause();
      setShowSummary(true);

      toast.success('Félicitations ! Entraînement terminé !');
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  }, [currentSession, timer.workoutTime, estimatedCalories, exerciseManager.exercises, addTimeSpent, addCaloriesBurned, completeWorkoutSession, timer]);

  const handleCancelWorkout = useCallback(() => {
    cancelWorkoutSession();
    timer.reset();
    setLocation('/dashboard');
    toast.info('Entraînement annulé');
  }, [cancelWorkoutSession, timer, setLocation]);

  // Actions d'exercices
  const handleToggleExerciseExpanded = useCallback((exerciseId: string) => {
    const newExpanded = exerciseManager.expandedExercise === exerciseId ? null : exerciseId;
    exerciseManager.setExpandedExercise(newExpanded);
  }, [exerciseManager]);

  const handleExerciseComplete = useCallback((exerciseId: string) => {
    exerciseManager.completeExercise(exerciseId);
    toast.success('Exercice terminé !');
  }, [exerciseManager]);

  const handleSetUpdate = useCallback((exerciseId: string, setIndex: number, updates: any) => {
    exerciseManager.updateExerciseSet(exerciseId, setIndex, updates);
  }, [exerciseManager]);

  const handleAddSet = useCallback((exerciseId: string) => {
    exerciseManager.addSetToExercise(exerciseId);
    toast.info('Série ajoutée');
  }, [exerciseManager]);

  const handleRemoveSet = useCallback((exerciseId: string, setIndex: number) => {
    exerciseManager.removeSetFromExercise(exerciseId, setIndex);
    toast.info('Série supprimée');
  }, [exerciseManager]);

  // Chargement des exercices par défaut
  const loadDefaultExercises = useCallback(async (): Promise<WorkoutExercise[]> => {
    // Exercices par défaut si aucun n'est fourni
    return [
      {
        id: 'ex1',
        name: 'Pompes',
        type: 'strength',
        category: 'chest',
        sets: [
          { reps: 10, completed: false },
          { reps: 10, completed: false },
          { reps: 10, completed: false }
        ],
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        difficulty: 'beginner',
        completed: false
      },
      {
        id: 'ex2',
        name: 'Squats',
        type: 'strength',
        category: 'legs',
        sets: [
          { reps: 15, completed: false },
          { reps: 15, completed: false },
          { reps: 15, completed: false }
        ],
        muscleGroups: ['quadriceps', 'glutes'],
        difficulty: 'beginner',
        completed: false
      }
    ];
  }, []);

  // Gestion du retour
  const handleBackNavigation = useCallback(() => {
    if (currentSession) {
      handleCancelWorkout();
    } else {
      setLocation('/dashboard');
    }
  }, [currentSession, handleCancelWorkout, setLocation]);

  // Rendu conditionnel
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <WorkoutStartScreen onStartWorkout={handleStartWorkout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <WorkoutSessionHeader
        sessionName={currentSession.name}
        status={currentSession.status}
        workoutTime={timer.workoutTime}
        formatTime={timer.formatTime}
      />

      <div className="p-4 space-y-4">
        {/* Carte de progression */}
        <WorkoutProgressCard
          progressPercentage={progressPercentage}
          quickMode={quickModeEnabled}
          setQuickMode={setQuickMode}
          currentStatus={currentSession.status}
          onPause={handlePauseWorkout}
          onResume={handleResumeWorkout}
          onComplete={handleCompleteWorkout}
          onCancel={handleCancelWorkout}
        />

        {/* Statistiques */}
        <WorkoutStatsCard
          workoutTime={timer.workoutTime}
          completedExercises={completedExercisesCount}
          estimatedCalories={estimatedCalories}
        />

        {/* Conseil d'entraînement */}
        <WorkoutTipCard tip={currentTip} />

        {/* Liste des exercices */}
        <div className="space-y-3">
          {exerciseManager.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isExpanded={exerciseManager.expandedExercise === exercise.id}
              onToggleExpanded={handleToggleExerciseExpanded}
              onExerciseComplete={handleExerciseComplete}
              onSetUpdate={handleSetUpdate}
              onAddSet={handleAddSet}
              onRemoveSet={handleRemoveSet}
              quickMode={quickModeEnabled}
            />
          ))}
        </div>
      </div>

      {/* Modal de résumé */}
      <WorkoutSessionSummary
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setLocation('/dashboard');
        }}
        workoutTime={timer.workoutTime}
        completedExercises={completedExercisesCount}
        estimatedCalories={estimatedCalories}
        progressPercentage={progressPercentage}
        formatTime={timer.formatTime}
      />
    </div>
  );
};

export default WorkoutPage;
