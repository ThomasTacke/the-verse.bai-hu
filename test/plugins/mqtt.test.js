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
  t.error(await fastify.mqtt('kitchen-pc', 'off'))
  t.error(await fastify.mqtt('kitchen-pc', 'on'))
  t.error(await fastify.mqtt('vitrine', 'off'))
  t.error(await fastify.mqtt('vitrine', 'on'))
  t.error(await fastify.mqtt('nightstand', 'off'))
  t.error(await fastify.mqtt('nightstand', 'on'))
  t.error(await fastify.mqtt('all', 'off'))
  t.error(await fastify.mqtt('all', 'on'))
  t.error(await fastify.mqtt('', 'off'))
  t.error(await fastify.mqtt('', 'on'))

  await fastify.close()
  t.end()
})
