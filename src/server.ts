// Require the framework
import * as Fastify from 'fastify';
import * as Swagger from 'fastify-swagger';
import AsyncMqtt from '@smart-home-the-verse/fastify-async-mqtt';
import { IClientOptions } from 'async-mqtt';
import IndexRoute from './routes/index';
import LightRoutes from './routes/lights';

const fastifyOpts = process.env.NODE_ENV !== 'test' ? {
  logger: {
    level: process.env.DEBUG === 'true' ? 'debug' : 'info'
  },
  pluginTimeout: 10000,
} : {}

const swaggerSchema = {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Bai Hu - White Tiger API',
      description: 'testing the fastify swagger api',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  exposeRoute: true
}

const mqttClientOptions: IClientOptions = {
  host: process.env.MQTT_BROKER || 'eclipse-mosquitto'
}

const createServer = () => {

  // Instantiate Fastify with some config
  const fastify: Fastify.FastifyInstance = Fastify(fastifyOpts);

  // Register Swagger
  fastify.register(Swagger, swaggerSchema);

  // Register Async MQTT Plugin
  fastify.register(AsyncMqtt, mqttClientOptions);

  // Register routes.
  fastify.register(IndexRoute);
  fastify.register(LightRoutes);

  // Return the instance
  fastify.ready();
  return fastify;
}

export default createServer;