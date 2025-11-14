#!/bin/bash

# Script simples de deploy
# Uso: ./deploy.sh

echo "🚀 Deploy ProcuraAI"
echo ""

# Detectar comando docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Docker Compose não encontrado!"
    echo "📝 Instale com: sudo apt install docker-compose-plugin"
    exit 1
fi

echo "✅ Usando: $DOCKER_COMPOSE"
echo ""

# Verificar se .env.production existe
if [ ! -f .env.production ]; then
    echo "❌ Arquivo .env.production não encontrado!"
    echo "📝 Crie com: cp .env.prod.example .env.production"
    exit 1
fi

# Parar containers antigos
echo "⏸️  Parando containers antigos..."
$DOCKER_COMPOSE -f docker-compose.prod.yml down

# Construir nova imagem
echo "🔨 Construindo imagem..."
$DOCKER_COMPOSE -f docker-compose.prod.yml build

# Iniciar container
echo "▶️  Iniciando container..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d

# Aguardar inicialização
echo "⏳ Aguardando aplicação iniciar..."
sleep 10

# Verificar status
echo ""
echo "📊 Status:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Acesse: https://procuraai.secties.pb.gov.br/"
echo "📋 Logs: $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f"
echo "⏹️  Parar: $DOCKER_COMPOSE -f docker-compose.prod.yml down"
