# spools-relay

The relay for **Spool** — a dumb byte broadcaster plus WebRTC signaling in one
small plain-JS server. Two jobs — introduce peers, forward opaque frames
between them — plus one optional courtesy it *still* can't read: the
**pocket**, which holds a few sealed full-state deposits per spool so the
mixtape is there when your friend opens the link while you're asleep. It
never parses a message and never holds a document it could open — it imports
neither `yjs` nor `y-websocket`, and that absence is the proof (enforced by
a test).

## Run one

```sh
npx spools-relay                # listens on :4444
npx spools-relay --port 5555    # or PORT=5555; --host/HOST likewise
```

That's the whole setup. No config file, no database, no state.

**Deploy it** (either path is a one-liner from this directory):

- **Railway:** `railway init && railway up` — `railway.json` is included
  (NIXPACKS, health check on `/`). Point the service's root directory at
  `packages/spools-relay` if deploying from the monorepo. For a durable
  pocket, attach a volume (Railway dashboard → service → volume, mount it
  at `/data`) and set `POCKET_DIR=/data/pocket`.
- **Fly.io:** `fly volumes create pocket_data --size 1`, then
  `fly launch --copy-config` — `fly.toml` is included, sized tiny (shared
  CPU, 256 MB), volume-mounted for the pocket, scale-to-zero on. With the
  volume, scale-to-zero trades pocket *latency* (cold wake on the next
  request), not correctness — deposits persist.
- **No volume?** The pocket runs in memory: everything works, and a restart
  simply degrades to sync-when-together until deposits accrue again. Honest,
  but it defeats the pocket's purpose during exactly the gaps it exists to
  bridge — give the canonical relay a disk.

Resource expectations: tiny. The relay does no computation on frames — it's
a fan-out loop. A hobby-tier instance carries intimate-scale traffic easily.

## Endpoints — the one-URL convention

A spool link carries a single relay URL ending in `/yjs`; clients derive the
signaling endpoint from it (same host, root path). One URL, both jobs.

| | |
|---|---|
| `ws(s)://host/yjs/{room}` | opaque byte broadcast — frames fan out to the room, sender excluded, bytes untouched |
| `ws(s)://host/` | y-webrtc signaling (topic pub/sub) |
| `PUT/GET /pocket/{room}/{token}` | the pocket — sealed deposits in, sealed deposits out, envelope JSON responses |
| `GET /` (any other path) | health JSON — room/deposit **counts only**, never content, never namespace ids |

Rooms are created on first join and vanish when the last member leaves.
Crude guards, documented in the source: 8 MiB max frame, 64 connections per
room.

## The pocket

Without it, a dumb relay means spools only sync while people are online
together. With it, clients holding a spool's **key** derive a write/read
token (a one-way hash — this server never sees the key and can't guess the
token) and deposit sealed full-state copies as they work. Whoever opens the
link later collects them, decrypts client-side, and merges. The relay keeps
the newest deposit per writer-session tag, a few tags per spool, and
forgets namespaces nobody has touched in ~60 days. Keyless spools have no
token and therefore no pocket: **this server stores ciphertext or nothing.**

It's on by default, in memory — `npx spools-relay` stays npx-and-done, and a
restart simply degrades to the sync-when-together baseline. Give it a
directory to make deposits survive restarts (one plain file per deposit, no
database):

```sh
POCKET_DIR=/data/pocket npx spools-relay
```

| knob | default | |
|---|---|---|
| `POCKET_DIR` | *(unset — memory)* | directory for deposits; set it on anything with a volume |
| `POCKET_TTL_DAYS` | `60` | namespaces untouched this long are swept; reads refresh the clock |
| `POCKET_K` | `8` | distinct writer-session tags kept per spool (raised from 4 for group rooms — T-124) |
| `POCKET_MAX_BYTES` | `8388608` | per-deposit cap (413 above it) |
| `POCKET_MAX_TOTAL_BYTES` | `1073741824` | relay-wide budget; stalest spools evicted first, 507 when even that can't fit it |
| `POCKET_PUTS_PER_MIN` | `24` | per-IP deposit admission (clients self-pace to ~1/min each, so this is ~24 sustained same-NAT devices) |

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
addresses — the same metadata any websocket host sees. Running the pocket
adds: **that a spool has deposits**, their **sizes and times**, an opaque
per-spool **namespace id** (a one-way hash — it never yields the key), and
how many distinct writer-session **tags** deposited recently. You still
cannot see content: frames are opaque bytes forwarded unread, deposits are
ciphertext held unopened, and the key rides in the URL fragment, which
browsers never transmit to any server, this one included.

## The honest part

Pure zero-server P2P discovery doesn't exist on the modern internet: two
browsers behind home routers need *some* rendezvous point. "No central
server" means precisely **"no server that ever sees your content."** The
relay touches a tiny handshake and gets out of the way.

And the live path still works exactly that way: **peers sync each other when
they're online together**, re-asking every ~20 s so reunions heal fast. The
pocket is what covers the rest of the clock — sealed copies this relay holds
but cannot open, so a spool survives the gap between one friend's evening
and another's midnight. If the pocket is empty, expired, or the relay is too
old to have one, you get exactly the sync-when-together baseline: the
feature only ever adds. That's the deal, and it's the point.

**What the canonical relay promises.** The default relay the SDK ships with
runs this server volume-backed on the stock knobs: deposits survive restarts,
untouched namespaces are swept after **60 days**, **8** writer-session tags per
spool, **8 MiB** per deposit, **1 GiB** relay-wide. Treat the 60 days as a
courtesy window, not an archive — the pocket is there to bridge the gap between
one friend's evening and another's midnight, and the thing that actually keeps
a spool is a copy on somebody's disk (`export()`).

**Group-scale honesty (T-110/T-111, measured).** The tag ring holds the
newest deposit from each of the last **8** writer sessions. People writing
*while connected* are always safe — every deposit carries the merged room —
but **nine or more people writing in isolation** (offline, partitioned) can
silently outrun the ring: the oldest unmerged worldview is evicted, a cold
joiner won't see it, and only that writer's own return heals it. The per-IP
deposit budget (**24/min**) covers a couple of dozen same-NAT devices at the
clients' own 1/min pacing. And the **64 connections per room** guard counts
tabs, not people; a 65th connection is closed with code 1013 ("room full"),
which today's SDK experiences as an endless connect/drop cycle — a full room
looks like a bad connection.

Env: `PORT` (default 4444), `HOST` (default 0.0.0.0), pocket knobs above.
Node ≥ 18. Tests: `pnpm test` (node:test, spawns real instances).
