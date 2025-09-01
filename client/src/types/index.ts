// Export all types for easy importing across the application

// API Types
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  PaginatedResponse,
  UploadResponse,
  UploadProgress,
  HttpMethod,
  AuthTokens,
  WebSocketMessage,
  CacheConfig,
  ApiEndpoint
} from './api';

// Authentication Types
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthState,
  AuthContextType
} from '../features/auth/types/authTypes';

// Workout Types
export type {
  Workout,
  Exercise,
  WorkoutSession,
  Set,
  ExerciseType,
  MuscleGroup,
  WorkoutTemplate,
  WorkoutPlan,
  WorkoutStats,
  ExerciseStats
} from '../features/workout/types/workoutTypes';

// Nutrition Types
export type {
  Meal,
  Food,
  NutritionEntry,
  MacronutrientGoals,
  NutritionGoals,
  FoodItem,
  MealType,
  NutritionStats,
  CalorieBreakdown
} from '../features/nutrition/types/nutritionTypes';

// Recovery Types
export type {
  RecoveryMetrics,
  SleepData,
  StressLevel,
  RecoveryStatus,
  RecoveryRecommendation,
  HRVData,
  RecoveryScore
} from '../features/recovery/types/recoveryTypes';

// Form Types
export type {
  FormField,
  FormData,
  ValidationRule,
  UseFormReturn,
  UseFormOptions
} from '../shared/hooks/useForm';

// Notification Types
export type {
  Notification,
  UseNotificationsReturn
} from '../shared/hooks/useNotifications';

// Common UI Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterState {
  [key: string]: string | number | boolean | null;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableState {
  pagination: PaginationState;
  filters: FilterState;
  sort: SortState;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  roles?: string[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Toast Types
export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  persistent?: boolean;
}

// Chart Types
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter';
  data: ChartDataPoint[];
  options?: Record<string, unknown>;
}

// Performance Types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  networkRequests: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Settings Types
export interface UserSettings {
  theme: Theme;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    workout: boolean;
    nutrition: boolean;
    recovery: boolean;
  };
  privacy: {
    profileVisible: boolean;
    statsVisible: boolean;
    activityVisible: boolean;
  };
}

// Feature Flag Types
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  conditions?: Record<string, unknown>;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface AnalyticsConfig {
  trackingId: string;
  enabled: boolean;
  debugMode: boolean;
  sampleRate: number;
}

// Environment Types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: Record<string, boolean>;
  analytics: AnalyticsConfig;
  supabase: {
    url: string;
    anonKey: string;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonNullable<T> = T extends null | undefined ? never : T;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ClickableProps {
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

// Default export with commonly used types
export default {
  // API
  ApiResponse,
  ApiError,
  
  // Auth
  User,
  LoginCredentials,
  
  // Common UI
  LoadingState,
  PaginationState,
  ModalProps,
  
  // Forms
  FormField,
  FormData,
  
  // Notifications
  Notification,
  
  // Config
  AppConfig,
  UserSettings,
};
