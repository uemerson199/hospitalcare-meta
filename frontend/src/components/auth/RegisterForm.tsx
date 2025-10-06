import React, { useState } from 'react';
import { Heart, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterCredentials, ApiError } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const { register } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!credentials.username.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!credentials.username.includes('@')) {
      setError('Digite um email válido');
      return false;
    }

    if (!credentials.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }

    if (credentials.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (credentials.password !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // Enviar apenas username e password para a API
      await register({
        username: credentials.username,
        password: credentials.password
      });
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 409) {
        setError('Este email já está cadastrado');
      } else {
        setError(apiError.message || 'Erro ao criar conta');
      }
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Criar nova conta
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBackToLogin}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Digite seu email"
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Digite sua senha"
              autoComplete="new-password"
              helperText="Mínimo de 6 caracteres"
            />

            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Criar Conta
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;