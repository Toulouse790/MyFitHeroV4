import {
  ApiResponse,
  ApiError,
  RequestConfig,
  PaginatedResponse,
  UploadProgress,
  UploadResponse,
} from '../types/api';

export class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(baseURL: string = import.meta.env.VITE_API_URL || '/api') {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  // Set authentication token
  setAuthToken(token: string): void {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Build URL with parameters
  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  // Handle API errors
  private async handleError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: Record<string, unknown> = {};

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData.details || {};
    } catch {
      // If response is not JSON, use default error message
    }

    const apiError: ApiError = {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
      details: errorDetails,
    };

    throw apiError;
  }

  // Generic request method
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params, timeout = 30000, retries = 3 } = config;

    const url = this.buildUrl(endpoint, params);
    const requestId = `${method}-${url}-${Date.now()}`;

    // Create abort controller for this request
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Remove Content-Type for FormData
    if (body instanceof FormData) {
      delete requestHeaders['Content-Type'];
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: abortController.signal,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestConfig.body =
        body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body);
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Set timeout
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, timeout);

        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          await this.handleError(response);
        }

        const data: ApiResponse<T> = await response.json();

        // Clean up
        this.abortControllers.delete(requestId);

        return data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort or client errors (4xx)
        if (
          error instanceof Error &&
          (error.name === 'AbortError' ||
            ('status' in error &&
              typeof error.status === 'number' &&
              error.status >= 400 &&
              error.status < 500))
        ) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // Clean up and throw last error
    this.abortControllers.delete(requestId);
    throw lastError!;
  }

  // Convenience methods
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    const config: RequestConfig = { method: 'GET' };
    if (params) config.params = params;
    return this.request<T>(endpoint, config);
  }

  async post<T>(endpoint: string, body?: RequestConfig['body']): Promise<ApiResponse<T>> {
    const config: RequestConfig = { method: 'POST' };
    if (body !== undefined) config.body = body;
    return this.request<T>(endpoint, config);
  }

  async put<T>(endpoint: string, body?: RequestConfig['body']): Promise<ApiResponse<T>> {
    const config: RequestConfig = { method: 'PUT' };
    if (body !== undefined) config.body = body;
    return this.request<T>(endpoint, config);
  }

  async patch<T>(endpoint: string, body?: RequestConfig['body']): Promise<ApiResponse<T>> {
    const config: RequestConfig = { method: 'PATCH' };
    if (body !== undefined) config.body = body;
    return this.request<T>(endpoint, config);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Paginated requests
  async getPaginated<T>(endpoint: string, page = 1, limit = 20): Promise<PaginatedResponse<T>> {
    return this.request<T[]>(endpoint, {
      method: 'GET',
      params: { page, limit },
    }) as Promise<PaginatedResponse<T>>;
  }

  // File upload with progress
  async upload(
    endpoint: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<UploadResponse>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', this.buildUrl(endpoint));

      // Add auth header if available
      if (this.defaultHeaders['Authorization']) {
        xhr.setRequestHeader('Authorization', this.defaultHeaders['Authorization']);
      }

      xhr.send(formData);
    });
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Cancel specific request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
