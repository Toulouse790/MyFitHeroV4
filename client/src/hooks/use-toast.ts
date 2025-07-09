import { toast as sonnerToast } from 'sonner';
import { useState, useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: string;
  action?: React.ReactNode;
}

// Store global pour les toasts (compatible avec le toaster)
let toastsStore: ToastState[] = [];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>(toastsStore);

  // S'abonner aux changements
  const subscribe = useCallback(() => {
    const listener = () => setToasts([...toastsStore]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: ToastState = { id, title, description, variant, duration };
    
    toastsStore.push(newToast);
    notifyListeners();
    
    // Auto-remove after duration
    setTimeout(() => {
      toastsStore = toastsStore.filter(t => t.id !== id);
      notifyListeners();
    }, duration);

    const message = description ? `${title}: ${description}` : title;
    
    switch (variant) {
      case 'destructive':
        sonnerToast.error(message, { duration });
        break;
      case 'success':
        sonnerToast.success(message, { duration });
        break;
      default:
        sonnerToast(title, { 
          description,
          duration 
        });
        break;
    }
  }, []);

  return { toast, toasts, subscribe };
};

// Export du type pour compatibilité
export type Toast = ToastOptions;
