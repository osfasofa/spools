# Spool Protocol — v1.1

Spool is a protocol for a few people to share a living document — a mixtape,
a chat, a list — with no server that ever sees their content. This document
specifies the protocol: what a client must read and write, and what a relay
must do, for independent implementations to interoperate. It describes a
system that already works; test citations point at the reference
implementation's proofs (non-normative).

The words MUST, SHOULD, and MAY are used as in RFC 2119. A **client** is any
program that opens spools; a **relay** is the rendezvous server named in a
link. The reference SDK (`spools` on npm) is *one* client; nothing here
requires it.

Prerequisite: [Yjs](https://docs.yjs.dev) and its ecosystem protocols
([y-protocols](https://github.com/yjs/y-protocols),
[y-webrtc](https://github.com/yjs/y-webrtc)). Spool deliberately invents no
CRDT and no wire format — a spool is a Yjs document with agreed shape,
synced with stock Yjs messages, optionally sealed with one shared key.

---

## 1. Identity and links

A spool is identified by a **code**: a string matching

```
^[a-z]+-[a-z]+-[0-9]{3}$        e.g.  amber-cassette-042
```

The code is the sync boundary: it names the relay room (both transports) and
keys local storage. It is a **rendezvous name, not a secret** — the key
(§4) is the secret. Generators SHOULD use readable words.

A spool travels as a **link**:

```
<any-base-url>#spool=<code>&relay=<ws-url>&k=<key>
```

- The parameters live in the **URL fragment**, encoded as an
  `application/x-www-form-urlencoded` query string — one encoding layer,
  applied once (parse with `URLSearchParams` or equivalent; values are
  percent-encoded only by that form encoding, never pre-encoded on top of
  it). Browsers never transmit fragments, so neither the relay nor the host
  serving a web client ever receives them.
- `spool` (required): the code.
- `relay` (optional): a `ws://` or `wss://` URL telling clients where to
  rendezvous. Links SHOULD carry it; a client MAY fall back to a default
  relay when it is absent. The link, not the client, decides where a spool
  lives.
- `k` (optional): the 32-byte encryption key in canonical form — exactly 43
  characters of the base64url alphabet, no padding (RFC 4648 §5). Writers
  MUST emit the canonical form; readers MAY tolerate padding and
  non-canonical trailing bits, since everything downstream (§4) derives
  from the decoded bytes, not the string. (Standard-alphabet base64 cannot be tolerated: form-urlencoding
  decodes its `+` as a space.) Absent = a plaintext spool. **Same link =
  same key**: there is no key exchange; handing someone the link *is* the
  key exchange.
- The base URL before `#` is not protocol-meaningful — any host serving any
  client works, including none (`#spool=…` alone is a valid link).
- A link that fails this grammar — missing `spool`, a code failing the
  pattern, a `k` that doesn't decode to exactly 32 bytes, a `relay` that
  isn't a websocket URL — MUST be rejected with an error, never silently
  patched. If a parameter repeats, the first occurrence wins (standard
  `URLSearchParams.get` behavior). Unknown fragment parameters MUST be
  ignored (the forward-compatibility rule, §2, applies to links too).
- Whatever the relay URL's path shape, the broadcast connection is always
  made to `<relay-url>/<code>` — strip **all** trailing slashes from the
  relay URL before appending, or same-link clients land in different rooms
  (`/yjs//code` ≠ `/yjs/code`); generators MUST NOT emit one. Relay URLs SHOULD NOT carry a query string
  (naive string-appending misroutes them); clients MAY reject links whose
  relay URL has one.
- When `relay` is absent, whichever default the opening client falls back
  to decides the rendezvous — two clients with different defaults opening
  the same relay-less link will not meet. That is the accepted cost of the
  fallback; it is why links SHOULD carry `relay`.

**The one-URL convention.** If the relay URL's path is `/yjs` (a trailing
slash is tolerated), the same host serves both jobs (§3): byte broadcast at
`<relay>/<code>` (i.e. `/yjs/<code>`) and WebRTC signaling at the same
scheme, host, and port with path `/`. A relay URL of any other shape names a
broadcast endpoint only — clients derive no signaling from it, sync over
websocket alone, and whatever serves it sits outside this spec's relay
conformance (§3 defines compliant relays only at the `/yjs/` layout).

## 2. Document shape

One spool = one Yjs document. Adding an entry is called **winding** (the
protocol's one verb of consequence — everything below describes what a
wind writes). Three root types carry everything:

**`entries` — a `Y.Map`.** One entry per key; key = entry id; value = a
nested `Y.Map` of metadata. If a malformed writer ever makes the `id` field
disagree with its map key, the map key governs (it addresses the body and
the sort):

| field | type | notes |
|---|---|---|
| `id` | string | equals its key in `entries`; MUST be unique in the spool. SHOULD be a UUID |
| `author` | string | self-declared display name — trust, not proof (see below) |
| `kind` | string | app-level flavor (`note`, `track`, `reaction`, …); the protocol doesn't care |
| `createdAt` | number | wall-clock ms at wind time, writer's clock |
| `parent` | string, optional | another entry's id — one threading mechanism for comments, reactions, replies |
| `deletedAt` | number, optional | wall-clock ms at delete time; present ⇒ soft-deleted. Delete = set it; restore = remove it. Nothing is ever hard-deleted |
| `data` | object, optional | plain-JSON machine fields (a track's `url`/`title`/`artist`), written once at wind time. The whole value is last-write-wins — honest only for write-once data; the human-readable text belongs in the body |

Fields not marked optional are required. An entry from a non-compliant
writer missing `createdAt` breaks only its own display position (readers
SHOULD sort it as if `createdAt` were 0); it cannot break sync.

Metadata fields are plain values (last-write-wins per field). That is
acceptable because write-once is **normative**: after an entry is created,
no metadata field may be modified except `deletedAt` (set and removed
freely). Changing text happens in the body; `data` is written at creation
and never again. Writers MUST set all of an entry's metadata fields in the
same Yjs transaction that inserts it into `entries`, so no peer ever
observes a half-built entry. Nothing is ever hard-deleted: clients MUST NOT
remove keys from `entries` and MUST NOT clear another entry's body root —
`deletedAt` is the only sanctioned form of gone.

**Bodies — root `Y.Text`s keyed `entry:<id>`.** The entry's human text.
Created lazily: the root key exists only once a body has content; absence of
the key — or a zero-length `Y.Text` — reads as the empty body. Because Yjs
instantiates a root type the moment it is read, clients SHOULD probe
existence without instantiating (e.g. the doc's `share` map) rather than
calling `getText` per render — an unwritten root never syncs, so the hazard
is purely local (the client's own existence probe starts returning false
positives), but the zero-length rule above keeps even that harmless.
Bodies are
`Y.Text`, never plain strings — concurrent edits merge
character-by-character instead of losing someone's writing.
*(Proof: `packages/spools/src/multiwriter.test.ts`.)*

**`history` — a `Y.Array`** of append-only plain-JSON **moments**:

```
{ ts: <wall-clock ms at append time>,
  snap: <standard base64, RFC 4648 §4 with padding,
         of Y.encodeSnapshot(Y.snapshot(doc))> }
```

Moments make `rewind` possible: the spool as of time `t` is
`Y.createDocFromSnapshot` of the moment with the greatest `ts` ≤ `t` —
selected by `ts` across the whole array, never by array position, because
concurrent writers interleave appends out of `ts` order (equal-`ts` ties
may break arbitrarily: rewind is a local read, never written back). Writing clients
SHOULD append a moment after a burst of local **content** changes (the
reference SDK: 2 s after the last content transaction, ≥ 10 s between
appends; writes to `history` itself never count as content, or the log
would feed itself); all clients MUST tolerate the array's presence.
Elements are written once and never edited. Before reconstructing, a client
MUST check the snapshot's state vector against its own — every
`client → clock` entry in the snapshot's `sv` must be ≤ the local doc's
clock for that client — because a snapshot referencing unreceived changes
is not reconstructible (skip it; use an earlier one). If no eligible moment
exists at all — `t` predates the first moment, or every candidate fails the
check — rewind is an error, not an empty spool: not knowing is different
from nothing. *(Proof: `packages/spools/src/history.test.ts`.)*

Rules that keep the shape alive:

- **Garbage collection MUST be disabled** on the doc (`new Y.Doc({gc:
  false})`). Yjs gc forgets deleted content — exactly what `rewind` needs —
  and gc is per-doc, so a single collecting peer serves a gutted past to
  everyone who syncs from it. The cost was measured at +34% doc size on a
  realistic spool.
- **Display order** is `createdAt` ascending, `id` ascending (UTF-16
  code-unit comparison, i.e. plain `<` on the strings — never locale
  collation) as tie-break — deterministic across peers even for identical
  timestamps.
- **The forward-compatibility rule**: clients MUST ignore, and MUST preserve,
  what they don't understand — unknown `kind`s, unknown metadata fields,
  unknown root types. This single rule is what makes future additions
  (e.g. a `sig` field) possible without a migration.
- **`author` is self-declared in v1.** Anyone holding the link can write
  anything, including under any name — that is the honest contract of
  intimate scale. Cryptographic attribution, if ever wanted, arrives as an
  additive `sig` field on entry metadata, never a migration.

## 3. Wire protocol and the relay

**There is no Spool wire format.** Peers exchange stock Yjs messages, and —
because the relay holds no document — **peers are each other's server**:
every client MUST answer an inbound SyncStep1 with SyncStep2, exactly as a
y-websocket server would. (Stock y-websocket clients already do; a
hand-rolled ask-only client would never complete a sync with anyone.)

- **Websocket**: the y-protocols sync + awareness protocol as implemented by
  y-websocket, connected to `<relay>/<code>`.
- **WebRTC**: the y-webrtc protocol as-is, room name = code, signaling at
  the relay root (§1). WebRTC is the low-latency bonus; websocket is the
  reliable path. Both sync the same doc; a client MAY implement either or
  both.

**The relay is a dumb byte broadcaster.** A room is named by the
**entire remainder of the upgrade URL's pathname after `/yjs/`**, taken raw
(no percent-decoding) — pathname, not raw URL: a query string is not part
of the room name (`/yjs/a-b-123` → room `a-b-123`; an empty remainder is
not a room — reject the connection).
The relay forwards every frame — binary or text, y-websocket never sends
text but the rule is *forward, don't inspect* — to every other connection
in the same room, verbatim: bytes untouched, frame type (opcode) preserved,
sender excluded. It MUST NOT parse,
transform, filter, or persist frames (v1), and MUST NOT share frames across
rooms. (Deposits, §6, are not frames: the pocket adds sealed storage beside
the broadcast path without touching this rule.) A standard y-websocket server is **not** a compliant relay: it parses
every message and materializes a server-side copy of the document — it sees
content, and it cannot carry encrypted frames (§4) at all. The relay MAY
additionally serve y-webrtc signaling at its root path; the canonical
`spools-relay` does both in ~200 lines.

*Signaling message shapes* (JSON text frames at `/`, from y-webrtc's
reference server, restated so this document stands alone): a client sends
`{type:'subscribe', topics:[string]}` / `{type:'unsubscribe',
topics:[string]}` to manage topic membership, `{type:'publish', topic:
string, …}` to have the whole message forwarded to every subscriber of that
topic — **including the sender, if subscribed** (y-webrtc tolerates its own
echoes) — and `{type:'ping'}` to receive `{type:'pong'}`. The server holds
topic→connection sets and forwards; it never interprets payloads (with a
key, y-webrtc encrypts them anyway). Non-JSON or unknown-`type` signaling
frames are ignored; a `publish` with no subscribers goes nowhere, silently.
Upgrades to any path other than `/` and `/yjs/<room>` are rejected.
Operational choices — keepalive pings, frame-size caps, per-room connection
caps, disconnecting slow consumers rather than buffering unboundedly — are
the relay's own business so long as it never drops or reorders frames on a
healthy connection.

**Clients on the websocket path MUST re-ask periodically.** A dumb relay
cannot answer a waiting peer (it holds no document), so a peer that was
offline during another's changes hears nothing until someone speaks. While
connected to a broadcast endpoint, clients MUST re-send SyncStep1
periodically; 15–30 s is recommended (reference: 20 s). Without this,
offline-gap reunions never heal. The rule does not apply to webrtc-only
clients — y-webrtc full-syncs on every peer connection, which covers the
same gap. *(Proof: T-003 spike; `packages/spools/src/engine.test.ts`.)*

Non-normative warning for implementers using stock `WebsocketProvider`: its
liveness and status semantics assume an *answering* server, which a dumb
relay deliberately is not. In an empty room no frames ever arrive, so its
~30 s message-timeout cycles the connection indefinitely (harmless, noisy),
and `synced` only fires once some peer answers SyncStep1 — never while
alone. Key UX to peers, not to `synced`.

Awareness (presence) messages are OPTIONAL and carry no document state; the
awareness state's shape is app-defined and cross-client presence is
best-effort. A client using both transports SHOULD share one awareness
instance across them.

## 4. Encryption

The key `k` is **32 random bytes, used directly** — no KDF, no derivation,
no rotation (a new key is a new spool). Key strength lives entirely in the
generator's RNG.

**Websocket frames.** When a spool has a key, every frame a client sends
**on the broadcast connection** (`<relay>/<code>`) MUST be sealed. The
signaling socket is exempt: its JSON envelope must stay parseable for topic
routing, and with a key y-webrtc encrypts the signaling *payloads* itself —
sealing applies to the sync pipe, not the rendezvous. The sealed frame
format:

```
0xE2 0xE1 ‖ nonce (24 bytes) ‖ XSalsa20-Poly1305 ciphertext
```

— NaCl `secretbox` (as in tweetnacl/libsodium) of the entire Yjs frame,
fresh random nonce per frame, the 32-byte key as-is, prefixed with the magic
bytes `0xE2 0xE1`. Inbound frames that lack the magic or fail
authentication MUST be dropped without being handed to Yjs — a wrong-key or
keyless peer in the room can therefore never corrupt the doc — and SHOULD be
counted and surfaced to the user ("someone here isn't on your key"). A
keyed client MUST NOT send a plaintext frame under any circumstances.
Conversely, an *unkeyed* client that receives a sealed frame (someone in
the room has a key it lacks) SHOULD drop frames carrying the magic prefix,
and MUST at minimum survive them without crashing or corrupting its doc —
sealed bytes never parse as valid Yjs messages, but the resulting decoder
exception must not take the client down.
*(Proof: `packages/spools/src/encrypted-transport.test.ts`, including an
instrumented-relay assertion that only sealed bytes cross the wire.)*

Implementation hint (non-normative): stock y-websocket has no frame hook;
the reference SDK seals by handing the provider a `WebSocket` subclass (its
`WebSocketPolyfill` option) that encrypts on `send` and decrypts before
delivering `message` events — no fork of the provider needed. Likewise, the
provider's `resyncInterval` option is exactly the §3 resync rule; nothing
needs hand-rolling.

**WebRTC.** The rtc path uses y-webrtc's built-in room encryption: the
`password` is the **canonical base64url-unpadded encoding of the 32 key
bytes** — identical to the `k=` string of a canonical link, and derived
from the bytes (not the raw parameter text) so that clients tolerating
sloppy `k=` variants still agree. This is a second scheme (y-webrtc derives
an AES key via PBKDF2) and that is a deliberate trade: both halves are
stock and proven, at the cost of two paragraphs in this spec. Peers without
the key cannot join the mesh or read its signaling payloads.

**At rest** (non-normative — storage never crosses implementations): the
reference SDK seals every persisted update with the same secretbox scheme,
rows prefixed `0xE2 0xE2`, and fails loudly when a link's key cannot decrypt
existing local data. Clients SHOULD seal local persistence for keyed spools.

**The honesty clause.** Pure serverless P2P discovery does not exist on the
modern internet; two browsers behind home routers need a rendezvous point.
"No central server" means precisely **"no server that ever sees content."**
A relay necessarily observes: connecting IP addresses, room codes, frame
sizes and timing. For a **keyed** spool it can never observe document
content, entry text, or the key — the key makes that physics, not policy.
For a **plaintext** spool the relay merely promises not to look: its frames
are ordinary Yjs messages any server could parse. The key is what upgrades
the promise. A relay offering the pocket (§6) additionally holds sealed
deposits at rest and observes: that a spool has deposits, their sizes and
times, an opaque key-derived namespace id (never invertible to the key),
and how many distinct session tags deposited recently — still zero content,
because the pocket is keyed-only: **it stores ciphertext or nothing.** Do
not claim more than this.

## 5. The export file (optional surface)

Clients SHOULD let a person carry a spool out as a file. The format is one
JSON document:

```
{ "format": "spool-export", "version": 1, "code": <code>,
  "exportedAt": <ms>, "entries": [<entry records, §2 fields + body,
  soft-deleted included>], "doc": <standard base64 of
  Y.encodeStateAsUpdate(doc)> }
```

The `entries` half is for humans (readable with no software, forever); the
`doc` half is the whole spool — importing means applying it to a doc for
that code (a CRDT merge; restoring into nothing and reunifying with
existing state are the same operation). Keyed spools export **decrypted**,
and the key MUST NOT be written into the file — the link is the only key
carrier. Readers MUST reject a `version` newer than they understand.

## 6. The pocket (optional relay capability)

A dumb relay cannot answer a waiting peer, so §3 sync requires two people
online together. The **pocket** closes that gap without opening the relay's
eyes: clients holding a spool's key periodically hand the relay a
**deposit** — the whole spool, sealed — and whoever opens the link later
collects, decrypts, and merges. The relay stores ciphertext it cannot read
under names it cannot guess, or it stores nothing: **the pocket is
keyed-only.** A plaintext spool has no pocket; its asynchronous option is an
always-on peer (e.g. the reference `spools-keeper` — an ordinary client,
outside this spec's scope because it needs nothing from it).

The capability is OPTIONAL for relays, and this whole section is additive:
no §3 rule changes (deposits are not frames), the link grammar is untouched
(the capability is discovered from the relay the link already names), and a
client or relay ignorant of this section remains fully conformant.

**Namespace token.** Deposits live under a per-spool namespace derived from
the key, by clients only:

```
token = base64url-unpadded( SHA-512( "spool-pocket-v1" ‖ key )[0..12) )
```

— the UTF-8 bytes of the domain string, then the 32 key bytes; the first 12
digest bytes; base64url without padding (16 characters). The token is a
capability, not an identity: deriving it requires the key, so only
link-holders can write — or even read — where link-holders read. The relay
cannot verify a token and MUST NOT be expected to; a namespace's whole
defense is that strangers can't guess 96 bits. The derivation is one-way
(the token never yields the key) and the token appears only in URL paths.

**The deposit envelope.**

```
0xE2 0xE3 ‖ version (1 byte, = 0x01) ‖ tag (4 bytes) ‖ nonce (24 bytes) ‖ ciphertext
```

— §4's secretbox, same 32-byte key as-is, over `Y.encodeStateAsUpdate(doc)`:
one writer's whole worldview, applied on receipt with `Y.applyUpdate` — a
CRDT merge with no clobber path (restoring into nothing and reunifying with
existing state are the same operation, as in §5). The 7-byte plaintext
header is the only part of a deposit a relay may read. The **tag** is 4
random bytes drawn fresh each session: a ring-partition key with no
continuity — spoofable by any key-holder, deliberately not identity, there
so one writer's repeated deposits replace their *own* slot instead of
flushing a diverged peer's only worldview. Readers MUST drop, unapplied, any
deposit whose magic is wrong or whose version is newer than they understand.

**Endpoints.** The pocket lives on the relay URL's origin, scheme-mapped
ws→http / wss→https:

- `PUT <origin>/pocket/<room>/<token>` — body: one deposit,
  `application/octet-stream`. Success is `200` with `"stored": true` in the
  envelope. The relay MUST reject bodies lacking the 7-byte header shape
  (400) and MAY enforce per-deposit size (413), admission rate (429), and
  storage-budget (507) limits.
- `GET <origin>/pocket/<room>/<token>` — the held deposits, newest first,
  at most one per tag; `at` is stamped by the relay's clock at storage:

```
{ "format": "spool-pocket", "version": 1, "ttlDays": <number>,
  "deposits": [ { "at": <ms>, "blob": <standard base64 of one envelope> }, … ] }
```

Every pocket response — success or error — MUST carry
`"format": "spool-pocket"` and a numeric `"version"`. Both path segments
MUST be constrained to `[A-Za-z0-9_-]`, at most 64 characters each (reject
others with 400) — spool codes and tokens both fit, and namespace segments
become storage names, so the charset is the traversal guard. Browser clients
reach these endpoints cross-origin: a relay offering the pocket MUST answer
CORS preflights permissively for GET and PUT on pocket paths.

**Detection is the envelope, never the status code.** Relays predating this
section answer `200` + health JSON to *any* HTTP request. A `200` whose body
is not a pocket envelope therefore means **the relay does not offer the
pocket** — it MUST NOT be read as an empty pocket, and a depositor MUST NOT
treat such a response as stored. An envelope `version` newer than the client
understands reads the same way (the §5 export-file rule). Relays offering
the pocket SHOULD also advertise a `pocket` block (counts and limits only,
never namespace ids) in their health JSON — informative for humans and
operators; the envelope rule alone is normative.

**Relay conformance, if offered.** A relay serving these endpoints:

1. MUST keep, per namespace, the newest deposit per distinct tag, and
   SHOULD retain at least 2 distinct tags — a joiner needs more than one
   worldview to union writers who diverged offline. It MAY cap distinct
   tags per namespace, evicting the stalest tag first (the reference keeps
   4); the cap plus per-deposit size bounds a namespace.
2. MUST NOT read a deposit beyond its 7-byte header, and MUST NOT serve one
   namespace's deposits under another.
3. MUST expire untouched namespaces after an advertised `ttlDays` (~60
   recommended) and SHOULD refresh expiry on reads, so spools that keep
   being opened stay covered. The pocket is a courtesy window, never an
   archive — devices remain the spool's home.
4. Everything else — storage medium, eviction under a relay-wide budget,
   admission limits — is the relay's own business, exactly as in §3.

**Client behavior, if used.** A client holding both a key and a relay URL:

- SHOULD fetch the pocket on open, after local persistence has loaded;
  MUST verify and decrypt deposits client-side, apply survivors with
  `Y.applyUpdate` — in any order; merges commute — and drop, never hand to
  Yjs, any deposit that fails authentication (§4's rule, reapplied; SHOULD
  count and surface drops).
- SHOULD deposit debounced while writing and flush a final deposit when
  leaving; SHOULD re-deposit when it holds state the pocket lacks
  ("deposit-if-ahead" — what repopulates a pocket after expiry) and when
  the newest held deposit is older than half the advertised TTL
  ("refresh-if-stale" — quiet-but-opened spools stay covered).
- MUST NOT block opening on any of this. A missing, empty, expired, or
  refused pocket degrades to exactly §3 behavior: the feature only ever
  adds.

*(Proof: `packages/spools/src/pocket-fetch.test.ts` and
`pocket-deposit.test.ts` (the midnight loop, both sides),
`packages/spools-relay/test/pocket.test.js` (ring, TTL, caps, the 200-trap),
and a real-browser run in `scratch/torture-t104/`.)*

---

## Conformance

You are a **compliant client** if:

1. You produce and consume the document shape of §2 exactly — `entries` map,
   `entry:<id>` bodies as `Y.Text`, soft deletes via `deletedAt`.
2. Your doc runs with Yjs garbage collection disabled.
3. You ignore and preserve unknown kinds, fields, and root types.
4. You speak stock y-websocket and/or y-webrtc protocol with the room =
   code, answering every inbound SyncStep1 with SyncStep2 — peers are each
   other's server.
5. You re-send SyncStep1 periodically (15–30 s recommended) while connected
   to a broadcast endpoint. (Webrtc-only clients are exempt, per §3.)
6. For keyed spools: every frame you send on the broadcast connection is
   sealed per §4 (the signaling socket is exempt), every inbound broadcast
   frame that doesn't authenticate is dropped unapplied, and your y-webrtc
   password is the canonical base64url encoding of the key bytes.
7. You never transmit the link fragment or the key to any server, and for
   keyed spools you never transmit content in plaintext to anyone.
   (Plaintext spools sync in the clear by definition — that is their
   documented contract, not a violation.)
8. If you use the pocket (§6, optional): you derive the token exactly as
   specified, never read a non-envelope `200` as pocket data or as stored,
   and drop unauthenticated deposits unapplied.

You are a **compliant relay** if:

1. You forward each room's frames to all other members of that room,
   byte-for-byte, sender excluded.
2. You never parse, transform, filter, persist, or cross-route frames.
3. Rooms live at `/yjs/<room>`, named by the entire path remainder after
   `/yjs/`, and are fully isolated from each other. (Broadcast endpoints at
   other paths may exist in the wild — links can name anything — but they
   are outside this conformance.)
4. (If you serve signaling) it is y-webrtc topic pub/sub per §3 at the root
   path, per the one-URL convention.
5. (If you offer the pocket) you meet §6's relay conformance: envelope
   responses on every pocket path, newest-per-tag under key-derived
   namespaces, nothing read past a deposit's 7-byte header, TTL'd as
   advertised.

## Versioning

This is **v1.1**, and it is humble: the compatibility promise is the
forward-compatibility rule itself. Future revisions may *add* — new metadata
fields, new root types, new entry kinds — and compliant v1 clients will
ignore and preserve those additions, so spools outlive spec revisions.
Revision v1.1 (Aug 2026) added exactly one thing, §6 — purely additive:
every v1 client and relay remains conformant unchanged, and mixed
generations interoperate (the §6 detection rule exists precisely for that).
Nothing listed here will be removed, renamed, or re-typed within v1; a
change that would break rule 3 of client conformance is not a revision of
this protocol but a different protocol. There is no version negotiation on
the wire.

---

*The reasoning behind every choice here — and the decisions log that
produced them — lives in [DESIGN_DOC.md](DESIGN_DOC.md). This document is
the what; that one is the why.*
