// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginCredentials, AuthResponse } from '../types';
// A linha abaixo pode precisar de ajuste dependendo de onde está sua apiService
import { apiService } from '../services/api';

// Interface para o tipo de dados do contexto de autenticação
interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // Mantém o estado de carregamento para consistência
}

// Cria o contexto com um valor inicial indefinido
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para o provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

// --- COMPONENTE DO PROVEDOR DE AUTENTICAÇÃO ---
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // --- INÍCIO DA MODIFICAÇÃO PARA TESTES ---

  // 1. O estado inicial do usuário e do token são definidos com dados falsos ("mock").
  const [user, setUser] = useState<AuthResponse['user'] | null>({
    id: 'mock-user-id-123',
    username: 'usuarioteste',
    // Adicione aqui outras propriedades que seu objeto 'user' possa ter
  });

  const [token, setToken] = useState<string | null>('mock-jwt-token-para-testes.12345');

  // 2. O estado de carregamento é definido como 'false' para pular qualquer tela de loading.
  const [isLoading, setIsLoading] = useState(false);

  // 3. O useEffect que verifica o localStorage foi comentado para não sobrescrever
  //    os dados falsos que definimos acima.
  /*
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);
  */

  // --- FIM DA MODIFICAÇÃO PARA TESTES ---

  // Função de login (pode ser mantida para evitar erros, mas não fará uma chamada real)
  const login = async (credentials: LoginCredentials): Promise<void> => {
    console.log('MODO DE TESTE: Login simulado para:', credentials.username);
    // Em modo de teste, a função de login não precisa fazer nada.
    // Retorna uma promessa resolvida para manter a consistência do tipo.
    return Promise.resolve();
  };

  // Função de logout permanece funcional para que você possa testar o fluxo de sair
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Para forçar o redirecionamento após o logout
    window.location.href = '/login'; 
  };

  // O valor fornecido ao contexto inclui o usuário e token falsos
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};