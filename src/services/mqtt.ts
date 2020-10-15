import { AsyncMqttClient, connect, IClientOptions, IClientPublishOptions } from 'async-mqtt';
import pino from 'pino';
import exitHook from 'async-exit-hook';

export class MqttService {
  private static instance: MqttService;
  private asyncMqttClient: AsyncMqttClient;

  private mqttClientOptions: IClientOptions = {
    host: process.env.MQTT_BROKER || 'eclipse-mosquitto'
  }
  private mqttPublishOpts: IClientPublishOptions = {
    qos: 0,
    retain: true
  }
  private logger = pino({
    name: 'mqtt-service',
    level: process.env.DEBUG === 'true' ? 'debug' : 'info'
  });

  constructor() {
    this.connect();
    this.startMqtt();
  }

  static getInstance(): MqttService {
    if(!MqttService.instance) {
      MqttService.instance = new MqttService();
    }
    return MqttService.instance;
  }

  connect() {
    if (!this.mqttClientOptions.host) {
      new Error('`host` parameter is mandatory');
      return;
    }
    this.logger.info({ plugin: 'mqtt', event: 'on-connect' }, `Connecting to: mqtt://${this.mqttClientOptions.host}`);
    this.asyncMqttClient = connect(`mqtt://${this.mqttClientOptions.host}`, this.mqttClientOptions);
    this.logger.info({ plugin: 'mqtt', event: 'on-connect' }, `MQTT Client connected to: mqtt://${this.mqttClientOptions.host}`);

    exitHook(async () => {
      await this.asyncMqttClient.end();
      this.logger.info({ plugin: 'mqtt', event: 'on-close' }, 'Connection to MQTT-Broker closed.');
    });
  }

  startMqtt() {
    const subTopic = 'the-verse/+/light';
    this.asyncMqttClient.subscribe(subTopic).then(() => this.logger.info(`Subscribed to ${subTopic}`)).catch(this.logger.error);
    this.asyncMqttClient.on('message', async (topic: string, payload: Buffer) => {
      const payloadToString = payload.toString();
      this.logger.info({ plugin: 'mqtt', event: 'on-message', topic: topic, payload: JSON.stringify(payloadToString) })
      if (topic.split('/')[1] !== 'all') {
        this.lightSwitch(topic.split('/')[1], payloadToString);
      } else if (topic.split('/')[1] === 'all') {
        this.publish('all', payloadToString);
      }
    });
    return;
  }

  async end() {
    await this.asyncMqttClient.end();
  }

  async publish(room: string, newState: string) {
    if (room === 'all') {
      Promise.all([
        this.asyncMqttClient.publish('the-verse/kitchen-pc/light', newState, this.mqttPublishOpts).catch(this.logger.error),
        this.asyncMqttClient.publish('the-verse/vitrine/light', newState, this.mqttPublishOpts).catch(this.logger.error),
        this.asyncMqttClient.publish('the-verse/nightstand/light', newState, this.mqttPublishOpts).catch(this.logger.error)
      ]).then(() => { return });
    } else {
      await this.asyncMqttClient.publish(`the-verse/${room}/light`, newState, this.mqttPublishOpts).catch(this.logger.error);
      return;
    }
  }

  async onOrOff(payload: string, room: string): Promise<string> {
    const roomCodes = await this.getRoomCodes(room);
    return roomCodes[payload];
  }

  async getRoomCodes(room: string) {
    const onCode = '1100';
    const offCode = '0011';
    const kitchenCode = '01011101110101000000';
    const vitrineCode = '01011101011101000000';
    const nightstandCode = '01011101010111000000';

    return {
      'kitchen-pc': { on: kitchenCode + onCode, off: kitchenCode + offCode },
      'vitrine': { on: vitrineCode + onCode, off: vitrineCode + offCode },
      'nightstand': { on: nightstandCode + onCode, off: nightstandCode + offCode },
      'default': { error: 'No room match' }
    }[room] || ['default'];
  }

  async lightSwitch(room: string, payload: string): Promise<void> {
    const topic = 'the-verse/433/lights'
    const modulePayload = await this.onOrOff(payload, room);
    this.logger.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(modulePayload) });
    this.asyncMqttClient.publish(topic, modulePayload, this.mqttPublishOpts).catch(this.logger.error);
  }
}