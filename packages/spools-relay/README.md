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
- **Behind either proxy, set `TRUST_PROXY=1`** (`fly.toml` already does;
  on Railway it's a service variable). Without it the socket address every
  per-IP limit keys on is the proxy's own, so the whole relay shares one
  bucket. With it, the client is the rightmost `X-Forwarded-For` hop — the
  one the proxy appended.

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

| knob | default | |
|---|---|---|
| `TRUST_PROXY` | *(unset — off)* | behind an edge proxy (Railway, Fly): every per-IP limit keys on the rightmost `X-Forwarded-For` hop, the one the proxy appended, instead of the proxy's own address. Leave it off on a relay exposed directly — there the header is whatever the client wrote |
| `RELAY_MAX_BUFFERED_BYTES` | `67108864` | a member with more than this queued for it (it stopped reading) is skipped and closed with 1008 "slow consumer"; 0 disables. 64 MiB is eight peers at the 8 MiB frame cap — a cold joiner gets one state frame per peer at once |
| `RELAY_MAX_FRAMES_PER_SEC` | `300` | per-connection frame budget; over it → closed with 1008 "frame budget exceeded"; 0 disables |
| `RELAY_MAX_BYTES_PER_MIN` | `134217728` | per-connection byte budget (128 MiB/min — sixteen full-size state frames); same close; 0 disables |
| `RELAY_CONNS_PER_IP_PER_ROOM` | `0` *(off)* | per-address cap inside one room; over it → closed with 1013 "too many connections from this address". **Enable together with `TRUST_PROXY`**: behind a proxy without it, everyone is one address and the cap would fall on all of them at once |

The close code matters: **1013 means "room full"** to the SDK; **1008** is
"you broke the relay's policy" (with the reason in the close frame), and a
healthy connection never sees it. The defaults are sized to the relay's own
ceilings rather than to typical traffic: a cold joiner has one state frame
per peer queued for it at once (64 MiB is eight peers at the 8 MiB frame
cap), a member at the 64-connection guard answers 63 SyncStep1s in one second
after a relay restart (300/s clears it), and 128 MiB a minute is sixteen
full-size state frames. Ordinary rooms send one frame per Yjs transaction
plus awareness and never get near any of these lines. The one they can
touch: a full-size spool in a room bigger than eight seats, cold-joined over
a slow link, can trip the buffered cap on arrival — the joiner reconnects
with backoff and gets the rest.

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
| `POCKET_MAX_TOTAL_BYTES` | `1073741824` | relay-wide budget. Eviction order: namespaces nobody has ever collected go first (oldest among them), then the stalest-touched; 507 when even that can't fit it |
| `POCKET_PUTS_PER_MIN` | `24` | per-IP deposit admission (clients self-pace to ~1/min each, so this is ~24 sustained same-NAT devices) |
| `POCKET_NEW_NAMESPACES_PER_HOUR` | `0` *(off)* | per-IP cap on *new* namespaces (429 "too many new namespaces" past it; deposits into an existing namespace don't count, nor do refused ones). **Enable together with `TRUST_PROXY`** behind a proxy. The canonical relay runs `60` (T-168, Sep 2026) |
| `POCKET_FIRST_MAX_BYTES` | `= POCKET_MAX_BYTES` | per-deposit cap for a namespace nobody has collected yet (413 above it); after its first read, `POCKET_MAX_BYTES` applies. Equal to it by default, and the canonical relay leaves it there (T-168, Sep 2026): a spool built alone and shared later would otherwise deposit nothing until its first read |

In disk mode the read count is a `.reads` file beside a namespace's
deposits — a plain number, never inside a deposit — restored at boot, so
both the eviction rank and touch-on-read survive a restart.

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
per-spool **namespace id** (a one-way hash — it never yields the key), how
many distinct writer-session **tags** deposited recently, and how many
times the namespace has been **collected** (a count, kept for eviction
order). You still
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
a spool is a copy on somebody's disk (`export()`). Under the 1 GiB budget,
namespaces nobody ever collected are evicted before ones somebody did; the
creation and first-deposit knobs are at their inert defaults. **A determined
stranger can still fill the pocket; devices remain the spool's home.** The
canonical relay answers at `wss://relay.spools.lol/yjs` — a name we own —
since 3 Sep 2026 (T-160). Links minted before then carry
`spools-relay-production.up.railway.app`; that hostname stays enabled on the
same service indefinitely: same process, same rooms, same pocket, so old
links and new links meet.

**Group-scale honesty (T-110/T-111, measured).** The tag ring holds the
newest deposit from each of the last **8** writer sessions. People writing
*while connected* are always safe — every deposit carries the merged room —
but **nine or more people writing in isolation** (offline, partitioned) can
silently outrun the ring: the oldest unmerged worldview is evicted, a cold
joiner won't see it, and only that writer's own return heals it. The per-IP
deposit budget (**24/min**) covers a couple of dozen same-NAT devices at the
clients' own 1/min pacing — per *client* address only where `TRUST_PROXY`
is set; a relay behind a proxy without it sees one address, and the budget
becomes one bucket for everyone on it. And the **64 connections per room** guard counts
tabs, not people; a 65th connection is closed with code 1013 ("room full").
The SDK (0.2.0+) reads that as "stand back": `spool.roomFull` turns true,
`on('full')` fires with the reason, and it tries again about every 30 s
instead of spinning; the room client shows the line. Room codes are public by design, so one
address could fill a room to that guard by itself; `RELAY_CONNS_PER_IP_PER_ROOM`
(off by default — it needs `TRUST_PROXY` behind a proxy) caps that, and the
extra sockets get 1013 with the reason "too many connections from this
address". One connection that stops reading, or floods, is closed with
**1008** and a reason (64 MiB queued, 300 frames/s, 128 MiB/min — the knobs
above) and the room keeps going for everyone else; nothing is buffered
without bound and nothing is fanned out past the budget.

Env: `PORT` (default 4444), `HOST` (default 0.0.0.0), `TRUST_PROXY` (default
off), pocket knobs above. Node ≥ 18. Tests: `pnpm test` (node:test, spawns
real instances).
