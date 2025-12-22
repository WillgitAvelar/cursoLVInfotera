import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usersProgress, setUsersProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, progress, lastActivity
  const [filterCompletion, setFilterCompletion] = useState('all'); // all, completed, inProgress, notStarted

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/training');
      return;
    }
    loadUsersProgress();
  }, [user, navigate]);

  const loadUsersProgress = async () => {
    try {
      const response = await api.get('/admin/users-progress');
      setUsersProgress(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users progress:', error);
      setLoading(false);
    }
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = usersProgress.filter(u =>
      u.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply completion filter
    if (filterCompletion === 'completed') {
      filtered = filtered.filter(u => u.progress_percentage === 100);
    } else if (filterCompletion === 'inProgress') {
      filtered = filtered.filter(u => u.progress_percentage > 0 && u.progress_percentage < 100);
    } else if (filterCompletion === 'notStarted') {
      filtered = filtered.filter(u => u.progress_percentage === 0);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.user_name.localeCompare(b.user_name);
        case 'progress':
          return b.progress_percentage - a.progress_percentage;
        case 'lastActivity':
          if (!a.last_activity) return 1;
          if (!b.last_activity) return -1;
          return new Date(b.last_activity) - new Date(a.last_activity);
        default:
          return 0;
      }
    });
  };

  const getStats = () => {
    const total = usersProgress.length;
    const completed = usersProgress.filter(u => u.progress_percentage === 100).length;
    const inProgress = usersProgress.filter(u => u.progress_percentage > 0 && u.progress_percentage < 100).length;
    const notStarted = usersProgress.filter(u => u.progress_percentage === 0).length;
    const avgProgress = total > 0 
      ? usersProgress.reduce((acc, u) => acc + u.progress_percentage, 0) / total 
      : 0;

    return { total, completed, inProgress, notStarted, avgProgress };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  const filteredUsers = getFilteredAndSortedUsers();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black border-b-2 border-lime-400/20">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Painel Administrativo
              </h1>
              <p className="text-gray-400">
                Acompanhe o progresso de todos os funcionários no treinamento
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/training')}
              >
                Voltar ao Treinamento
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-400 text-sm font-semibold">Total de Usuários</h3>
              <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-lime-900/50 to-lime-800/30 rounded-2xl p-6 border-2 border-lime-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lime-300 text-sm font-semibold">Completaram</h3>
              <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-lime-400">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-2xl p-6 border-2 border-yellow-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-yellow-300 text-sm font-semibold">Em Progresso</h3>
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-yellow-400">{stats.inProgress}</p>
          </div>

          <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-2xl p-6 border-2 border-red-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-red-300 text-sm font-semibold">Não Iniciaram</h3>
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-red-400">{stats.notStarted}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl p-6 border-2 border-blue-400/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-blue-300 text-sm font-semibold">Progresso Médio</h3>
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-blue-400">{stats.avgProgress.toFixed(0)}%</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="progress">Ordenar por Progresso</option>
                <option value="lastActivity">Ordenar por Atividade</option>
              </select>
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value)}
                className="px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-lime-400"
              >
                <option value="all">Todos</option>
                <option value="completed">Completaram</option>
                <option value="inProgress">Em Progresso</option>
                <option value="notStarted">Não Iniciaram</option>
              </select>
            </div>

            <Button
              variant="primary"
              onClick={loadUsersProgress}
            >
              Atualizar
            </Button>
          </div>
        </div>

        {/* Users Progress List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-12 border-2 border-gray-800 text-center">
              <p className="text-gray-400 text-lg">Nenhum usuário encontrado</p>
            </div>
          ) : (
            filteredUsers.map((userProgress) => (
              <div
                key={userProgress.user_id}
                className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-lime-400/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {userProgress.user_name}
                    </h3>
                    <p className="text-gray-400 text-sm">{userProgress.user_email}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-2"
                         style={{
                           backgroundColor: userProgress.progress_percentage === 100 
                             ? 'rgba(132, 204, 22, 0.2)' 
                             : userProgress.progress_percentage > 0 
                             ? 'rgba(234, 179, 8, 0.2)' 
                             : 'rgba(239, 68, 68, 0.2)',
                           color: userProgress.progress_percentage === 100 
                             ? '#84cc16' 
                             : userProgress.progress_percentage > 0 
                             ? '#eab308' 
                             : '#ef4444'
                         }}
                    >
                      {userProgress.progress_percentage === 100 
                        ? '✓ Completo' 
                        : userProgress.progress_percentage > 0 
                        ? '⚡ Em Andamento' 
                        : '○ Não Iniciado'}
                    </div>
                    <p className="text-gray-500 text-xs">
                      Última atividade: {formatDate(userProgress.last_activity)}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lime-400 font-semibold text-sm">
                      Progresso do Treinamento
                    </span>
                    <span className="text-gray-400 text-sm">
                      {userProgress.completed_sections} / {userProgress.total_sections} seções
                    </span>
                  </div>
                  <ProgressBar 
                    progress={userProgress.progress_percentage} 
                    height="12px" 
                    showPercentage={false} 
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-lime-400 font-bold text-lg">
                    {userProgress.progress_percentage.toFixed(0)}% Concluído
                  </span>
                  <span className="text-gray-500">
                    {userProgress.total_sections - userProgress.completed_sections} seções restantes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
