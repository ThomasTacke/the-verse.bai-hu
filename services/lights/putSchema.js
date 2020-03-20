const serviceConfig = require('./serviceConfig')

module.exports = {
  schema: {
    description: 'Update a light in a room',
    tags: [serviceConfig.tag],
    summary: 'Update a light in a room',
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
}