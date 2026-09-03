# `spools` SDK — API design note

> **Status: design, not spec.** The protocol spec is written last, from working code (DESIGN_DOC §4). This note is the target we build toward; revise it when the code teaches us something. Decisions referenced here are logged in DESIGN_DOC §5.
>
> As of `spools@0.1.0`: the surface documented here is the package's contract. Anything `index.ts` exports beyond it (`SpoolEngine`, the encrypted-persistence and transport classes, the magic constants…) is scaffolding — real escape hatches, kept exported on purpose, but they may move in any 0.x (settled at T-130, RELEASING.md decision 2).

The API should feel like handing someone a tape, not configuring a network. Object words (make/open/hand), not session words (start/join/connect).

---

## Entry points

```ts
import { newSpool, openSpool } from 'spools'

const spool = await newSpool(opts?)   // starting fresh
const spool = await openSpool(link)   // someone handed you this
```

### `newSpool(opts?): Promise<Spool>`

Creates a fresh spool: generates a code (`adjective-noun-NNN`), generates a 32-byte key, connects, resolves when local persistence is ready.

```ts
interface NewSpoolOptions {
  relay?: string      // wss URL; default: the SDK's default relay constant
  author?: string     // self-declared display name stamped on entries you wind
  persist?: boolean   // default true; false = memory-only (tests, previews)
  encrypted?: boolean // default true: key generated, carried in k=, local storage sealed (M5). false = keyless, plaintext at rest
}
```

### `openSpool(link, opts?): Promise<Spool>`

Accepts a full URL, a bare fragment (`#spool=…&relay=…&k=…`), or a bare spool code (uses default relay, no key). Resolves when local persistence has loaded — **not** when the network syncs; a spool opens instantly offline and catches up when peers appear. `opts` is `NewSpoolOptions` minus `relay` (the link's relay wins).

Errors: `SpoolLinkError` (unparseable link / bad key encoding); `SpoolKeyError` (the link's `k=` cannot decrypt existing local data for that spool code — wrong or changed key; fails loud at open, never silent garbage). An unreachable relay is **not** an open error — it surfaces through `spool.status`.

---

## The `Spool` handle

One spool = one Y.Doc = one sync boundary = one link. Instance object — many spools can be open at once (no fosho-style module singleton).

```ts
interface Spool {
  readonly code: string
  readonly entries: Entry[]          // live truth: sorted by createdAt, soft-deleted excluded
  readonly deleted: Entry[]          // the complement: soft-deleted only, same handles/sort; restore() brings one back
  readonly whenReady: Promise<void>  // local persistence loaded (same signal open/new await)
  readonly status: 'offline' | 'connecting' | 'connected'
  readonly roomFull: boolean         // the relay refused the last connection with 1013 "room full" (T-169); clears when one is accepted
  readonly keyFingerprint: string | null  // 8 chars for "same key?" UX; null for keyless spools
  readonly undecryptableFrames: number    // relay frames dropped: someone in the room is on the wrong key / no key (T-051); always 0 for keyless spools
  readonly pocket: PocketState | null     // what the relay's pocket did on open (M10); null = keyless/relayless spool, no pocket by construction
  readonly doc: Y.Doc                // escape hatch for power users binding editors
  readonly awareness: Awareness | null  // the engine's shared-across-both-transports awareness (M11, T-112); null when relayless. App-defined payload, best-effort, EPHEMERAL BY DESIGN — state expires ~30 s after its writer goes quiet; never persist it (ghost presence is a named refusal). Sealed on keyed spools by construction: awareness frames are indistinguishable from sync frames on the wire

  readonly history: number[]         // recorded moment timestamps (ms), ascending — what rewind() can target; the scrubber's tick marks

  wind(input: WindInput): Entry
  on(event: 'entry', cb: (change: EntryChange) => void): () => void   // returns unsubscribe
  on(event: 'status', cb: (status: Spool['status']) => void): () => void
  on(event: 'undecryptable', cb: (total: number) => void): () => void // fires per dropped frame with the running total — "someone here isn't on your key" UX
  on(event: 'pocket', cb: (state: PocketState) => void): () => void   // additive event (the status union stays closed); never fires for keyless spools
  on(event: 'full', cb: (reason: string) => void): () => void         // additive (T-169): fires with the relay's close reason on every refused attempt while the room is full

  share(): string                    // the shareable link
  rewind(ts: number): EntrySnapshot[]  // the spool as it was at the latest recorded moment ≤ ts; see "rewind()" below
  export(): string                   // the portable file (JSON text), yours forever; see "export() and the stash" below
  leave(): Promise<void>             // final history moment → final pocket deposit → teardown: webrtc → websocket → idb → doc.destroy()
}

interface WindInput {
  kind: string          // app-level flavor; protocol doesn't care
  body?: string         // initial body text (creates the Y.Text lazily)
  parent?: string       // entry id — threading, reactions, replies
  data?: Record<string, unknown>  // plain-JSON machine fields; write-once by convention (whole-value LWW). Body stays the human text
}
```

`wind()` is synchronous and returns the **live Entry handle** immediately (decision: DESIGN_DOC §5) — local-first means there's nothing to await. Sync happens in the background.

`leave()` disconnects and releases resources. Local IndexedDB data is **retained** — a spool is a keepsake. (Deleting local data is a stash/archive concern, M8.)

**A full room says so** (T-169). `spools-relay` closes the 65th connection to a room with code 1013 ("room full"); y-websocket's default would reconnect at once and forever, which an app sees as an endless connecting spinner. The SDK treats 1013 as "stand back": `roomFull` turns true, `on('full')` fires with the close reason, `status` reads `offline` (not `connecting`) while it waits ~30 s, then it tries once more — refused again, it says so again. The moment a connection is accepted, `roomFull` clears. The status union stays closed; this sits beside it, like `pocket`.

## Events: diff + getter, no replay

`on('entry')` delivers diffs; `spool.entries` is always the whole truth:

```ts
interface EntryChange {
  added: Entry[]
  updated: Entry[]     // metadata changes AND body edits both land here
  deleted: Entry[]     // soft-deleted this change
}
```

Contract (decision: DESIGN_DOC §5):
- **No replay on load.** Opening a spool with 40 entries fires zero events. `await spool.whenReady`, render from `spool.entries`, then events describe changes after that point.
- A naive client may ignore the payload entirely and rerender from `spool.entries` on any event — that path can never drift out of sync.
- Events are batched per Yjs transaction (one remote sync burst = one event, not one per entry).

## The `Entry` handle

A **live view** over the underlying Yjs state — never a snapshot. The same object everywhere: returned by `wind()`, held in `spool.entries`, delivered in `EntryChange`.

```ts
interface Entry {
  readonly id: string          // uuid
  readonly author: string      // self-declared in v1 — trust, not proof (DESIGN_DOC §6)
  readonly kind: string
  readonly parent?: string
  readonly createdAt: number   // wall-clock ms, writer's clock
  readonly deletedAt?: number
  readonly data?: Record<string, unknown>  // machine fields from wind time; read-only by convention (mutations don't sync)

  body: string                 // getter/setter over the Y.Text; '' if no body exists
  readonly text: Y.Text | null // raw Y.Text for editor bindings; null until a body exists
  readonly children: Entry[]   // entries whose parent === this.id (soft-deleted excluded, like spool.entries)

  delete(): void               // soft: sets deletedAt (DESIGN_DOC §5)
  restore(): void              // clears deletedAt — archiving falls out free
}
```

Setting `entry.body` on an entry with no body creates the `Y.Text` at that moment (lazy bodies, DESIGN_DOC §5). Writing `body` replaces content wholesale — fine for simple cases; concurrent-edit-safe flows should bind to `entry.text`.

---

## Document shape (what's actually in the Y.Doc)

- `Y.Map` named `entries` — one nested `Y.Map` per entry id, holding `{ id, author, parent, kind, createdAt, deletedAt, data? }`. Plain values, last-write-wins per field — acceptable because metadata fields are write-once or tombstones. `data` is a plain-JSON object of machine fields (a track's url/title/artist), written once at wind time (T-030 verdict, §5); the human text lives in the body.
- Per-entry `Y.Text` at doc root, keyed `entry:<id>` — created lazily, only when a body exists. Absence of the key = no body.
- `Y.Array` named `history` — append-only `{ ts, snap }` moments for `rewind()` (T-060): wall-clock ms + base64 `Y.Snapshot`. Elements are plain JSON, written once, never edited.
- Clients ignore `kind`s **and metadata fields** they don't understand — the forward-compatibility rule. (This is what makes a future `data` or `sig` field additive.)

## Link format

```
https://anyhost.example/#spool=<code>&relay=<wss-url>&k=<key>
```

- Fragment only — browsers never transmit it to servers, including the host serving the client files.
- `code`: `adjective-noun-NNN` (readable) — generator/validator adapted from fosho `note.ts`.
- `relay`: URL-encoded wss URL; the link says where to rendezvous, no hardcoded servers.
- `k`: 32-byte key, URL-safe unpadded base64. Absent = unencrypted spool. What `k=` guarantees, per layer (T-050/T-051, §5):
  - **Storage**: XSalsa20-Poly1305 seals every IndexedDB row (no KDF — the 32 random bytes are the key). Wrong key fails loud at open (`SpoolKeyError`).
  - **Websocket transport**: every frame leaves as `0xE2E1‖nonce‖ciphertext` (same secretbox, same key) — the dumb relay forwards bytes it cannot read. Inbound frames that don't carry the magic and decrypt are dropped + counted (`undecryptableFrames` / `on('undecryptable')`), never handed to Yjs — a wrong-key or keyless peer on the same room code cannot corrupt the doc.
  - **WebRTC transport**: y-webrtc's own `password` scheme (PBKDF2 → AES), fed the literal `k=` string. Peers without the key can't join the mesh or read signaling payloads. This is a *second* crypto scheme, kept stock on purpose (§5 two-transport decision).
  - Same link = same key — that's the contract. There is no key exchange; the social act of sharing the link *is* the key exchange.

## rewind() — the memory feature (M6, T-060)

Read-only time travel. `rewind(ts)` rebuilds the doc as of the **latest recorded moment ≤ ts** and returns plain frozen records — never live handles, and the present is never mutated:

```ts
interface EntrySnapshot {
  readonly id: string
  readonly author: string
  readonly kind: string
  readonly parent?: string
  readonly createdAt: number
  readonly deletedAt?: number   // present if the entry was soft-deleted at that moment — memory includes the deleted
  readonly data?: Record<string, unknown>
  readonly body: string         // body text as it read at that moment; '' if none existed
}
```

- Entries soft-deleted *as of that moment* **appear**, with `deletedAt` set — remembering is the point; the caller filters if it wants the then-visible view. Same sort as `spool.entries` (createdAt, id tie-break).
- **Moments**: whichever peer writes also logs, debounced on idle (2 s after a local change, ≥ 10 s apart), into a `history` root `Y.Array` of `{ ts, snap }` — wall-clock ms plus a base64 `Y.Snapshot` (~0.5 KB, measured). The log syncs and merges like everything else, so every peer scrubs through everyone's moments. `spool.history` lists them.
- **Errors**: `rewind(ts)` earlier than the first recorded moment throws `SpoolHistoryError` — loud, not an empty array pretending the spool didn't exist. A moment referencing peer changes this device hasn't synced yet is skipped (falls back to the nearest earlier satisfiable one); if none qualifies, `SpoolHistoryError`.
- **Price** (§5, measured in `scratch/spike-rewind`): every doc runs `gc: false` — +34% on a realistic 200-entry spool (94 vs 70 KB). The honest asterisk: wholesale body rewrites keep ~90 B each forever; heavy editor churn on one body grows linearly. History begins the day a spool first runs post-T-060 code — content gc'd before that is unrecoverable (silently empty bodies, verified).

## export() and the stash (M8, T-080)

**`spool.export(): string`** — synchronous (it's all local), returning pretty-printed JSON in format (c) per §5: one file, two halves of the same spool.

```ts
interface SpoolExport {
  format: 'spool-export'
  version: 1
  code: string
  exportedAt: number
  entries: EntrySnapshot[]  // the human half: every entry, soft-deleted included (marked), display order — readable in 2040 with no software
  doc: string               // the machine half: base64 (RFC 4648 §4) of Y.encodeStateAsUpdate — full CRDT history, rewind moments included
}
```

Encrypted spools export **decrypted** (the holder has the key; a keepsake you can't read isn't one) and the key is **never in the file** — an export is content; the link stays the only key carrier. Say so in UI.

**`importSpool(file, opts?): Promise<Spool>`** — brings a file back to life. The embedded doc is *applied*, not copied — Yjs merge semantics — so importing into an empty browser restores the spool and importing over existing local state reunifies histories; no clobber path exists. **No relay is contacted unless `opts.relay` is passed**: an export must open even when the relay is long gone (offline-forever). `opts.key` re-seals storage/transport if you still have the link. Throws `SpoolExportError` on anything unreadable — loud, never a silent empty spool.

**The stash** — local archive management; `stash` graduates from reserved word (§2) to shipped surface:

```ts
stash.list(): Promise<StashedSpool[]>   // union of kept IndexedDB databases + registry rows, most recent first
stash.label(code, label): void          // name a keepsake
stash.archive(code, archived): void     // shelf flag — kept but set aside; nothing disconnects
stash.forget(code): Promise<void>       // THE one hard delete in the system: removes the local database + registry row.
                                        // Rejects while the spool is open (leave() first). Clients owe it confirm-twice ceremony.
```

`StashedSpool`: `{ code, stored, link?, label?, archived?, lastOpened? }`. The registry lives in localStorage and **stores the full link, `k=` included** — deliberately: same device, same trust boundary as the browser history that already carries the link, and without it a sealed spool in the stash could never be reopened or exported. Persisted spools are stamped into the registry automatically on open; a link is only recorded when it carries something (relay/key), so an import never downgrades a stored sealed link.

## The pocket (M10)

For a **keyed** spool with a relay, the SDK quietly closes the midnight gap
(SPEC §6): on open it collects whatever sealed deposits the relay's pocket
holds, decrypts client-side, and merges — fetched entries arrive through the
ordinary `entry` events, so rendering costs clients nothing; and while you
write, it deposits the sealed whole spool back, debounced (~10 s, ≥ 60 s
apart), with a final flush inside `leave()`. Keyless spools skip all of it
structurally — no key, no namespace token, no pocket ("ciphertext or
nothing" is physics here, not policy; their async option is
`spools-keeper`).

```ts
type PocketPhase = 'checking' | 'applied' | 'empty' | 'unavailable'

interface PocketState {
  phase: PocketPhase
  applied?: number   // deposits merged (once settled)
  dropped?: number   // deposits dropped unapplied — bad envelope or failed authentication (counted, never handed to Yjs)
  depositError?: 'too-big' | 'budget' | 'rate-limited'  // the relay refused a deposit — see below
}
```

- `depositError`: `too-big` (413) and `budget` (507) are hard relay limits —
  depositing stops and the spool degrades, loudly, to live-only.
  `rate-limited` (429, T-178) is the soft one: the final deposit —
  `leave()`'s flush, or a hidden tab's — was refused through the bounded
  retry, so the pocket lacks the last changes; it clears on the next deposit
  the relay accepts. Read it after `await leave()`; it is the one moment the
  answer matters.
- **Leaving under a rate limit** (T-178): `leave()` retries a 429'd final
  deposit three times inside ~5 s (waits of 1 s, then 2 s — the relay's
  per-IP budget is a sliding minute, so waiting is the remedy) before naming
  the loss; it never goes quiet. A scheduled deposit that meets a 429 re-arms
  itself after the min-gap instead of waiting for the next change. Deposits
  that seal to ≤ 64 KiB go out with `keepalive: true`, so a flush started by
  `visibilitychange` outlives the tab that started it (bigger ones cannot
  carry the option — browsers refuse it).
- **Memory-only clients have no heal** (T-178): deposit-if-ahead repairs a
  lost deposit on the next open only when local persistence still holds the
  winds. A `persist: false` spool — a preview, a headless builder, a keeper
  before its file restore — loses what a refused or interrupted final deposit
  carried, and a builder that exits without `leave()` has deposited nothing:
  `await leave()` and read `depositError` before the process goes away.

- `unavailable` covers every kind of nothing: an old relay (detected by the
  §6 envelope rule — a bare `200` is never "empty"), a dead relay, a future
  envelope version. All of them degrade to exactly v1 behavior; the pocket
  never blocks `open()`, and `whenReady` stays purely local.
- Repopulation is automatic: on open the SDK re-deposits when local state is
  ahead of the pocket (covers TTL expiry and relay wipes) or when the newest
  deposit is older than half the advertised TTL (quiet-but-loved spools stay
  covered).
- **The honest loss window**: a tab slammed shut mid-session loses at most
  the last debounce of *pocket coverage* (`sendBeacon` can't carry a real
  spool — the 64 KiB budget vs a measured 94 KB doc). Nothing is ever lost
  locally; the gap is only in what the relay holds for absent friends, and
  it heals on the next open of a persisted spool. `visibilitychange →
  hidden` narrows it with a best-effort flush that, for spools sealing to
  ≤ 64 KiB, rides `keepalive` and so outlives the tab (T-178).

## Under the hood (M1 shape)

Per-spool instance bundles: `Y.Doc` + `IndexeddbPersistence` (db name = spool code) + `WebsocketProvider` (room = spool code) + `WebrtcProvider` (same room, **sharing the websocket provider's awareness**, per fosho `sync.ts:1032`). Websocket is the reliable path; WebRTC the low-latency bonus — redundant, not competing. Extraction source: the distilled `connectToNote` / `disconnectFromNote` (fosho `sync.ts:950–1143`) minus identity, permissions, subdocs, addressing, singletons.

## Deferred surface (designed later, listed so names stay reserved)

- `splice` — reserved verb, no design.

### Parked with evidence (M11 — the room shipped these as app conventions; promotion waits for a second client to want them)

- **Profiles / seats** — `room:profile` entries keyed by an opaque per-device
  seat id, newest-wins at render. Any promoted surface must preserve D1's
  rules: seat ids stay opaque + variable-length, several seats may map to one
  person, `author` keeps being written.
- **Presence payload conventions** — `awareness` `room` field
  (`{ seat, typing?, read? }`), transitions-only typing, the latecomer
  re-touch nudge (T-111), pagehide cleanup. A `presence` event or helper
  would calcify exactly the contracts §5 says calcify hardest — evidence
  first.
- **Ephemeral read markers** — the D4 decision (T-110): reading writes
  nothing to the doc, ever. Any future persisted variant starts from
  append-only newest-wins entries, never body-rewrite (measured quadratic).
- **Pocket ring tag persistence** — pocket.ts's 4-byte tag is per-instance,
  so every reload takes a fresh ring slot (T-124 evidence). A localStorage
  tag beside `spool-author` would pin one slot per device.
- **`stash.remember(code, link)`** — syrup mirrors `touch()`'s localStorage
  write by hand (same key, same row shape) because its satchel opens with
  `persist: false`. A vessel coupled to a private format is the evidence;
  T-179 is the review.
- **The `splice` family — fork / retelling / rejoin** — evidence from four
  sources: the spools-of-spools spike (fork keeps lineage; reunion by a
  dual-key human), syrup's shipped `/branch` convention and its `/splice`
  + `/rejoin` ask, lore's brief, and the owner's reel riff (forgetting as
  cutting a new reel). T-180 is the review; it waits on the riff.
- *(Not parked, a bug: pocket deposits lost at `leave()` under 429 or
  unload — T-178.)*
