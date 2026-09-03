// M15 hardening (the ship review's relay rail), tested against real spawned
// instances like pocket.test.js: T-161 the proxy-aware client address.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { relayPool, deposit, put } from './helpers.js'

const pool = relayPool(15300)
const startRelay = pool.start
after(pool.stop)

// ---------- T-161: which address does a per-IP limit key on? ----------

test('TRUST_PROXY: the rightmost X-Forwarded-For hop is the client, each with its own deposit budget', async () => {
  const { base } = await startRelay({ TRUST_PROXY: '1', POCKET_PUTS_PER_MIN: '2' })
  const putAs = (xff, i) => put(base, 'r/t', deposit([1, 1, 1, i]), { 'x-forwarded-for': xff })
  assert.equal((await putAs('203.0.113.1', 1)).status, 200)
  assert.equal((await putAs('203.0.113.1', 2)).status, 200)
  assert.equal((await putAs('203.0.113.1', 3)).status, 429, 'first address has spent its 2/min')
  assert.equal((await putAs('203.0.113.2', 4)).status, 200, 'second address has an independent budget')
  // the proxy appends the real client LAST; a client-supplied leftmost value buys nothing
  assert.equal((await putAs('198.51.100.9, 203.0.113.1', 5)).status, 429, 'spoofed leftmost hop, same bucket')
  assert.equal((await putAs('203.0.113.1, 203.0.113.3', 6)).status, 200, 'a chain whose rightmost hop is new is a new client')
})

test('without TRUST_PROXY the header is ignored: everyone is the socket address', async () => {
  const { base } = await startRelay({ POCKET_PUTS_PER_MIN: '2' })
  const putAs = (xff, i) => put(base, 'r/t', deposit([1, 1, 1, i]), { 'x-forwarded-for': xff })
  assert.equal((await putAs('203.0.113.1', 1)).status, 200)
  assert.equal((await putAs('203.0.113.2', 2)).status, 200)
  assert.equal((await putAs('203.0.113.3', 3)).status, 429, 'three "addresses", one bucket: the header bought nothing')
})
