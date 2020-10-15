import { FastifyInstance } from 'fastify';
import { configureControllerTest } from 'fastify-decorators/testing';
import LightController from '../../src/controllers/lights.controller';
import { MqttService } from '../../src/services/mqtt';

describe('Controller: LightsController', () => {
  let instance: FastifyInstance;
  MqttService.getInstance();

  beforeEach(async () => {
    instance = await configureControllerTest({
      controller: LightController
    });
  });

  it(`PUT Light route`, async () => {
    await sleep(1000);
    const result = await instance.inject({
      method: 'PUT',
      url: '/light/all',
      payload: { value: 'on' }
    });

    expect(result.statusCode).toEqual(201);
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
