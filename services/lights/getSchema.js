const serviceConfig = require('./serviceConfig')

module.exports = {
  schema: {
    description: 'Get light information',
    tags: [serviceConfig.tag],
    summary: 'Get light information',
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
}
