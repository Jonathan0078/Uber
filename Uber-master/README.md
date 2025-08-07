# Uber Rio Pardo - Sistema de Transporte Urbano

Um sistema de transporte urbano inspirado no Uber, desenvolvido especificamente para a cidade de Rio Pardo, RS, Brasil.

## 🚗 Sobre o Projeto

O Uber Rio Pardo é uma aplicação web que conecta passageiros e motoristas na cidade de Rio Pardo. O sistema oferece uma interface intuitiva para solicitação de corridas e gerenciamento de viagens, com foco na comunidade local.

## ✨ Funcionalidades

### Para Passageiros
- **Cadastro e Login**: Sistema de autenticação para usuários
- **Solicitação de Corridas**: Interface para solicitar viagens com destino específico
- **Mapa Interativo**: Visualização da localização atual e destino
- **Histórico de Viagens**: Acompanhamento das corridas realizadas
- **Perfil do Usuário**: Gerenciamento de informações pessoais

### Para Motoristas
- **Cadastro Completo**: Registro com informações do veículo e documentação
- **Dashboard do Motorista**: Interface para gerenciar corridas e status
- **Recebimento de Chamadas**: Sistema para aceitar ou recusar corridas
- **Informações do Veículo**: Cadastro de CNH, placa, modelo e ano do carro
- **Status Online/Offline**: Controle de disponibilidade para corridas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 com Vite
- **Estilização**: Tailwind CSS
- **Componentes**: Shadcn/ui
- **Ícones**: Lucide React
- **Hospedagem**: GitHub Pages
- **Controle de Versão**: Git/GitHub

## 🌍 Área de Cobertura

O sistema está configurado especificamente para atender a cidade de **Rio Pardo, RS, Brasil**, com restrições geográficas implementadas para garantir o foco na comunidade local.

## 🚀 Como Usar

### Acesso Online
A aplicação está disponível em: [https://jonathan0078.github.io/Uber/](https://jonathan0078.github.io/Uber/)

### Para Passageiros
1. Acesse o site e clique em "Passageiro"
2. Faça seu cadastro ou login
3. Insira seu destino no campo de busca
4. Clique em "Solicitar Corrida"
5. Aguarde a confirmação do motorista

### Para Motoristas
1. Acesse o site e clique em "Motorista"
2. Complete o cadastro com suas informações e dados do veículo
3. Faça login no sistema
4. Ative seu status para receber chamadas
5. Aceite as corridas disponíveis

## 📱 Interface do Usuário

### Tela Inicial
- Seleção entre perfil de Passageiro ou Motorista
- Design responsivo para dispositivos móveis e desktop

### Dashboard do Passageiro
- Mapa interativo para visualização da localização
- Campo de busca para destino
- Botão de solicitação de corrida
- Histórico de viagens

### Dashboard do Motorista
- Lista de chamadas recebidas
- Informações do passageiro e destino
- Controles para aceitar/recusar corridas
- Status de disponibilidade

## 🔧 Instalação Local

Para executar o projeto localmente:

```bash
# Clone o repositório
git clone https://github.com/Jonathan0078/Uber.git

# Entre no diretório
cd Uber

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm run dev
```

## 📦 Build e Deploy

```bash
# Gerar build de produção
pnpm run build

# Os arquivos serão gerados na pasta 'dist'
```

O deploy é automatizado via GitHub Actions sempre que há push para a branch master.

## 🗂️ Estrutura do Projeto

```
Uber/
├── src/
│   ├── pages/
│   │   ├── ProfileSelection.jsx    # Seleção de perfil
│   │   ├── UserLogin.jsx          # Login do passageiro
│   │   ├── UserRegister.jsx       # Cadastro do passageiro
│   │   ├── UserDashboard.jsx      # Dashboard do passageiro
│   │   ├── DriverLogin.jsx        # Login do motorista
│   │   ├── DriverRegister.jsx     # Cadastro do motorista
│   │   └── DriverDashboard.jsx    # Dashboard do motorista
│   ├── App.jsx                    # Componente principal
│   └── main.jsx                   # Ponto de entrada
├── public/                        # Arquivos estáticos
├── dist/                         # Build de produção
└── .github/workflows/            # Configurações do GitHub Actions
```

## 🎨 Design e UX

- **Cores**: Esquema de cores moderno com tons de azul e cinza
- **Tipografia**: Fontes legíveis e hierarquia visual clara
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela
- **Acessibilidade**: Elementos com contraste adequado e navegação intuitiva

## 🔒 Segurança e Privacidade

- Dados armazenados localmente no navegador
- Validação de formulários no frontend
- Restrição geográfica para Rio Pardo, RS
- Interface segura para informações pessoais

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato através do GitHub.

---

**Uber Rio Pardo** - Conectando a comunidade através do transporte inteligente.

