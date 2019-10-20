const mqtt = require('async-mqtt')

const mqttClient = mqtt.connect('mqtt://192.168.42.45')

mqttClient.on('connect', async () => {
    console.log('Connected to MQTT broker')

    const topic = 'the-verse/+/light'
    mqttClient.subscribe(topic).then(() => console.log(`Subscribed to ${topic}`)).catch(console.log)
})

mqttClient.on('message', async (topic, payload) => {
    let light = topic.toString().split('/')
    console.log(light)
    switch (light[1]) {
        case 'kitchen-pc':
            mqttClient.publish('the-verse/433/lights', payload.toString() === 'on' ? '010111011101010000001100' : '010111011101010000000011').catch(console.log)
            break;
        case 'vitrine':
            mqttClient.publish('the-verse/433/lights', payload.toString() === 'on' ? '010111010111010000001100' : '010111010111010000000011').catch(console.log)
            break;
        case 'nightstand':
            mqttClient.publish('the-verse/433/lights', payload.toString() === 'on' ? '010111010101110000001100' : '010111010101110000000011').catch(console.log)
            break;            
        case 'all':
            await mqttClient.publish('the-verse/kitchen-pc/light', payload.toString() === 'on' ? 'on' : 'off').catch(console.log)
            await mqttClient.publish('the-verse/vitrine/light', payload.toString() === 'on' ? 'on' : 'off').catch(console.log)
            break;
        default:
            break;
    }
    console.log(topic)
    console.log(payload.toString())
})