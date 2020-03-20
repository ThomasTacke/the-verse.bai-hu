# Base image
FROM node:lts-alpine3.9 AS base
EXPOSE 3000
WORKDIR /usr/src/app
RUN npm install -g fastify-cli

FROM base AS dev
RUN npm install -g standard

# Prod image
FROM base AS prod
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "start" ]