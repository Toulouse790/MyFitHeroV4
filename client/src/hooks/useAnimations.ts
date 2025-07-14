import { useEffect, useState, useRef } from 'react';

// Hook pour les animations d'entrée
export const useAnimateOnMount = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return isVisible;
};

// Hook pour les animations au scroll
export const useAnimateOnScroll = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return { elementRef, isVisible };
};

// Hook pour les animations de progression
export const useProgressAnimation = (targetValue: number, duration = 1000) => {
  const [currentValue, setCurrentValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(targetValue * easeOut);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration]);
  
  return currentValue;
};

// Hook pour les vibrations haptiques
export const useHaptic = () => {
  const vibrate = (pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };
  
  const successVibration = () => vibrate([50, 100, 50]);
  const errorVibration = () => vibrate([100, 50, 100, 50, 100]);
  const clickVibration = () => vibrate(25);
  
  return {
    vibrate,
    successVibration,
    errorVibration,
    clickVibration
  };
};

// Hook pour les notifications avec animations
export const useAnimatedToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    isExiting: boolean;
  }>>([]);
  
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type, isExiting: false };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove après 3 secondes
    setTimeout(() => {
      setToasts(prev => 
        prev.map(toast => 
          toast.id === id ? { ...toast, isExiting: true } : toast
        )
      );
      
      // Supprimer définitivement après l'animation
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 300);
    }, 3000);
  };
  
  return { toasts, addToast };
};
