'use strict'

require('dotenv').config()
const { test } = require('tap')
const Fastify = require('fastify')
const mqttPlugin = require('../../plugins/mqtt')

test('mqtt works standalone', async (t) => {
  t.plan(10)
  const fastify = Fastify()
  fastify.register(mqttPlugin)

  await fastify.ready()
  t.equal(await fastify.mqtt('kitchen-pc', 'off'), 'Done')
  t.equal(await fastify.mqtt('kitchen-pc', 'on'), 'Done')
  t.equal(await fastify.mqtt('vitrine', 'off'), 'Done')
  t.equal(await fastify.mqtt('vitrine', 'on'), 'Done')
  t.equal(await fastify.mqtt('nightstand', 'off'), 'Done')
  t.equal(await fastify.mqtt('nightstand', 'on'), 'Done')
  t.equal(await fastify.mqtt('all', 'off'), 'Done')
  t.equal(await fastify.mqtt('all', 'on'), 'Done')
  t.equal(await fastify.mqtt('', 'off'), 'Done')
  t.equal(await fastify.mqtt('', 'on'), 'Done')
  t.done()

  fastify.close()
})
