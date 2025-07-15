// client/src/components/ActiveSessionIndicator.tsx
import React from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';

export const ActiveSessionIndicator: React.FC = () => {
  const { currentSession, pauseSession, resumeSession, completeSession } = useWorkoutSession();

  if (!currentSession) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (currentSession.status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <div>
              <h3 className="font-semibold text-sm text-gray-800">{currentSession.name}</h3>
              <p className="text-xs text-gray-600">
                {formatTime(currentSession.duration)} / {currentSession.targetDuration}min
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentSession.status === 'active' && (
              <button
                onClick={pauseSession}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Pause"
              >
                <Pause size={16} className="text-gray-600" />
              </button>
            )}
            
            {currentSession.status === 'paused' && (
              <button
                onClick={resumeSession}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Reprendre"
              >
                <Play size={16} className="text-gray-600" />
              </button>
            )}
            
            <button
              onClick={completeSession}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              title="Terminer"
            >
              <Square size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getStatusColor()}`}
              style={{
                width: `${Math.min((currentSession.duration / (currentSession.targetDuration * 60)) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
