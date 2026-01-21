#!/bin/bash

# Script simples para configurar Nginx com certificados corretos
# Uso: sudo ./fix-nginx.sh

echo "🔧 Configurando Nginx..."
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Execute como root: sudo ./fix-nginx.sh"
    exit 1
fi

# Backup
echo "💾 Backup..."
cp /etc/nginx/sites-available/procuraai /etc/nginx/sites-available/procuraai.bak 2>/dev/null || true

# Criar configuração diretamente
echo "📝 Criando configuração..."

cat << 'NGINX_CONFIG' > /etc/nginx/sites-available/procuraai
# HTTP - Redireciona para HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name procuraai-homolog.secties.pb.gov.br;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Com privacidade (não rastreável por Google)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name procuraai-homolog.secties.pb.gov.br;

    ssl_certificate /etc/letsencrypt/live/procuraai.secties.pb.gov.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/procuraai.secties.pb.gov.br/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ============================================
    # Headers de Privacidade - Bloqueia Google
    # ============================================
    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noodp" always;
    add_header X-Google-no-trace "true" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

    # ============================================
    # Headers de Segurança
    # ============================================
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;" always;

    access_log /var/log/nginx/procuraai-access.log;
    error_log /var/log/nginx/procuraai-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONFIG

# Link simbólico
echo "🔗 Link simbólico..."
ln -sf /etc/nginx/sites-available/procuraai /etc/nginx/sites-enabled/procuraai

# Testar
echo ""
echo "🧪 Testando..."
nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ OK! Recarregando Nginx..."
    systemctl reload nginx
    echo ""
    echo "🎉 Pronto!"
    echo "🌐 Acesse: https://procuraai-homolog.secties.pb.gov.br"
    echo "🔒 Privacidade: Google NÃO conseguirá rastrear"
else
    echo ""
    echo "❌ Erro!"
    echo ""
    echo "Verifique se os certificados existem:"
    ls -la /etc/letsencrypt/live/procuraai.secties.pb.gov.br/
fi
