import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default query options
const queryConfig: DefaultOptions = {
  queries: {
    // Cache time - how long data stays in cache when component unmounts
    gcTime: 1000 * 60 * 5, // 5 minutes
    
    // Stale time - how long data is considered fresh
    staleTime: 1000 * 60, // 1 minute
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) {
          return false;
        }
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (useful for real-time data)
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
    
    // Background refetch interval (optional)
    // refetchInterval: 1000 * 60 * 5, // 5 minutes
  },
  
  mutations: {
    // Retry mutations only once
    retry: 1,
    
    // Mutation retry delay
    retryDelay: 1000,
  }
};

// Query keys factory for consistent key management
export const queryKeys = {
  // Authentication
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
    preferences: ['auth', 'preferences'] as const,
  },
  
  // Workouts
  workouts: {
    all: ['workouts'] as const,
    lists: () => [...queryKeys.workouts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.workouts.lists(), { filters }] as const,
    details: () => [...queryKeys.workouts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workouts.details(), id] as const,
    templates: ['workouts', 'templates'] as const,
    sessions: (userId: string) => ['workouts', 'sessions', userId] as const,
    history: (userId: string) => ['workouts', 'history', userId] as const,
  },
  
  // Nutrition
  nutrition: {
    all: ['nutrition'] as const,
    meals: (userId: string, date: string) => [...queryKeys.nutrition.all, 'meals', userId, date] as const,
    foods: () => [...queryKeys.nutrition.all, 'foods'] as const,
    tracking: (userId: string) => [...queryKeys.nutrition.all, 'tracking', userId] as const,
    goals: (userId: string) => [...queryKeys.nutrition.all, 'goals', userId] as const,
  },
  
  // Recovery
  recovery: {
    all: ['recovery'] as const,
    status: (userId: string) => [...queryKeys.recovery.all, 'status', userId] as const,
    metrics: (userId: string, period: string) => [...queryKeys.recovery.all, 'metrics', userId, period] as const,
    recommendations: (userId: string) => [...queryKeys.recovery.all, 'recommendations', userId] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: (userId: string) => [...queryKeys.analytics.all, 'dashboard', userId] as const,
    progress: (userId: string, type: string) => [...queryKeys.analytics.all, 'progress', userId, type] as const,
    insights: (userId: string) => [...queryKeys.analytics.all, 'insights', userId] as const,
  },
  
  // Admin
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    reports: (type: string) => [...queryKeys.admin.all, 'reports', type] as const,
  }
};

// Create query client with configuration
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: queryConfig,
    
    // Global error handler
    queryCache: undefined,
    mutationCache: undefined,
  });
};

// Singleton query client instance
export const queryClient = createQueryClient();

// Helper functions for cache management
export const invalidateQueries = {
  // Invalidate all auth-related queries
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
  
  // Invalidate workout queries
  workouts: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all }),
    byId: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(id) }),
    lists: () => queryClient.invalidateQueries({ queryKey: queryKeys.workouts.lists() }),
  },
  
  // Invalidate nutrition queries
  nutrition: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all }),
    meals: (userId: string, date: string) => 
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.meals(userId, date) }),
    tracking: (userId: string) => 
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.tracking(userId) }),
  },
  
  // Invalidate recovery queries
  recovery: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.recovery.all }),
    status: (userId: string) => 
      queryClient.invalidateQueries({ queryKey: queryKeys.recovery.status(userId) }),
  },
  
  // Invalidate analytics queries
  analytics: {
    all: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
    dashboard: (userId: string) => 
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard(userId) }),
  }
};

// Cache prefetching utilities
export const prefetchQueries = {
  workouts: {
    templates: () => queryClient.prefetchQuery({
      queryKey: queryKeys.workouts.templates,
      queryFn: () => import('../features/workout/services/WorkoutService').then(m => m.workoutService.getTemplates()),
      staleTime: 1000 * 60 * 10, // 10 minutes
    }),
  },
  
  nutrition: {
    foods: () => queryClient.prefetchQuery({
      queryKey: queryKeys.nutrition.foods(),
      queryFn: () => import('../features/nutrition/services/NutritionService').then(m => m.nutritionService.getFoods()),
      staleTime: 1000 * 60 * 30, // 30 minutes
    }),
  }
};

export default queryConfig;
