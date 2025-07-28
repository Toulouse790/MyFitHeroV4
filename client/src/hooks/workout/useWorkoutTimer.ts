// hooks/workout/useWorkoutTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWorkoutTimerReturn {
  totalTime: number;
  exerciseTime: number;
  restTime: number;
  isResting: boolean;
  startExerciseTimer: () => void;
  startRestTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export const useWorkoutTimer = (isSessionActive: boolean): UseWorkoutTimerReturn => {
  const [totalTime, setTotalTime] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer principal
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
        if (isResting) {
          setRestTime(prev => Math.max(0, prev - 1));
        } else {
          setExerciseTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSessionActive, isPaused, isResting]);

  const startExerciseTimer = useCallback(() => {
    setIsResting(false);
    setExerciseTime(0);
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }
  }, []);

  const startRestTimer = useCallback((duration: number) => {
    setIsResting(true);
    setRestTime(duration);
    
    restTimeoutRef.current = setTimeout(() => {
      setIsResting(false);
      setRestTime(0);
    }, duration * 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTotalTime(0);
    setExerciseTime(0);
    setRestTime(0);
    setIsResting(false);
    setIsPaused(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    totalTime,
    exerciseTime,
    restTime,
    isResting,
    startExerciseTimer,
    startRestTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  };
};
