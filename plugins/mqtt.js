'use strict'

const fp = require('fastify-plugin')
const mqtt = require('async-mqtt')

const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto'

module.exports = fp(async (fastify, opts, next) => {
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

async function lightSwitch (fastify, mqttClient, light, payload) {
  fastify.log.info({ plugin: 'mqtt', event: 'publish', light: light, payload: JSON.stringify(payload) })
  const onCode = '1100'
  const offCode = '0011'
  switch (light) {
    case 'kitchen-pc':
      await mqttClient.publish('the-verse/433/lights', payload === 'on' ? `01011101110101000000${onCode}` : `01011101110101000000${offCode}`).catch(fastify.log.error)
      break
    case 'vitrine':
      await mqttClient.publish('the-verse/433/lights', payload === 'on' ? `01011101011101000000${onCode}` : `01011101011101000000${offCode}`).catch(fastify.log.error)
      break
    case 'nightstand':
      await mqttClient.publish('the-verse/433/lights', payload === 'on' ? `01011101010111000000${onCode}` : `01011101010111000000${offCode}`).catch(fastify.log.error)
      break
    case 'all':
      await mqttClient.publish('the-verse/kitchen-pc/light', payload.toString() === 'on' ? 'on' : 'off', { retain: true }).catch(fastify.log.error)
      await mqttClient.publish('the-verse/vitrine/light', payload.toString() === 'on' ? 'on' : 'off', { retain: true }).catch(fastify.log.error)
      await mqttClient.publish('the-verse/nightstand/light', payload.toString() === 'on' ? 'on' : 'off', { retain: true }).catch(fastify.log.error)
      break
    default:
      break
  }
  return 'Done'
}
