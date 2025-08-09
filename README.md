# Uber App - Aplicativo de Transporte

Um aplicativo de transporte completo desenvolvido com React (frontend) e Flask (backend), com comunicação em tempo real via GitHub Actions.

## 🚀 Funcionalidades

### Para Passageiros
- ✅ Criar conta como passageiro
- ✅ Solicitar corridas informando origem e destino
- ✅ Acompanhar status da corrida em tempo real
- ✅ Visualizar histórico de corridas
- ✅ Chat com motorista durante a corrida

### Para Motoristas
- ✅ Criar conta como motorista
- ✅ Alternar disponibilidade (disponível/indisponível)
- ✅ Ver corridas disponíveis para aceitar
- ✅ Aceitar corridas
- ✅ Gerenciar status da corrida (aceita → em andamento → concluída)
- ✅ Chat com passageiro durante a corrida
- ✅ Visualizar histórico de corridas

### Sistema de Comunicação
- ✅ GitHub Actions para sincronização de mensagens
- ✅ Chat em tempo real entre passageiro e motorista
- ✅ Armazenamento de mensagens em arquivo JSON no repositório

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **Shadcn/ui** - Componentes UI

### Backend
- **Flask** - Framework Python
- **Flask-CORS** - Suporte a CORS
- **SQLite** - Banco de dados (em memória para desenvolvimento)

### DevOps
- **GitHub Actions** - CI/CD e comunicação
- **Git** - Controle de versão

## 📁 Estrutura do Projeto

```
Uber/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── ui/         # Componentes base (Button, Card, etc.)
│   │   │   ├── UserSelector.jsx
│   │   │   ├── PassengerDashboard.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   └── ChatComponent.jsx
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                 # API Flask
│   ├── src/
│   │   ├── models/         # Modelos de dados
│   │   │   ├── user.py
│   │   │   ├── ride.py
│   │   │   └── message.py
│   │   ├── routes/         # Rotas da API
│   │   │   ├── user.py
│   │   │   ├── ride.py
│   │   │   └── message.py
│   │   └── main.py         # Servidor Flask
│   └── requirements.txt
├── .github/
│   └── workflows/
│       └── communication.yml # GitHub Action para chat
├── messages/
│   ├── all_messages.json   # Armazenamento de mensagens
│   └── README.md
└── architecture_plan.md    # Documentação da arquitetura
```

## 🚀 Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm

### Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python src/main.py
```

O backend estará rodando em `http://localhost:5000`

### Frontend (React)
```bash
cd frontend
pnpm install
pnpm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📱 Como Usar

### 1. Criar Usuários
- Acesse `http://localhost:5173`
- Preencha nome e email
- Selecione o tipo: **Passageiro** ou **Motorista**
- Clique em "Criar Usuário"

### 2. Como Passageiro
- Após fazer login, preencha origem e destino
- Clique em "Solicitar Corrida"
- Aguarde um motorista aceitar
- Use o chat para se comunicar com o motorista

### 3. Como Motorista
- Após fazer login, ative sua disponibilidade
- Visualize corridas disponíveis
- Aceite uma corrida
- Gerencie o status: Aceita → Em Andamento → Concluída
- Use o chat para se comunicar com o passageiro

## 🔄 Sistema de Comunicação

O sistema utiliza GitHub Actions para sincronizar mensagens entre usuários:

1. **Envio de Mensagem**: Usuário envia mensagem via frontend
2. **API Processing**: Backend processa e armazena temporariamente
3. **GitHub Action**: Workflow sincroniza mensagens para o repositório
4. **Persistência**: Mensagens são salvas em `messages/all_messages.json`
5. **Sincronização**: Outros usuários recebem mensagens atualizadas

## 🎯 Status dos Recursos

- ✅ **Autenticação**: Sistema básico sem Google OAuth (conforme solicitado)
- ✅ **Gestão de Corridas**: Completo (solicitar, aceitar, gerenciar status)
- ✅ **Chat em Tempo Real**: Implementado via GitHub Actions
- ✅ **Interface Responsiva**: Design mobile-first
- ✅ **API RESTful**: Endpoints completos para todas as funcionalidades

## 🔮 Próximos Passos

1. **Integração Google OAuth**: Adicionar login social
2. **Geolocalização**: Integrar mapas e GPS
3. **Notificações Push**: Alertas em tempo real
4. **Sistema de Pagamento**: Integração com gateways
5. **Avaliações**: Sistema de rating para motoristas e passageiros

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Jonathan** com ❤️

---

**Nota**: Este é um projeto de demonstração. Para uso em produção, implemente autenticação robusta, validações de segurança e otimizações de performance.

