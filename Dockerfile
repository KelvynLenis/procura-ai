# Dockerfile para producao
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias de build
COPY package*.json ./
RUN npm ci

# Copiar codigo
COPY . .

# Build da aplicacao
RUN npm run build

# Remover dependencias de desenvolvimento (economizar espaco)
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Iniciar aplicacao
CMD ["npm", "start"]
