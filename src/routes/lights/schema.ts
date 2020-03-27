import { RouteSchema } from "fastify";

export const LightGetSchema: RouteSchema = {
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        code: { type: 'number' },
        msg: { type: 'string' },
        lights: {
          type: 'object',
          properties: {
            kitchen: { type: 'string' },
            livingRoom: { type: 'string' }
          }
        }
      },
      example: {
        code: 200,
        msg: 'Successfully received light information.',
        lights: {
          kitchen: 'on',
          livingRoom: 'off'
        }
      }
    }
  }
}

export const LightPutSchema: RouteSchema = {
  params: {
    type: 'object',
    properties: {
      room: {
        type: 'string',
        description: 'room name or all'
      }
    }
  },
  body: {
    type: 'object',
    properties: {
      value: { type: 'string' }
    }
  },
  response: {
    201: {
      description: 'Successful response',
      type: 'object',
      properties: {}
    }
  }
}
