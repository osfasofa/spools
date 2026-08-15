// T-100 spike relay: the broadcast half of spools-relay (copied minimally)
// plus the pocket sketch under test — per-tag ring, tokened namespaces,
// envelope JSON responses — and per-room inbound frame instrumentation for
// the S6 noise measurement. Throwaway; T-101 is the real implementation.
import http from 'node:http'
import { WebSocketServer } from 'ws'

const wsReadyStateOpen = 1

const MAGIC = [0xe2, 0xe3]
const VERSION = 1
const HEADER_LEN = 2 + 1 + 4 // magic + version + tag

export const startPocketRelay = ({ port, K = 4, partitioned = true, maxBytes = 8 * 1024 * 1024, ttlDays = 60 }) =>
  new Promise((resolve) => {
    /** room name → Set of connections */
    const rooms = new Map()
    /** room name → [{bytes, at}] inbound frame log (instrumentation) */
    const frameLog = new Map()
    /** `${room}/${token}` → { touchedAt, deposits: Map(tagHex → {at, blob}) | ring: [{at, blob}] } */
    const pockets = new Map()

    const onBroadcastConnection = (conn, roomName) => {
      const members = rooms.get(roomName) ?? rooms.set(roomName, new Set()).get(roomName)
      members.add(conn)
      conn.on('message', (data, isBinary) => {
        const log = frameLog.get(roomName) ?? frameLog.set(roomName, []).get(roomName)
        log.push({ bytes: data.byteLength ?? data.length, at: Date.now() })
        for (const peer of members) {
          if (peer !== conn && peer.readyState === wsReadyStateOpen) peer.send(data, { binary: isBinary })
        }
      })
      conn.on('close', () => {
        members.delete(conn)
        if (members.size === 0) rooms.delete(roomName)
      })
    }

    const json = (res, status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify(body))
    }

    const countDeposits = () => {
      let n = 0
      for (const p of pockets.values()) n += partitioned ? p.deposits.size : p.ring.length
      return n
    }

    const server = http.createServer((req, res) => {
      const segments = new URL(req.url, 'http://relay').pathname.split('/').filter(Boolean)
      if (segments[0] === 'pocket' && segments.length === 3) {
        const nsKey = `${segments[1]}/${segments[2]}`
        if (req.method === 'PUT') {
          const chunks = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => {
            const blob = Buffer.concat(chunks)
            if (blob.length > maxBytes) return json(res, 413, { format: 'spool-pocket', version: VERSION, error: 'too big' })
            if (blob.length < HEADER_LEN || blob[0] !== MAGIC[0] || blob[1] !== MAGIC[1] || blob[2] !== VERSION) {
              return json(res, 400, { format: 'spool-pocket', version: VERSION, error: 'bad envelope' })
            }
            const ns = pockets.get(nsKey) ?? pockets.set(nsKey, { touchedAt: Date.now(), deposits: new Map(), ring: [] }).get(nsKey)
            ns.touchedAt = Date.now()
            if (partitioned) {
              // the design under test: newest per tag, at most K tags, evict stalest tag
              const tag = blob.subarray(3, 7).toString('hex')
              ns.deposits.set(tag, { at: Date.now(), blob })
              if (ns.deposits.size > K) {
                let stalest = null
                for (const [t, d] of ns.deposits) if (!stalest || d.at < stalest.at) stalest = { t, at: d.at }
                ns.deposits.delete(stalest.t)
              }
            } else {
              // the reviewer's control: unpartitioned last-K ring
              ns.ring.push({ at: Date.now(), blob })
              if (ns.ring.length > K) ns.ring.shift()
            }
            json(res, 200, { format: 'spool-pocket', version: VERSION, stored: true })
          })
          return
        }
        if (req.method === 'GET') {
          const ns = pockets.get(nsKey)
          if (ns) ns.touchedAt = Date.now() // touch-on-read
          const list = ns ? (partitioned ? [...ns.deposits.values()] : [...ns.ring]) : []
          list.sort((a, b) => b.at - a.at)
          return json(res, 200, {
            format: 'spool-pocket',
            version: VERSION,
            ttlDays,
            deposits: list.map((d) => ({ at: d.at, blob: d.blob.toString('base64') })),
          })
        }
      }
      // everything else: health JSON, old-relay-shaped, plus the pocket block
      json(res, 200, {
        status: 'ok',
        service: 'spike-pocket-relay',
        relay: { rooms: rooms.size, connections: [...rooms.values()].reduce((n, s) => n + s.size, 0) },
        pocket: { rooms: pockets.size, deposits: countDeposits(), ttlDays, maxBytes },
      })
    })

    const wss = new WebSocketServer({ noServer: true })
    server.on('upgrade', (req, socket, head) => {
      const pathname = new URL(req.url, 'http://relay').pathname
      if (pathname.startsWith('/yjs/') && pathname.length > 5) {
        wss.handleUpgrade(req, socket, head, (ws) => onBroadcastConnection(ws, pathname.slice(5)))
      } else {
        socket.destroy()
      }
    })

    server.listen(port, () =>
      resolve({
        frameLog: (room) => frameLog.get(room) ?? [],
        resetFrameLog: (room) => frameLog.set(room, []),
        close: () => new Promise((r) => { for (const s of rooms.values()) for (const c of s) c.terminate(); server.close(r) }),
      })
    )
  })
