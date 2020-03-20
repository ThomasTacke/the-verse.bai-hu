'use strict'

// Read the .env file.
require('dotenv').config()

// Require the framework
const Fastify = require('fastify')

// Instantiate Fastify with some config
const fastify = Fastify({
  logger: true,
  pluginTimeout: 10000
})

const port = process.env.PORT || 3000
const address = process.env.ADDRESS || '127.0.0.1'

// Register your application as a normal plugin.
fastify.register(require('./app.js'), {
  port: port,
  address: address
})

// Start listening.
async function start() {
  try {
    await fastify.listen(port, address)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()
