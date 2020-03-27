import * as fp from 'fastify-plugin';
import { AsyncMqttClient, IClientPublishOptions, connectAsync } from 'async-mqtt';
import { FastifyInstance } from 'fastify';

const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto';
const mqttPublishOpts: IClientPublishOptions = {
  qos: 0,
  retain: true
}
let mqttClient: AsyncMqttClient;

export default fp(async (fastify: FastifyInstance) => {
  await startMqtt(fastify);
  fastify.decorate('mqtt', async (light: string, newState: string) => {
    mqttClient.publish(`the-verse/${light}/light`, newState, mqttPublishOpts).catch(fastify.log.error);
  }).addHook('onClose', async (fastify: FastifyInstance, done) => {
    await mqttClient.end();
    fastify.log.info({ plugin: 'mqtt', event: 'on-close' }, `Closed connection to: mqtt://${mqttBroker}`);
    done();
  });
})

async function startMqtt(fastify: FastifyInstance): Promise<void> {
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `Connecting to: mqtt://${mqttBroker}`);
  mqttClient = await connectAsync(`mqtt://${mqttBroker}`);
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `MQTT Client connected to: mqtt://${mqttBroker}`);

  const subTopic = 'the-verse/+/light';
  mqttClient.subscribe(subTopic).then(() => fastify.log.info(`Subscribed to ${subTopic}`)).catch(fastify.log.error);
  mqttClient.on('message', async (topic: string, payload: Buffer) => {
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
    mqttClient.publish('the-verse/kitchen-pc/light', newState, mqttPublishOpts).catch(fastify.log.error);
    mqttClient.publish('the-verse/vitrine/light', newState, mqttPublishOpts).catch(fastify.log.error);
    mqttClient.publish('the-verse/nightstand/light', newState, mqttPublishOpts).catch(fastify.log.error);
  }
}

async function onOrOff(payload: string, room: string): Promise<string> {
  const onCode = '1100'
  const offCode = '0011'

  const kitchenCode = '01011101110101000000'
  const kitchenOnCode = kitchenCode + onCode
  const kitchenOffCode = kitchenCode + offCode

  const vitrineCode = '01011101011101000000'
  const vitrineOnCode = vitrineCode + onCode
  const vitrineOffCode = vitrineCode + offCode

  const nightstandCode = '01011101010111000000'
  const nightstandOnCode = nightstandCode + onCode
  const nightstandOffCode = nightstandCode + offCode

  if (room === 'kitchen-pc') { return payload === 'on' ? kitchenOnCode : kitchenOffCode }
  if (room === 'vitrine') { return payload === 'on' ? vitrineOnCode : vitrineOffCode }
  if (room === 'nightstand') { return payload === 'on' ? nightstandOnCode : nightstandOffCode }
}

async function lightSwitch(fastify: FastifyInstance, room: string, payload: string): Promise<void> {
  const topic = 'the-verse/433/lights'
  const modulePayload = await onOrOff(payload, room);
  fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(modulePayload) });
  mqttClient.publish(topic, modulePayload, mqttPublishOpts).catch(fastify.log.error);
}
