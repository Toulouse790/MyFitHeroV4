import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { api } from './api';
import type { ApiError } from '../types/api';

// Query keys factory for consistent cache management
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    preferences: () => [...queryKeys.auth.all, 'preferences'] as const,
    stats: () => [...queryKeys.auth.all, 'stats'] as const,
  },

  // User data queries
  user: {
    all: ['user'] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
    preferences: (id: string) => [...queryKeys.user.all, 'preferences', id] as const,
    stats: (id: string) => [...queryKeys.user.all, 'stats', id] as const,
    achievements: (id: string) => [...queryKeys.user.all, 'achievements', id] as const,
  },

  // Workout queries
  workouts: {
    all: ['workouts'] as const,
    lists: () => [...queryKeys.workouts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.workouts.lists(), filters] as const,
    details: () => [...queryKeys.workouts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workouts.details(), id] as const,
    templates: () => [...queryKeys.workouts.all, 'templates'] as const,
    history: (userId: string) => [...queryKeys.workouts.all, 'history', userId] as const,
    sessions: () => [...queryKeys.workouts.all, 'sessions'] as const,
    activeSession: () => [...queryKeys.workouts.sessions(), 'active'] as const,
  },

  // Exercise queries
  exercises: {
    all: ['exercises'] as const,
    lists: () => [...queryKeys.exercises.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.exercises.lists(), filters] as const,
    details: () => [...queryKeys.exercises.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exercises.details(), id] as const,
    categories: () => [...queryKeys.exercises.all, 'categories'] as const,
    equipment: () => [...queryKeys.exercises.all, 'equipment'] as const,
  },

  // Nutrition queries
  nutrition: {
    all: ['nutrition'] as const,
    meals: () => [...queryKeys.nutrition.all, 'meals'] as const,
    meal: (id: string) => [...queryKeys.nutrition.meals(), id] as const,
    foods: () => [...queryKeys.nutrition.all, 'foods'] as const,
    food: (id: string) => [...queryKeys.nutrition.foods(), id] as const,
    tracking: () => [...queryKeys.nutrition.all, 'tracking'] as const,
    dailyTracking: (date: string) => [...queryKeys.nutrition.tracking(), date] as const,
    macros: (userId: string, date: string) => 
      [...queryKeys.nutrition.all, 'macros', userId, date] as const,
  },

  // Recovery queries
  recovery: {
    all: ['recovery'] as const,
    status: () => [...queryKeys.recovery.all, 'status'] as const,
    metrics: () => [...queryKeys.recovery.all, 'metrics'] as const,
    recommendations: () => [...queryKeys.recovery.all, 'recommendations'] as const,
    sleep: () => [...queryKeys.recovery.all, 'sleep'] as const,
    sleepData: (date: string) => [...queryKeys.recovery.sleep(), date] as const,
    hrv: () => [...queryKeys.recovery.all, 'hrv'] as const,
    stress: () => [...queryKeys.recovery.all, 'stress'] as const,
  },

  // Hydration queries
  hydration: {
    all: ['hydration'] as const,
    daily: (date: string) => [...queryKeys.hydration.all, 'daily', date] as const,
    history: (userId: string, days: number) => 
      [...queryKeys.hydration.all, 'history', userId, days] as const,
    goals: () => [...queryKeys.hydration.all, 'goals'] as const,
  },

  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    progress: (userId: string, metric: string, timeframe: string) => 
      [...queryKeys.analytics.all, 'progress', userId, metric, timeframe] as const,
    reports: () => [...queryKeys.analytics.all, 'reports'] as const,
    insights: () => [...queryKeys.analytics.all, 'insights'] as const,
  },

  // Social queries
  social: {
    all: ['social'] as const,
    feed: () => [...queryKeys.social.all, 'feed'] as const,
    friends: () => [...queryKeys.social.all, 'friends'] as const,
    challenges: () => [...queryKeys.social.all, 'challenges'] as const,
    challenge: (id: string) => [...queryKeys.social.challenges(), id] as const,
    leaderboards: () => [...queryKeys.social.all, 'leaderboards'] as const,
  },

  // Wearables queries
  wearables: {
    all: ['wearables'] as const,
    devices: () => [...queryKeys.wearables.all, 'devices'] as const,
    device: (id: string) => [...queryKeys.wearables.devices(), id] as const,
    sync: () => [...queryKeys.wearables.all, 'sync'] as const,
    data: (deviceId: string, type: string) => 
      [...queryKeys.wearables.all, 'data', deviceId, type] as const,
  },
} as const;

// Enhanced error handling
const handleQueryError = (error: unknown): ApiError => {
  if (error && typeof error === 'object' && 'status' in error) {
    return error as ApiError;
  }

  return {
    status: 500,
    statusText: 'Internal Error',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    details: { originalError: error }
  };
};

// Global error handler
const globalErrorHandler = (error: unknown): void => {
  const apiError = handleQueryError(error);
  
  // Log error in development
  if (import.meta.env.DEV) {
    console.error('Query Error:', {
      status: apiError.status,
      message: apiError.message,
      details: apiError.details
    });
  }

  // Handle specific error cases
  switch (apiError.status) {
    case 401:
      // Handle unauthorized - already handled by API interceptor
      break;
    case 403:
      // Handle forbidden
      console.warn('Access denied:', apiError.message);
      break;
    case 429:
      // Handle rate limiting
      console.warn('Rate limit exceeded:', apiError.message);
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      // Handle server errors
      console.error('Server error:', apiError.message);
      break;
    default:
      console.error('Unhandled error:', apiError.message);
  }
};

// Retry logic for failed queries
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  const apiError = handleQueryError(error);
  
  // Don't retry client errors (4xx) except 429 (rate limit)
  if (apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) {
    return false;
  }

  // Retry up to 3 times for server errors and network issues
  return failureCount < 3;
};

// Retry delay with exponential backoff
const retryDelay = (attemptIndex: number): number => {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

// Query cache configuration
const queryCache = new QueryCache({
  onError: globalErrorHandler,
  onSuccess: (data, query) => {
    // Log successful queries in development
    if (import.meta.env.DEV) {
      console.log('Query Success:', {
        queryKey: query.queryKey,
        dataType: typeof data,
        hasData: !!data
      });
    }
  },
});

// Mutation cache configuration
const mutationCache = new MutationCache({
  onError: globalErrorHandler,
  onSuccess: (data, _variables, _context, mutation) => {
    // Log successful mutations in development
    if (import.meta.env.DEV) {
      console.log('Mutation Success:', {
        mutationKey: mutation.options.mutationKey,
        dataType: typeof data
      });
    }
  },
});

// Main QueryClient configuration
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache when unused
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in older versions)
      
      // Retry configuration
      retry: shouldRetry,
      retryDelay,
      
      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Error handling
      throwOnError: false,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error) => {
        const apiError = handleQueryError(error);
        // Only retry server errors, not client errors
        return failureCount < 2 && apiError.status >= 500;
      },
      retryDelay,
      
      // Error handling
      throwOnError: false,
      
      // Network mode
      networkMode: 'online',
    },
  },
});

// Simple localStorage persistence (without external dependency)
const persistanceKey = 'myfit-hero-cache';

// Save critical query data to localStorage
const saveCriticalData = (queryClient: QueryClient): void => {
  try {
    const criticalQueries = [
      queryKeys.auth.user(),
      queryKeys.auth.preferences(),
      queryKeys.workouts.templates(),
    ];

    const dataToSave: Record<string, unknown> = {};
    
    criticalQueries.forEach((queryKey) => {
      const data = queryClient.getQueryData(queryKey);
      if (data) {
        dataToSave[JSON.stringify(queryKey)] = data;
      }
    });

    localStorage.setItem(persistanceKey, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn('Failed to save query data to localStorage:', error);
  }
};

// Load critical query data from localStorage
const loadCriticalData = (queryClient: QueryClient): void => {
  try {
    const savedData = localStorage.getItem(persistanceKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      Object.entries(parsedData).forEach(([keyString, data]) => {
        try {
          const queryKey = JSON.parse(keyString);
          queryClient.setQueryData(queryKey, data);
        } catch (error) {
          console.warn('Failed to restore query data:', error);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to load query data from localStorage:', error);
  }
};

// Initialize persistence (only in browser)
if (typeof window !== 'undefined') {
  // Load persisted data on initialization
  loadCriticalData(queryClient);
  
  // Save data before page unload
  window.addEventListener('beforeunload', () => {
    saveCriticalData(queryClient);
  });
  
  // Save data periodically
  setInterval(() => {
    saveCriticalData(queryClient);
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Query prefetching helpers
export const prefetchQueries = {
  // Prefetch user profile
  userProfile: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(userId),
      queryFn: () => api.get(`/users/${userId}/profile`),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  // Prefetch workout templates
  workoutTemplates: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.workouts.templates(),
      queryFn: () => api.get('/workouts/templates'),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  },

  // Prefetch exercises
  exercises: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.exercises.list(),
      queryFn: () => api.get('/exercises'),
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  },

  // Prefetch today's nutrition
  todayNutrition: async () => {
    const today = new Date().toISOString().split('T')[0];
    if (today) {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.nutrition.dailyTracking(today),
        queryFn: () => api.get(`/nutrition/tracking/${today}`),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all auth-related queries
  auth: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  },

  // Invalidate user data
  user: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    }
  },

  // Invalidate workout data
  workouts: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all });
  },

  // Invalidate nutrition data
  nutrition: (date?: string) => {
    if (date) {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.dailyTracking(date) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all });
    }
  },

  // Invalidate recovery data
  recovery: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.recovery.all });
  },

  // Invalidate all cached data
  all: () => {
    queryClient.invalidateQueries();
  },
};

// Cache optimization helpers
export const optimisticUpdates = {
  // Optimistic update for user profile
  updateUserProfile: (userId: string, updates: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.user.profile(userId),
      (oldData: unknown) => {
        if (oldData && typeof oldData === 'object') {
          return { ...oldData, ...updates };
        }
        return updates;
      }
    );
  },

  // Optimistic update for workout completion
  completeWorkout: (workoutId: string) => {
    queryClient.setQueryData(
      queryKeys.workouts.detail(workoutId),
      (oldData: unknown) => {
        if (oldData && typeof oldData === 'object') {
          return { 
            ...oldData, 
            status: 'completed',
            completedAt: new Date().toISOString()
          };
        }
        return oldData;
      }
    );
  },
};

// Background synchronization
export const backgroundSync = {
  // Sync critical data in background
  syncCriticalData: async () => {
    const promises = [
      queryClient.refetchQueries({ queryKey: queryKeys.auth.user() }),
      queryClient.refetchQueries({ queryKey: queryKeys.workouts.activeSession() }),
    ];

    await Promise.allSettled(promises);
  },

  // Sync all stale data
  syncStaleData: async () => {
    await queryClient.refetchQueries({ stale: true });
  },
};

export default queryClient;
