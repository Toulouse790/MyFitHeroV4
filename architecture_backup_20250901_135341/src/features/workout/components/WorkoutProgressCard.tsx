import React from 'react';
import { TrendingUp, Clock, Target } from 'lucide-react';

interface WorkoutProgressCardProps {
  currentExercise: number;
  totalExercises: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

export const WorkoutProgressCard: React.FC<WorkoutProgressCardProps> = ({
  currentExercise,
  totalExercises,
  timeElapsed,
  estimatedTimeRemaining,
}) => {
  const progress = (currentExercise / totalExercises) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
        <TrendingUp className="text-blue-500" size={20} />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            Exercice {currentExercise} de {totalExercises}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Time Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Clock className="text-gray-500" size={16} />
          <div>
            <p className="text-xs text-gray-500">Temps écoulé</p>
            <p className="text-sm font-medium">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Target className="text-gray-500" size={16} />
          <div>
            <p className="text-xs text-gray-500">Temps restant</p>
            <p className="text-sm font-medium">{formatTime(estimatedTimeRemaining)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
