'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const swaggerOptions = require('./config/swagger')
const options = require(`./config/${process.env.NODE_ENV || 'default'}.json`)

module.exports = (fastify, opts, next)  => {
    // Place here your custom code!
    fastify
        .register(require('fastify-swagger'), swaggerOptions)
        .ready(err => {
            if (err) fastify.log.error(err)
            fastify.swagger()
        })

    // Do not touch the following lines

    // This loads all plugins defined in plugins
    // those should be support plugins that are reused
    // through your application
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'plugins'),
        options: Object.assign({}, opts)
    })

    // This loads all plugins defined in services
    // define your routes in one of these
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'services'),
        options: Object.assign({}, opts)
    })

    // Make sure to call next when done
    next()
}
