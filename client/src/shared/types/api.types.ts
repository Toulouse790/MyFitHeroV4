/**
 * Types pour les réponses API et les requêtes
 */

// Types de base pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types pour les requêtes
export interface ApiRequest {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  query?: Record<string, any>;
}

// Types d'erreurs API
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Types pour l'authentification
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

// Types pour les uploads
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Types pour la recherche
export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  total: number;
}
