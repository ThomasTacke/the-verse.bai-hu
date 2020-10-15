import { FastifyInstance } from 'fastify';
import { configureControllerTest } from 'fastify-decorators/testing';
import IndexController from '../../src/controllers/index.controller';

describe('Controller: IndexController', () => {
  let instance: FastifyInstance;

  beforeEach(async () => {
    instance = await configureControllerTest({
      controller: IndexController
    });
  });

  it(`GET Index route`, async () => {
    const result = await instance.inject({
      method: 'GET',
      url: '/',
    });

    expect(result.statusCode).toEqual(200);
  });
});