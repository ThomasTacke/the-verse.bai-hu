// Require the framework
import * as Fastify from 'fastify';
import { ServerResponse } from 'http';
import * as Swagger from 'fastify-swagger';
import IndexRoute from './routes/index';
import LightRoutes from './routes/lights';
import mqtt from './plugins/mqtt';

const fastifyOpts = process.env.NODE_ENV !== 'test' ? {
  logger: true,
  pluginTimeout: 10000
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

const createServer = () => {

  // Instantiate Fastify with some config
  const fastify: Fastify.FastifyInstance = Fastify(fastifyOpts);

  // Register Swagger
  fastify.register(Swagger, swaggerSchema);

  // Register routes.
  fastify.register(IndexRoute);
  fastify.register(LightRoutes);

  // Register MQTT Plugin
  fastify.register(mqtt);

  fastify.setErrorHandler((error: any, request: Fastify.FastifyRequest, reply: Fastify.FastifyReply<ServerResponse>) => {
    request.log.error(error.toString());
    reply.code(500).send(JSON.stringify(error));
  });

  fastify.ready();
  return fastify;
}

export default createServer;