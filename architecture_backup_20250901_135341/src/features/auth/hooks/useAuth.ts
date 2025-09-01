import { useState, useEffect, useCallback, useContext, createContext, ReactNode, createElement } from 'react';
import { AuthService } from '../services/auth.service';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  UpdateProfileData, 
  UpdatePreferencesData, 
  UpdateUserProfileData,
  ChangePasswordData,
  ResetPasswordData,
  UserStatsResponse,
  OAuthCredentials
} from '../types/index';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions d'authentification
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithOAuth: (credentials: OAuthCredentials) => Promise<boolean>;
  
  // Gestion du profil
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  updatePreferences: (data: UpdatePreferencesData) => Promise<boolean>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<boolean>;
  
  // Gestion des mots de passe
  changePassword: (data: ChangePasswordData) => Promise<boolean>;
  requestPasswordReset: (data: ResetPasswordData) => Promise<boolean>;
  
  // Autres
  refreshUser: () => Promise<void>;
  getUserStats: () => Promise<UserStatsResponse | null>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  // Initialisation - vérifier si l'utilisateur est connecté
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = AuthService.getStoredUser();
        const token = AuthService.getAccessToken();
        
        if (storedUser && token) {
          // Vérifier si le token est toujours valide
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token invalide, nettoyer
            AuthService.clearTokens();
          }
        }
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
        AuthService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Connexion
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(credentials);
      setUser(response.session.user);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inscription
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.register(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connexion OAuth
  const loginWithOAuth = useCallback(async (credentials: OAuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.loginWithOAuth(credentials);
      setUser(response.session.user);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion OAuth';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await AuthService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mise à jour du profil
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await AuthService.updateProfile(data);
      setUser(updatedUser);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mise à jour des préférences
  const updatePreferences = useCallback(async (data: UpdatePreferencesData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await AuthService.updatePreferences(data);
      setUser(updatedUser);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des préférences';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mise à jour du profil fitness
  const updateUserProfile = useCallback(async (data: UpdateUserProfileData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await AuthService.updateUserProfile(data);
      setUser(updatedUser);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil fitness';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Changement de mot de passe
  const changePassword = useCallback(async (data: ChangePasswordData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.changePassword(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Demande de réinitialisation de mot de passe
  const requestPasswordReset = useCallback(async (data: ResetPasswordData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.requestPasswordReset(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la demande de réinitialisation';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rafraîchissement des données utilisateur
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement utilisateur:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Récupération des statistiques utilisateur
  const getUserStats = useCallback(async (): Promise<UserStatsResponse | null> => {
    if (!isAuthenticated) return null;
    
    try {
      return await AuthService.getUserStats();
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      return null;
    }
  }, [isAuthenticated]);

  // Vérification d'email
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.verifyEmail(token);
      await refreshUser(); // Rafraîchir pour mettre à jour le statut de vérification
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification d\'email';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  // Renvoi de vérification d'email
  const resendEmailVerification = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.resendEmailVerification();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du renvoi de vérification';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithOAuth,
    updateProfile,
    updatePreferences,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    refreshUser,
    getUserStats,
    verifyEmail,
    resendEmailVerification
  };

  return createElement(AuthContext.Provider, { value }, children);
}

// Hook simple pour les composants qui n'ont besoin que de l'état d'auth
export function useAuthState() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return { user, isAuthenticated, isLoading };
}

// Hook pour les actions d'authentification
export function useAuthActions() {
  const { 
    login, 
    register, 
    logout, 
    loginWithOAuth,
    updateProfile,
    updatePreferences,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    refreshUser,
    verifyEmail,
    resendEmailVerification
  } = useAuth();
  
  return {
    login,
    register,
    logout,
    loginWithOAuth,
    updateProfile,
    updatePreferences,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    refreshUser,
    verifyEmail,
    resendEmailVerification
  };
}