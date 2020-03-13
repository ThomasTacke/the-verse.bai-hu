'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = (fastify, opts, next) => {
  // Place here your custom code!
  fastify.log.info(opts)
  fastify
    .register(require('fastify-swagger'), {
      routePrefix: '/documentation',
      exposeRoute: true,
      swagger: {
        info: {
          title: '433 Middle Man REST API',
          description: 'testing the fastify swagger api',
          version: '1.0.0'
        },
        externalDocs: {
          url: 'https://swagger.io',
          description: 'Find more info here'
        },
        // host: `${opts.address}:${opts.port}`,
        host: '127.0.0.1:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'root', description: 'Root Page.' },
          { name: 'light', description: 'Light related end points.' }
        ]
        // ,
        // securityDefinitions: {
        //     apiKey: {
        //         type: 'apiKey',
        //         name: 'apiKey',
        //         in: 'header'
        //     }
        // }
      }
    })
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
