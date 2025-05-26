FROM node:20-slim

WORKDIR /home/node/app

RUN apt-get update -y && apt-get install -y openssl

# COPY package.json  ./

# RUN yarn install

COPY . .

WORKDIR /home/node/app

USER node

EXPOSE 19000 19001 19002 3000 8081 8082
