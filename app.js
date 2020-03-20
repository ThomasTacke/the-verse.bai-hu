'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const swagger = require('fastify-swagger')
const swaggerConfig = require('./swagger')

module.exports = (fastify, opts, next) => {
  // Place here your custom code!
  fastify.log.info(opts)
  fastify
    .register(swagger, swaggerConfig)
    .ready(err => {
      err ? fastify.log.error(err) : fastify.swagger()
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
