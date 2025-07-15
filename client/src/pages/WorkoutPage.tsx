import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Target,
  Clock,
  Play,
  CheckCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { User as SupabaseAuthUserType } from '@supabase/supabase-js';

interface WorkoutPageProps {
  userProfile?: SupabaseAuthUserType;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
  instructions: string;
}

interface Workout {
  name: string;
  type: string;
  duration: number;
  difficulty: string;
  description: string;
  exercises: Exercise[];
}

const WorkoutPage: React.FC<WorkoutPageProps> = () => {
  const [todayWorkout] = useState<Workout>({
    name: 'Entraînement du jour',
    type: 'Force',
    duration: 45,
    difficulty: 'Intermédiaire',
    description: 'Un entraînement complet pour améliorer votre force et votre endurance.',
    exercises: [
      { name: 'Squats', sets: 3, reps: 12, rest: 60, instructions: 'Effectuez 3 séries de 12 répétitions.' },
      { name: 'Pompes', sets: 3, reps: 10, rest: 60, instructions: 'Effectuez 3 séries de 10 répétitions.' },
      { name: 'Fentes', sets: 3, reps: 10, rest: 60, instructions: 'Effectuez 3 séries de 10 répétitions par jambe.' },
      { name: 'Planche', sets: 3, reps: 30, rest: 60, instructions: 'Tenez la position pendant 30 secondes.' },
    ]
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setIsWorkoutPaused(false);
  };

  const pauseWorkout = () => {
    setIsWorkoutPaused(!isWorkoutPaused);
  };

  const nextExercise = () => {
    if (currentExerciseIndex < todayWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      endWorkout();
    }
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setIsWorkoutPaused(false);
    setCurrentExerciseIndex(0);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isWorkoutActive && !isWorkoutPaused) {
      intervalId = setInterval(() => {
        setWorkoutTime(prevTime => prevTime + 1);
        setCaloriesBurned(prevCalories => prevCalories + 5);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isWorkoutActive, isWorkoutPaused]);

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
              <h1 className="text-xl font-bold text-gray-800">Entraînement</h1>
              <p className="text-sm text-gray-600">
                {isWorkoutActive ? 'En cours' : 'Prêt à commencer'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Programme d'entraînement */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Target className="mr-2 text-orange-600" size={24} />
              Programme du jour
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentExerciseIndex + 1}/{todayWorkout.exercises.length}
              </span>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentExerciseIndex + 1) / todayWorkout.exercises.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{todayWorkout.name}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {todayWorkout.type}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {todayWorkout.duration} min
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {todayWorkout.difficulty}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{todayWorkout.description}</p>
          </div>

          {/* Exercice actuel */}
          <div className="border-2 border-orange-200 rounded-xl p-4 mb-4 bg-orange-50">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Dumbbell className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  {todayWorkout.exercises[currentExerciseIndex]?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {todayWorkout.exercises[currentExerciseIndex]?.sets} × {todayWorkout.exercises[currentExerciseIndex]?.reps}
                </p>
                <p className="text-xs text-gray-500">
                  {todayWorkout.exercises[currentExerciseIndex]?.instructions}
                </p>
              </div>
            </div>
          </div>

          {/* Contrôles d'entraînement */}
          <div className="flex space-x-3">
            {!isWorkoutActive ? (
              <button
                onClick={startWorkout}
                className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
                <Play className="mr-2" size={20} />
                Commencer l'entraînement
              </button>
            ) : (
              <>
                <button
                  onClick={pauseWorkout}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
                >
                  {isWorkoutPaused ? 'Reprendre' : 'Pause'}
                </button>
                <button
                  onClick={nextExercise}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Exercice suivant
                </button>
                <button
                  onClick={endWorkout}
                  className="px-6 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Terminer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-600" size={20} />
            Exercices
          </h3>
          <div className="space-y-3">
            {todayWorkout.exercises.map((exercise, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  index === currentExerciseIndex
                    ? 'border-orange-500 bg-orange-50'
                    : index < currentExerciseIndex
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === currentExerciseIndex
                        ? 'bg-orange-500 text-white'
                        : index < currentExerciseIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index < currentExerciseIndex ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                      <p className="text-sm text-gray-600">{exercise.sets} × {exercise.reps}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{exercise.rest}s repos</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={20} />
            Statistiques
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-800">Calories</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{caloriesBurned}</p>
              <p className="text-xs text-blue-600">kcal brûlées</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="text-orange-600" size={16} />
                <span className="text-sm font-medium text-orange-800">Temps</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.floor(workoutTime / 60)}:{(workoutTime % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-orange-600">minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPage;
