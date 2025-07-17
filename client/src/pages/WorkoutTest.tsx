import React, { useEffect } from 'react';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { Button } from '@/components/ui/button';

const WorkoutTest: React.FC = () => {
  const {
    currentSession,
    isSessionActive,
    startSession,
    addExercise,
    updateExerciseSet,
    addSetToExercise,
    removeSetFromExercise,
    getLastWeightForExercise
  } = useWorkoutSession();

  const startTestWorkout = () => {
    startSession('Test Workout', 30);
    
    // Ajouter des exercices de test
    setTimeout(() => {
      addExercise({
        name: 'Développé Couché',
        sets: [
          { reps: 10, weight: 60, completed: false },
          { reps: 8, weight: 65, completed: false },
          { reps: 6, weight: 70, completed: false }
        ],
        completed: false,
        restTime: 120
      });

      addExercise({
        name: 'Squats',
        sets: [
          { reps: 12, weight: 80, completed: false },
          { reps: 10, weight: 85, completed: false }
        ],
        completed: false,
        restTime: 90
      });
    }, 100);
  };

  const testAddSet = () => {
    if (currentSession && currentSession.exercises.length > 0) {
      addSetToExercise(currentSession.exercises[0].id);
    }
  };

  const testRemoveSet = () => {
    if (currentSession && currentSession.exercises.length > 0) {
      removeSetFromExercise(currentSession.exercises[0].id, 0);
    }
  };

  const testUpdateWeight = () => {
    if (currentSession && currentSession.exercises.length > 0) {
      updateExerciseSet(currentSession.exercises[0].id, 0, { weight: 75 });
    }
  };

  useEffect(() => {
    console.log('Current session:', currentSession);
    console.log('Is session active:', isSessionActive);
  }, [currentSession, isSessionActive]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Workout Session</h1>
      
      <div className="space-y-4">
        <Button onClick={startTestWorkout}>
          Démarrer Test Workout
        </Button>
        
        <Button onClick={testAddSet}>
          Ajouter une série
        </Button>
        
        <Button onClick={testRemoveSet}>
          Supprimer une série
        </Button>
        
        <Button onClick={testUpdateWeight}>
          Changer le poids (75kg)
        </Button>
      </div>

      {currentSession && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Session courante: {currentSession.name}</h2>
          <p>Status: {currentSession.status}</p>
          <p>Exercices: {currentSession.exercises.length}</p>
          
          {currentSession.exercises.map((exercise) => (
            <div key={exercise.id} className="mt-4 p-2 bg-white rounded">
              <h3 className="font-medium">{exercise.name}</h3>
              <p>Séries: {exercise.sets.length}</p>
              
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="ml-4 text-sm">
                  Série {setIndex + 1}: {set.reps} reps
                  {set.weight && ` à ${set.weight}kg`}
                  {set.duration && ` pendant ${set.duration}s`}
                  {set.completed ? ' ✅' : ' ⏳'}
                </div>
              ))}
              
              <p className="text-xs text-gray-600">
                Dernier poids pour {exercise.name}: {getLastWeightForExercise(exercise.name) || 'Aucun'}kg
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutTest;
