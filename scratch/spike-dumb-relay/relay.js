// T-003 spike: the dumbest possible relay. Room = URL path. Fans every frame
// out to the room's other members (echo optionally includes the sender, for
// the echo probe). Never decodes a frame — stats count opaque frames only.
import { WebSocketServer } from 'ws'

export const startRelay = ({ port, echo = false }) =>
  new Promise((resolve) => {
    const rooms = new Map()
    const stats = { framesIn: 0, framesOut: 0 }
    const wss = new WebSocketServer({ port }, () => resolve({ stats, close: () => wss.close() }))
    wss.on('connection', (conn, req) => {
      const room = req.url
      if (!rooms.has(room)) rooms.set(room, new Set())
      const members = rooms.get(room)
      members.add(conn)
      conn.on('message', (data) => {
        stats.framesIn++
        for (const peer of members) {
          if ((echo || peer !== conn) && peer.readyState === peer.OPEN) {
            peer.send(data)
            stats.framesOut++
          }
        }
      })
      conn.on('close', () => {
        members.delete(conn)
        if (members.size === 0) rooms.delete(room)
      })
    })
  })
