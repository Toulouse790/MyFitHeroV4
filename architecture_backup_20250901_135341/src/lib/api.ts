import { apiService } from '../services/ApiService';
import { API_ENDPOINTS } from '../types/api';
import type { 
  ApiResponse, 
  PaginatedResponse,
  UploadResponse,
  UploadProgress 
} from '../types/api';

// Re-export types for convenience
export type { 
  ApiResponse, 
  ApiError, 
  RequestConfig,
  PaginatedResponse,
  UploadResponse,
  UploadProgress 
} from '../types/api';

// Authentication API methods
const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiService.post<{ user: any; tokens: any }>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  register: async (userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) => {
    return apiService.post<{ user: any; tokens: any }>(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  refreshToken: async (refreshToken: string) => {
    return apiService.post<{ tokens: any; user?: any }>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  },

  logout: async () => {
    return apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getProfile: async () => {
    return apiService.get<any>(API_ENDPOINTS.AUTH.PROFILE);
  },

  updateProfile: async (updates: Record<string, unknown>) => {
    return apiService.patch<any>(API_ENDPOINTS.AUTH.PROFILE, updates);
  },

  verifyEmail: async (token: string) => {
    return apiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }
};

// User API methods
const userApi = {
  getProfile: async () => {
    return apiService.get<any>(API_ENDPOINTS.USER.PROFILE);
  },

  updateProfile: async (updates: Record<string, unknown>) => {
    return apiService.patch<any>(API_ENDPOINTS.USER.PROFILE, updates);
  },

  getPreferences: async () => {
    return apiService.get<any>(API_ENDPOINTS.USER.PREFERENCES);
  },

  updatePreferences: async (preferences: Record<string, unknown>) => {
    return apiService.patch<any>(API_ENDPOINTS.USER.PREFERENCES, preferences);
  },

  uploadAvatar: async (file: File, onProgress?: (progress: UploadProgress) => void) => {
    return apiService.upload(API_ENDPOINTS.USER.AVATAR, file, onProgress);
  }
};

// Workout API methods
const workoutApi = {
  getWorkouts: async (params?: { page?: number; limit?: number }) => {
    return apiService.get<PaginatedResponse<any>>(API_ENDPOINTS.WORKOUT.LIST, params);
  },

  getWorkout: async (id: string) => {
    return apiService.get<any>(API_ENDPOINTS.WORKOUT.UPDATE.replace(':id', id));
  },

  createWorkout: async (workoutData: Record<string, unknown>) => {
    return apiService.post<any>(API_ENDPOINTS.WORKOUT.CREATE, workoutData);
  },

  updateWorkout: async (id: string, updates: Record<string, unknown>) => {
    return apiService.patch<any>(API_ENDPOINTS.WORKOUT.UPDATE.replace(':id', id), updates);
  },

  deleteWorkout: async (id: string) => {
    return apiService.delete(API_ENDPOINTS.WORKOUT.DELETE.replace(':id', id));
  },

  getTemplates: async () => {
    return apiService.get<any[]>(API_ENDPOINTS.WORKOUT.TEMPLATES);
  }
};

// Nutrition API methods
const nutritionApi = {
  getMeals: async (date?: string) => {
    const params = date ? { date } : undefined;
    return apiService.get<any[]>(API_ENDPOINTS.NUTRITION.MEALS, params);
  },

  addMeal: async (mealData: Record<string, unknown>) => {
    return apiService.post<any>(API_ENDPOINTS.NUTRITION.MEALS, mealData);
  },

  updateMeal: async (id: string, updates: Record<string, unknown>) => {
    return apiService.patch<any>(`${API_ENDPOINTS.NUTRITION.MEALS}/${id}`, updates);
  },

  deleteMeal: async (id: string) => {
    return apiService.delete(`${API_ENDPOINTS.NUTRITION.MEALS}/${id}`);
  },

  searchFoods: async (query: string) => {
    return apiService.get<any[]>(API_ENDPOINTS.NUTRITION.FOODS, { search: query });
  },

  getTracking: async (date?: string) => {
    const params = date ? { date } : undefined;
    return apiService.get<any>(API_ENDPOINTS.NUTRITION.TRACKING, params);
  },

  updateTracking: async (trackingData: Record<string, unknown>) => {
    return apiService.post<any>(API_ENDPOINTS.NUTRITION.TRACKING, trackingData);
  }
};

// Recovery API methods
const recoveryApi = {
  getStatus: async () => {
    return apiService.get<any>(API_ENDPOINTS.RECOVERY.STATUS);
  },

  updateStatus: async (statusData: Record<string, unknown>) => {
    return apiService.post<any>(API_ENDPOINTS.RECOVERY.STATUS, statusData);
  },

  getMetrics: async (period?: string) => {
    const params = period ? { period } : undefined;
    return apiService.get<any[]>(API_ENDPOINTS.RECOVERY.METRICS, params);
  },

  getRecommendations: async () => {
    return apiService.get<any[]>(API_ENDPOINTS.RECOVERY.RECOMMENDATIONS);
  }
};

// Analytics API methods
const analyticsApi = {
  getDashboard: async () => {
    return apiService.get<any>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  },

  exportData: async (type: string, format: string = 'json') => {
    return apiService.get<any>(API_ENDPOINTS.ANALYTICS.EXPORT, { type, format });
  }
};

// Generic API methods
export const api = {
  // Direct access to service methods
  get: apiService.get.bind(apiService),
  post: apiService.post.bind(apiService),
  put: apiService.put.bind(apiService),
  patch: apiService.patch.bind(apiService),
  delete: apiService.delete.bind(apiService),
  upload: apiService.upload.bind(apiService),
  
  // Specialized methods
  getPaginated: apiService.getPaginated.bind(apiService),
  
  // Token management
  setAuthToken: apiService.setAuthToken.bind(apiService),
  
  // Request cancellation
  cancelAllRequests: apiService.cancelAllRequests.bind(apiService),
  cancelRequest: apiService.cancelRequest.bind(apiService),
  
  // Feature-specific APIs
  auth: authApi,
  user: userApi,
  workout: workoutApi,
  nutrition: nutritionApi,
  recovery: recoveryApi,
  analytics: analyticsApi
};

// Default export
export default api;

// Named exports for specific APIs
export { authApi, userApi, workoutApi, nutritionApi, recoveryApi, analyticsApi };
