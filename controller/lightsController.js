'use strict'

module.exports = (fastify) => {
  const module = {}

  module.getLights = async function (req, reply) {
    reply.code(501)
    reply.send({
      code: 501,
      msg: 'This function is not implemented.',
      lights: {}
    })
  }

  module.setLight = async function (req, reply) {
    await fastify.mqtt(req.params.room, req.body.value)
    reply.code(201)
    reply.send()
  }

  return module
}
