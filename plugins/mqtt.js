'use strict'

const fp = require('fastify-plugin')
const mqtt = require('async-mqtt')
const options = require(`../config/${process.env.NODE_ENV || 'default'}.json`)

const mqttClient = mqtt.connect(`mqtt://${options.mqtt.host}`)

module.exports = fp(async (fastify, opts) => {
    mqttClient.on('connect', async () => {
        fastify.log.info('Connected to MQTT broker')
    
        const topic = 'the-verse/+/light'
        mqttClient.subscribe(topic).then(() => fastify.log.info(`Subscribed to ${topic}`)).catch(fastify.log.error)
    })
    
    mqttClient.on('message', async (topic, payload) => {
        fastify.log.info(`Topic: ${topic}`)
        fastify.log.info(`Light: ${topic.toString().split('/')[1]}`)
        fastify.log.info(`Payload: ${payload.toString()}`)
        lightSwitch(fastify, topic.toString().split('/')[1], payload.toString())
    })

    fastify.decorate('mqtt', (light, newState) => {
        fastify.log.info(light)
        fastify.log.info(newState)
        lightSwitch(fastify, light, newState)
    })
})

async function lightSwitch(fastify, light, payload) {
    switch (light) {
        case 'kitchen-pc':
            mqttClient.publish('the-verse/433/lights', payload === 'on' ? '010111011101010000001100' : '010111011101010000000011').catch(fastify.log.error)
            break;
        case 'vitrine':
            mqttClient.publish('the-verse/433/lights', payload === 'on' ? '010111010111010000001100' : '010111010111010000000011').catch(fastify.log.error)
            break;
        case 'nightstand':
            mqttClient.publish('the-verse/433/lights', payload === 'on' ? '010111010101110000001100' : '010111010101110000000011').catch(fastify.log.error)
            break;
        case 'all':
            await mqttClient.publish('the-verse/kitchen-pc/light', payload.toString() === 'on' ? 'on' : 'off').catch(fastify.log.error)
            await mqttClient.publish('the-verse/vitrine/light', payload.toString() === 'on' ? 'on' : 'off').catch(fastify.log.error)
            break;
        default:
            break;
    }
}
