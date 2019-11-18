'use strict'

require('dotenv').config()
const { test } = require('tap')
const { build } = require('../helper')

test('default root route', async (t) => {
  t.plan(2)
  const app = build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/'
  })

  t.strictEqual(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.payload), { code: 200, msg: 'This is a dummy text.', root: true })
  t.done()
})
