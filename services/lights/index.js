'use strict'

const serviceConfig = {
    tag: 'light'
}

module.exports = async (fastify, opts) => {
    const controller = require('../../controller/lightsController')(fastify)

    fastify.get('/light', {
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
    }, controller.getLights)

    fastify.put('/light/:room', {
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
                    value: { type: 'string' },
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
    }, controller.setLight)
}
