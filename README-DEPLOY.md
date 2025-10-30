# 🚀 Deploy - ProcuraAI Web

Guia de deploy da aplicação ProcuraAI Web em servidor de produção.

## 📋 Pré-requisitos

- Servidor Linux com SSH configurado
- Docker e Docker Compose instalados
- Nginx instalado
- Certificado SSL (Let's Encrypt recomendado)
- Acesso root/sudo no servidor

## 🔧 Configuração Inicial

### 1. Clone do Projeto

```bash
git clone <seu-repositorio> /var/www/procuraai-web
cd /var/www/procuraai-web
```

### 2. Configuração das Variáveis de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.prod.example .env.production
nano .env.production
```

**Variáveis obrigatórias:**

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.secties.pb.gov.br/v1
NEXT_PUBLIC_APPWRITE_PROJECT=

# Gov.br SSO
GOVBR_CLIENT_ID=seu_client_id
GOVBR_CLIENT_SECRET=seu_client_secret
GOVBR_REDIRECT_URI=https://procuraai.secties.pb.gov.br/api/login-gov/callback

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key

# Collections (configure conforme seu Appwrite)
NEXT_PUBLIC_USERS_COLLECTION_ID=...
NEXT_PUBLIC_NOTIFICATIONS_COLLECTION_ID=...
# ... outras collections
```

### 3. Configuração do Nginx

Execute o script de configuração do Nginx:

```bash
chmod +x fix-nginx.sh
sudo ./fix-nginx.sh
```

Ou configure manualmente criando `/etc/nginx/sites-available/procuraai`:

```nginx
server {
    listen 80;
    server_name procuraai.secties.pb.gov.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name procuraai.secties.pb.gov.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/procuraai.secties.pb.gov.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/procuraai.secties.pb.gov.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative a configuração e reinicie o Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/procuraai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🐳 Deploy com Docker

### Deploy Inicial

```bash
chmod +x deploy.sh
./deploy.sh
```

O script `deploy.sh` irá:
1. Detectar automaticamente se você tem `docker-compose` ou `docker compose`
2. Fazer o build da imagem Docker
3. Subir o container em modo produção
4. A aplicação estará disponível em http://localhost:3000

### Comandos Úteis

**Ver logs da aplicação:**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

**Parar a aplicação:**
```bash
docker-compose -f docker-compose.prod.yml down
```

**Reiniciar a aplicação:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

**Ver status dos containers:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Atualização da Aplicação

Para atualizar a aplicação com novas mudanças:

```bash
cd /var/www/procuraai-web
git pull origin main  # ou sua branch de produção
./deploy.sh
```

## 🔍 Verificação de Saúde

Após o deploy, verifique:

1. **Status do Docker:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. **Logs da aplicação:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=50
   ```

3. **Nginx funcionando:**
   ```bash
   sudo systemctl status nginx
   ```

4. **Acesso HTTPS:**
   ```bash
   curl -I https://procuraai.secties.pb.gov.br
   ```

## 🆘 Solução de Problemas

### Container não inicia

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs

# Verificar se a porta 3000 está em uso
sudo lsof -i :3000

# Verificar variáveis de ambiente
docker-compose -f docker-compose.prod.yml config
```

### Erro de certificado SSL

```bash
# Verificar se os certificados existem
ls -la /etc/letsencrypt/live/procuraai.secties.pb.gov.br/

# Renovar certificados Let's Encrypt
sudo certbot renew

# Testar configuração do Nginx
sudo nginx -t
```

### Aplicação retorna erro 502

```bash
# Verificar se o container está rodando
docker-compose -f docker-compose.prod.yml ps

# Verificar conectividade
curl http://localhost:3000

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📁 Estrutura de Arquivos

```
/var/www/procuraai-web/
├── .env.production          # Variáveis de ambiente (não commitado)
├── Dockerfile.prod          # Configuração Docker para produção
├── docker-compose.prod.yml  # Orquestração Docker
├── deploy.sh               # Script de deploy
├── fix-nginx.sh            # Script de configuração Nginx
└── ... (código da aplicação)
```

## 🔐 Segurança

- ✅ HTTPS obrigatório (redirecionamento de HTTP para HTTPS)
- ✅ Certificados SSL válidos (Let's Encrypt)
- ✅ Variáveis de ambiente não versionadas
- ✅ Headers de proxy configurados corretamente

## 📝 Notas Importantes

- O arquivo `.env.production` **NUNCA** deve ser commitado no Git
- Certifique-se de ter todas as variáveis configuradas antes do deploy
- O certificado SSL precisa ser renovado periodicamente (Let's Encrypt renova a cada 90 dias)
- Mantenha backups regulares do banco de dados Appwrite

## 🔗 Links Úteis

- **Aplicação:** https://procuraai.secties.pb.gov.br
- **Appwrite:** https://appwrite.secties.pb.gov.br
- **Documentação Next.js:** https://nextjs.org/docs
- **Let's Encrypt:** https://letsencrypt.org/

---

**Última atualização:** Outubro 2025
