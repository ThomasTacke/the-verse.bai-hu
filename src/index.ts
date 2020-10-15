// Require the framework
import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import Swagger, { FastifyDynamicSwaggerOptions } from 'fastify-swagger';
import { bootstrap } from 'fastify-decorators';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { lightResponseSchema, lightSchema } from './controllers/lights.controller';
import { MqttService } from './services/mqtt';

dotenv.config();

const serverAddress = process.env.ADDRESS || '0.0.0.0';
const serverPort = +process.env.PORT || 3000;

const fastifyOpts: FastifyServerOptions = process.env.NODE_ENV !== 'test' ? {
  logger: {
    level: process.env.DEBUG === 'true' ? 'debug' : 'info'
  },
  pluginTimeout: 10000,
} : {}

const swaggerSchema: FastifyDynamicSwaggerOptions = {
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

// Instantiate Fastify with some config
const instance: FastifyInstance = Fastify(fastifyOpts);

// Register Swagger
instance.register(Swagger, swaggerSchema);

// Add Schemas to fastify instance
instance.addSchema(lightSchema);
instance.addSchema(lightResponseSchema);

// Register routes here
instance.register(bootstrap, {
  directory: resolve(__dirname, `controllers`),
  mask: /\.controller\./
});

// Return the instance
instance.ready();

try {
  instance.listen(serverPort, serverAddress).then(() => {
    instance.swagger()
  });
  instance.addHook('onClose', (instance, done) => {
    MqttService.getInstance().end().then(() => {
      done();
    });
  })
} catch (error) {
  console.log(error);
  process.exit(1);
}

export { instance };