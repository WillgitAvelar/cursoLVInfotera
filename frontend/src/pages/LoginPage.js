import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Loader from '../components/Loader';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/training');
      } else {
        await register(email, name, password);
        setIsLogin(true);
        setError('');
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 via-black to-black" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-lime-400 to-lime-500 p-4 rounded-2xl mb-4 shadow-lg shadow-lime-400/50">
            <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Litoral Verde
          </h1>
          <p className="text-lime-400 font-medium">
            Plataforma de Treinamento Infotera
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-800 p-8">
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${
                isLogin
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${
                !isLogin
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Nome Completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@litoralverde.com.br"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="mb-4 p-3 bg-lime-900/20 border border-lime-500/30 rounded-lg text-lime-400 text-xs">
                <strong>Atenção:</strong> Apenas emails @litoralverde.com.br são permitidos
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader size="sm" />
              ) : isLogin ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 Litoral Verde. Plataforma de Treinamento Interno.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;