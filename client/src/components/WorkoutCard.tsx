// client/src/components/WorkoutCard.tsx
import React, { useState } from 'react';
import { Clock, Flame, Target, Star, Play, Timer, Users, ChevronRight } from 'lucide-react';
import { WorkoutTimer } from './WorkoutTimer';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';

export interface WorkoutInterface {
  id: number;
  title: string;
  duration: number;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  calories: number;
  category: string;
  rating: number;
  participants: number;
  tags: string[];
  description: string;
  exerciseList: string[];
  emoji?: string;
}

interface WorkoutCardProps {
  workout: WorkoutInterface;
  onStartWorkout?: (workout: WorkoutInterface) => void;
  showQuickStart?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onStartWorkout,
  showQuickStart = true 
}) => {
  const [showTimer, setShowTimer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { startSession } = useWorkoutSession();

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Débutant': return 'text-green-600 bg-green-100';
      case 'Intermédiaire': return 'text-yellow-600 bg-yellow-100';
      case 'Avancé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleStartWorkout = () => {
    if (onStartWorkout) {
      onStartWorkout(workout);
    }
    startSession(workout.title, workout.duration);
    setShowTimer(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="text-4xl">{workout.emoji || '💪'}</div>
            <div className="flex items-center space-x-1">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">{workout.rating}</span>
              <span className="text-xs text-gray-500">({workout.participants})</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-800 text-lg mb-1">{workout.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{workout.description}</p>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-xs text-gray-500 uppercase">Exercices Clés</h4>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? 'Réduire' : 'Voir plus'}
                <ChevronRight size={12} className={`ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {workout.exerciseList.slice(0, isExpanded ? undefined : 4).map((exercise, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  {exercise}
                </span>
              ))}
              {!isExpanded && workout.exerciseList.length > 4 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  +{workout.exerciseList.length - 4} autres
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {workout.tags.map((tag, index) => {
              const isSpecialTag = tag.includes('perte') || tag.includes('masse') || tag.includes('performance');
              return (
                <span 
                  key={index} 
                  className={`px-2 py-1 text-xs rounded-full ${
                    isSpecialTag 
                      ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
        
        <div className="bg-gray-50/70 px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center">
                <Clock size={14} className="mr-1 text-gray-400" /> {workout.duration}min
              </span>
              <span className="flex items-center">
                <Flame size={14} className="mr-1 text-orange-400" /> {workout.calories} kcal
              </span>
              <span className="flex items-center">
                <Target size={14} className="mr-1 text-blue-400" /> {workout.exerciseList.length} exos
              </span>
              <span className="flex items-center">
                <Users size={14} className="mr-1 text-purple-400" /> {workout.participants}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
              {workout.difficulty}
            </span>
          </div>
          
          {showQuickStart && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleStartWorkout}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Play size={16} />
                <span>Commencer</span>
              </button>
              
              <button
                onClick={() => setShowTimer(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
                title="Chronomètre"
              >
                <Timer size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timer Modal */}
      <WorkoutTimer
        isVisible={showTimer}
        onClose={() => setShowTimer(false)}
        workoutName={workout.title}
        targetDuration={workout.duration}
      />
    </>
  );
};
