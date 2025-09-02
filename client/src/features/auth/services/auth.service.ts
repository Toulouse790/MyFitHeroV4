import {
  User,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  UpdatePreferencesData,
  UpdateUserProfileData,
  LoginResponse,
  RefreshTokenResponse,
  UserStatsResponse,
  SessionInfo,
  OAuthCredentials,
} from '../types/index';

export class AuthService {
  private static readonly BASE_URL = '/api/auth';
  private static readonly TOKEN_KEY = 'myfithero_token';
  private static readonly REFRESH_TOKEN_KEY = 'myfithero_refresh_token';
  private static readonly USER_KEY = 'myfithero_user';

  // === AUTHENTIFICATION ===

  // Connexion
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de connexion');
      }

      const loginResponse: LoginResponse = await response.json();

      // Stockage sécurisé des tokens
      if (credentials.rememberMe) {
        localStorage.setItem(this.TOKEN_KEY, loginResponse.session.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.session.refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.session.user));
      } else {
        sessionStorage.setItem(this.TOKEN_KEY, loginResponse.session.accessToken);
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.session.refreshToken);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.session.user));
      }

      return loginResponse;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la connexion:', error);
      // Données de mock pour le développement
      return this.getMockLoginResponse(credentials.email);
    }
  }

  // Inscription
  static async register(data: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${this.BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'inscription");
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  // Connexion OAuth
  static async loginWithOAuth(credentials: OAuthCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/oauth/${credentials.provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de connexion OAuth');
      }

      const loginResponse: LoginResponse = await response.json();

      // Stockage des tokens
      localStorage.setItem(this.TOKEN_KEY, loginResponse.session.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.session.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.session.user));

      return loginResponse;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la connexion OAuth:', error);
      throw error;
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch(`${this.BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyage local dans tous les cas
      this.clearTokens();
    }
  }

  // Rafraîchissement du token
  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await fetch(`${this.BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du rafraîchissement du token');
      }

      const refreshResponse: RefreshTokenResponse = await response.json();

      // Mise à jour du token
      const storage = localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(this.TOKEN_KEY, refreshResponse.accessToken);

      return refreshResponse;
    } catch {
      // Erreur silencieuse
      console.error('Erreur lors du rafraîchissement du token:', error);
      this.clearTokens();
      throw error;
    }
  }

  // === GESTION DES MOTS DE PASSE ===

  // Demande de réinitialisation
  static async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/password/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la demande de réinitialisation');
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur demande réinitialisation:', error);
      throw error;
    }
  }

  // Réinitialisation du mot de passe
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la réinitialisation');
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur réinitialisation mot de passe:', error);
      throw error;
    }
  }

  // Changement de mot de passe
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/password/change`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du changement de mot de passe');
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur changement mot de passe:', error);
      throw error;
    }
  }

  // === GESTION DU PROFIL ===

  // Récupération du profil utilisateur
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${this.BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          return null;
        }
        throw new Error('Erreur lors de la récupération du profil');
      }

      const user = await response.json();

      // Mise à jour du stockage local
      const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage;
      storage.setItem(this.USER_KEY, JSON.stringify(user));

      return user;
    } catch {
      // Erreur silencieuse
      console.error('Erreur récupération profil:', error);
      return this.getMockUser();
    }
  }

  // Mise à jour du profil
  static async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await fetch(`${this.BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
      }

      const updatedUser = await response.json();

      // Mise à jour du stockage local
      const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage;
      storage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

      return updatedUser;
    } catch {
      // Erreur silencieuse
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }

  // Mise à jour des préférences
  static async updatePreferences(data: UpdatePreferencesData): Promise<User> {
    try {
      const response = await fetch(`${this.BASE_URL}/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour des préférences');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur mise à jour préférences:', error);
      throw error;
    }
  }

  // Mise à jour du profil fitness
  static async updateUserProfile(data: UpdateUserProfileData): Promise<User> {
    try {
      const response = await fetch(`${this.BASE_URL}/fitness-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du profil fitness');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur mise à jour profil fitness:', error);
      throw error;
    }
  }

  // === VÉRIFICATIONS ===

  // Vérification d'email
  static async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/verify/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la vérification d'email");
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur vérification email:', error);
      throw error;
    }
  }

  // Renvoi de vérification d'email
  static async resendEmailVerification(): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/verify/email/resend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.getAccessToken()}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du renvoi de vérification');
      }
    } catch {
      // Erreur silencieuse
      console.error('Erreur renvoi vérification email:', error);
      throw error;
    }
  }

  // === STATISTIQUES UTILISATEUR ===

  // Récupération des statistiques
  static async getUserStats(): Promise<UserStatsResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${this.getAccessToken()}` },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur statistiques utilisateur:', error);
      return this.getMockUserStats();
    }
  }

  // === GESTION DES SESSIONS ===

  // Information sur la session
  static async getSessionInfo(): Promise<SessionInfo> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { isValid: false, expiresIn: 0, user: null, permissions: [], lastActivity: '' };
      }

      const response = await fetch(`${this.BASE_URL}/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return { isValid: false, expiresIn: 0, user: null, permissions: [], lastActivity: '' };
      }

      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur info session:', error);
      return { isValid: false, expiresIn: 0, user: null, permissions: [], lastActivity: '' };
    }
  }

  // === HELPERS ===

  // Récupération du token d'accès
  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Récupération du token de rafraîchissement
  static getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  // Récupération de l'utilisateur stocké
  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      // Erreur silencieuse
      return null;
    }
  }

  // Vérification de l'authentification
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Nettoyage des tokens
  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  // === DONNÉES DE MOCK ===

  private static getMockLoginResponse(email: string): LoginResponse {
    const mockUser = this.getMockUser();
    return {
      session: {
        user: mockUser,
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        deviceInfo: {
          deviceId: 'mock_device_' + Date.now(),
          platform: 'web',
          osVersion: 'Unknown',
          appVersion: '1.0.0',
          lastSeen: new Date().toISOString(),
          isActive: true,
        },
      },
      isFirstLogin: email.includes('new'),
      requiresTwoFactor: false,
      twoFactorMethods: [],
    };
  }

  private static getMockUser(): User {
    return {
      id: 'mock_user_' + Date.now(),
      email: 'user@example.com',
      username: 'mockuser',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://via.placeholder.com/150',
      phone: '+33 6 12 34 56 78',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      preferences: {
        language: 'fr',
        timezone: 'Europe/Paris',
        units: 'metric',
        notifications: {
          email: true,
          push: true,
          sms: false,
          workoutReminders: true,
          nutritionReminders: true,
          recoveryAlerts: true,
          achievementNotifications: true,
          weeklyReports: true,
          friendsActivity: true,
        },
        privacy: {
          profileVisibility: 'friends',
          workoutVisibility: 'friends',
          statsVisibility: 'private',
          allowFriendRequests: true,
          allowCoachRequests: false,
          dataSharing: false,
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false,
          screenReader: false,
          colorBlindMode: 'none',
        },
      },
      profile: {
        height: 180,
        weight: 75,
        targetWeight: 70,
        activityLevel: 'moderate',
        fitnessGoals: [
          {
            id: '1',
            type: 'weight_loss',
            target: 70,
            unit: 'kg',
            deadline: '2024-12-31',
            isActive: true,
            progress: 67,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        medicalConditions: [],
        allergies: ['peanuts'],
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'spouse',
          phone: '+33 6 87 65 43 21',
          email: 'jane@example.com',
        },
      },
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        features: ['advanced_analytics', 'custom_workouts', 'nutrition_tracking', 'coach_support'],
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isEmailVerified: true,
      isPhoneVerified: false,
      isActive: true,
    };
  }

  private static getMockUserStats(): UserStatsResponse {
    return {
      totalWorkouts: 127,
      totalCaloriesBurned: 15420,
      averageWorkoutDuration: 45,
      currentStreak: 12,
      longestStreak: 28,
      lastWorkout: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      joinedDaysAgo: 95,
    };
  }
}
