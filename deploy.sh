#!/bin/bash

# Script simples de deploy
# Uso: ./deploy.sh

set -euo pipefail
trap 'echo "❌ Erro no deploy (linha $LINENO). Verifique o comando acima." >&2' ERR

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

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env nao encontrado!"
    echo "📝 Crie com: cp .env.example .env"
    exit 1
fi

# Parar containers antigos
echo "⏸️  Parando containers antigos..."
$DOCKER_COMPOSE -f docker-compose.yaml down

# Construir nova imagem
echo "🔨 Construindo imagem..."
$DOCKER_COMPOSE -f docker-compose.yaml build

# Iniciar container
echo "▶️  Iniciando container..."
$DOCKER_COMPOSE -f docker-compose.yaml up -d --remove-orphans

# Aguardar inicialização
echo "⏳ Aguardando aplicação iniciar..."
sleep 10

# Verificar status
echo ""
echo "📊 Status:"
$DOCKER_COMPOSE -f docker-compose.yaml ps

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Acesse: https://procuraai-homolog.secties.pb.gov.br/"
echo "📋 Logs: $DOCKER_COMPOSE -f docker-compose.yaml logs -f"
echo "⏹️  Parar: $DOCKER_COMPOSE -f docker-compose.yaml down"
