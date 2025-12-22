import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import Loader from '../components/Loader';

const TrainingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [activeSection, setActiveSection] = useState('introducao');
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteSection, setCurrentNoteSection] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectionsRes, progressRes, favoritesRes, notesRes] = await Promise.all([
        api.get('/sections'),
        api.get('/progress'),
        api.get('/favorites'),
        api.get('/notes')
      ]);

      setSections(sectionsRes.data);
      
      const progressMap = {};
      progressRes.data.forEach(p => {
        progressMap[p.section_id] = p.completed;
      });
      setProgress(progressMap);

      const favSet = new Set();
      favoritesRes.data.forEach(f => favSet.add(f.section_id));
      setFavorites(favSet);

      const notesMap = {};
      notesRes.data.forEach(n => {
        if (!notesMap[n.section_id]) notesMap[n.section_id] = [];
        notesMap[n.section_id].push(n);
      });
      setNotes(notesMap);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const toggleProgress = async (sectionId) => {
    try {
      const newStatus = !progress[sectionId];
      await api.post('/progress', {
        section_id: sectionId,
        completed: newStatus
      });
      setProgress({ ...progress, [sectionId]: newStatus });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const toggleFavorite = async (sectionId) => {
    try {
      await api.post('/favorites/toggle', { section_id: sectionId });
      const newFavorites = new Set(favorites);
      if (favorites.has(sectionId)) {
        newFavorites.delete(sectionId);
      } else {
        newFavorites.add(sectionId);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openNoteModal = (sectionId) => {
    setCurrentNoteSection(sectionId);
    const sectionNotes = notes[sectionId] || [];
    setNoteContent(sectionNotes.length > 0 ? sectionNotes[0].content : '');
    setShowNoteModal(true);
  };

  const saveNote = async () => {
    try {
      const sectionNotes = notes[currentNoteSection] || [];
      if (sectionNotes.length > 0) {
        await api.put(`/notes/${sectionNotes[0].id}`, { content: noteContent });
      } else {
        await api.post('/notes', {
          section_id: currentNoteSection,
          content: noteContent
        });
      }
      await loadData();
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async () => {
    try {
      const sectionNotes = notes[currentNoteSection] || [];
      if (sectionNotes.length > 0) {
        await api.delete(`/notes/${sectionNotes[0].id}`);
        await loadData();
        setShowNoteModal(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const calculateProgress = () => {
    const completed = Object.values(progress).filter(p => p).length;
    return sections.length > 0 ? (completed / sections.length) * 100 : 0;
  };

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader size="lg" text="Carregando treinamento..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-900 to-black border-r-2 border-lime-400/20 overflow-y-auto z-50">
        <div className="p-6">
          {/* Logo */}
          <div className="text-center mb-6 pb-6 border-b border-lime-400/20">
            <div className="inline-block bg-gradient-to-r from-lime-400 to-lime-500 p-3 rounded-xl mb-3">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <h2 className="text-lime-400 font-bold text-lg">Litoral Verde</h2>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Buscar seções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 mb-6 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-400"
          />

          {/* Navigation */}
          <nav className="space-y-2">
            {filteredSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-lime-400 text-black font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-lime-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  progress[section.id] ? 'bg-lime-500' : 'bg-gray-600'
                }`} />
                <span className="flex-1 text-sm">{section.title}</span>
                {favorites.has(section.id) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-80 min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 to-black border-b-2 border-lime-400/20 sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bem-vindo, {user?.name}!
                </h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              <div className="flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                  >
                    Painel Admin
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                >
                  Sair
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lime-400 font-semibold text-sm">
                  Progresso do Treinamento
                </span>
                <span className="text-gray-400 text-sm">
                  {Object.values(progress).filter(p => p).length} / {sections.length} seções
                </span>
              </div>
              <ProgressBar progress={calculateProgress()} height="10px" showPercentage={false} />
            </div>
          </div>
        </header>

        {/* Section Content */}
        <div className="px-8 py-8">
          {sections.filter(s => s.id === activeSection).map(section => (
            <div key={section.id} className="max-w-5xl">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-lime-400 to-lime-500 rounded-2xl p-8 mb-8 shadow-lg shadow-lime-400/20">
                <h2 className="text-4xl font-bold text-black mb-4">
                  {section.title}
                </h2>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleProgress(section.id)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      progress[section.id]
                        ? 'bg-black text-lime-400'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {progress[section.id] ? '✓ Concluída' : 'Marcar como Concluída'}
                  </button>
                  
                  <button
                    onClick={() => toggleFavorite(section.id)}
                    className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-all"
                  >
                    <svg 
                      className={`w-6 h-6 ${favorites.has(section.id) ? 'text-yellow-500 fill-yellow-500' : 'text-black'}`}
                      fill={favorites.has(section.id) ? 'currentColor' : 'none'}
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => openNoteModal(section.id)}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 transition-all flex items-center gap-2 text-black font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {notes[section.id]?.length > 0 ? 'Editar Anotações' : 'Adicionar Anotações'}
                  </button>
                </div>
              </div>

              {/* Section Content (Static for demo) */}
              <div className="bg-gray-900 rounded-2xl p-8 border-2 border-gray-800 text-white">
                <SectionContent sectionId={section.id} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border-2 border-lime-400/20 max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-lime-400 mb-4">
              Anotações da Seção
            </h3>
            
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Digite suas anotações aqui..."
              className="w-full h-64 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 resize-none"
            />
            
            <div className="flex justify-end gap-3 mt-4">
              {notes[currentNoteSection]?.length > 0 && (
                <Button
                  variant="danger"
                  onClick={deleteNote}
                >
                  Deletar
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setShowNoteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={saveNote}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Section Content Component (Static content for each section)
const SectionContent = ({ sectionId }) => {
  const content = {
    'introducao': (
      <>
        <h3 className="text-2xl font-bold text-lime-400 mb-4">Introdução ao Infotravel</h3>
        <p className="mb-4">
          Para a realização de orçamentos, reservas, pagamentos e outras funcionalidades essenciais no setor de 
          Turismo, utilizamos o sistema <strong className="text-lime-400">Infotravel</strong>. Adotado pela Litoral Verde desde 
          <strong className="text-lime-400"> 2019</strong>, este sistema também é utilizado por diversas empresas do setor de Turismo, 
          garantindo padrões de mercado e integração com fornecedores.
        </p>
        <div className="bg-gray-800 rounded-lg p-6 my-6">
          <h4 className="text-xl font-semibold text-lime-400 mb-3">Link de Acesso</h4>
          <a 
            href="https://reservas.litoralverde.com.br/infotravel/login.xhtml" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lime-400 hover:text-lime-300 underline"
          >
            reservas.litoralverde.com.br/infotravel/login.xhtml
          </a>
        </div>
      </>
    ),
    'acesso': (
      <>
        <h3 className="text-2xl font-bold text-lime-400 mb-4">Acesso ao Sistema</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-lime-400 mb-3">Verificar E-mail</h4>
            <p>Verifique em seu e-mail se você recebeu um e-mail de Boas Vindas ao Portal da Litoral Verde.</p>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-lime-400 mb-3">Processo de Login:</h4>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Acesse o link informado no e-mail</li>
              <li>Insira seu <strong>usuário</strong> e <strong>senha</strong> recebidos no e-mail</li>
              <li>Clique em <strong>"Entrar"</strong></li>
            </ol>
          </div>
          
          <div className="bg-lime-900/20 border border-lime-400/30 rounded-lg p-4">
            <p className="text-lime-300">
              <strong>💡 Importante:</strong> Lembre-se de anotar sua nova senha em um local seguro e de atender 
              a todos os pré-requisitos exigidos pelo sistema.
            </p>
          </div>
        </div>
      </>
    ),
    'cadastro-clientes': (
      <>
        <h3 className="text-2xl font-bold text-lime-400 mb-4">Cadastro de Clientes</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-lime-400 mb-3">Formas de Pesquisa</h4>
            <p className="mb-4">Realize a pesquisa de clientes de quatro formas diferentes:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lime-400 font-semibold">✓ Por nome completo</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lime-400 font-semibold">✓ Por e-mail</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lime-400 font-semibold">✓ Por telefone</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-lime-400 font-semibold">✓ Por documento (CPF)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-yellow-300">
              <strong>⚠️ Dica Importante:</strong><br />
              Antes de iniciar o atendimento, sempre verifique se o cliente já possui cadastro. 
              Como temos diversos canais de atendimento, é possível que ele já tenha sido atendido por outro colega.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-lime-400 font-semibold">Para adicionar novo cliente:</p>
            <p className="mt-2"><strong>Menu → Cadastro → Clientes → Adicionar</strong></p>
          </div>
        </div>
      </>
    ),
    // Add more sections as needed...
  };

  return (
    <div className="prose prose-invert max-w-none">
      {content[sectionId] || (
        <div>
          <h3 className="text-2xl font-bold text-lime-400 mb-4">Conteúdo em Desenvolvimento</h3>
          <p>Esta seção está sendo preparada com conteúdo detalhado sobre {sectionId}.</p>
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
