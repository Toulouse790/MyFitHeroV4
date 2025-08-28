import React from 'react';
import { Play, Clock, Users, Star, Dumbbell } from 'lucide-react';

interface WorkoutStartScreenProps {
  workout: {
    id: string;
    name: string;
    description?: string;
    duration: number;
    difficulty: string;
    exercisesCount: number;
    equipment?: string[];
    muscleGroups?: string[];
    rating?: number;
    imageUrl?: string;
  };
  onStart?: () => void;
  onCancel?: () => void;
}

export const WorkoutStartScreen: React.FC<WorkoutStartScreenProps> = ({
  workout,
  onStart,
  onCancel
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'débutant':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
      case 'intermédiaire':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
      case 'avancé':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto overflow-hidden">
      {/* Workout Image */}
      {workout.imageUrl && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={workout.imageUrl}
            alt={workout.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{workout.name}</h1>
          {workout.description && (
            <p className="text-gray-600 text-sm">{workout.description}</p>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-500" size={16} />
            <div>
              <p className="text-xs text-gray-500">Durée</p>
              <p className="text-sm font-medium">{formatTime(workout.duration)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dumbbell className="text-purple-500" size={16} />
            <div>
              <p className="text-xs text-gray-500">Exercices</p>
              <p className="text-sm font-medium">{workout.exercisesCount}</p>
            </div>
          </div>
          
          {workout.rating && (
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={16} />
              <div>
                <p className="text-xs text-gray-500">Note</p>
                <p className="text-sm font-medium">{workout.rating}/5</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Users className="text-green-500" size={16} />
            <div>
              <p className="text-xs text-gray-500">Niveau</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(workout.difficulty)}`}>
                {workout.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        {/* Equipment */}
        {workout.equipment && workout.equipment.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Équipement nécessaire</h3>
            <div className="flex flex-wrap gap-2">
              {workout.equipment.map((item, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Muscle Groups */}
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Muscles ciblés</h3>
            <div className="flex flex-wrap gap-2">
              {workout.muscleGroups.map((muscle, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Play size={20} />
            Commencer l'entraînement
          </button>
          
          <button
            onClick={onCancel}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
