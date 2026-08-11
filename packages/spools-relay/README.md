# spools-relay

The relay for **Spool** — a dumb byte broadcaster plus WebRTC signaling in one
small plain-JS server. It introduces peers and forwards opaque frames; it
never parses a message and never holds a document. "No central server" means
*no server that ever sees your content* — and this server literally cannot:
it imports neither `yjs` nor `y-websocket`, and that absence is the proof.

```sh
PORT=4444 node server.js     # or, once published: npx spools-relay
```

## Endpoints — the one-URL convention

A spool link carries a single relay URL ending in `/yjs`; clients derive the
signaling endpoint from it (same host, root path). One URL, both jobs.

| | |
|---|---|
| `ws(s)://host/yjs/{room}` | opaque byte broadcast — frames fan out to the room, sender excluded, bytes untouched |
| `ws(s)://host/` | y-webrtc signaling (topic pub/sub) |
| `GET /` (any path) | health JSON — room/connection **counts only**, never content |

Rooms are created on first join and vanish when the last member leaves.
Nothing is stored. Crude guards, documented in the source: 8 MiB max frame,
64 connections per room.

## The honest part

A dumb relay keeps no copy of your spool, which means **spools sync when
people are online together**. Open a link while nobody else is connected and
you'll see your own local copy, calmly, until a peer shows up — then you
reconcile. That's the deal, and it's the point: the relay touches a tiny
encrypted handshake and gets out of the way. (Peers re-ask each other for
state every ~20 s, so reunions after a gap heal within that window.)

Env: `PORT` (default 4444), `HOST` (default 0.0.0.0).
