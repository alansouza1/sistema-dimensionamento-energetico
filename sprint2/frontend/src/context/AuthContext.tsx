import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/authService';
import {
  getStoredToken,
  getStoredUser,
  getApiBaseUrl,
  setApiBaseUrl,
  subscribeConnectionMode,
  ConnectionMode,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectionMode: ConnectionMode;
  apiBaseUrl: string;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateApiBaseUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('simulated');
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(() => getApiBaseUrl());

  useEffect(() => {
    const unsubscribe = subscribeConnectionMode((mode) => {
      setConnectionMode(mode);
    });

    // Check auth session
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch {
          // If token invalid, fall back to stored user or clear
          const fallbackUser = getStoredUser();
          if (fallbackUser) {
            setUser(fallbackUser);
          }
        }
      } else {
        // Pre-initialize demo user so the app is immediately testable
        const demoUser: User = {
          id: 1,
          nome: 'Alan Souza',
          email: 'alan@fiap.com.br',
        };
        setUser(demoUser);
        setToken('demo-token-sers');
      }
      setIsLoading(false);
    };

    initAuth();
    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.usuario);
      setToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.usuario);
      setToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateApiBaseUrl = (url: string) => {
    setApiBaseUrl(url);
    setApiBaseUrlState(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        connectionMode,
        apiBaseUrl,
        login,
        register,
        logout,
        updateApiBaseUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
