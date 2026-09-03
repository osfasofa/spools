#!/usr/bin/env node
// spools-relay: WebRTC signaling + per-room opaque byte broadcast, one small
// plain-JS server. So dumb that running one is trivial and trusting one is
// unnecessary: the broadcast half forwards frames it never parses, holds no
// document, and imports neither yjs nor y-websocket — that absence is the
// proof (DESIGN_DOC §3, T-003 spike verdict: "dumb relay works as-is").
//
// Endpoints (the one-URL convention — clients derive both from a single
// relay URL ending in /yjs):
//   ws(s)://host/yjs/{room}   opaque byte broadcast, room = path segment
//   ws(s)://host/             y-webrtc signaling (topic pub/sub)
//   PUT/GET /pocket/{room}/{token}
//                             the pocket (M10): sealed full-state deposits,
//                             held unread so a spool survives the gap between
//                             one friend's evening and another's midnight
//   GET  any other path       health JSON — counts only, never content
//
// Signaling half lifted from fosho server/server.js:50–173. Broadcast half
// per T-003: fan out to the room, sender excluded, bytes untouched. Pocket
// per T-100/T-101: deposits live under key-derived namespaces the relay
// can't guess into, newest-per-tag so nobody's worldview gets flushed, and
// the relay only ever reads a deposit's 7 plaintext header bytes.

import http from 'node:http'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { WebSocketServer } from 'ws'
import * as map from 'lib0/map'

// npx spools-relay [--port N] [--host H]; env PORT/HOST also respected
const argv = process.argv.slice(2)
const argValue = (flag) => {
  const i = argv.indexOf(flag)
  return i !== -1 ? argv[i + 1] : undefined
}
const port = Number(argValue('--port') ?? process.env.PORT ?? 4444)
const host = argValue('--host') ?? process.env.HOST ?? '0.0.0.0'

const PING_TIMEOUT_MS = 30_000
// Crude abuse guards, not hardening (T-040): a Yjs state frame for a big doc
// is single-digit MB at most; a room is an intimate-scale rendezvous.
const MAX_FRAME_BYTES = 8 * 1024 * 1024
const MAX_CONNS_PER_ROOM = 64
// Backpressure and a frame budget on the broadcast path (T-170). A peer that
// stops reading would otherwise buffer in this process without bound, and a
// code-holder without the key could push 8 MiB junk frames and have each one
// fanned out ×63. Both are "the relay's own business" (SPEC §3): over either
// line the connection is closed with 1008 (policy) and a reason — never 1013,
// which the SDK reads as "room full". 0 disables a guard. The defaults are
// sized to the relay's own ceilings, not to typical traffic: a cold joiner
// has one state frame per peer queued for it at once (64 MiB = eight peers
// at the 8 MiB frame cap), a member answers up to 63 SyncStep1s in one
// second after a relay restart (300/s clears it), and 128 MiB/min is sixteen
// full-size state frames. Floods are hundreds of frames a second and tens of
// MiB a second; these lines only ever catch those. (Raised at review from
// 16 MiB / 60 / 32 MiB — the first values could close a cold joiner in a
// big room as a "slow consumer" on arrival.)
const RELAY_MAX_BUFFERED_BYTES = Number(process.env.RELAY_MAX_BUFFERED_BYTES ?? 64 * 1024 * 1024)
const RELAY_MAX_FRAMES_PER_SEC = Number(process.env.RELAY_MAX_FRAMES_PER_SEC ?? 300)
const RELAY_MAX_BYTES_PER_MIN = Number(process.env.RELAY_MAX_BYTES_PER_MIN ?? 128 * 1024 * 1024)
// Per-address cap per room (T-169). Codes are public by design (every URL,
// every screenshot), so without this one address can fill a room up to the
// 64 guard and lock everyone else out. Default 0 = off: behind a proxy
// without TRUST_PROXY every client IS the proxy's address, and a cap that
// was on by default would fall on all of them at once. Enable it together
// with TRUST_PROXY. Over the cap → 1013 (the SDK's "full") with its own reason.
const RELAY_CONNS_PER_IP_PER_ROOM = Number(process.env.RELAY_CONNS_PER_IP_PER_ROOM ?? 0)

// Pocket knobs (T-101). Memory by default — npx-and-done stays npx-and-done,
// and a restart degrades to exactly v1 semantics. POCKET_DIR makes deposits
// files on disk: no database, just <room>/<token>/<tag>.
const POCKET_TTL_DAYS = Number(process.env.POCKET_TTL_DAYS ?? 60)
const POCKET_MAX_BYTES = Number(process.env.POCKET_MAX_BYTES ?? MAX_FRAME_BYTES)
// K raised 4 → 8 for M11's group rooms (T-124, owner-approved): T-110 proved
// 5+ concurrent divergent seats can silently outrun a 4-slot ring, and only
// the evicted writer's return heals it. 8 covers the 5–8-seat target plus
// reload churn (a reload takes a fresh tag). The bound moves, it doesn't
// vanish — 9+ divergent writers can still outrun it; the README says so.
const POCKET_K = Number(process.env.POCKET_K ?? 8) // distinct tags kept per namespace
const POCKET_MAX_TOTAL_BYTES = Number(process.env.POCKET_MAX_TOTAL_BYTES ?? 1024 * 1024 * 1024)
// 12 → 24 (T-124): clients pace themselves to one deposit/min each, so this
// is ~24 sustained same-NAT devices — a household with two active rooms and
// a flush burst never queues a deposit
const POCKET_PUTS_PER_MIN = Number(process.env.POCKET_PUTS_PER_MIN ?? 24) // per IP
const POCKET_SWEEP_MS = Number(process.env.POCKET_SWEEP_MS ?? 3_600_000)
const POCKET_DIR = process.env.POCKET_DIR || null
// Admission levers for the pocket (T-168), both inert by default. Namespaces
// are free to create — any room and any token that fit the charset — so at
// the stock knobs one address could fill the relay-wide budget in minutes.
// The first defense is eviction ORDER (never-read namespaces go first, see
// ensureBudget); these two bound creation and the size of what nobody has
// collected yet. NEW_NAMESPACES_PER_HOUR is per client address and needs
// TRUST_PROXY behind a proxy (T-161). FIRST_MAX_BYTES caps deposits into a
// namespace that has never been read; it defaults to POCKET_MAX_BYTES (no
// change) until the owner signs off a canonical value.
const POCKET_NEW_NAMESPACES_PER_HOUR = Number(process.env.POCKET_NEW_NAMESPACES_PER_HOUR ?? 0) // 0 = off
const POCKET_FIRST_MAX_BYTES = Number(process.env.POCKET_FIRST_MAX_BYTES ?? POCKET_MAX_BYTES)

// Who is the client? (T-161) Behind an edge proxy (Railway, Fly) the socket's
// remoteAddress is the proxy, so every per-IP limit collapses into one bucket
// shared by everyone. With TRUST_PROXY set, the client is the RIGHTMOST
// X-Forwarded-For hop — the one the proxy itself appended; anything left of
// it is client-supplied and may lie. Off by default: a relay exposed directly
// must never believe a header the client wrote.
const envFlag = (name) => {
  const v = (process.env[name] ?? '').trim().toLowerCase()
  return v !== '' && !['0', 'false', 'no', 'off'].includes(v)
}
const TRUST_PROXY = envFlag('TRUST_PROXY')

/** the address every per-IP limit keys on — one rule, shared by the pocket and the broadcast half */
const clientIp = (request) => {
  if (TRUST_PROXY) {
    const hops = String(request.headers['x-forwarded-for'] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (hops.length > 0) return hops[hops.length - 1]
  }
  return request.socket.remoteAddress ?? 'unknown'
}

// Sliding-window hit logs keyed by client address (key → [timestamps]). The
// touched key is pruned on every use and the whole map once per window, so
// the log stays bounded by live traffic instead of waiting for the hourly
// sweep (a stranger spraying addresses would otherwise pile up until then).
const makeHitLog = (windowMs) => ({ windowMs, hits: new Map(), prunedAt: 0 })
const pruneHitLog = (log, now = Date.now()) => {
  log.prunedAt = now
  for (const [key, times] of log.hits) {
    const recent = times.filter((t) => now - t < log.windowMs)
    if (recent.length === 0) log.hits.delete(key)
    else log.hits.set(key, recent)
  }
}
/** hits for `key` inside the window (pruning as it goes) */
const recentHits = (log, key, now = Date.now()) => {
  if (now - log.prunedAt >= log.windowMs) pruneHitLog(log, now)
  const recent = (log.hits.get(key) ?? []).filter((t) => now - t < log.windowMs)
  if (recent.length === 0) log.hits.delete(key)
  else log.hits.set(key, recent)
  return recent.length
}
const recordHit = (log, key, now = Date.now()) => {
  map.setIfUndefined(log.hits, key, () => []).push(now)
}

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1

/** ping/pong liveness, shared by both halves; returns the interval so close handlers can clear it */
const keepAlive = (conn) => {
  let pongReceived = true
  const interval = setInterval(() => {
    if (!pongReceived) {
      conn.terminate()
      clearInterval(interval)
      return
    }
    pongReceived = false
    try {
      conn.ping()
    } catch {
      conn.terminate()
    }
  }, PING_TIMEOUT_MS)
  conn.on('pong', () => {
    pongReceived = true
  })
  return interval
}

// ========== BROADCAST HALF (opaque byte relay, /yjs/{room}) ==========

/** room name → Set of connections. Created on first join, GC'd when empty. */
const rooms = new Map()
/** connection → client address, only kept while a per-address cap is on (T-169) */
const memberAddress = new WeakMap()

const onBroadcastConnection = (conn, roomName, request) => {
  const members = map.setIfUndefined(rooms, roomName, () => new Set())
  if (members.size >= MAX_CONNS_PER_ROOM) {
    conn.close(1013, 'room full')
    return
  }
  if (RELAY_CONNS_PER_IP_PER_ROOM > 0) {
    const address = clientIp(request)
    let fromHere = 0
    for (const peer of members) if (memberAddress.get(peer) === address) fromHere++
    if (fromHere >= RELAY_CONNS_PER_IP_PER_ROOM) {
      conn.close(1013, 'too many connections from this address')
      return
    }
    memberAddress.set(conn, address)
  }
  members.add(conn)
  const pingInterval = keepAlive(conn)
  // per-connection frame budget (T-170): fixed one-second / one-minute windows
  let frameWindowAt = 0
  let framesInWindow = 0
  let byteWindowAt = 0
  let bytesInWindow = 0

  conn.on('message', (data, isBinary) => {
    if (conn.readyState !== wsReadyStateOpen) return // closed by us — nothing more gets forwarded
    const now = Date.now()
    if (now - frameWindowAt >= 1_000) {
      frameWindowAt = now
      framesInWindow = 0
    }
    if (now - byteWindowAt >= 60_000) {
      byteWindowAt = now
      bytesInWindow = 0
    }
    framesInWindow += 1
    bytesInWindow += data.length
    if (
      (RELAY_MAX_FRAMES_PER_SEC > 0 && framesInWindow > RELAY_MAX_FRAMES_PER_SEC) ||
      (RELAY_MAX_BYTES_PER_MIN > 0 && bytesInWindow > RELAY_MAX_BYTES_PER_MIN)
    ) {
      conn.close(1008, 'frame budget exceeded')
      return
    }
    // the whole job: hand the bytes to everyone else in the room, unread
    for (const peer of members) {
      if (peer === conn || peer.readyState !== wsReadyStateOpen) continue
      if (RELAY_MAX_BUFFERED_BYTES > 0 && peer.bufferedAmount > RELAY_MAX_BUFFERED_BYTES) {
        // it stopped reading: stop feeding it. close() leaves OPEN at once,
        // so from here on the loop skips it and what's queued is the bound.
        peer.close(1008, 'slow consumer')
        continue
      }
      peer.send(data, { binary: isBinary })
    }
  })

  conn.on('close', () => {
    clearInterval(pingInterval)
    members.delete(conn)
    if (members.size === 0) rooms.delete(roomName)
  })
}

// ========== SIGNALING HALF (y-webrtc peer discovery, /) ==========
// fosho server.js:50–173, kept boring. Deviations: ping interval cleared on
// close (fosho leaked it), and no topic names in logs — the relay already
// can't see content; it shouldn't chat about rendezvous names either.

/** topic name → Set of subscribed connections */
const topics = new Map()

const send = (conn, message) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    conn.close()
  }
  try {
    conn.send(JSON.stringify(message))
  } catch {
    conn.close()
  }
}

const onSignalingConnection = (conn) => {
  const subscribedTopics = new Set()
  let closed = false
  const pingInterval = keepAlive(conn)

  conn.on('close', () => {
    clearInterval(pingInterval)
    for (const topicName of subscribedTopics) {
      const subs = topics.get(topicName)
      if (subs) {
        subs.delete(conn)
        if (subs.size === 0) topics.delete(topicName)
      }
    }
    subscribedTopics.clear()
    closed = true
  })

  conn.on('message', (message) => {
    try {
      message = JSON.parse(message.toString())
    } catch {
      return // not signaling JSON — ignore
    }
    if (!message || !message.type || closed) return
    switch (message.type) {
      case 'subscribe':
        for (const topicName of message.topics || []) {
          if (typeof topicName === 'string') {
            const topic = map.setIfUndefined(topics, topicName, () => new Set())
            topic.add(conn)
            subscribedTopics.add(topicName)
          }
        }
        break
      case 'unsubscribe':
        for (const topicName of message.topics || []) {
          const subs = topics.get(topicName)
          if (subs) subs.delete(conn)
        }
        break
      case 'publish':
        if (message.topic) {
          const receivers = topics.get(message.topic)
          if (receivers) {
            message.clients = receivers.size
            for (const receiver of receivers) send(receiver, message)
          }
        }
        break
      case 'ping':
        send(conn, { type: 'pong' })
    }
  })
}

// ========== POCKET HALF (sealed deposits, /pocket/{room}/{token}) ==========
// The relay's third job (M10, user-approved): hold the last few sealed
// full-state deposits per key-derived namespace, so the spool is there when
// a friend opens the link while the writer sleeps. The token is a one-way
// hash of the key derived by CLIENTS — this server never learns the key,
// can't verify the token, and can't read a deposit past its 7-byte plaintext
// header (magic ‖ version ‖ tag). Ciphertext or nothing, by construction:
// keyless spools derive no token and so have no pocket.

const POCKET_MAGIC_0 = 0xe2
const POCKET_MAGIC_1 = 0xe3
const POCKET_VERSION = 1
const POCKET_HEADER_LEN = 7 // magic(2) + version(1) + tag(4)
// namespace segments become file paths under POCKET_DIR — charset is the
// traversal guard. Codes and base64url tokens both fit comfortably.
const SEGMENT_RE = /^[A-Za-z0-9_-]{1,64}$/

/** `${room}/${token}` → { room, token, touchedAt, reads, tags: Map(tagHex → {at, bytes, blob|null}) } */
const namespaces = new Map()
let pocketTotalBytes = 0
/** client address → put timestamps within the last minute (T-161: keyed via clientIp) */
const putLog = makeHitLog(60_000)
/** client address → namespace creations within the last hour (T-168) */
const newNamespaceLog = makeHitLog(3_600_000)
/** disk mode: a namespace's read count lives in this sidecar beside its deposits — never inside one */
const READS_FILE = '.reads'

const nsDir = (ns) => path.join(POCKET_DIR, ns.room, ns.token)
const newNamespace = (room, token) => ({ room, token, touchedAt: 0, reads: 0, tags: new Map() })

/** disk mode: rebuild the index from files at boot; touch times restart as deposit times, or the last read where the sidecar is newer */
if (POCKET_DIR) {
  fs.mkdirSync(POCKET_DIR, { recursive: true })
  for (const room of fs.readdirSync(POCKET_DIR)) {
    const roomPath = path.join(POCKET_DIR, room)
    if (!fs.statSync(roomPath).isDirectory()) continue
    for (const token of fs.readdirSync(roomPath)) {
      const ns = newNamespace(room, token)
      for (const name of fs.readdirSync(path.join(roomPath, token))) {
        const file = path.join(roomPath, token, name)
        const st = fs.statSync(file)
        if (name === READS_FILE) {
          ns.reads = Number.parseInt(fs.readFileSync(file, 'utf8'), 10) || 0
          ns.touchedAt = Math.max(ns.touchedAt, st.mtimeMs)
          continue
        }
        if (name.startsWith('.')) continue // only tags are deposits
        ns.tags.set(name, { at: st.mtimeMs, bytes: st.size, blob: null })
        ns.touchedAt = Math.max(ns.touchedAt, st.mtimeMs)
        pocketTotalBytes += st.size
      }
      if (ns.tags.size > 0) namespaces.set(`${room}/${token}`, ns)
    }
  }
}

const evictNamespace = async (nsKey) => {
  const ns = namespaces.get(nsKey)
  if (!ns) return
  for (const t of ns.tags.values()) pocketTotalBytes -= t.bytes
  namespaces.delete(nsKey)
  if (POCKET_DIR) await fsp.rm(nsDir(ns), { recursive: true, force: true }).catch(() => {})
}

const evictTag = async (ns, tagHex) => {
  const t = ns.tags.get(tagHex)
  if (!t) return
  pocketTotalBytes -= t.bytes
  ns.tags.delete(tagHex)
  if (POCKET_DIR) await fsp.rm(path.join(nsDir(ns), tagHex), { force: true }).catch(() => {})
}

/** eviction order (T-168): a namespace nobody ever collected is worth the least, so never-read ones go first (oldest among them), then the stalest-touched */
const evictsBefore = (a, b) => {
  const aRead = a.reads > 0
  const bRead = b.reads > 0
  if (aRead !== bRead) return !aRead
  return a.touchedAt < b.touchedAt
}

/** make room under the relay-wide budget by dropping namespaces in eviction order (never the one being written) */
const ensureBudget = async (incomingBytes, protectedKey) => {
  while (pocketTotalBytes + incomingBytes > POCKET_MAX_TOTAL_BYTES) {
    let victim = null
    for (const [key, ns] of namespaces) {
      if (key !== protectedKey && (!victim || evictsBefore(ns, victim.ns))) victim = { key, ns }
    }
    if (!victim) return false
    await evictNamespace(victim.key)
  }
  return true
}

const pocketJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ format: 'spool-pocket', version: POCKET_VERSION, ...body }))
}

/** {room, token} when the path has the exact pocket shape, else null */
const parsePocketPath = (pathname) => {
  const segments = pathname.split('/').filter((s) => s.length > 0)
  if (segments.length !== 3 || segments[0] !== 'pocket') return null
  return { room: segments[1], token: segments[2] }
}

const handlePocketPut = (request, response, { room, token }) => {
  const ip = clientIp(request)
  const now = Date.now()
  if (recentHits(putLog, ip, now) >= POCKET_PUTS_PER_MIN) return pocketJson(response, 429, { error: 'rate limited' })
  recordHit(putLog, ip, now)
  const nsKey = `${room}/${token}`
  const existing = namespaces.get(nsKey)
  // T-168: creating namespaces is what a stranger does by the thousand; a
  // namespace nobody has collected yet gets the smaller cap (= the full cap
  // until signed off). Checked before the body so a refused PUT costs nothing.
  if (!existing && POCKET_NEW_NAMESPACES_PER_HOUR > 0 && recentHits(newNamespaceLog, ip, now) >= POCKET_NEW_NAMESPACES_PER_HOUR) {
    return pocketJson(response, 429, { error: 'too many new namespaces' })
  }
  const maxBytes = existing && existing.reads > 0 ? POCKET_MAX_BYTES : Math.min(POCKET_FIRST_MAX_BYTES, POCKET_MAX_BYTES)

  const chunks = []
  let size = 0
  let overflowed = false
  request.on('data', (chunk) => {
    size += chunk.length
    if (size > maxBytes) {
      overflowed = true
      pocketJson(response, 413, { error: 'deposit too big', maxBytes })
      request.destroy()
      return
    }
    chunks.push(chunk)
  })
  request.on('end', async () => {
    if (overflowed) return
    const blob = Buffer.concat(chunks)
    if (
      blob.length < POCKET_HEADER_LEN ||
      blob[0] !== POCKET_MAGIC_0 ||
      blob[1] !== POCKET_MAGIC_1 ||
      blob[2] !== POCKET_VERSION
    ) {
      return pocketJson(response, 400, { error: 'not a deposit envelope' })
    }
    const created = !namespaces.has(nsKey)
    const ns = map.setIfUndefined(namespaces, nsKey, () => newNamespace(room, token))
    ns.touchedAt = Date.now()
    const tagHex = blob.subarray(3, 7).toString('hex')
    const replacing = ns.tags.get(tagHex)?.bytes ?? 0
    if (!(await ensureBudget(blob.length - replacing, nsKey))) {
      if (ns.tags.size === 0) namespaces.delete(nsKey)
      return pocketJson(response, 507, { error: 'relay storage budget exhausted' })
    }
    // newest per tag: a writer only ever replaces their own slot (T-100 S3c)
    if (replacing) pocketTotalBytes -= replacing
    ns.tags.set(tagHex, { at: Date.now(), bytes: blob.length, blob: POCKET_DIR ? null : blob })
    pocketTotalBytes += blob.length
    if (ns.tags.size > POCKET_K) {
      let stalest = null
      for (const [t, d] of ns.tags) if (!stalest || d.at < stalest.at) stalest = { t, at: d.at }
      await evictTag(ns, stalest.t)
    }
    if (POCKET_DIR) {
      await fsp.mkdir(nsDir(ns), { recursive: true })
      await fsp.writeFile(path.join(nsDir(ns), tagHex), blob)
    }
    if (created) recordHit(newNamespaceLog, ip) // only a stored deposit counts as a creation
    pocketJson(response, 200, { stored: true })
  })
}

const handlePocketGet = async (request, response, { room, token }) => {
  const ns = namespaces.get(`${room}/${token}`)
  if (ns) {
    ns.touchedAt = Date.now() // touch-on-read: opened spools stay covered
    ns.reads += 1 // and collected namespaces are evicted last (T-168)
    if (POCKET_DIR) fsp.writeFile(path.join(nsDir(ns), READS_FILE), String(ns.reads)).catch(() => {})
  }
  const list = ns ? [...ns.tags.entries()].sort((a, b) => b[1].at - a[1].at) : []
  const deposits = []
  for (const [tagHex, t] of list) {
    const blob = t.blob ?? (await fsp.readFile(path.join(nsDir(ns), tagHex)).catch(() => null))
    if (blob) deposits.push({ at: Math.round(t.at), blob: blob.toString('base64') })
  }
  pocketJson(response, 200, { ttlDays: POCKET_TTL_DAYS, deposits })
}

/** TTL sweep + rate-log pruning; interval unref'd so it never holds the process open */
setInterval(() => {
  const expiry = Date.now() - POCKET_TTL_DAYS * 86_400_000
  for (const [key, ns] of namespaces) {
    if (ns.touchedAt < expiry) evictNamespace(key)
  }
  pruneHitLog(putLog)
  pruneHitLog(newNamespaceLog)
}, POCKET_SWEEP_MS).unref()

// ========== HTTP + UPGRADE ROUTING ==========

const broadcastWss = new WebSocketServer({ noServer: true, maxPayload: MAX_FRAME_BYTES })
const signalingWss = new WebSocketServer({ noServer: true, maxPayload: MAX_FRAME_BYTES })
signalingWss.on('connection', onSignalingConnection)

const countConns = (m) => {
  let n = 0
  for (const set of m.values()) n += set.size
  return n
}

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://relay').pathname
  const pocket = parsePocketPath(pathname)
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', pocket ? 'GET, PUT, OPTIONS' : 'GET, OPTIONS')
  if (pocket) response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }
  if (pocket) {
    if (!SEGMENT_RE.test(pocket.room) || !SEGMENT_RE.test(pocket.token)) {
      return pocketJson(response, 400, { error: 'bad namespace' })
    }
    if (request.method === 'PUT') return handlePocketPut(request, response, pocket)
    if (request.method === 'GET') {
      handlePocketGet(request, response, pocket).catch(() => pocketJson(response, 500, { error: 'pocket read failed' }))
      return
    }
    return pocketJson(response, 405, { error: 'GET and PUT only' })
  }
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(
    JSON.stringify({
      status: 'ok',
      service: 'spools-relay',
      relay: { rooms: rooms.size, connections: countConns(rooms) },
      signaling: { topics: topics.size, connections: countConns(topics) },
      // counts and advertised limits only — never namespace ids, never content
      pocket: {
        rooms: new Set([...namespaces.values()].map((ns) => ns.room)).size,
        deposits: [...namespaces.values()].reduce((n, ns) => n + ns.tags.size, 0),
        ttlDays: POCKET_TTL_DAYS,
        maxBytes: POCKET_MAX_BYTES,
      },
    })
  )
})

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://relay').pathname
  if (pathname.startsWith('/yjs/') && pathname.length > '/yjs/'.length) {
    const roomName = pathname.slice('/yjs/'.length)
    broadcastWss.handleUpgrade(request, socket, head, (ws) => onBroadcastConnection(ws, roomName, request))
  } else if (pathname === '/') {
    signalingWss.handleUpgrade(request, socket, head, (ws) => signalingWss.emit('connection', ws, request))
  } else {
    socket.destroy() // exactly two jobs; everything else is a wrong number
  }
})

server.listen(port, host, () => {
  console.log(`spools-relay listening on ${host}:${port}`)
  console.log(`  relay:     ws://localhost:${port}/yjs/{room}`)
  console.log(`  signaling: ws://localhost:${port}/`)
})
