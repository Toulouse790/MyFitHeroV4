import { useCallback } from 'react';
import { useLoadingState } from './useLoadingState';

// Types d'erreurs standardisés
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  errors?: ValidationError[];
  requestId?: string;
}

// Types pour le hook
export interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void;
  logErrors?: boolean;
  showToast?: boolean;
  context?: string;
}

export interface UseErrorHandlerReturn {
  error: string | null;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => AppError;
  handleApiError: (error: unknown) => ApiError | null;
  handleValidationErrors: (errors: ValidationError[]) => string;
  wrapAsync: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  createError: (code: string, message: string, details?: any) => AppError;
}

/**
 * Hook personnalisé pour la gestion unifiée des erreurs
 * Élimine la duplication des try/catch et normalise les erreurs
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { onError, logErrors = true, showToast = false, context: globalContext } = options;
  const { error, setError, clearError } = useLoadingState();

  // Normalise une erreur en AppError
  const createError = useCallback((
    code: string,
    message: string,
    details?: any
  ): AppError => ({
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    context: globalContext,
  }), [globalContext]);

  // Gère une erreur générique
  const handleError = useCallback((error: unknown, context?: string): AppError => {
    let appError: AppError;

    if (error instanceof Error) {
      appError = createError(
        error.name || 'UnknownError',
        error.message,
        { stack: error.stack, context }
      );
    } else if (typeof error === 'string') {
      appError = createError('StringError', error, { context });
    } else {
      appError = createError(
        'UnknownError',
        'Une erreur inconnue est survenue',
        { originalError: error, context }
      );
    }

    // Log l'erreur si activé
    if (logErrors) {
      console.error('🚨 Erreur capturée:', appError);
    }

    // Callback personnalisé
    if (onError) {
      onError(appError);
    }

    // Toast si activé (nécessite une intégration avec le système de toast)
    if (showToast) {
      // toast.error(appError.message);
    }

    // Mettre à jour l'état local
    setError(appError.message);

    return appError;
  }, [createError, logErrors, onError, showToast, setError]);

  // Gère spécifiquement les erreurs d'API
  const handleApiError = useCallback((error: unknown): ApiError | null => {
    try {
      // Erreur Fetch
      if (error instanceof Response) {
        return {
          status: error.status,
          statusText: error.statusText,
          message: `Erreur ${error.status}: ${error.statusText}`,
          requestId: error.headers.get('x-request-id') || undefined,
        };
      }

      // Erreur avec structure API
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        return {
          status: response?.status || 0,
          statusText: response?.statusText || 'Unknown',
          message: response?.data?.message || 'Erreur API',
          errors: response?.data?.errors || [],
          requestId: response?.headers?.['x-request-id'],
        };
      }

      // Erreur Supabase
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any;
        return {
          status: supabaseError.status || 500,
          statusText: supabaseError.statusText || 'Supabase Error',
          message: supabaseError.message || 'Erreur de base de données',
          requestId: supabaseError.request_id,
        };
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // Gère les erreurs de validation
  const handleValidationErrors = useCallback((errors: ValidationError[]): string => {
    if (errors.length === 0) return '';
    
    if (errors.length === 1) {
      return `${errors[0].field}: ${errors[0].message}`;
    }

    return `Erreurs de validation: ${errors.map(e => e.field).join(', ')}`;
  }, []);

  // Wrapper pour les fonctions async
  const wrapAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError();
      return await asyncFn();
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [clearError, handleError]);

  return {
    error,
    clearError,
    handleError,
    handleApiError,
    handleValidationErrors,
    wrapAsync,
    createError,
  };
}

// Hook spécialisé pour les erreurs de formulaire
export interface UseFormErrorHandlerReturn {
  errors: Record<string, string>;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  handleValidationErrors: (validationErrors: ValidationError[]) => void;
  hasErrors: boolean;
  getFieldError: (field: string) => string | undefined;
}

export function useFormErrorHandler(): UseFormErrorHandlerReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleValidationErrors = useCallback((validationErrors: ValidationError[]) => {
    const errorMap = validationErrors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {} as Record<string, string>);
    
    setErrors(errorMap);
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  const getFieldError = useCallback((field: string) => {
    return errors[field];
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleValidationErrors,
    hasErrors,
    getFieldError,
  };
}

// Utilitaires d'erreur
export const ErrorUtils = {
  // Vérifie si c'est une erreur réseau
  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('offline')
    );
  },

  // Vérifie si c'est une erreur d'autorisation
  isAuthError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      return status === 401 || status === 403;
    }
    return false;
  },

  // Vérifie si c'est une erreur de validation
  isValidationError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as any).status === 422;
    }
    return false;
  },

  // Extrait le message d'erreur le plus utile
  extractMessage: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object') {
      if ('message' in error) return String(error.message);
      if ('error' in error) return String(error.error);
    }
    return 'Une erreur inconnue est survenue';
  },

  // Crée une erreur standardisée
  createStandardError: (message: string, code?: string, details?: any): AppError => ({
    code: code || 'STANDARD_ERROR',
    message,
    details,
    timestamp: new Date().toISOString(),
  }),
};

export default useErrorHandler;
