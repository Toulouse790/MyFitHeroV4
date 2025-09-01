import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  defaultDuration: number;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
  // Configuration
  setMaxNotifications: (max: number) => void;
  setDefaultDuration: (duration: number) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      maxNotifications: 5,
      defaultDuration: 5000,

      // Actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration ?? get().defaultDuration
        };

        set((state) => {
          let updatedNotifications = [...state.notifications, newNotification];
          
          // Limit the number of notifications
          if (updatedNotifications.length > state.maxNotifications) {
            updatedNotifications = updatedNotifications.slice(-state.maxNotifications);
          }

          return { notifications: updatedNotifications };
        });

        // Auto-remove after duration (unless persistent)
        if (!notification.persistent) {
          const duration = newNotification.duration || get().defaultDuration;
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }

        return id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === id
              ? { ...notification, ...updates }
              : notification
          )
        }));
      },

      // Convenience methods
      success: (title, message, options = {}) => {
        const notification = {
          type: 'success' as const,
          title,
          ...(message && { message }),
          ...options
        };
        return get().addNotification(notification);
      },

      error: (title, message, options = {}) => {
        const notification = {
          type: 'error' as const,
          title,
          ...(message && { message }),
          persistent: true,
          ...options
        };
        return get().addNotification(notification);
      },

      warning: (title, message, options = {}) => {
        const notification = {
          type: 'warning' as const,
          title,
          ...(message && { message }),
          ...options
        };
        return get().addNotification(notification);
      },

      info: (title, message, options = {}) => {
        const notification = {
          type: 'info' as const,
          title,
          ...(message && { message }),
          ...options
        };
        return get().addNotification(notification);
      },

      // Configuration
      setMaxNotifications: (max) => {
        set({ maxNotifications: max });
      },

      setDefaultDuration: (duration) => {
        set({ defaultDuration: duration });
      }
    }),
    {
      name: 'notification-store',
      partialize: (state: NotificationStore) => ({
        maxNotifications: state.maxNotifications,
        defaultDuration: state.defaultDuration
      })
    }
  )
);

// Selectors
export const selectNotifications = (state: NotificationStore) => state.notifications;
export const selectNotificationById = (id: string) => (state: NotificationStore) => 
  state.notifications.find(notification => notification.id === id);
export const selectNotificationsByType = (type: Notification['type']) => (state: NotificationStore) => 
  state.notifications.filter(notification => notification.type === type);

export default useNotificationStore;
