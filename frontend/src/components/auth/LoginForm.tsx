import React, { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials, ApiError } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (showRegister) {
    const RegisterForm = React.lazy(() => import('./RegisterForm'));
    return (
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <RegisterForm onBackToLogin={() => setShowRegister(false)} />
      </React.Suspense>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Usuário e senha são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      await login(credentials);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">HospitalCare</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão Hospitalar
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Faça login em sua conta
              </h3>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Usuário"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Digite seu usuário"
              autoComplete="username"
            />

            <Input
              label="Senha"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Entrar
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema desenvolvido para gestão hospitalar
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;