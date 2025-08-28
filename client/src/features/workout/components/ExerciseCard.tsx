import React from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    sets: number;
    reps?: number;
    duration?: number;
    weight?: number;
    restTime?: number;
    completed?: boolean;
  };
  currentSet?: number;
  isActive?: boolean;
  onStartSet?: () => void;
  onCompleteSet?: () => void;
  onRestStart?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  currentSet = 1,
  isActive = false,
  onStartSet,
  onCompleteSet,
  onRestStart
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-lg border p-4 transition-all ${
      isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
    } ${exercise.completed ? 'opacity-60' : ''}`}>
      
      {/* Exercise Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{exercise.name}</h3>
        {exercise.completed && (
          <div className="flex items-center gap-1 text-green-600">
            <Check size={16} />
            <span className="text-xs">Terminé</span>
          </div>
        )}
      </div>
      
      {/* Exercise Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Séries:</span>
          <span className="ml-2 font-medium">{currentSet}/{exercise.sets}</span>
        </div>
        
        {exercise.reps && (
          <div>
            <span className="text-gray-500">Répétitions:</span>
            <span className="ml-2 font-medium">{exercise.reps}</span>
          </div>
        )}
        
        {exercise.duration && (
          <div>
            <span className="text-gray-500">Durée:</span>
            <span className="ml-2 font-medium">{formatTime(exercise.duration)}</span>
          </div>
        )}
        
        {exercise.weight && (
          <div>
            <span className="text-gray-500">Poids:</span>
            <span className="ml-2 font-medium">{exercise.weight} kg</span>
          </div>
        )}
      </div>
      
      {/* Rest Time */}
      {exercise.restTime && (
        <div className="mb-4 text-sm">
          <span className="text-gray-500">Repos:</span>
          <span className="ml-2 font-medium">{formatTime(exercise.restTime)}</span>
        </div>
      )}
      
      {/* Progress Dots */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: exercise.sets }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < currentSet - 1
                ? 'bg-green-500'
                : i === currentSet - 1 && isActive
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Action Buttons */}
      {isActive && !exercise.completed && (
        <div className="flex gap-2">
          <button
            onClick={onStartSet}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Play size={16} />
            Commencer
          </button>
          
          <button
            onClick={onCompleteSet}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Check size={16} />
            Terminer
          </button>
          
          {exercise.restTime && (
            <button
              onClick={onRestStart}
              className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
