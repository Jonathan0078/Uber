# 🐍 Guia Completo: Deploy do Backend no PythonAnywhere

Este guia te ajudará a fazer o deploy do backend Flask do seu aplicativo Uber no PythonAnywhere.

## 📋 Pré-requisitos

1. **Conta no PythonAnywhere**: Crie uma conta gratuita em [pythonanywhere.com](https://www.pythonanywhere.com)
2. **Código do Backend**: O código já está preparado no repositório GitHub

## 🚀 Passo a Passo

### 1. Criar Conta no PythonAnywhere

1. Acesse [pythonanywhere.com](https://www.pythonanywhere.com)
2. Clique em "Pricing & signup"
3. Escolha o plano "Beginner" (gratuito)
4. Crie sua conta com username e senha
5. Confirme seu email

### 2. Acessar o Console

1. Faça login no PythonAnywhere
2. Vá para o **Dashboard**
3. Clique em **"Consoles"** no menu superior
4. Clique em **"Bash"** para abrir um terminal

### 3. Clonar o Repositório

No console Bash, execute:

```bash
# Clonar o repositório
git clone https://github.com/Jonathan0078/Uber.git

# Entrar no diretório do backend
cd Uber/backend

# Verificar se os arquivos estão lá
ls -la
```

### 4. Criar Ambiente Virtual

```bash
# Criar ambiente virtual Python 3.10
mkvirtualenv --python=/usr/bin/python3.10 uber-backend

# Ativar o ambiente virtual (se não estiver ativo)
workon uber-backend

# Instalar dependências
pip install -r requirements.txt
```

### 5. Configurar Web App

1. No Dashboard, clique em **"Web"** no menu superior
2. Clique em **"Add a new web app"**
3. Escolha seu domínio (será algo como `yourusername.pythonanywhere.com`)
4. Selecione **"Manual configuration"**
5. Escolha **"Python 3.10"**

### 6. Configurar o WSGI File

1. Na página da Web App, encontre a seção **"Code"**
2. Clique no link do **"WSGI configuration file"** (algo como `/var/www/yourusername_pythonanywhere_com_wsgi.py`)
3. **Substitua todo o conteúdo** do arquivo pelo seguinte código:

```python
#!/usr/bin/env python3

import sys
import os

# Substitua 'yourusername' pelo seu username do PythonAnywhere
username = 'yourusername'  # MUDE AQUI!

# Add your project directory to the sys.path
project_home = f'/home/{username}/Uber/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Add the src directory to the path
src_path = f'/home/{username}/Uber/backend/src'
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# Set up the virtual environment
activate_this = f'/home/{username}/.virtualenvs/uber-backend/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

# Import your Flask application
from main import app as application

if __name__ == "__main__":
    application.run()
```

**⚠️ IMPORTANTE**: Substitua `yourusername` pelo seu username real do PythonAnywhere!

### 7. Configurar Virtualenv

1. Na página da Web App, encontre a seção **"Virtualenv"**
2. No campo **"Enter path to a virtualenv"**, digite:
   ```
   /home/yourusername/.virtualenvs/uber-backend
   ```
   (Substitua `yourusername` pelo seu username)

### 8. Configurar Diretório de Código

1. Na seção **"Code"**, encontre **"Source code"**
2. Digite o caminho:
   ```
   /home/yourusername/Uber/backend
   ```

### 9. Recarregar a Aplicação

1. Clique no botão verde **"Reload yourusername.pythonanywhere.com"**
2. Aguarde alguns segundos

### 10. Testar o Backend

1. Acesse `https://yourusername.pythonanywhere.com`
2. Você deve ver uma resposta JSON como:
   ```json
   {
     "message": "Uber App Backend API",
     "version": "1.0.0",
     "status": "running",
     "endpoints": {
       "users": "/api/users",
       "rides": "/api/rides",
       "messages": "/api/messages"
     }
   }
   ```

3. Teste os endpoints:
   - `https://yourusername.pythonanywhere.com/api/users`
   - `https://yourusername.pythonanywhere.com/health`

## 🔧 Configuração do Frontend

Após o backend estar funcionando, você precisa atualizar o frontend para usar a nova URL.

### Atualizar URL da API

1. Edite o arquivo `frontend/src/components/UserSelector.jsx`
2. Encontre a linha:
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' 
     ? '/api' 
     : 'https://uber-backend-api.herokuapp.com/api';
   ```

3. Substitua por:
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' 
     ? '/api' 
     : 'https://yourusername.pythonanywhere.com/api';
   ```

4. Faça o mesmo em outros componentes que fazem chamadas à API:
   - `frontend/src/components/PassengerDashboard.jsx`
   - `frontend/src/components/DriverDashboard.jsx`
   - `frontend/src/components/ChatComponent.jsx`

### Fazer Deploy das Alterações

```bash
# No seu computador local ou no GitHub
git add .
git commit -m "Atualiza URL da API para PythonAnywhere"
git push origin master
```

O GitHub Actions fará automaticamente o deploy do frontend atualizado.

## 🐛 Troubleshooting

### Erro 500 - Internal Server Error

1. Verifique os logs de erro:
   - No Dashboard → Web → Error log
   - No Dashboard → Web → Server log

2. Problemas comuns:
   - Username incorreto no arquivo WSGI
   - Caminho do virtualenv incorreto
   - Dependências não instaladas

### Erro de CORS

Se houver problemas de CORS, verifique se o CORS está configurado corretamente no `main.py`:

```python
CORS(app, origins=["*"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
```

### Banco de Dados

O SQLite será criado automaticamente em `/home/yourusername/Uber/backend/src/database/app.db`

### Atualizar Código

Para atualizar o código no PythonAnywhere:

```bash
# No console Bash do PythonAnywhere
cd ~/Uber
git pull origin master

# Recarregar a aplicação na página Web
```

## 📱 Teste Final

1. **Backend**: `https://yourusername.pythonanywhere.com`
2. **Frontend**: `https://Jonathan0078.github.io/Uber/`
3. **Teste completo**: Criar usuário, solicitar corrida, chat

## 🎉 Pronto!

Seu aplicativo Uber agora está completamente funcional com:
- ✅ Frontend no GitHub Pages com PWA
- ✅ Backend no PythonAnywhere
- ✅ Comunicação entre frontend e backend
- ✅ Todas as funcionalidades operacionais

---

**Dica**: Anote sua URL do PythonAnywhere: `https://yourusername.pythonanywhere.com`

