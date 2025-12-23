# 🌴 Litoral Verde - Plataforma de Treinamento Infotera

## 📋 Visão Geral

Plataforma moderna de treinamento interno para funcionários da Litoral Verde, focada no sistema Infotera. Com design profissional em preto e verde limão, a aplicação oferece:

- ✅ Sistema de autenticação restrito ao domínio @litoralverde.com.br
- 📊 Painel administrativo com visualização de progresso dos funcionários
- 📝 Sistema de anotações por seção
- ⭐ Sistema de favoritos
- 📈 Tracking automático de progresso

## 🎨 Design

- **Tema**: Dark mode com preto (#000000, #121212) e verde limão (#84cc16)
- **Estilo**: Moderno, minimalista, tech-oriented
- **Tipografia**: Inter (sans-serif)
- **Responsivo**: Totalmente adaptável a mobile, tablet e desktop

## 🚀 Funcionalidades

### Para Usuários (Consultores)
- Login seguro com email @litoralverde.com.br
- Navegação por 12 seções de treinamento
- Marcar seções como concluídas
- Adicionar anotações em cada seção
- Favoritar seções importantes
- Visualizar progresso pessoal em tempo real

### Para Administradores
- Painel com estatísticas gerais
- Visualização de progresso de todos os funcionários com barras
- Filtros por status de conclusão
- Ordenação por nome, progresso ou última atividade
- Busca por nome ou email

## 🏗️ Arquitetura

### Backend (FastAPI + MongoDB)
- `/api/auth` - Autenticação (login, registro)
- `/api/sections` - Seções do curso
- `/api/progress` - Progresso do usuário
- `/api/notes` - Sistema de anotações
- `/api/favorites` - Sistema de favoritos
- `/api/admin` - Endpoints administrativos

### Frontend (React)
- **LoginPage**: Página de autenticação
- **TrainingPage**: Interface de treinamento com todas as seções
- **AdminDashboard**: Painel administrativo

## 🔐 Credenciais de Acesso

### Admin
- **Email**: admin@litoralverde.com.br
- **Senha**: admin123

### Usuário Teste
- **Email**: consultor@litoralverde.com.br
- **Senha**: teste123

⚠️ **IMPORTANTE**: Altere essas senhas após o primeiro acesso!

## 📚 Seções do Treinamento

1. Introdução ao Infotravel
2. Acesso ao Sistema
3. Cadastro de Clientes
4. Sistema de Orçamento
5. Monte seu Pacote
6. Orçamento Web
7. Gestão de Reservas
8. Sistema de Pagamentos
9. Descontos
10. Reservas Manuais
11. Emissão de Aéreo Nacional
12. Status de Reservas Detalhado

## 🛠️ Tecnologias

### Backend
- FastAPI 0.110.1
- MongoDB (Motor driver)
- JWT Authentication
- Bcrypt para hashing de senhas
- Python 3.11+

### Frontend
- React 19
- React Router DOM
- Axios
- Tailwind CSS 3.4
- Radix UI Components
- Lucide React Icons

## 📦 Instalação e Execução

### Backend
```bash
cd /app/backend
pip install -r requirements.txt
```

### Frontend
```bash
cd /app/frontend
yarn install
```

### Iniciar Serviços
```bash
sudo supervisorctl restart all
sudo supervisorctl status
```

### Criar Usuário Admin
```bash
python /app/scripts/create_admin.py
```

## 🔧 Configuração

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET="litoral-verde-secret-key-change-this-in-production-2025"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://site-upgrade-68.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## 📱 Acesso

- **Frontend**: https://site-upgrade-68.preview.emergentagent.com
- **Backend API**: https://site-upgrade-68.preview.emergentagent.com/api

## 🎯 Próximas Melhorias

- [ ] Adicionar quiz/avaliações ao final de cada seção
- [ ] Certificado de conclusão automático
- [ ] Notificações por email
- [ ] Sistema de badges/conquistas
- [ ] Modo offline para consulta
- [ ] Exportação de relatórios em PDF
- [ ] Integração com calendário para lembretes

## 👥 Equipe

Desenvolvido para **Litoral Verde** - Plataforma de Treinamento Interno

## 📄 Licença

© 2025 Litoral Verde. Todos os direitos reservados.

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025
# cursoLVInfotera























**# gitignore
**# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

**# IDE and editors
**.idea/
*.vscode/

# Dependencies
node_modules/
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# Testing
/coverage

# Next.js
/.next/
/out/
next-env.d.ts
*.tsbuildinfo

# Production builds
/build
dist/
dist

# Environment files (comprehensive coverage)

*token.json*
*credentials.json*

# Logs and debug files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
dump.rdb

# System files
.DS_Store
*.pem

# Python
__pycache__/
*pyc*
venv/
.venv/

# Development tools
chainlit.md
.chainlit
.ipynb_checkpoints/
.ac

# Deployment
.vercel

# Data and databases
agenthub/agents/youtube/db

# Archive files and large assets
**/*.zip
**/*.tar.gz
**/*.tar
**/*.tgz
*.pack
*.deb
*.dylib

# Build caches
.cache/

# Mobile development
android-sdk/ 