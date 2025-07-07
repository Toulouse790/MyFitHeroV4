// Simple authentication client to replace Supabase auth
interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

interface AuthResponse {
  user: AuthUser | null;
  token?: string;
  error?: string;
}

class AuthClient {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('token'); // ✅ Changé de 'auth_token' vers 'token'
  }

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { user: null, error: data.message };
      }

      this.token = data.token;
      localStorage.setItem('token', data.token); // ✅ Changé de 'auth_token' vers 'token'

      return { user: data.user, token: data.token };
    } catch (error) {
      return { user: null, error: 'Registration failed' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { user: null, error: data.message };
      }

      this.token = data.token;
      localStorage.setItem('token', data.token); // ✅ Changé de 'auth_token' vers 'token'

      return { user: data.user, token: data.token };
    } catch (error) {
      return { user: null, error: 'Login failed' };
    }
  }

  async signOut(): Promise<void> {
    this.token = null;
    localStorage.removeItem('token'); // ✅ Changé de 'auth_token' vers 'token'
  }

  async getUser(): Promise<AuthUser | null> {
    if (!this.token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.token = null;
        localStorage.removeItem('token'); // ✅ Changé de 'auth_token' vers 'token'
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authClient = new AuthClient();
export type { AuthUser, AuthResponse };
