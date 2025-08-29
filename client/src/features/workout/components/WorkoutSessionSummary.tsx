import React from 'react';
import { CheckCircle, Clock, Star, Share, Download } from 'lucide-react';

interface WorkoutSessionSummaryProps {
  summary: {
    workoutName: string;
    duration: number;
    exercisesCompleted: number;
    totalExercises: number;
    caloriesBurned?: number;
    personalRecords?: string[];
    rating?: number;
    notes?: string;
  };
  onRate?: (rating: number) => void;
  onShare?: () => void;
  onSave?: () => void;
  onClose?: () => void;
}

export const WorkoutSessionSummary: React.FC<WorkoutSessionSummaryProps> = ({
  summary,
  onRate,
  onShare,
  onSave,
  onClose,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const completionRate = (summary.exercisesCompleted / summary.totalExercises) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Séance terminée !</h2>
        <p className="text-gray-600">{summary.workoutName}</p>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            <span className="text-sm text-gray-600">Durée</span>
          </div>
          <span className="font-medium">{formatTime(summary.duration)}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-sm text-gray-600">Exercices</span>
          </div>
          <span className="font-medium">
            {summary.exercisesCompleted}/{summary.totalExercises} ({Math.round(completionRate)}%)
          </span>
        </div>

        {summary.caloriesBurned && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🔥</span>
              <span className="text-sm text-gray-600">Calories</span>
            </div>
            <span className="font-medium">{summary.caloriesBurned} kcal</span>
          </div>
        )}
      </div>

      {/* Personal Records */}
      {summary.personalRecords && summary.personalRecords.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">🏆 Nouveaux records !</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {summary.personalRecords.map((record, index) => (
              <li key={index}>• {record}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Comment s'est passée votre séance ?
        </h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => onRate?.(rating)}
              className={`p-1 ${
                summary.rating && rating <= summary.rating
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <Star size={24} fill="currentColor" />
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      {summary.notes && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
          <p className="text-sm text-gray-600">{summary.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Share size={16} />
          Partager
        </button>

        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <Download size={16} />
          Sauvegarder
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        Fermer
      </button>
    </div>
  );
};
