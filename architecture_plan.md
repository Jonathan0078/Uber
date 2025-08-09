# Plano de Arquitetura do Aplicativo Uber-like

## 1. Visão Geral

O objetivo é criar um aplicativo de transporte simplificado, similar ao Uber, focado na comunicação entre passageiro e motorista. Inicialmente, não haverá autenticação via Google. A comunicação será intermediada por GitHub Actions.

## 2. Componentes Principais

### 2.1. Frontend (Passageiro e Motorista)

*   **Tecnologia:** React (para web, com possibilidade de empacotamento para mobile via Capacitor/Electron no futuro).
*   **Funcionalidades do Passageiro:**
    *   Solicitar corrida (origem, destino).
    *   Visualizar motoristas disponíveis (simulado).
    *   Receber confirmação da corrida.
    *   Comunicar-se com o motorista (via GitHub Actions).
    *   Visualizar status da corrida.
*   **Funcionalidades do Motorista:**
    *   Definir disponibilidade.
    *   Receber solicitações de corrida.
    *   Aceitar/Recusar corrida.
    *   Comunicar-se com o passageiro (via GitHub Actions).
    *   Atualizar status da corrida (a caminho, chegou, em corrida, finalizada).

### 2.2. Backend

*   **Tecnologia:** Flask (Python).
*   **Funcionalidades:**
    *   API para gerenciar usuários (passageiros/motoristas).
    *   API para gerenciar corridas (criação, atualização de status).
    *   API para intermediar a comunicação entre passageiro e motorista (gatilho para GitHub Actions).
    *   Armazenamento de dados (SQLite para simplicidade inicial, com migração futura para PostgreSQL/MySQL).

### 2.3. GitHub Actions (Mecanismo de Comunicação)

*   **Fluxo de Comunicação:**
    1.  **Passageiro envia mensagem:** O frontend do passageiro chama uma API do backend para enviar uma mensagem ao motorista.
    2.  **Backend dispara GitHub Action:** O backend, ao receber a mensagem, dispara um evento (ex: `repository_dispatch`) para um GitHub Action.
    3.  **GitHub Action processa e notifica:** O GitHub Action, ao ser acionado, pode:
        *   Atualizar um arquivo no repositório (ex: `messages.json`) com a nova mensagem.
        *   Disparar outro evento `repository_dispatch` para notificar o motorista (simulado).
        *   Em um cenário real, isso seria substituído por WebSockets ou Push Notifications, mas para este MVP, usaremos o GitHub Actions como intermediário.
    4.  **Motorista recebe mensagem:** O frontend do motorista periodicamente verifica o arquivo `messages.json` ou é notificado por um mecanismo similar (simulado).

## 3. Estrutura do Repositório

```
Uber/
├── .git/
├── .github/
│   └── workflows/
│       └── communication.yml  # GitHub Action para comunicação
├── frontend/                # Aplicação React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/                 # Aplicação Flask
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   └── requirements.txt
├── README.md
└── architecture_plan.md
```

## 4. Próximos Passos

1.  Criar a estrutura de diretórios `frontend` e `backend`.
2.  Inicializar o projeto React no `frontend`.
3.  Inicializar o projeto Flask no `backend`.
4.  Definir os modelos de dados no `backend`.
5.  Criar as rotas básicas da API no `backend`.
6.  Desenvolver as interfaces de usuário básicas no `frontend`.
7.  Implementar a lógica de comunicação via GitHub Actions.

