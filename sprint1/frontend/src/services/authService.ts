import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';
import {
  apiRequest,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      () => {
        // Fallback simulated login
        const email = credentials.email.trim();
        const userName = email.split('@')[0] || 'Usuário';
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
        const user: User = {
          id: 1,
          nome: formattedName,
          email: credentials.email,
        };
        const token = `simulated-jwt-token-${Date.now()}`;
        setStoredToken(token);
        setStoredUser(user);
        return { token, usuario: user };
      }
    ).then((res) => {
      setStoredToken(res.token);
      setStoredUser(res.usuario);
      return res;
    });
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      () => {
        // Fallback simulated registration
        const user: User = {
          id: Math.floor(Math.random() * 1000) + 2,
          nome: credentials.nome.trim(),
          email: credentials.email.trim(),
        };
        const token = `simulated-jwt-token-${Date.now()}`;
        setStoredToken(token);
        setStoredUser(user);
        return { token, usuario: user };
      }
    ).then((res) => {
      setStoredToken(res.token);
      setStoredUser(res.usuario);
      return res;
    });
  },

  async getMe(): Promise<User> {
    return apiRequest<User>(
      '/auth/me',
      { method: 'GET' },
      () => {
        const user = getStoredUser();
        if (user) return user;
        const defaultUser: User = { id: 1, nome: 'Alan Souza', email: 'alan@fiap.com.br' };
        setStoredUser(defaultUser);
        return defaultUser;
      }
    );
  },

  logout(): void {
    setStoredToken(null);
    setStoredUser(null);
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  },

  getCurrentUser(): User | null {
    return getStoredUser();
  },
};
