import { useState, useEffect, useCallback } from 'react';

export interface UseWorkoutTimerReturn {
  workoutTime: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  formatTime: (time: number) => string;
}

export const useWorkoutTimer = (): UseWorkoutTimerReturn => {
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isActive) {
      intervalId = setInterval(() => {
        setWorkoutTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isActive]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setWorkoutTime(0);
    setIsActive(false);
  }, []);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    workoutTime,
    isActive,
    start,
    pause,
    resume,
    reset,
    formatTime,
  };
};
