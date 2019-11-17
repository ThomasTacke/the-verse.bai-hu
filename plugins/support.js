'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
    fastify.decorate('someSupport', () => {
        return 'hugs'
    })
})
