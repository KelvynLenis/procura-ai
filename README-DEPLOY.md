# 🚀 Deploy - ProcuraAI Web

## Requisitos

- Linux com Docker e Docker Compose
- Nginx e certificado SSL
- Acesso ao Docker e `sudo` para Nginx

## Deploy rapido

```bash
git clone <seu-repositorio> /var/www/procuraai-web
cd /var/www/procuraai-web
cp .env.example .env
nano .env
chmod +x deploy.sh
./deploy.sh
```

## Nginx (primeira vez ou troca de dominio/certificado)

```bash
chmod +x fix-nginx.sh
sudo ./fix-nginx.sh
```

## Atualizar aplicacao

```bash
cd /var/www/procuraai-web
git pull origin main
./deploy.sh
```

## Atualizar variaveis de ambiente

```bash
nano .env
docker compose -f docker-compose.yaml up -d --force-recreate
```

## Manutencao

```bash
docker compose -f docker-compose.yaml ps
docker compose -f docker-compose.yaml logs -f
docker compose -f docker-compose.yaml restart
docker compose -f docker-compose.yaml down
```

## Permissoes

- `deploy.sh`: acesso ao Docker (grupo `docker` ou `sudo`).
- `fix-nginx.sh`: requer `sudo`/root.
- `.env`: permissao de escrita no arquivo.
