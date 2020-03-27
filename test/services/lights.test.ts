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

tap.test('default light route', async (t) => {
  const server = await createServer().ready();
  const res = await server.inject({
    method: 'GET',
    url: '/light'
  });

  t.strictEqual(res.statusCode, 501);
  t.deepEqual(JSON.parse(res.payload), { code: 501, msg: 'This function is not implemented.', lights: {} });
  await server.close();
  t.done();
});

tap.test('put light route', async t => {
  const server = await createServer().ready();
  const res = await server.inject({
    method: 'PUT',
    url: '/light/all',
    payload: { value: 'on' }
  });

  t.strictEqual(res.statusCode, 201);
  await server.close();
  t.done();
});
