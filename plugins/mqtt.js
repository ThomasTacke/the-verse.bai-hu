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

async function onOrOff (payload, room) {
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

  const myPayload = []

  const allOn = [
    kitchenOnCode,
    vitrineOnCode,
    nightstandOnCode
  ]

  const allOff = [
    kitchenOffCode,
    vitrineOffCode,
    nightstandOffCode
  ]

  if (room === 'all') { myPayload.push(payload === 'on' ? allOn : allOff) }

  if (room === 'kitchen-pc') { myPayload.push(payload === 'on' ? kitchenOnCode : kitchenOffCode) }

  if (room === 'vitrine') { myPayload.push(payload === 'on' ? vitrineOnCode : vitrineOffCode) }

  if (room === 'nightstand') { myPayload.push(payload === 'on' ? nightstandOnCode : nightstandOffCode) }

  return myPayload
}

async function lightSwitch (fastify, mqttClient, room, payload) {
  const topic = 'the-verse/433/lights'
  const payloads = await onOrOff(payload, room).catch(fastify.log.error)
  for (const item in payloads) {
    fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(item) })
    mqttClient.publish(topic, item, { retain: true }).catch(fastify.log.error)
  }

  return 'Done'
}
