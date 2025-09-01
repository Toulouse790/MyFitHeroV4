import { useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../../features/auth/AuthContext';
import { authService } from '../../features/auth/services/AuthService';
import type { User, LoginCredentials, RegisterData } from '../../features/auth/types/authTypes';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setIsAuthenticated,
    setIsLoading,
    setError,
    clearError
  } = context;

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Store tokens
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        }
        
        return true;
      }
      
      setError(response.error || 'Login failed');
      return false;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError]);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Store tokens
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        }
        
        return true;
      }
      
      setError(response.error || 'Registration failed');
      return false;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call logout service
      await authService.logout();
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Clear stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
    } catch {
      // Even if logout fails on server, clear local state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsAuthenticated, setIsLoading, setError]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        return false;
      }

      const response = await authService.refreshToken(storedRefreshToken);
      
      if (response.success && response.data) {
        // Update tokens
        if (response.data.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        }
        
        // Update user if provided
        if (response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
        
        return true;
      }
      
      // Refresh failed, logout user
      await logout();
      return false;
      
    } catch {
      // Refresh failed, logout user
      await logout();
      return false;
    }
  }, [setUser, setIsAuthenticated, logout]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.updateProfile(updates);
      
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      
      setError(response.error || 'Profile update failed');
      return false;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading, setError]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        try {
          // Decode token to check expiration (simplified)
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const expiresAt = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          
          // Refresh if token expires in the next 5 minutes
          if (expiresAt - now < 5 * 60 * 1000) {
            await refreshToken();
          }
        } catch {
          // If token is invalid, refresh
          await refreshToken();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateProfile
  };
};

export default useAuth;
