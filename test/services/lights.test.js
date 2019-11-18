'use strict'

require('dotenv').config()
const { test } = require('tap')
const { build } = require('../helper')

test('default light route', async (t) => {
  t.plan(2)
  const app = build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/light'
  })

  t.strictEqual(res.statusCode, 501)
  t.deepEqual(JSON.parse(res.payload), { code: 501, msg: 'This function is not implemented.', lights: {} })
  t.done()
})

test('put light route', async t => {
  t.plan(1)
  const app = build(t)

  const res = await app.inject({
    method: 'PUT',
    url: '/light/all',
    payload: { value: 'on' }
  })

  t.strictEqual(res.statusCode, 201)
  t.done()
})
