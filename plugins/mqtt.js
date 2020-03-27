'use strict'

const fp = require('fastify-plugin')
const mqtt = require('async-mqtt')

const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto'
let mqttClient

module.exports = fp(async function (fastify, opts, next) {
  await startMqtt(fastify)
  fastify
    .decorate('mqtt', async (light, newState) => {
      mqttClient.publish(`the-verse/${light}/light`, newState, { retain: true }).catch(fastify.log.error)
    })
    .addHook('onClose', async (fastify, done) => {
      await mqttClient.end()
      fastify.log.info({ plugin: 'mqtt', event: 'on-close' }, `Closed connection to: mqtt://${mqttBroker}`)
      done()
    })

  next()
})

async function startMqtt (fastify) {
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `Connecting to: mqtt://${mqttBroker}`)
  mqttClient = await mqtt.connectAsync(`mqtt://${mqttBroker}`)
  fastify.log.info({ plugin: 'mqtt', event: 'on-connect' }, `MQTT Client connected to: mqtt://${mqttBroker}`)

  const subTopic = 'the-verse/+/light'
  mqttClient.subscribe(subTopic).then(() => fastify.log.info(`Subscribed to ${subTopic}`)).catch(fastify.log.error)
  mqttClient.on('message', async (topic, payload) => {
    fastify.log.info({ plugin: 'mqtt', event: 'on-message', topic: topic, payload: JSON.stringify(payload) })
    publishAll(fastify, topic.toString().split('/')[1], payload.toString())
    if (topic.toString().split('/')[1] !== 'all') {
      lightSwitch(fastify, mqttClient, topic.toString().split('/')[1], payload.toString())
    }
  })
}

async function publishAll (fastify, room, newState) {
  if (room === 'all') {
    mqttClient.publish('the-verse/kitchen-pc/light', newState, { retain: true }).catch(fastify.log.error)
    mqttClient.publish('the-verse/vitrine/light', newState, { retain: true }).catch(fastify.log.error)
    mqttClient.publish('the-verse/nightstand/light', newState, { retain: true }).catch(fastify.log.error)
  }
}

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

  let myPayload
  if (room === 'kitchen-pc') { myPayload = payload === 'on' ? kitchenOnCode : kitchenOffCode }
  if (room === 'vitrine') { myPayload = payload === 'on' ? vitrineOnCode : vitrineOffCode }
  if (room === 'nightstand') { myPayload = payload === 'on' ? nightstandOnCode : nightstandOffCode }
  return myPayload
}

async function lightSwitch (fastify, mqttClient, room, payload) {
  const topic = 'the-verse/433/lights'
  const modulePayload = await onOrOff(payload, room).catch(fastify.log.error)
  fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(modulePayload) })
  mqttClient.publish(topic, modulePayload, { retain: true }).catch(fastify.log.error)
}
