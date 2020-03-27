import * as tap from 'tap';
import createServer from '../../src/server';
import { Server, IncomingMessage, ServerResponse } from 'http';

declare module "fastify" {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse
    > {
    mqtt(light: string, newState: string): void
  }
}

tap.test('default root route', async (t) => {
  const server = await createServer().ready();

  const res = await server.inject({
    method: 'GET',
    url: '/'
  });

  t.strictEqual(res.statusCode , 200);
  t.deepEqual(res.payload, 'Heello World!');
  await server.close();
  t.done();
})
