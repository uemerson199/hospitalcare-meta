import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await apiService.login(credentials);
    
    setToken(response.token);
    
    // Se a API não retorna dados do usuário, criar um objeto básico
    const user = response.user || {
      id: 'user-id',
      username: credentials.username,
      name: credentials.username.split('@')[0] // Usar parte do email como nome
    };
    
    setUser(user);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    const response = await apiService.register(credentials);
    
    setToken(response.token);
    
    // Se a API não retorna dados do usuário, criar um objeto básico
    const user = response.user || {
      id: 'user-id',
      username: credentials.username,
      name: credentials.username.split('@')[0] // Usar parte do email como nome
    };
    
    setUser(user);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};