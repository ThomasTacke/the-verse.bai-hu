'use strict'

const serviceConfig = {
    tag: 'root'
}

module.exports = async (fastify, opts) => {
    fastify.get('/', {
        schema: {
            description: 'Get the root page',
            tags: [serviceConfig.tag],
            summary: 'Get the root page',
            response: {
                200: {
                    description: 'Successful response',
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        msg: { type: 'string' },
                        reqBody: {
                            type: 'object',
                            properties: {
                                root: { type: 'boolean' }
                            }
                        }
                    },
                    example: {
                        code: 200,
                        msg: 'This is a dummy text.',
                        reqBody: {
                            root: true
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        return {
            code: 200,
            msg: 'This is a dummy text.',
            reqBody: {
                root: true
            }
        }
    })
}
