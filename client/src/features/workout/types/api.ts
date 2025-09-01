// Base API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Configuration
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: FormData | string | Record<string, unknown> | null;
  params?: Record<string, string | number>;
  timeout?: number;
  retries?: number;
}

// API Error Types
export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Upload Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}

// WebSocket Types
export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  id?: string;
}

// Cache Types
export interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    AVATAR: '/user/avatar',
  },
  WORKOUT: {
    LIST: '/workouts',
    CREATE: '/workouts',
    UPDATE: '/workouts/:id',
    DELETE: '/workouts/:id',
    TEMPLATES: '/workouts/templates',
  },
  NUTRITION: {
    MEALS: '/nutrition/meals',
    FOODS: '/nutrition/foods',
    TRACKING: '/nutrition/tracking',
  },
  RECOVERY: {
    STATUS: '/recovery/status',
    METRICS: '/recovery/metrics',
    RECOMMENDATIONS: '/recovery/recommendations',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    EXPORT: '/analytics/export',
  },
} as const;

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
