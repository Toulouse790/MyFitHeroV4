import { createClient } from '@supabase/supabase-js';
import { ApiService } from '../services/ApiService';
import type { 
  ApiResponse, 
  RequestConfig, 
  AuthTokens,
  ApiError 
} from '../types/api';

// Environment configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Supabase client initialization
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enhanced API client with Supabase integration
class EnhancedApiService extends ApiService {
  private retryQueue: Array<() => Promise<unknown>> = [];
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    super(API_BASE_URL);
    this.setupSupabaseAuth();
    this.setupInterceptors();
  }

  // Setup Supabase authentication integration
  private setupSupabaseAuth(): void {
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        this.setAuthToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        this.setAuthToken('');
        this.clearCache();
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        this.setAuthToken(session.access_token);
        this.processRefreshSubscribers(session.access_token);
      }
    });

    // Set initial token if available
    this.initializeAuth();
  }

  // Initialize authentication state
  private async initializeAuth(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        this.setAuthToken(session.access_token);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Override the request method to add interceptors
    const originalRequest = this.request.bind(this);

    this.request = async <T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> => {
      // Request interceptor
      const enhancedConfig = await this.requestInterceptor(config);
      
      try {
        // Make the request
        const response = await originalRequest<T>(endpoint, enhancedConfig);
        
        // Response interceptor
        return this.responseInterceptor(response);
      } catch (error) {
        // Error interceptor
        return this.errorInterceptor(error, endpoint, enhancedConfig);
      }
    };
  }

  // Request interceptor - enhance requests with auth and metadata
  private async requestInterceptor(config: RequestConfig): Promise<RequestConfig> {
    const enhancedConfig = { ...config };

    // Add request timestamp
    enhancedConfig.headers = {
      ...enhancedConfig.headers,
      'X-Request-Time': new Date().toISOString(),
      'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0'
    };

    // Add correlation ID for tracking
    const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    enhancedConfig.headers['X-Correlation-ID'] = correlationId;

    // Ensure fresh token
    await this.ensureFreshToken();

    return enhancedConfig;
  }

  // Response interceptor - handle successful responses
  private responseInterceptor<T>(response: ApiResponse<T>): ApiResponse<T> {
    // Log successful requests in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        success: response.success,
        hasData: !!response.data,
        message: response.message
      });
    }

    return response;
  }

  // Error interceptor - handle errors and retries
  private async errorInterceptor<T>(
    error: unknown, 
    endpoint: string, 
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const apiError = error as ApiError;

    // Handle 401 unauthorized - attempt token refresh
    if (apiError.status === 401 && !config.headers?.['X-Retry-After-Refresh']) {
      try {
        await this.refreshAuthToken();
        
        // Retry the original request once
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            'X-Retry-After-Refresh': 'true'
          }
        };

        return this.request<T>(endpoint, retryConfig);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await this.handleAuthenticationFailure();
        throw refreshError;
      }
    }

    // Handle network errors with retry mechanism
    if (this.isNetworkError(apiError) && this.shouldRetry(config)) {
      return this.addToRetryQueue(() => this.request<T>(endpoint, config));
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        endpoint,
        status: apiError.status,
        message: apiError.message,
        details: apiError.details
      });
    }

    throw error;
  }

  // Token refresh mechanism
  private async refreshAuthToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(!!token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        throw new Error('Token refresh failed');
      }

      this.setAuthToken(data.session.access_token);
      this.processRefreshSubscribers(data.session.access_token);
      return true;
    } catch (error) {
      this.processRefreshSubscribers('');
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }
  }

  // Process refresh subscribers
  private processRefreshSubscribers(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  // Ensure token is fresh
  private async ensureFreshToken(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeToExpiry = expiresAt.getTime() - now.getTime();
        
        // Refresh if expires in the next 5 minutes
        if (timeToExpiry < 5 * 60 * 1000) {
          await this.refreshAuthToken();
        }
      }
    } catch (error) {
      console.error('Failed to ensure fresh token:', error);
    }
  }

  // Handle authentication failure
  private async handleAuthenticationFailure(): Promise<void> {
    try {
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Failed to handle auth failure:', error);
    }
  }

  // Check if error is network-related
  private isNetworkError(error: ApiError): boolean {
    return error.status >= 500 || error.status === 0;
  }

  // Check if request should be retried
  private shouldRetry(config: RequestConfig & { _retryCount?: number }): boolean {
    const retryCount = config._retryCount || 0;
    return retryCount < (config.retries || 3);
  }

  // Add request to retry queue
  private async addToRetryQueue<T>(requestFn: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      this.retryQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Process queue after a delay
      setTimeout(() => this.processRetryQueue(), 1000);
    });
  }

  // Process retry queue
  private async processRetryQueue(): Promise<void> {
    while (this.retryQueue.length > 0) {
      const request = this.retryQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
    }
  }

  // Clear all caches and pending requests
  private clearCache(): void {
    this.cancelAllRequests();
    this.retryQueue = [];
  }

  // Enhanced upload with Supabase Storage
  async uploadToStorage(
    bucket: string,
    path: string,
    file: File,
    options?: {
      onProgress?: (progress: number) => void;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ url: string; path: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options?.metadata
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Storage upload failed:', error);
      throw error;
    }
  }

  // Real-time subscription management
  createRealtimeSubscription(
    table: string,
    filter?: string,
    callback?: (payload: unknown) => void
  ) {
    return supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        callback || ((payload) => {
          console.log('Realtime update:', payload);
        })
      )
      .subscribe();
  }

  // Database query with enhanced error handling
  async query<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, unknown>;
      orderBy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<T[]>> {
    try {
      let query = supabase.from(table).select(options?.select || '*');

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        const [column, direction] = options.orderBy.split(' ');
        query = query.order(column, { ascending: direction !== 'desc' });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data as T[],
        message: 'Query successful'
      };
    } catch (error) {
      return {
        success: false,
        data: [] as T[],
        error: error instanceof Error ? error.message : 'Query failed'
      };
    }
  }

  // Enhanced mutation operations
  async mutate<T>(
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data?: Record<string, unknown>,
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      let query;

      switch (operation) {
        case 'insert':
          query = supabase.from(table).insert(data).select();
          break;
        case 'update':
          query = supabase.from(table).update(data);
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          query = query.select();
          break;
        case 'delete':
          query = supabase.from(table).delete();
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      const { data: result, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: result as T,
        message: `${operation} successful`
      };
    } catch (error) {
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : `${operation} failed`
      };
    }
  }
}

// Export singleton instance
export const api = new EnhancedApiService();

// Export Supabase utilities
export const auth = supabase.auth;
export const storage = supabase.storage;
export const realtime = supabase.realtime;

// Export helper functions
export const createSupabaseClient = () => supabase;

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.access_token;
  } catch {
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
};

export const getAuthTokens = async (): Promise<AuthTokens | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token || '',
        expiresAt: session.expires_at || 0
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Default export
export default api;
