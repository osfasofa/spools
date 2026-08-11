# `spools` SDK — API design note

> **Status: design, not spec.** The protocol spec is written last, from working code (DESIGN_DOC §4). This note is the target we build toward; revise it when the code teaches us something. Decisions referenced here are logged in DESIGN_DOC §5.

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
}
```

### `openSpool(link, opts?): Promise<Spool>`

Accepts a full URL, a bare fragment (`#spool=…&relay=…&k=…`), or a bare spool code (uses default relay, no key). Resolves when local persistence has loaded — **not** when the network syncs; a spool opens instantly offline and catches up when peers appear. `opts` is `NewSpoolOptions` minus `relay` (the link's relay wins).

Errors: `SpoolLinkError` (unparseable link / bad key encoding). An unreachable relay is **not** an open error — it surfaces through `spool.status`.

---

## The `Spool` handle

One spool = one Y.Doc = one sync boundary = one link. Instance object — many spools can be open at once (no fosho-style module singleton).

```ts
interface Spool {
  readonly code: string
  readonly entries: Entry[]          // live truth: sorted by createdAt, soft-deleted excluded
  readonly whenReady: Promise<void>  // local persistence loaded (same signal open/new await)
  readonly status: 'offline' | 'connecting' | 'connected'
  readonly doc: Y.Doc                // escape hatch for power users binding editors

  wind(input: WindInput): Entry
  on(event: 'entry', cb: (change: EntryChange) => void): () => void   // returns unsubscribe
  on(event: 'status', cb: (status: Spool['status']) => void): () => void

  share(): string                    // the shareable link
  rewind(ts: number): EntrySnapshot[]  // M6; see notes below
  export(): Promise<Blob>            // M8; portable file, yours forever
  leave(): Promise<void>             // teardown: webrtc → websocket → idb → doc.destroy()
}

interface WindInput {
  kind: string          // app-level flavor; protocol doesn't care
  body?: string         // initial body text (creates the Y.Text lazily)
  parent?: string       // entry id — threading, reactions, replies
}
```

`wind()` is synchronous and returns the **live Entry handle** immediately (decision: DESIGN_DOC §5) — local-first means there's nothing to await. Sync happens in the background.

`leave()` disconnects and releases resources. Local IndexedDB data is **retained** — a spool is a keepsake. (Deleting local data is a stash/archive concern, M8.)

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

  body: string                 // getter/setter over the Y.Text; '' if no body exists
  readonly text: Y.Text | null // raw Y.Text for editor bindings; null until a body exists
  readonly children: Entry[]   // entries whose parent === this.id

  delete(): void               // soft: sets deletedAt (DESIGN_DOC §5)
  restore(): void              // clears deletedAt — archiving falls out free
}
```

Setting `entry.body` on an entry with no body creates the `Y.Text` at that moment (lazy bodies, DESIGN_DOC §5). Writing `body` replaces content wholesale — fine for simple cases; concurrent-edit-safe flows should bind to `entry.text`.

---

## Document shape (what's actually in the Y.Doc)

- `Y.Map` named `entries` — one nested `Y.Map` per entry id, holding `{ id, author, parent, kind, createdAt, deletedAt }`. Plain values, last-write-wins per field — acceptable because metadata fields are write-once or tombstones.
- Per-entry `Y.Text` at doc root, keyed `entry:<id>` — created lazily, only when a body exists. Absence of the key = no body.
- Clients ignore `kind`s **and metadata fields** they don't understand — the forward-compatibility rule. (This is what makes a future `data` or `sig` field additive.)

## Link format

```
https://anyhost.example/#spool=<code>&relay=<wss-url>&k=<key>
```

- Fragment only — browsers never transmit it to servers, including the host serving the client files.
- `code`: `adjective-noun-NNN` (readable) — generator/validator adapted from fosho `note.ts`.
- `relay`: URL-encoded wss URL; the link says where to rendezvous, no hardcoded servers.
- `k`: 32-byte key, URL-safe unpadded base64. Absent = unencrypted spool. Parsed and carried from M1; cryptographically live in M5.

## Under the hood (M1 shape)

Per-spool instance bundles: `Y.Doc` + `IndexeddbPersistence` (db name = spool code) + `WebsocketProvider` (room = spool code) + `WebrtcProvider` (same room, **sharing the websocket provider's awareness**, per fosho `sync.ts:1032`). Websocket is the reliable path; WebRTC the low-latency bonus — redundant, not competing. Extraction source: the distilled `connectToNote` / `disconnectFromNote` (fosho `sync.ts:950–1143`) minus identity, permissions, subdocs, addressing, singletons.

## Deferred surface (designed later, listed so names stay reserved)

- `rewind(ts)` — Yjs snapshot history (M6). Known constraint to investigate: snapshots need `gc: false` on the doc; measure the size cost before committing.
- `export()` / stash (M8).
- `splice` — reserved verb, no design.
