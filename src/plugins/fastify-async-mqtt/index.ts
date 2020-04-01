import * as fp from 'fastify-plugin';
import { AsyncMqttClient, connectAsync, IClientOptions } from 'async-mqtt';
import { FastifyInstance } from 'fastify';
import * as http from 'http';

// TODO: Move to typings file
declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
    > {
    mqtt: AsyncMqttClient;
  }
}

let asyncMqttClient: AsyncMqttClient;

async function decorateFastifyInstance(fastify: FastifyInstance, client: AsyncMqttClient, next) {
  fastify.addHook('onClose', async (fastify: FastifyInstance, done) => {
    await asyncMqttClient.end();
    fastify.log.info({ plugin: 'mqtt', event: 'on-close' }, 'Connection to MQTT-Broker closed.');
    done();
  });

  if (!fastify.mqtt) {
    fastify.decorate('mqtt', client);
  }

  next();
}

async function fastifyAsyncMqtt(fastify: FastifyInstance, clientOptions: IClientOptions, next) {
  if (!clientOptions.host) {
    next(new Error('`host` parameter is mandatory'));
    return;
  }
  // try {
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `Connecting to: mqtt://${clientOptions.host}`);
  asyncMqttClient = await connectAsync(`mqtt://${clientOptions.host}`, clientOptions);
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `MQTT Client connected to: mqtt://${clientOptions.host}`);
  decorateFastifyInstance(fastify, asyncMqttClient, next);
  // } catch (error) {
  //   next(error);
  //   return
  // }

}

export default fp(fastifyAsyncMqtt, {
  fastify: '>=1.0.0',
  name: 'fastify-async-mqtt'
})
