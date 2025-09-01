import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: number;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
      };

      setNotifications(prev => [...prev, newNotification]);

      // Auto-remove after duration (default 5 seconds) unless persistent
      if (!notification.persistent) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string): string => {
      const notification: Omit<Notification, 'id' | 'timestamp'> = { type: 'success', title };
      if (message !== undefined) notification.message = message;
      return addNotification(notification);
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string): string => {
      const notification: Omit<Notification, 'id' | 'timestamp'> = {
        type: 'error',
        title,
        persistent: true,
      };
      if (message !== undefined) notification.message = message;
      return addNotification(notification);
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string): string => {
      const notification: Omit<Notification, 'id' | 'timestamp'> = { type: 'warning', title };
      if (message !== undefined) notification.message = message;
      return addNotification(notification);
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string): string => {
      const notification: Omit<Notification, 'id' | 'timestamp'> = { type: 'info', title };
      if (message !== undefined) notification.message = message;
      return addNotification(notification);
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
  };
};

export default useNotifications;
