# Instruções de Deploy - Uber App

## 🚀 Deploy no GitHub Pages

### Configuração Automática
O projeto está configurado para deploy automático no GitHub Pages através do GitHub Actions.

### Workflow de Deploy
- **Arquivo**: `.github/workflows/deploy.yml`
- **Trigger**: Push na branch `master`
- **Processo**: Build do frontend React → Deploy no GitHub Pages

### URL de Acesso
- **Produção**: https://Jonathan0078.github.io/Uber/
- **Repositório**: https://github.com/Jonathan0078/Uber

## 📱 PWA (Progressive Web App)

### Funcionalidades PWA Implementadas
- ✅ **Manifest**: `/frontend/public/manifest.json`
- ✅ **Service Worker**: `/frontend/public/sw.js`
- ✅ **Ícones**: 192x192 e 512x512 pixels
- ✅ **Meta Tags**: Theme color, viewport, etc.
- ✅ **Instalação**: Pode ser instalado como app nativo

### Como Instalar o PWA
1. Acesse https://Jonathan0078.github.io/Uber/
2. No navegador mobile, toque no menu "Adicionar à tela inicial"
3. No desktop, clique no ícone de instalação na barra de endereços

## 🔧 Configurações Técnicas

### Vite Configuration
```javascript
base: '/Uber/', // Base URL para GitHub Pages
build: {
  outDir: 'dist',
  assetsDir: 'assets'
}
```

### GitHub Actions
```yaml
# Deploy automático quando há push na master
on:
  push:
    branches: [ master ]
```

## 🌐 Backend em Produção

### Opções de Deploy do Backend
1. **Heroku** (recomendado para demonstração)
2. **Railway**
3. **Render**
4. **DigitalOcean App Platform**

### Configuração da API
No arquivo `UserSelector.jsx`, a URL da API é configurada automaticamente:
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? '/api' 
  : 'https://uber-backend-api.herokuapp.com/api';
```

## 📋 Checklist de Deploy

### ✅ Concluído
- [x] Configuração do GitHub Actions
- [x] Build automático do frontend
- [x] Deploy no GitHub Pages
- [x] Configuração PWA completa
- [x] Ícones e manifest
- [x] Service Worker para cache
- [x] Meta tags para mobile

### 🔄 Próximos Passos (Opcional)
- [ ] Deploy do backend em produção
- [ ] Configuração de domínio customizado
- [ ] SSL/HTTPS personalizado
- [ ] Analytics e monitoramento

## 🛠️ Comandos Úteis

### Build Local
```bash
cd frontend
pnpm install
pnpm run build
```

### Deploy Manual (se necessário)
```bash
git add .
git commit -m "Deploy update"
git push origin master
```

### Verificar PWA
1. Abra DevTools (F12)
2. Vá para aba "Application"
3. Verifique "Service Workers" e "Manifest"

## 📱 Teste em Dispositivos

### Mobile
- Acesse via navegador mobile
- Teste instalação PWA
- Verifique responsividade

### Desktop
- Teste em diferentes navegadores
- Verifique instalação PWA
- Teste funcionalidades offline (cache)

## 🔍 Troubleshooting

### Problemas Comuns
1. **404 no GitHub Pages**: Verificar se o workflow executou com sucesso
2. **PWA não instala**: Verificar manifest.json e service worker
3. **Recursos não carregam**: Verificar caminhos relativos no build

### Logs de Deploy
- Acesse: https://github.com/Jonathan0078/Uber/actions
- Verifique logs do workflow "Deploy to GitHub Pages"

---

**Nota**: O aplicativo está totalmente funcional no GitHub Pages com PWA. Para uso em produção, considere fazer deploy do backend e configurar domínio personalizado.

