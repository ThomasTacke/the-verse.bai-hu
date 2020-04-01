import * as fp from 'fastify-plugin';
import { RouteOptions, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LightGetSchema, LightPutSchema } from './schema';
import { ServerResponse } from 'http';
import { IClientPublishOptions } from 'async-mqtt';

const mqttPublishOpts: IClientPublishOptions = {
  qos: 0,
  retain: true
}

async function startMqtt(fastify: FastifyInstance) {
  const subTopic = 'the-verse/+/light';
  fastify.mqtt.subscribe(subTopic).then(() => fastify.log.info(`Subscribed to ${subTopic}`)).catch(fastify.log.error);
  fastify.mqtt.on('message', async (topic: string, payload: Buffer) => {
    const payloadToString = payload.toString();
    fastify.log.info({ plugin: 'mqtt', event: 'on-message', topic: topic, payload: JSON.stringify(payloadToString) })
    publishAll(fastify, topic.split('/')[1], payloadToString);
    if (topic.split('/')[1] !== 'all') {
      lightSwitch(fastify, topic.split('/')[1], payloadToString);
    }
  })
}

async function publishAll(fastify: FastifyInstance, room: string, newState: string): Promise<void> {
  if (room === 'all') {
    fastify.mqtt.publish('the-verse/kitchen-pc/light', newState, mqttPublishOpts).catch(fastify.log.error);
    fastify.mqtt.publish('the-verse/vitrine/light', newState, mqttPublishOpts).catch(fastify.log.error);
    fastify.mqtt.publish('the-verse/nightstand/light', newState, mqttPublishOpts).catch(fastify.log.error);
  }
}

async function onOrOff(payload: string, room: string): Promise<string> {
  const roomCodes = await getRoomCodes(room);
  if (roomCodes.error) {
    return '';
  }
  return roomCodes[payload];
}

async function getRoomCodes(room: string) {
  const onCode = '1100';
  const offCode = '0011';
  const kitchenCode = '01011101110101000000';
  const vitrineCode = '01011101011101000000';
  const nightstandCode = '01011101010111000000';

  return room === 'kitchen-pc' ? { on: kitchenCode + onCode, off: kitchenCode + offCode } :
    room === 'vitrine' ? { on: vitrineCode + onCode, off: vitrineCode + offCode } :
      room === 'nightstand' ? { on: nightstandCode + onCode, off: nightstandCode + offCode } :
        { error: 'No room match' };
}

async function lightSwitch(fastify: FastifyInstance, room: string, payload: string): Promise<void> {
  const topic = 'the-verse/433/lights'
  const modulePayload = await onOrOff(payload, room);
  fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(modulePayload) });
  fastify.mqtt.publish(topic, modulePayload, mqttPublishOpts).catch(fastify.log.error);
}

export default fp(async (fastify: FastifyInstance) => {
  startMqtt(fastify);
  const LightGetRoute: RouteOptions = {
    method: 'GET',
    url: '/light',
    schema: LightGetSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
      return reply.code(501).send({
        code: 501,
        msg: 'This function is not implemented.',
        lights: {}
      });
    }
  }

  const LightPutRoute: RouteOptions = {
    method: 'PUT',
    url: '/light/:room',
    schema: LightPutSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
      await fastify.mqtt.publish(`the-verse/${request.params.room}/light`, request.body.value, mqttPublishOpts).catch(fastify.log.error);
      return reply.code(201).send();
    }
  }

  fastify.route(LightGetRoute);
  fastify.route(LightPutRoute);
});
