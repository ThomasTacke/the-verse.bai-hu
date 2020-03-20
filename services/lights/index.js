'use strict'

module.exports = async function (fastify, opts) {
  const controller = require('../../controller/lightsController')(fastify)
  fastify.get('/light', require('./getSchema'), controller.getLights)
  fastify.put('/light/:room', require('./putSchema'), controller.setLight)
}
