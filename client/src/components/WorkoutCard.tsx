// client/src/components/WorkoutCard.tsx
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Clock, 
  Flame, 
  Users, 
  Star,
  Plus,
  Minus,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutInterface {
  id: number;
  title: string;
  duration: number;
  difficulty: string;
  calories: number;
  category: string;
  tags: string[];
  description: string;
  exerciseList: string[];
  rating: number;
  participants: number;
  emoji: string;
}

interface WorkoutCardProps {
  workout: WorkoutInterface;
  onStartWorkout: (workout: WorkoutInterface) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onStartWorkout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [exerciseSets, setExerciseSets] = useState<Record<string, { sets: number; reps: number; weight: number }>>({});
  const { startSession, addExercise, getLastWeightForExercise } = useWorkoutSession();
  const { toast } = useToast();

  // Initialize exercise data
  const initializeExerciseData = (exerciseName: string) => {
    if (!exerciseSets[exerciseName]) {
      const lastWeight = getLastWeightForExercise(exerciseName) || 0;
      setExerciseSets(prev => ({
        ...prev,
        [exerciseName]: { sets: 3, reps: 10, weight: lastWeight }
      }));
    }
  };

  // Update exercise data
  const updateExerciseData = (exerciseName: string, field: 'sets' | 'reps' | 'weight', value: number) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [field]: Math.max(0, value)
      }
    }));
  };

  // Start workout with configured exercises
  const handleStartCustomWorkout = () => {
    // Start session
    startSession(workout.title, workout.duration);
    
    // Add exercises with configured sets
    workout.exerciseList.forEach((exerciseName) => {
      const config = exerciseSets[exerciseName] || { sets: 3, reps: 10, weight: 0 };
      
      const exercise = {
        name: exerciseName,
        sets: Array(config.sets).fill(null).map(() => ({
          reps: config.reps,
          weight: config.weight,
          completed: false
        })),
        completed: false,
        restTime: 60
      };
      
      addExercise(exercise);
    });

    toast({
      title: "Entraînement démarré !",
      description: `${workout.title} - ${workout.exerciseList.length} exercices configurés`,
    });

    // Navigate to workout page
    onStartWorkout(workout);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'débutant': return 'text-green-600 bg-green-50';
      case 'intermédiaire': return 'text-yellow-600 bg-yellow-50';
      case 'avancé': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{workout.emoji}</span>
              <h3 className="font-semibold text-gray-900">{workout.title}</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center text-gray-500">
                <Clock size={16} className="mr-1" />
                <span>{workout.duration} min</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Flame size={16} className="mr-1" />
                <span>{workout.calories} cal</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Users size={16} className="mr-1" />
                <span>{workout.participants}</span>
              </div>
              <div className="flex items-center text-yellow-500">
                <Star size={16} className="mr-1 fill-current" />
                <span>{workout.rating}</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={getDifficultyColor(workout.difficulty)}>
                {workout.difficulty}
              </Badge>
              {workout.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <ChevronRight 
            size={20} 
            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 mb-3">Exercices ({workout.exerciseList.length})</h4>
          
          {/* Exercise List with Controls */}
          <div className="space-y-3">
            {workout.exerciseList.map((exercise, index) => {
              // Initialize data for this exercise
              if (!exerciseSets[exercise]) {
                initializeExerciseData(exercise);
              }
              
              const exerciseData = exerciseSets[exercise] || { sets: 3, reps: 10, weight: 0 };
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{exercise}</span>
                    <Edit2 size={16} className="text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Sets */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Séries</label>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateExerciseData(exercise, 'sets', exerciseData.sets - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <Input
                          type="number"
                          value={exerciseData.sets}
                          onChange={(e) => updateExerciseData(exercise, 'sets', parseInt(e.target.value) || 0)}
                          className="h-8 w-12 text-center p-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateExerciseData(exercise, 'sets', exerciseData.sets + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Reps */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Reps</label>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateExerciseData(exercise, 'reps', exerciseData.reps - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <Input
                          type="number"
                          value={exerciseData.reps}
                          onChange={(e) => updateExerciseData(exercise, 'reps', parseInt(e.target.value) || 0)}
                          className="h-8 w-12 text-center p-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateExerciseData(exercise, 'reps', exerciseData.reps + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Weight */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Poids (kg)</label>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateExerciseData(exercise, 'weight', exerciseData.weight - 2.5)}
                        >
                          <Minus size={14} />
                        </Button>
                        <Input
                          type="number"
                          step="2.5"
                          value={exerciseData.weight}
                          onChange={(e) => updateExerciseData(exercise, 'weight', parseFloat(e.target.value) || 0)}
                          className="h-8 w-16 text-center p-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateExerciseData(exercise, 'weight', exerciseData.weight + 2.5)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button 
              onClick={handleStartCustomWorkout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Démarrer l'entraînement
            </Button>
            <Button 
              variant="outline"
              onClick={() => onStartWorkout(workout)}
            >
              Aperçu rapide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
