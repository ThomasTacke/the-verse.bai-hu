import * as fp from 'fastify-plugin';
import { RouteOptions, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LightGetSchema, LightPutSchema } from './schema';
import { ServerResponse } from 'http';

export default fp(async (fastify: FastifyInstance) => {
  const LightGetRoute: RouteOptions = {
    method: 'GET',
    url: '/light',
    schema: LightGetSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
      return reply.code(501).send({
        code: 501,
        msg: 'This function is not implemented.',
        lights: {}
      });
    }
  }

  const LightPutRoute: RouteOptions = {
    method: 'PUT',
    url: '/light/:room',
    schema: LightPutSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
      await fastify.mqtt(request.params.room, request.body.value);
      return reply.code(201).send();
    }
  }

  fastify.route(LightGetRoute);
  fastify.route(LightPutRoute);
});
