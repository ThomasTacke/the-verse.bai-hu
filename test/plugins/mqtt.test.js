'use strict'

require('dotenv').config()
const { test } = require('tap')
const Fastify = require('fastify')
const mqtt = require('async-mqtt')
const mqttPlugin = require('../../plugins/mqtt')

const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto'

test('mqtt works standalone', async (t) => {
  const fastify = Fastify()
  const mqttClient = await mqtt.connectAsync(`mqtt://${mqttBroker}`)

  fastify.register(mqttPlugin)

  await mqttClient.publish('the-verse/kitchen-pc/light', 'on', { retain: true })
  await mqttClient.end()

  await fastify.ready()
  t.equal(await fastify.mqtt('kitchen-pc', 'off'), 'Done')
  t.equal(await fastify.mqtt('kitchen-pc', 'on'), 'Done')
  t.equal(await fastify.mqtt('vitrine', 'off'), 'Done')
  t.equal(await fastify.mqtt('vitrine', 'on'), 'Done')
  t.equal(await fastify.mqtt('nightstand', 'off'), 'Done')
  t.equal(await fastify.mqtt('nightstand', 'on'), 'Done')
  t.equal(await fastify.mqtt('all', 'off'), 'Done')
  t.equal(await fastify.mqtt('all', 'on'), 'Done')
  t.equal(await fastify.mqtt('', 'off'), 'Done')
  t.equal(await fastify.mqtt('', 'on'), 'Done')

  fastify.close()
})
