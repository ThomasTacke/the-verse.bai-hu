import * as fp from 'fastify-plugin';
import { RouteOptions, FastifyInstance } from 'fastify';
import { IndexGetSchema } from './schema';

export default fp(async (fastify: FastifyInstance) => {
  fastify.log.info('Test');
  const IndexGetRoute: RouteOptions = {
    method: 'GET',
    url: '/',
    schema: IndexGetSchema,
    handler: async (reqeust, reply) => {
      return reply.code(200).send('Heello World!');
    }
  };

  fastify.route(IndexGetRoute);
});
