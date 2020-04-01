import * as tap from 'tap';
import * as Fastify from 'fastify';
import mqttPlugin from '../../src/plugins/fastify-async-mqtt';

tap.test('Async MQTT No host given', async (t) => {
  const fastify: Fastify.FastifyInstance = Fastify();
  fastify.register(mqttPlugin);
  await fastify.close();
  t.end();
});
