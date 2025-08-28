import React from 'react';
import { Clock, Users, Trophy } from 'lucide-react';

interface WorkoutSessionHeaderProps {
  title: string;
  duration?: number;
  participants?: number;
  difficulty?: string;
}

export const WorkoutSessionHeader: React.FC<WorkoutSessionHeaderProps> = ({
  title,
  duration,
  participants,
  difficulty
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {duration && (
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{duration} min</span>
          </div>
        )}
        
        {participants && (
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{participants} participants</span>
          </div>
        )}
        
        {difficulty && (
          <div className="flex items-center gap-1">
            <Trophy size={16} />
            <span>{difficulty}</span>
          </div>
        )}
      </div>
    </div>
  );
};
