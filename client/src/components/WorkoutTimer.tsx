// client/src/components/WorkoutTimer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Target, Zap } from 'lucide-react';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';

interface WorkoutTimerProps {
  isVisible: boolean;
  onClose: () => void;
  workoutName?: string;
  targetDuration?: number; // en minutes
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  isVisible,
  onClose,
  workoutName = 'Entraînement',
  targetDuration = 30
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0); // en secondes
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { startSession, updateSessionDuration, completeSession, cancelSession } = useWorkoutSession();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    const targetSeconds = targetDuration * 60;
    return Math.min((timeElapsed / targetSeconds) * 100, 100);
  };

  const startTimer = useCallback(() => {
    if (timerState === 'running') return;
    
    // Démarrer une session si c'est la première fois
    if (timerState === 'idle') {
      startSession(workoutName, targetDuration);
    }
    
    setTimerState('running');
    const id = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        updateSessionDuration(newTime);
        return newTime;
      });
    }, 1000);
    setIntervalId(id);
  }, [timerState, workoutName, targetDuration, startSession, updateSessionDuration]);

  const pauseTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimerState('paused');
  }, [intervalId]);

  const stopTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimerState('idle');
    setTimeElapsed(0);
    cancelSession();
  }, [intervalId, cancelSession]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeElapsed(0);
    setTimerState('idle');
  }, [stopTimer]);

  // Vérifier si l'objectif est atteint
  useEffect(() => {
    if (timeElapsed >= targetDuration * 60 && timerState === 'running') {
      pauseTimer();
      setTimerState('completed');
      completeSession();
      
      // Vibration sur mobile si disponible
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [timeElapsed, targetDuration, timerState, pauseTimer, completeSession]);

  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{workoutName}</h2>
            <p className="text-sm text-gray-600">Objectif: {targetDuration} minutes</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Square size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Timer principal */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* Cercle de progression */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Cercle de fond */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              {/* Cercle de progression */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={timerState === 'completed' ? '#10b981' : '#3b82f6'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - getProgressPercentage() / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
            
            {/* Temps au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(getProgressPercentage())}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock size={16} className="text-blue-500" />
            </div>
            <div className="text-sm font-medium text-gray-800">
              {formatTime(timeElapsed)}
            </div>
            <div className="text-xs text-gray-500">Écoulé</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target size={16} className="text-green-500" />
            </div>
            <div className="text-sm font-medium text-gray-800">
              {formatTime(Math.max(0, targetDuration * 60 - timeElapsed))}
            </div>
            <div className="text-xs text-gray-500">Restant</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap size={16} className="text-orange-500" />
            </div>
            <div className="text-sm font-medium text-gray-800">
              {Math.round((timeElapsed / 60) * 12)} {/* Estimation calorique */}
            </div>
            <div className="text-xs text-gray-500">Calories</div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={resetTimer}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Reset"
          >
            <RotateCcw size={20} className="text-gray-600" />
          </button>
          
          <button
            onClick={timerState === 'running' ? pauseTimer : startTimer}
            className={`p-4 rounded-full transition-colors ${
              timerState === 'running'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            title={timerState === 'running' ? 'Pause' : 'Start'}
          >
            {timerState === 'running' ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white" />
            )}
          </button>
          
          <button
            onClick={stopTimer}
            className="p-3 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
            title="Stop"
          >
            <Square size={20} className="text-red-600" />
          </button>
        </div>

        {/* Message de completion */}
        {timerState === 'completed' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <Target size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">Objectif atteint ! 🎉</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Excellent travail ! Vous avez terminé votre entraînement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
