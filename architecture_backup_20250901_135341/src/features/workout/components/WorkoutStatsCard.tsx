import React from 'react';
import { BarChart3, Clock, Trophy, Flame } from 'lucide-react';

interface WorkoutStatsCardProps {
  stats: {
    duration: number;
    exercisesCompleted: number;
    totalExercises: number;
    caloriesBurned?: number;
    averageHeartRate?: number;
    personalRecords?: number;
  };
}

export const WorkoutStatsCard: React.FC<WorkoutStatsCardProps> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const completionRate = (stats.exercisesCompleted / stats.totalExercises) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
        <BarChart3 className="text-blue-500" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Duration */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <Clock className="text-blue-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Durée</p>
            <p className="font-medium">{formatTime(stats.duration)}</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <Trophy className="text-green-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Completion</p>
            <p className="font-medium">{Math.round(completionRate)}%</p>
          </div>
        </div>

        {/* Calories */}
        {stats.caloriesBurned && (
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Flame className="text-orange-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Calories</p>
              <p className="font-medium">{stats.caloriesBurned}</p>
            </div>
          </div>
        )}

        {/* Heart Rate */}
        {stats.averageHeartRate && (
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-5 h-5 text-red-500">💓</div>
            <div>
              <p className="text-xs text-gray-500">FC Moy.</p>
              <p className="font-medium">{stats.averageHeartRate} bpm</p>
            </div>
          </div>
        )}
      </div>

      {/* Personal Records */}
      {stats.personalRecords && stats.personalRecords > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={16} />
            <p className="text-sm font-medium text-yellow-800">
              {stats.personalRecords} nouveau{stats.personalRecords > 1 ? 'x' : ''} record
              {stats.personalRecords > 1 ? 's' : ''} personnel{stats.personalRecords > 1 ? 's' : ''}{' '}
              !
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
