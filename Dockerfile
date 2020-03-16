# Base image
FROM node:lts-alpine3.9 AS base
EXPOSE 3000
WORKDIR /usr/src/app
RUN npm install -g fastify-cli

# Prod image
FROM base AS prod
COPY package*.json ./
RUN npm install -g fastify-cli
# If you are building your code for production
RUN apk add python
# RUN npm ci --only=production
RUN npm install
# Bundle app source
COPY . .
CMD [ "npm", "start" ]