// T-010: two engines, fosho's deployed production relay, real network.
import { WebSocket as NodeWS } from 'ws'
import { SpoolEngine } from '../../packages/spools/dist/index.js'

const RELAY = 'wss://foshoio-production.up.railway.app/yjs'
const code = `smoke-t010-node-${process.argv[2] ?? 'x'}`

const mk = () =>
  new SpoolEngine({ code, relay: RELAY, persist: false, webrtc: false, WebSocketPolyfill: NodeWS })

const waitUntil = async (fn, ms = 15000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (fn()) return true
    await new Promise((r) => setTimeout(r, 50))
  }
  return fn()
}

const a = mk()
const b = mk()
console.log('connecting to', RELAY, 'room', code)
console.log('connected:', await waitUntil(() => a.status === 'connected' && b.status === 'connected'))
a.doc.getMap('m').set('hello', 'from-a')
console.log('a→b converged:', await waitUntil(() => b.doc.getMap('m').get('hello') === 'from-a'))
b.doc.getMap('m').set('reply', 'from-b')
console.log('b→a converged:', await waitUntil(() => a.doc.getMap('m').get('reply') === 'from-b'))
await a.leave()
await b.leave()
console.log('left cleanly')
process.exit(0)
