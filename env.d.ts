declare namespace NodeJS {
  export interface ProcessEnv {
    MQTT_BROKER: string;
    NODE_ENV?: string;
    ADDRESS?: string;
    PORT?: string;
  }
}