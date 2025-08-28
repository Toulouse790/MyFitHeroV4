import React from 'react';
import { Lightbulb, Star, ArrowRight } from 'lucide-react';

interface WorkoutTipCardProps {
  tip: {
    title: string;
    description: string;
    category: string;
    importance: 'low' | 'medium' | 'high';
  };
}

export const WorkoutTipCard: React.FC<WorkoutTipCardProps> = ({ tip }) => {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Star className="text-red-500" size={16} />;
      case 'medium':
        return <Lightbulb className="text-yellow-500" size={16} />;
      default:
        return <Lightbulb className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getImportanceColor(tip.importance)}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getImportanceIcon(tip.importance)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{tip.title}</h4>
            <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
              {tip.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{tip.description}</p>
          
          <button className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1">
            En savoir plus
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
