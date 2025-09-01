// Types communs unifiés pour MyFitHero V4
// Élimine la duplication des types à travers l'application

// ===== TYPES DE BASE =====

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface UserEntity extends BaseEntity {
  user_id: string;
}

// ===== TYPES D'ERREURS UNIFIÉS =====

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  context?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  errors?: ValidationError[];
  requestId?: string;
}

export interface FormFieldError {
  field: string;
  message: string;
}

// ===== TYPES DE FORMULAIRES UNIFIÉS =====

export interface BaseFormData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface FormState {
  isSubmitting: boolean;
  errors: FormFieldError[];
  touched: Record<string, boolean>;
  isDirty: boolean;
}

export interface FormProps {
  onSubmit: (data: unknown) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: unknown;
  validationSchema?: unknown;
}

// ===== TYPES API UNIFIÉS =====

export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T = unknown> extends LoadingState {
  data: T | null;
  lastUpdated: string | null;
}

// ===== TYPES UTILISATEUR UNIFIÉS =====

export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  last_sign_in: string | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  units: UnitPreferences;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface UnitPreferences {
  weight: 'kg' | 'lb';
  height: 'cm' | 'ft';
  distance: 'km' | 'mi';
  temperature: 'c' | 'f';
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  workoutReminders: boolean;
  socialUpdates: boolean;
  achievements: boolean;
  weeklyReports: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'friends' | 'private';
  activitySharing: boolean;
  dataAnalytics: boolean;
  crashReporting: boolean;
}

// ===== TYPES MÉTRIQUES UNIFIÉS =====

export interface BaseMetrics {
  date: string;
  value: number;
  unit: string;
  category?: string;
  source: 'manual' | 'device' | 'calculated' | 'imported';
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    unit?: string;
  }[];
}

export interface StatsSummary {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

// ===== TYPES STORE UNIFIÉS =====

export interface BaseStoreState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface BaseStoreActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// ===== TYPES COMPOSANTS UNIFIÉS =====

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface FormComponentProps extends BaseComponentProps {
  error?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  helpText?: string;
}

// ===== TYPES NAVIGATION UNIFIÉS =====

export interface RouteConfig {
  path: string;
  component: React.ComponentType<unknown>;
  exact?: boolean;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  title?: string;
  description?: string;
  meta?: Record<string, string>;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  requiresAuth?: boolean;
}

// ===== TYPES TOAST/NOTIFICATIONS UNIFIÉS =====

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  persistent?: boolean;
  actionUrl?: string;
}

// ===== TYPES ÉVÉNEMENTS UNIFIÉS =====

export interface AppEvent {
  type: string;
  payload: unknown;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsEvent extends AppEvent {
  type: 'page_view' | 'button_click' | 'feature_used' | 'error_occurred' | 'conversion';
  properties: Record<string, unknown>;
  category?: string;
}

// ===== TYPES CACHE UNIFIÉS =====

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: string;
  expiresAt: string;
  key: string;
  version?: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live en millisecondes
  staleWhileRevalidate?: boolean;
  version?: string;
  tags?: string[];
}

// ===== TYPES DEVICE/WEARABLES UNIFIÉS =====

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'scale' | 'watch' | 'band' | 'chest_strap' | 'other';
  brand: string;
  model: string;
  batteryLevel?: number;
  isConnected: boolean;
  lastSync?: string;
  connectionType: 'bluetooth' | 'wifi' | 'api';
  capabilities: string[];
}

export interface DeviceReading {
  deviceId: string;
  timestamp: string;
  type: string;
  value: number;
  unit: string;
  accuracy?: 'high' | 'medium' | 'low';
  metadata?: Record<string, unknown>;
}

// ===== UTILITAIRES DE TYPE =====

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type WithoutTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;
export type CreateInput<T> = WithoutTimestamps<Omit<T, 'id'>>;
export type UpdateInput<T> = Partial<WithoutTimestamps<Omit<T, 'id'>>>;

// Types guards utiles
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' && error !== null && 'field' in error && 'message' in error;
}

export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

// Export des constantes communes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  WORKOUT_HISTORY: 'workout_history',
  DAILY_STATS: 'daily_stats',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
} as const;

export const EVENT_TYPES = {
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  WORKOUT_START: 'workout.start',
  WORKOUT_COMPLETE: 'workout.complete',
  GOAL_ACHIEVED: 'goal.achieved',
  DEVICE_CONNECTED: 'device.connected',
} as const;
