import { api } from '../lib/api';

// Standard service response type
interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * High-level service layer that orchestrates API calls
 * and provides business logic operations
 */
export class ApiServiceLayer {
  // Authentication operations
  async signIn(email: string, password: string): Promise<ServiceResponse> {
    try {
      const response = await api.auth.login({ email, password });

      if (response.success && response.data?.tokens) {
        // Set auth token for subsequent requests
        api.setAuthToken(response.data.tokens.accessToken);

        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || 'Login failed',
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async signUp(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.auth.register(userData);

      if (response.success && response.data?.tokens) {
        // Set auth token for subsequent requests
        api.setAuthToken(response.data.tokens.accessToken);

        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.error || 'Registration failed',
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await api.auth.logout();
    } catch {
      // Erreur silencieuse
      console.warn('Logout error:', error);
    } finally {
      // Always clear token locally
      api.setAuthToken('');
    }
  }

  async refreshUserSession(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await api.auth.refreshToken(refreshToken);

      if (response.success && response.data?.tokens) {
        api.setAuthToken(response.data.tokens.accessToken);

        // Update stored tokens
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);

        return true;
      }

      return false;
    } catch {
      // Erreur silencieuse
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // User profile operations
  async getUserProfile(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.user.getProfile();
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  async updateUserProfile(
    updates: Record<string, unknown>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.user.updateProfile(updates);
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // Workout operations
  async getWorkouts(
    page = 1,
    limit = 20
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.workout.getWorkouts({ page, limit });
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workouts',
      };
    }
  }

  async createWorkout(
    workoutData: Record<string, unknown>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.workout.createWorkout(workoutData);
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workout',
      };
    }
  }

  // Nutrition operations
  async getTodaysMeals(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.nutrition.getMeals(today);
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meals',
      };
    }
  }

  async addMeal(
    mealData: Record<string, unknown>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.nutrition.addMeal(mealData);
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add meal',
      };
    }
  }

  // Recovery operations
  async getRecoveryStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.recovery.getStatus();
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recovery status',
      };
    }
  }

  async updateRecoveryStatus(
    statusData: Record<string, unknown>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.recovery.updateStatus(statusData);
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recovery status',
      };
    }
  }

  // Analytics operations
  async getDashboardData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.analytics.getDashboard();
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      };
    }
  }

  // File upload operations
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.upload(endpoint, file, onProgress);
      return {
        success: response.success,
        data: response.data,
        error: response.error,
      };
    } catch {
      // Erreur silencieuse
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Batch operations
  async batchOperation(operations: Array<() => Promise<any>>): Promise<{
    results: Array<{ success: boolean; data?: any; error?: string }>;
    successCount: number;
    errorCount: number;
  }> {
    const results = await Promise.allSettled(operations.map(op => op()));

    const processedResults = results.map(result => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value };
      } else {
        return {
          success: false,
          error: result.reason instanceof Error ? result.reason.message : 'Operation failed',
        };
      }
    });

    const successCount = processedResults.filter(r => r.success).length;
    const errorCount = processedResults.filter(r => !r.success).length;

    return {
      results: processedResults,
      successCount,
      errorCount,
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.success;
    } catch {
      // Erreur silencieuse
      return false;
    }
  }
}

// Export singleton instance
export const apiServiceLayer = new ApiServiceLayer();
export default apiServiceLayer;
