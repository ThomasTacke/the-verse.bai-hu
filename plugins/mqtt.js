'use strict'

const fp = require('fastify-plugin')
const mqtt = require('async-mqtt')

const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto'

module.exports = fp(async function (fastify, opts, next) {
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `Connecting to: mqtt://${mqttBroker}`)
  const mqttClient = await mqtt.connectAsync(`mqtt://${mqttBroker}`)
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `MQTT Client connected to: mqtt://${mqttBroker}`)
  const topic = 'the-verse/+/light'
  mqttClient.subscribe(topic).then(() => fastify.log.info(`Subscribed to ${topic}`)).catch(fastify.log.error)

  mqttClient.on('message', async (topic, payload) => {
    fastify.log.info({ plugin: 'mqtt', event: 'on-message', topic: topic, payload: JSON.stringify(payload) })
    lightSwitch(fastify, mqttClient, topic.toString().split('/')[1], payload.toString())
  })

  fastify
    .decorate('mqtt', async (light, newState) => {
      return lightSwitch(fastify, mqttClient, light, newState)
    })
    .addHook('onClose', async (fastify, done) => {
      await mqttClient.end()
      fastify.log.info({ plugin: 'mqtt', event: 'on-close' }, `Closed connection to: mqtt://${mqttBroker}`)
      done()
    })

  next()
})

async function noop() { }

async function lightSwitch(fastify, mqttClient, room, payload) {
  const onCode = '1100'
  const offCode = '0011'

  let wirelessSockets = {
    kitchenPayload: payload === 'on' ? `01011101110101000000${onCode}` : `01011101110101000000${offCode}`,
    vitrinePayload: payload === 'on' ? `01011101011101000000${onCode}` : `01011101011101000000${offCode}`,
    nighstandPayload: payload === 'on' ? `01011101010111000000${onCode}` : `01011101010111000000${offCode}`
  }

  payload = room === 'kitchen-pc' ? wirelessSockets.kitchenPayload
    : room === 'vitrine' ? wirelessSockets.vitrinePayload
      : room === 'nighstand' ? wirelessSockets.nighstandPayload
        : room === 'all' ? payload
          : await noop()

  const topic = 'the-verse/433/lights'

  if (room === 'all') {
    Object.values(wirelessSockets).forEach(socket => {
      fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(socket) })
      mqttClient.publish(topic, socket, { retain: true }).catch(fastify.log.error)
    })
  } else {
    fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(payload) })
    await mqttClient.publish(topic, payload, { retain: true }).catch(fastify.log.error)
  }

  return 'Done'
}
