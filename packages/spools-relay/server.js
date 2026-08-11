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
//   GET  any path             health JSON — counts only, never content
//
// Signaling half lifted from fosho server/server.js:50–173. Broadcast half
// per T-003: fan out to the room, sender excluded, bytes untouched.

import http from 'node:http'
import { WebSocketServer } from 'ws'
import * as map from 'lib0/map'

const port = Number(process.env.PORT ?? 4444)
const host = process.env.HOST ?? '0.0.0.0'

const PING_TIMEOUT_MS = 30_000
// Crude abuse guards, not hardening (T-040): a Yjs state frame for a big doc
// is single-digit MB at most; a room is an intimate-scale rendezvous.
const MAX_FRAME_BYTES = 8 * 1024 * 1024
const MAX_CONNS_PER_ROOM = 64

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

const onBroadcastConnection = (conn, roomName) => {
  const members = map.setIfUndefined(rooms, roomName, () => new Set())
  if (members.size >= MAX_CONNS_PER_ROOM) {
    conn.close(1013, 'room full')
    return
  }
  members.add(conn)
  const pingInterval = keepAlive(conn)

  conn.on('message', (data, isBinary) => {
    // the whole job: hand the bytes to everyone else in the room, unread
    for (const peer of members) {
      if (peer !== conn && peer.readyState === wsReadyStateOpen) {
        peer.send(data, { binary: isBinary })
      }
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
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(
    JSON.stringify({
      status: 'ok',
      service: 'spools-relay',
      relay: { rooms: rooms.size, connections: countConns(rooms) },
      signaling: { topics: topics.size, connections: countConns(topics) },
    })
  )
})

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://relay').pathname
  if (pathname.startsWith('/yjs/') && pathname.length > '/yjs/'.length) {
    const roomName = pathname.slice('/yjs/'.length)
    broadcastWss.handleUpgrade(request, socket, head, (ws) => onBroadcastConnection(ws, roomName))
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
