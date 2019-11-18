'use strict'

const isDocker = require('is-docker')
const fp = require('fastify-plugin')
const mqtt = require('async-mqtt')

const mqttBroker = isDocker() ? 'eclipse-mosquitto' : process.env.MQTT_BROKER

module.exports = fp(async (fastify, opts, next) => {
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
  switch (light) {
    case 'kitchen-pc':
      await mqttClient.publish('the-verse/433/lights', payload === 'on' ? '010111011101010000001100' : '010111011101010000000011').catch(fastify.log.error)
      break
    case 'vitrine':
      await mqttClient.publish('the-verse/433/lights', payload === 'on' ? '010111010111010000001100' : '010111010111010000000011').catch(fastify.log.error)
      break
    case 'nightstand':
      await mqttClient.publish('the-verse/433/lights', payload === 'on' ? '010111010101110000001100' : '010111010101110000000011').catch(fastify.log.error)
      break
    case 'all':
      await mqttClient.publish('the-verse/kitchen-pc/light', payload.toString() === 'on' ? 'on' : 'off').catch(fastify.log.error)
      await mqttClient.publish('the-verse/vitrine/light', payload.toString() === 'on' ? 'on' : 'off').catch(fastify.log.error)
      break
    default:
      break
  }
  return 'Done'
}
