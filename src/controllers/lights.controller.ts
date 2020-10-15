import { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, RawServerBase } from 'fastify'
import { Controller, ControllerType, PUT, Inject, FastifyInstanceToken } from 'fastify-decorators';
import S from 'fluent-schema';
import { MqttService } from '../services/mqtt';

const tag = 'Light';

export const lightSchema = S.object()
  .id('#light')
  .prop('kitchen', S.string())
  .prop('livingRoom', S.string());

export const lightResponseSchema = S.object()
  .id('#lightRes')
  .prop('code', S.number())
  .prop('msg', S.string());
// .prop('lights', S.ref('#light'));

const roomSchema = S.object()
  .prop('room', S.string())

const lightsBodySchema = S.object()
  .prop('value', S.string())

const getLightsSchema: FastifySchema = {
  tags: [tag],
  description: 'Get Lights Status',
  response: { 200: lightResponseSchema }
}

const putLightsSchema: FastifySchema = {
  tags: [tag],
  description: 'Update Lights Status',
  params: roomSchema,
  body: lightsBodySchema,
  response: { 201: lightResponseSchema }
}

@Controller({
  route: 'light',
  type: ControllerType.REQUEST
}) export default class LightController {
  @Inject(FastifyInstanceToken) private instance!: FastifyInstance;

  @PUT({ url: '/:room', options: { schema: putLightsSchema } }) async updateLight(request: FastifyRequest<any>, reply: FastifyReply<RawServerBase>) {
    await MqttService.getInstance().publish(request.params.room, request.body.value);
    return reply.code(201).send({
      code: 201,
      msg: 'Done',
      lights: {
        kitchen: "yep",
        livingRoom: "yep"
      }
    });
  }
}