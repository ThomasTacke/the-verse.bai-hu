import * as tap from 'tap';
import * as Fastify from 'fastify';
import { IClientPublishOptions, connectAsync } from 'async-mqtt';
import mqttPlugin from '../../src/plugins/mqtt';
import { Server, IncomingMessage, ServerResponse } from 'http';

const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto'
const mqttPublishOpts: IClientPublishOptions = {
  qos: 0,
  retain: true
}

declare module "fastify" {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse
    > {
    mqtt(light: string, newState: string): void
  }
}

tap.test('mqtt works standalone', async (t) => {
  const fastify: Fastify.FastifyInstance = Fastify();
  const mqttClient = await connectAsync(`mqtt://${mqttBroker}`);

  fastify.register(mqttPlugin);

  await mqttClient.publish('the-verse/kitchen-pc/light', 'on', mqttPublishOpts);
  await mqttClient.end();

  await fastify.ready();
  t.resolves(fastify.mqtt('kitchen-pc', 'off'));
  t.resolves(fastify.mqtt('kitchen-pc', 'off'));
  t.resolves(fastify.mqtt('kitchen-pc', 'on'));
  t.resolves(fastify.mqtt('vitrine', 'off'));
  t.resolves(fastify.mqtt('vitrine', 'on'));
  t.resolves(fastify.mqtt('nightstand', 'off'));
  t.resolves(fastify.mqtt('nightstand', 'on'));
  t.resolves(fastify.mqtt('all', 'off'));
  t.resolves(fastify.mqtt('all', 'on'));
  t.resolves(fastify.mqtt('', 'off'));
  t.resolves(fastify.mqtt('', 'on'));

  await fastify.close();
  t.end();
})
