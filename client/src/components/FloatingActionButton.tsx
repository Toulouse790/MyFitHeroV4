// client/src/components/FloatingActionButton.tsx
import React, { useState } from 'react';
import { Plus, X, Dumbbell, Droplets, Moon, Utensils, Timer, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';
import { WorkoutTimer } from './WorkoutTimer';

interface FloatingActionButtonProps {
  className?: string;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [, navigate] = useLocation();

  const quickActions: QuickAction[] = [
    {
      id: 'workout',
      icon: <Dumbbell size={20} />,
      label: 'Entraînement',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => navigate('/workout')
    },
    {
      id: 'hydration',
      icon: <Droplets size={20} />,
      label: 'Hydratation',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/hydration')
    },
    {
      id: 'nutrition',
      icon: <Utensils size={20} />,
      label: 'Nutrition',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/nutrition')
    },
    {
      id: 'sleep',
      icon: <Moon size={20} />,
      label: 'Sommeil',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/sleep')
    },
    {
      id: 'timer',
      icon: <Timer size={20} />,
      label: 'Chrono',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => {
        setShowTimer(true);
        setIsOpen(false);
      }
    },
    {
      id: 'schedule',
      icon: <Calendar size={20} />,
      label: 'Planning',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => {
        // TODO: Ouvrir le planning
        console.log('Schedule clicked');
      }
    }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setIsOpen(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Timer Modal */}
      <WorkoutTimer
        isVisible={showTimer}
        onClose={() => setShowTimer(false)}
        workoutName="Entraînement Libre"
        targetDuration={30}
      />

      {/* Actions rapides */}
      <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex flex-col space-y-3 mb-4">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className={`transform transition-all duration-300 ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => handleActionClick(action)}
                className={`${action.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group`}
                title={action.label}
              >
                {action.icon}
                <span className="absolute right-full mr-3 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {action.label}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton principal */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
        aria-label={isOpen ? 'Fermer les actions rapides' : 'Ouvrir les actions rapides'}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </button>
    </div>
  );
};
