// Types pour le module d'authentification

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences: UserPreferences;
  profile: UserProfile;
  subscription: UserSubscription;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  units: 'metric' | 'imperial';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  workoutReminders: boolean;
  nutritionReminders: boolean;
  recoveryAlerts: boolean;
  achievementNotifications: boolean;
  weeklyReports: boolean;
  friendsActivity: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  workoutVisibility: 'public' | 'friends' | 'private';
  statsVisibility: 'public' | 'friends' | 'private';
  allowFriendRequests: boolean;
  allowCoachRequests: boolean;
  dataSharing: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  targetWeight?: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoals: FitnessGoal[];
  medicalConditions: string[];
  allergies: string[];
  emergencyContact?: EmergencyContact;
  coachId?: string;
}

export interface FitnessGoal {
  id: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility' | 'general_health';
  target: number;
  unit: string;
  deadline?: string;
  isActive: boolean;
  progress: number;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  features: string[];
  paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  lastSeen: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: Partial<DeviceInfo>;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: 'male' | 'female' | 'other';
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: File | string;
}

export interface UpdatePreferencesData {
  language?: string;
  timezone?: string;
  units?: 'metric' | 'imperial';
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
  accessibility?: Partial<AccessibilitySettings>;
}

export interface UpdateUserProfileData {
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoals?: Partial<FitnessGoal>[];
  medicalConditions?: string[];
  allergies?: string[];
  emergencyContact?: EmergencyContact;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface VerificationToken {
  token: string;
  type: 'email' | 'phone' | 'password_reset' | 'account_deletion';
  expiresAt: string;
}

export interface OAuthProvider {
  name: 'google' | 'facebook' | 'apple' | 'github';
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export interface OAuthCredentials {
  provider: OAuthProvider['name'];
  code: string;
  state?: string;
  redirectUri: string;
}

export interface TwoFactorAuth {
  isEnabled: boolean;
  method: 'sms' | 'email' | 'authenticator';
  backupCodes: string[];
  lastUsed?: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'suspicious_activity';
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
  isBlocked: boolean;
}

export interface AccountDeletionRequest {
  reason: string;
  feedback?: string;
  scheduledAt: string;
  confirmationToken: string;
}

// DTOs pour les API
export interface LoginResponse {
  session: AuthSession;
  isFirstLogin: boolean;
  requiresTwoFactor: boolean;
  twoFactorMethods: TwoFactorAuth['method'][];
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresAt: string;
}

export interface UserStatsResponse {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  averageWorkoutDuration: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkout?: string;
  joinedDaysAgo: number;
}

export interface AuthValidationError {
  field: keyof LoginCredentials | keyof RegisterData | keyof ChangePasswordData;
  message: string;
  code: string;
}

export interface SessionInfo {
  isValid: boolean;
  expiresIn: number; // seconds
  user: User | null;
  permissions: string[];
  lastActivity: string;
}
