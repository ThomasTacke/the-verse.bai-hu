import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, RawServerBase } from 'fastify'
import { Controller, ControllerType, GET, Inject, FastifyInstanceToken } from 'fastify-decorators';
import S from 'fluent-schema';

const tag = 'Index';

const indexSchema = S.object()
  .prop('code', S.number())
  .prop('msg', S.string())
  .prop('root', S.boolean());

const getIndexSchema: FastifySchema = {
  tags: [tag],
  description: 'Get Index Route',
  response: { 200: indexSchema }
}

@Controller({
  route: '',
  type: ControllerType.SINGLETON
}) export default class IndexController {
  @Inject(FastifyInstanceToken) private instance!: FastifyInstance;

  @GET({ url: '/', options: { schema: getIndexSchema } }) async getIndex(request: FastifyRequest<any>, reply: FastifyReply<RawServerBase>) {
    return reply.code(200).send({
      code: 200,
      msg: 'Bai Hu Service up and running!',
      root: true
    });
  }
}
