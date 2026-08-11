# spools-relay

The relay for **Spool** — a dumb byte broadcaster plus WebRTC signaling in one
small plain-JS server (~200 lines, three imports). It has exactly two jobs and
no third: introduce peers, and forward opaque frames between them. It never
parses a message and never holds a document — it imports neither `yjs` nor
`y-websocket`, and that absence is the proof.

## Run one

```sh
npx spools-relay                # listens on :4444
npx spools-relay --port 5555    # or PORT=5555; --host/HOST likewise
```

That's the whole setup. No config file, no database, no state.

**Deploy it** (either path is a one-liner from this directory):

- **Railway:** `railway init && railway up` — `railway.json` is included
  (NIXPACKS, health check on `/`). Point the service's root directory at
  `packages/spools-relay` if deploying from the monorepo.
- **Fly.io:** `fly launch --copy-config` — `fly.toml` is included, sized tiny
  (shared CPU, 256 MB) with scale-to-zero: a relay with no connections has
  nobody waiting on it, and Fly wakes it on the next one.

Resource expectations: tiny. The relay does no computation on frames — it's
a fan-out loop. A hobby-tier instance carries intimate-scale traffic easily.

## Endpoints — the one-URL convention

A spool link carries a single relay URL ending in `/yjs`; clients derive the
signaling endpoint from it (same host, root path). One URL, both jobs.

| | |
|---|---|
| `ws(s)://host/yjs/{room}` | opaque byte broadcast — frames fan out to the room, sender excluded, bytes untouched |
| `ws(s)://host/` | y-webrtc signaling (topic pub/sub) |
| `GET /` (any path) | health JSON — room/connection **counts only**, never content |

Rooms are created on first join and vanish when the last member leaves.
Crude guards, documented in the source: 8 MiB max frame, 64 connections per
room.

## Point your links at it

A spool lives on whichever relay its link names. To use yours:

```
https://anyhost.example/#spool=<code>&relay=wss%3A%2F%2Fyour-relay.example%2Fyjs&k=<key>
```

(the `relay=` param is your relay's URL with the `/yjs` path, URL-encoded —
the SDK's `share()` builds this for you when a spool was opened against your
relay). There is no relay-to-relay federation, no directory, no chatter: two
people on the same link rendezvous at the same relay, and that's the entire
topology.

## What the operator can and cannot see

Running a relay means you can observe: **room codes** (rendezvous names, not
secrets), **connection counts**, **traffic volume and timing**, and IP
addresses — the same metadata any websocket host sees. You cannot see
content: frames are opaque bytes forwarded unread (and once encryption lands,
ciphertext end to end — the key rides in the URL fragment, which browsers
never transmit to any server, this one included).

## The honest part

Pure zero-server P2P discovery doesn't exist on the modern internet: two
browsers behind home routers need *some* rendezvous point. "No central
server" means precisely **"no server that ever sees your content."** The
relay touches a tiny handshake and gets out of the way.

And because a dumb relay keeps no copy of your spool, **spools sync when
people are online together**. Open a link while nobody else is connected and
you'll see your own local copy, calmly, until a peer shows up — then you
reconcile. Peers re-ask each other for state every ~20 s, so reunions after
a gap heal within that window. That's the deal, and it's the point.

Env: `PORT` (default 4444), `HOST` (default 0.0.0.0). Node ≥ 18.
