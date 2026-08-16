# Spool — Design Document

> **An artifact that can change, that's passed around.**
> Ad hoc side channels between people — not a place you go, a thing you hold.

This is the founding reference document for Spool: a small protocol, SDK, relay, and reference client for intimate, local-first, peer-to-peer shared spaces. It captures the philosophy, architecture, vocabulary, and build order agreed during the initial design sessions.

**The protocol's source of truth is now [SPEC.md](SPEC.md)** (written from the working system, M7): the spec is the *what*, this document remains the *why* — philosophy, architecture rationale, and the decisions log (§5). Where a §3 sketch below and SPEC.md disagree, SPEC.md wins.

---

## 1. What Spool is

Spool is a protocol for two (or a few) people to share a living document — a mixtape, a chat, a blog, a board — with **no central server that ever sees their content**. Each person holds their own complete copy. Copies sync live when people are online together, reconcile automatically when they reconnect, and persist locally forever as memory even if they never sync again.

The shared thing is called a **spool**: a compact object you make, wind entries onto, and hand to someone as a link.

### Philosophy (the non-negotiables)

- **No central server owns the data.** Relays are dumb, encrypted-blind, and interchangeable. Anyone can run one.
- **No discovery, no feed, no search.** The only way into a spool is a link handed to you by a person. The remaining friction is social, not technical — and that friction is the point. A spool means something because someone gave it to you.
- **Power to the person.** Data lives on the user's device. Export, archive, and delete are first-class. A spool is a keepsake, not an account.
- **Hard stuff sinks below the waterline.** CRDTs, NAT traversal, key handling — invisible. What's left visible is deliberate, human-scale effort.
- **Adoption is optional.** This exists to be good, not to be big. No growth loops. Chasing adoption metrics leads to the diseases this project is the antidote to.
- **Intimate scale by design.** Built for "me and you and this link," not for networks of strangers. This is the lane competitors (Matrix, ActivityPub, Nostr) don't occupy: they federate strangers; Spool connects friends.

### Origin / lineage

- **fosho.io** — production-proven prior art: Yjs + y-webrtc + y-websocket + y-indexeddb, room-as-URL, encryption with key in URL fragment, ~200-line relay. Spool's engine is a stripped-down extraction of fosho's `sync.ts`.
- **blackpeople.lol** — the shipped mixtape toy (Astro static site, git-based, giscus comments). Not built on Spool, but establishes the mixtape-trading UX that becomes Spool's reference client concept and cultural entry point.

---

## 2. Vocabulary

The metaphor budget is spent deliberately: one vivid noun, two vivid verbs, everything else boring on purpose (the Unix pattern — "file" is boring, "pipe" is vivid).

| Term | Meaning |
|---|---|
| **Spool** | The shared artifact. One spool = one Yjs doc = one sync boundary = one shareable link. |
| **Entry** | The generic unit of content inside a spool. Deliberately plain and kind-agnostic. |
| **wind** | Add an entry to a spool. `spool.wind({...})` |
| **rewind** | View a spool's history at an earlier point in time (Yjs snapshots). `spool.rewind(ts)` |
| **open** | Open a spool from a link. Kept boring and literal — the most load-bearing word. |
| `kind` | App-level flavor on an Entry. A mixtape client renders `kind: 'track'` entries as tracks; a chat client renders `kind: 'message'` entries as messages. The protocol doesn't care. |
| **stash** | Local archive management — the spools this device keeps: list, label, archive, and the system's one hard delete (`forget`). *Shipped in M8 (T-080).* |
| **pocket** | The relay's optional held-copies capability (M10): it keeps the last few sealed full-state deposits per room, so the spool is there when a friend opens the link while the writer sleeps. Named by the owner; *mailbox* was passed over because it implies an addressee and Spool has none — a pocket just holds. *(M10, in progress.)* |
| **deposit** | One sealed full-state copy dropped into the pocket. Boring on purpose. *(M10, in progress.)* |
| **splice** *(reserved)* | Possible future verb for merging/threading spools. |

- Package name: **`spools`** (verified available on npm as of Aug 2026; bare `spool` is a dead squat). Claim it with a 0.0.1 stub early.
- Naming rejected along the way, for the record: *yarn* (npm collision), *reel* (Instagram collision), *fable* (model-name mixup, never actually chosen), *bundle/parcel* (bundler collisions), *tape/track/cut* (music-locked).
- The sentence test that settled it: *"Every spool is a list of entries. Wind new ones on, rewind to see how it grew."* — zero glossary required.

---

## 3. Architecture — four layers

Three visible prongs (protocol, relay, client) plus the secret fourth layer that determines success: the SDK. **Nobody adopts a spec; they adopt a library.** The graveyard of P2P protocols (Braid, Textile, much of the Dat ecosystem) is full of real specs and real relays that never had a delightful `joinRoom()` moment. The SDK is the actual product.

```
┌─────────────────────┐  ┌─────────────────────┐
│  Reference client    │  │  Other clients       │   Layer 4: swappable UIs
│  (static files)      │  │  (anyone, anything)  │
└──────────┬──────────┘  └──────────┬──────────┘
           └────────────┬────────────┘
              ┌─────────▼─────────┐
              │   SDK: `spools`    │              Layer 2: the product
              │ open · wind ·      │
              │ rewind · storage   │
              └─────────┬─────────┘
        ┌───────────────┴───────────────┐
┌───────▼────────────┐      ┌───────────▼───────┐
│  Protocol spec      │      │  Relay             │   Layers 1 & 3
│  (room, Entry, wire)│      │  (dumb, 1-command) │
└─────────────────────┘      └───────────────────┘
```

### Layer 1 — Protocol (the spec)

Brutally small. Every sentence in a spec is a sentence every future client author must implement. It defines exactly four things:

**1. Spool identity & links.** A spool is identified by a code string. A shareable link:

```
https://anyhost.example/#spool=<code>&relay=<wss-url>&k=<key>
```

Two critical properties:
- The **relay URL travels in the link**, making clients host-independent. The link itself says where to rendezvous — no hardcoded servers.
- The **encryption key lives in the URL fragment** (after `#`), which browsers never transmit to servers. Even the host serving the client files cannot see the key. (Proven pattern from fosho.)

**2. Document shape (the Entry model).** One spool = one Yjs doc containing:

- A `Y.Map` named `entries` — metadata per entry:
  ```
  { id, author, parent, kind, createdAt, deletedAt }
  ```
- Per-entry `Y.Text` bodies keyed `entry:<id>` — the actual content (markdown/plain text).

Rules and rationale:
- **Bodies are `Y.Text`, never plain strings in the map.** Plain strings give last-write-wins (someone's edit silently vanishes); `Y.Text` merges character-by-character with no conflicts.
- **`parent` gives threading for free** — comments on posts, reactions on tracks, replies on messages, sub-entries on entries — all the same recursive mechanism, no special cases.
- **Deletes are soft** (`deletedAt`, hidden in UI). Hard deletes in CRDT-land get weird when someone else was mid-edit. Bonus: archiving is the same mechanism, reversible.
- **Clients ignore `kind`s they don't understand.** This single rule is the forward-compatibility story (same as email clients ignoring unknown attachment types).

**3. Wire protocol: don't invent one.** The spec says: *Yjs sync protocol over y-websocket and y-webrtc, as-is.* This feels like cheating; it is the biggest strategic advantage:
- Every Yjs binding (React/Vue/Svelte/ProseMirror/CodeMirror) already works with Spool.
- The *messages* are stock Yjs; only the relay's role differs. A Spool relay is a dumb byte broadcaster (see Layer 3) that forwards frames without parsing them. Standard y-websocket servers are **not** compliant relays: `setupWSConnection` parses every message and materializes a plaintext server-side copy of the doc — they see content, and they cannot carry Spool's encrypted frames at all. (Discovered while auditing fosho: its encrypted rooms silently don't sync over websocket — only over WebRTC.) They remain usable as a rendezvous for spools whose members accept a content-visible relay, documented as such and nothing more.
- Trade-off accepted: coupled to Yjs's format. Yjs is the most battle-tested CRDT library with strong momentum — the right dependency to take.

**4. Encryption.** Client-side encryption; key in the fragment; relay sees only ciphertext and handshakes. This is what makes "the relay isn't a central server that owns you" *true* rather than marketing. fosho's `EncryptedIndexeddbPersistence` and encrypted websocket wrapper are the prior art to extract.

### Layer 2 — SDK (`spools`)

The entire adoption story. API surface fits in a tweet:

```js
import { openSpool, newSpool } from 'spools'

const spool = await openSpool(link)      // someone handed you this
const spool = await newSpool()           // starting fresh

spool.wind({ kind: 'track', body: '...' })   // add an entry
spool.on('entry', render)                    // watch it grow
spool.rewind(timestamp)                      // view history
spool.share()                                // → the shareable link
spool.export()                               // portable file, yours forever
spool.leave()
```

Under the hood: fosho's `sync.ts` stripped to ~150 lines — `Y.Doc` + IndexedDB persistence + websocket provider + webrtc provider, spool code as the single sync boundary (doubles as the IndexedDB database name and the room name on both providers). Websocket is the reliable path; WebRTC is the low-latency bonus. Both sync the same doc; they're redundant, not competing.

Design principles:
- **The API should feel like handing someone a tape, not configuring a network.** Object words (make/open/hand), not session words (start/join/connect).
- Entry helpers so nobody touches raw `Y.Map`/`Y.Text` — but expose the raw doc as an escape hatch for power users binding editors.
- Entry bodies: `entry.body` string getter + setter for simple cases; `entry.text` as the raw `Y.Text` for editor bindings.
- Framework-agnostic, zero config beyond the link/code. One npm package.
- **Stripped from fosho, not inherited:** identity/keypairs, permissions, subdocuments, addressing. None of it is needed for v1. Resist re-adding until a real client demands it.

### Layer 3 — Relay (aggressively boring)

Design goal: **so dumb that running one is trivial and trusting one is unnecessary.** Exactly two jobs (a third deferred):

1. WebRTC signaling — introduce peers so they can connect directly.
2. Websocket byte relay — per-room broadcast of **opaque frames**; the reliable sync path when direct P2P fails (NAT) or as the always-works default. The relay never parses a frame and never holds a doc. This is what makes "relay never sees content" literally true rather than aspirational, and it's what lets encrypted frames pass through unchanged.
3. *(Shipped, M10 — the pocket, SPEC §6.)* Optional sealed-deposit storage so a spool syncs even when peers are never simultaneously online: clients deposit the whole spool sealed under key-derived namespaces; the relay holds the newest per session tag, TTL'd, reading nothing past a 7-byte header. Keyed-only — ciphertext or nothing. (The frame-log sketch that used to sit here was retired on evidence — §5 and docs/M10-async-brief.md.)

- fosho's ~200-line `server.js` provides the signaling half verbatim; its y-websocket half (which parses messages and keeps a server-side doc) gets **replaced** by the dumb broadcaster. Half extraction, half small invention — gated by a feasibility spike (do y-websocket clients complete their sync handshake through a pipe that only forwards? peers answer each other's sync steps, so they should — verify first).
- Ship as `npx spools-relay` + a one-click Railway/Fly deploy button in the README. **If spinning up a relay takes longer than making coffee, the self-hosting promise has failed.**
- **Zero relay-to-relay coordination.** No federation, no directory, no chatter. A spool lives on whichever relay its link names. Radically simpler than Matrix-style federation, and sufficient for intimate scale.

Honesty clause for the README: pure zero-server P2P discovery doesn't exist on the modern internet — two browsers behind home routers need *some* rendezvous point (NAT traversal). "No central server" precisely means **"no server that ever sees your content."** The relay touches a tiny encrypted handshake and gets out of the way. Don't overpromise past this.

### Layer 4 — Reference client (the proof)

- **Pure static files.** HTML/JS, no build server, no backend. Drop the folder on Vercel, Netlify, GitHub Pages, a Raspberry Pi, or a USB stick — it works, because the client is static files that talk to whatever relay the link names.
- First vessel: **mixtape trading.** Low-stakes, warm, inherently two-person, self-explaining ("I made you a spool" needs no onboarding). Every successful protocol had a killer demo that *was* the pitch (RSS had podcasts).
- Should demo Entry's flexibility: two or three renderers (mixtape view, chat view, list view) over the *same spool*, so people viscerally get that views are skins over one data model.

---

## 4. Build order

Sequenced to always have something working, never to design in the abstract. The spec is written **last** — describing what demonstrably works, not what might. Spec-first is how protocol projects die in RFC purgatory; you write the constitution after the country exists.

- [x] **0. Ship the mixtape** — blackpeople.lol live *(done, Aug 2026)*
- [x] **1. SDK core** — strip fosho `sync.ts` → engine (~150 lines); Entry helpers (`wind`, `on('entry')`, soft delete); `openSpool`/`newSpool` parsing links. **Use fosho's already-deployed relay** — zero new infrastructure between here and a working demo. *(done Aug 2026, T-010–T-013)*
- [x] **2. Reference client v0** — ugliest possible list/chat on the SDK. Success = two browser tabs winding entries onto the same spool, surviving refresh (IndexedDB) and offline/reconnect. *(done Aug 2026, T-020–T-021; torture checklist lives in `apps/client/TESTING.md`)*
- [x] **3. Mixtape renderer** — second `kind` set (`track`, `reaction`), same engine, proves views-are-skins. *(done Aug 2026, T-030)*
- [x] **4. Relay packaging** — extract fosho `server.js` → `spools-relay`, `npx` + deploy button. *(done Aug 2026, T-040–T-041; canonical relay deployed, fosho dependency ended)*
- [x] **4.5 Encryption (M5)** — sealed at rest and on both wires; relay-blindness automated, not asserted. *(done Aug 2026, T-050–T-051; two-transport decision in §5)*
- [x] **5. `rewind()`** — Yjs snapshot history + a scrubber in the reference client. The memory feature; the demo that sells the vision. *(done Aug 2026, T-060–T-061; pitch asset at `docs/assets/rewind-demo.gif`)*
- [x] **6. Spec doc** — written from the working system. *(done Aug 2026, T-070: SPEC.md, three clean-room adversarial reads, zero blocking ambiguities on the final pass)*
- [x] **7. Export / stash** — spool as portable file; local archive management. *(done Aug 2026, T-080: format (c) — readable + lossless in one JSON file; stash shipped in SDK + client)*
- [ ] **Async sync — the pocket (M10)**: sealed state deposits + the keeper. Signed off Aug 2026; brief at [docs/M10-async-brief.md](docs/M10-async-brief.md), tickets T-100–T-107. *Code, spec (v1.1 §6), clients, and `spools-keeper` shipped Aug 2026 — remaining: the canonical-relay volume deploy (T-105, owner at keyboard) and npm publishes.*
- [ ] Later: encryption hardening pass, `splice`, more renderers (board, blog).

**Immediate errands:** ~~publish `spools@0.0.1` stub on npm to claim the name; check domains~~ *done Aug 2026 (T-002): `spools@0.0.1` published as the real SDK, `spools-relay@0.1.0` live, repo public under `osfasofa`, domains recorded-not-bought (existing URLs suffice — the link format is host-agnostic by design).*

> **Working roadmap:** this list is the milestone summary; the session-sized breakdown lives in [`tickets/INDEX.md`](tickets/INDEX.md). The SDK surface is designed in [`docs/SDK-API.md`](docs/SDK-API.md) (a design note, not the spec — the spec still comes last).

---

## 5. Design decisions log

Decisions made deliberately, with the reasoning — so future sessions don't relitigate them without new information.

| Decision | Choice | Why |
|---|---|---|
| CRDT | Yjs, wire protocol as-is | Battle-tested, huge ecosystem inherited for free; fosho proves it in production |
| Git in the sync path | **No** | fosho proves Yjs-only works; git remains interesting only as a personal snapshot/export target (see fosho's backup-daemon pattern: debounced commits on idle / peer-count-zero), deferred |
| Sync topology | Websocket relay (reliable) + WebRTC (bonus), same doc | Redundant paths, not competing; proven in fosho |
| Entry bodies | Per-entry `Y.Text` | Plain strings = last-write-wins data loss on concurrent edits |
| Threading | `parent` field, recursive | One mechanism for comments/reactions/replies/threads |
| Deletes | Soft (`deletedAt`) | Hard deletes conflict with concurrent edits; archiving falls out free |
| Federation | None | Intimate scale doesn't need it; simplicity is the feature |
| Spec timing | Last | Describe what works; avoid RFC purgatory |
| Metaphor budget | spool/wind/rewind vivid; Entry/open plain | Legibility over theme; Unix pattern |
| Friction philosophy | Technical friction hidden; social friction (link-from-a-person) kept | The remaining friction builds the bonds; it's the point |
| Repo shape | pnpm-workspaces monorepo: `packages/spools`, `packages/spools-relay`, `apps/client` | Three named deliverables from day one, no repo surgery later; plain workspaces, no turbo/nx *(Aug 2026 session)* |
| `wind()` return | Live Entry handle (`.id`, `.body`, `.text`, `.delete()`) | Same object the rest of the API hands out — free for callers who ignore it, saves a lookup for everyone else; breaking to add after example code exists |
| `on('entry')` payload | Diff events (`{added, updated, deleted}`) + `spool.entries` getter; no event replay on load (`whenReady` → read `entries` → events thereafter) | Naive clients rerender from the getter and can never drift; polished clients animate from the diff. Event contracts calcify hardest, so decided earliest |
| Entry bodies | Lazy `Y.Text` — `entry:<id>` created only when a body exists | Uniform model, one spec sentence. Structured `data` field deferred because it's purely additive later (clients ignore unknown fields); mixtape renderer is the forcing function |
| Relay role | True dumb byte relay — never parses frames | y-websocket servers keep a plaintext server-side doc and drop encrypted frames (proven in fosho); a broadcaster makes the privacy promise literally true. Feasibility spike gates the relay milestone |
| Authorship | `author` is a self-declared string in v1 | Trust, not proof — that *is* intimate scale. Banked: crypto attribution, if ever wanted, arrives as an additive `sig` field, never a migration |
| Relay persistence | Parked for v2 → **superseded by the pocket (M10 rows below, Aug 2026)** | Dumb relay keeps the door wide open (append forwarded bytes, replay on join); v1 story stays "syncs when we're together" |
| Client resync | Spool clients MUST run periodic resync (SDK sets `resyncInterval`, ~15–30 s) | A dumb relay can't answer a waiting peer; peers must re-ask. Proven in T-003: without it, offline-gap reunions never heal the waiting side (y-websocket sends SyncStep1 only at connect). Cost: one tiny state-vector frame per client per interval *(Aug 2026, T-003 spike)* |
| Deleted-entry access | `spool.deleted` getter — same live handles and sort as `entries` | The API's first consumer (T-020's client) needed a restore UI on day one and had to fall back to the raw-doc escape hatch; the getter mirrors `entries`, and `restore()` already lives on the handle *(Aug 2026, T-020)* |
| Structured entry data | Plain-JSON `data` field on entry metadata; body stays the human text | M3 verdict: markdown-smuggle is a schema hiding in a regex — unparseable in principle, a bug-compatible parser copy in every renderer, no independent field edits. Whole-value LWW is honest for fields written once at wind time; keeping the note in `body` preserves naive-view readability *(Aug 2026, T-030 verdict, user-approved)* |
| At-rest crypto shape | XSalsa20-Poly1305 (tweetnacl secretbox), `nonce‖ciphertext`, rows prefixed `0xE2E2`; **no KDF** — the link's 32 random bytes are the key; wrong key fails loud (`SpoolKeyError` at open); rotation = a new spool | Lifted from fosho per T-050 (production-proven primitives, zero invention). Key strength lives in the RNG — documented v1 property. Encrypted-then-stored per update; y-indexeddb-shaped store keeps the persistence swap invisible *(Aug 2026, T-050)* |
| Two-transport crypto | **Two schemes, both stock**: every websocket frame is secretbox-sealed (`0xE2E1‖nonce‖ciphertext`, same no-KDF key as at-rest); the rtc path uses y-webrtc's own `password` option, fed the literal `k=` string from the link (its PBKDF2→AES scheme, untouched). Inbound ws frames that don't carry the magic + decrypt are **dropped and counted** (`spool.on('undecryptable')`), never handed to Yjs — mixed rooms can't corrupt either side | Unifying on secretbox means forking/monkey-patching y-webrtc's data-channel internals — a maintained patch in the layer where bugs are silent corruption, and it loses y-webrtc's free signaling-payload encryption. Both halves as shipped are production-proven (fosho ran exactly this pair); the cost is two spec paragraphs instead of one. rtc needs app-level crypto either way: DTLS secures the wire, not the key boundary — anyone with just the room code could otherwise join the mesh. Relay-blindness is an automated test (instrumented relay, marker-leak control), not a claim *(Aug 2026, T-051, user-approved)* |
| Export format | **(c) Both halves in one JSON file**: readable `entries` array (all entries, soft-deleted marked) + full doc as base64 `doc` field + `format`/`version` fields. Encrypted spools export **decrypted**, key never in the file (the link stays the only key carrier). Import = `Y.applyUpdate` — a CRDT merge, no clobber path; no relay contacted unless asked (offline-forever). Stash registry (localStorage) stores the full link incl. `k=` — same device, same trust boundary as browser history | (a) raw blob alone fails "a non-technical person finds the file meaningful" (power to the person, §1); (b) JSON alone amputates CRDT history — no re-sync, no rewind: the view, not the spool. ~2× size of (a) is trivial at intimate scale. `stash.forget()` is the one hard delete in the system, owed confirm-twice ceremony *(Aug 2026, T-080, user-approved)* |
| History / gc policy | **Every spool runs `gc:false`** — no opt-in fork. Mechanism: a `history` root Y.Array of `{ts, snap}` moments (wall-clock ms + base64 Y.Snapshot, ~0.5 KB each), appended debounced-on-idle (2 s, ≥ 10 s apart) by whichever peer wrote; `rewind(ts)` rebuilds at the latest satisfiable moment ≤ ts and returns frozen plain `EntrySnapshot`s (soft-deleted-then entries included, `deletedAt` set) — the present never mutated | Measured (`scratch/spike-rewind`): +34% doc size on a realistic 200-entry spool (94 vs 70 KB), load time unchanged; honest asterisk: wholesale body rewrites keep ~90 B each forever. Opt-in history would fork the spec into two spool kinds **and** mixed-gc rooms poison memory — gc is per-doc, so one gc:on peer serves a gutted past to late joiners. Retro: content gc'd before T-060 is silently unrecoverable (empty bodies, verified) — history begins when this ships *(Aug 2026, T-060, user-approved)* |
| Async sync mechanism (M10) | **The pocket** — clients debounce-deposit the whole spool sealed (`0xE2E3‖version‖tag‖nonce‖ciphertext` of `Y.encodeStateAsUpdate(doc)`, same no-KDF key, magic family continued) via HTTP PUT to a **key-derived namespace** (`/pocket/<room>/<token>`, token = one-way domain-separated hash of the key — only link-holders can write or read the pocket; no key, no pocket). The relay keeps the newest deposit **per 4-byte session tag, ≤K≈4 tags** (a solo writer can never flush a diverged peer's worldview), TTL'd ~60 days with touch-on-read; on open, clients fetch after `whenReady`, drop-and-count anything that fails authentication, and `Y.applyUpdate` the rest — `importSpool` merge semantics, no clobber path. **Keyed-only: the relay stores ciphertext or nothing.** Deposits are not frames, so every §3/SPEC MUST NOT survives verbatim; capability is feature-detected (versioned envelope + `pocket` block in health JSON — an old relay's universal `200` must read as *no capability*, never "empty"); link grammar untouched | The flagship async gesture failed whenever writers and readers never overlapped (the midnight-mixtape gap). The banked §6 frame-log sketch retired on new evidence that postdates it: sealing made frames unclassifiable (the log is mostly resync/awareness chatter — a connected client emits ~180 SyncStep1s/hour), replay resurrects ghost presence, eviction strands causal deps (silent incompleteness), and plaintext rooms would get durably recorded server-side. Namespace + per-tag ring added in the PR #1 review round (griefable ring and solo-flush findings, both real). Full trade-off record: [docs/M10-async-brief.md](docs/M10-async-brief.md) *(Aug 2026, M10 brief + review round, user-approved)* |
| Pocket posture + keeper | Canonical relay runs the pocket **volume-backed**, TTL ~60 days, documented as a courtesy window, not an archive (memory-mode + scale-to-zero would evaporate deposits during exactly the gaps the pocket bridges — fly.toml's "stateless: scale-to-zero is safe" comment stops being true and gets revised in T-105). `npx spools-keeper <link>` is in scope as M10's optional last ticket: a headless always-on peer on hardware *you* control — zero protocol/relay/spec change, persistence via existing `export()`/`importSpool` | If the canonical relay opted out, default links would keep the broken first impression — M10 would fix the flagship story for nobody it's aimed at. The keeper keeps the canonical-relay decision from being load-bearing for people who distrust even a ciphertext-holding relay, and remains the philosophically pure answer (your data, your always-on device) *(Aug 2026, M10 brief, user-approved)* |
| Chat identity (M11) | **Seats + a shared profile table — an app convention, not a protocol change.** Each device generates a random **seat id** (an *opaque, variable-length string* — never parsed, never length-assumed), stamped on entries via `data`; display names live in reserved-kind profile entries keyed by seat, resolved newest-wins at render, so anyone can rename anyone retroactively. A seat is a **device, not a person**; the table must stay able to map several seats to one identity. `author` keeps being written for naive-client readability | `author` is fixed at open and frozen per entry — it structurally cannot support editable nicknames (T-020 friction #2, finally demanded by a real client). Full Ed25519 identity rejected as the untried top rung of §6's ladder. Opaqueness is the forward path: the seat id can become a signing public key and entries gain the banked additive `sig` field — never a migration. Never denormalize a name into a message (fosho's chat.ts did; renames never propagated) *(Aug 2026, M11 brief, user-approved)* |
| Mutable shared state (M11) | **Entries, not new root types**: chat name and profiles are reserved-kind entries (`room:*`), filtered from the message view, resolved newest-wins at render. Read receipts are **ephemeral, awareness-only** — "seen" rides the sealed awareness payload and dies with the tab; nothing about reading is ever wound into the doc (D3 amended, D4's body-rewritten cursor rejected on T-110's numbers) | Keeps mutation inside the sanctioned model for names/profiles: naive clients render reserved kinds via the unknown-kind fallback, `rewind()` covers them, no private structure invented. The receipt call: T-110 measured the signed-off body-rewrite cursor as **quadratic** — each rewrite adds a delete-set range that never merges (the history log's own moment items interleave with the tombstones in the client's clock sequence), and every later moment re-encodes the whole ds: cumulative ~2.7·n² B, so ~2 000 advances spend the entire 8 MiB deposit cap and a scrolling lurker gets there in ~5½ hours of room lifetime. The flat alternative (append-only `room:read` entries, newest-wins, ~359 B/advance) was offered and declined — zero permanent cost won over persistence. Any future persisted-receipt revisit starts from the append-only idiom, never body-rewrite. Corollary worth keeping: moments measured ~73 B in append-only rooms, not the feared ~0.5 KB — sustained body-rewriting is the one shape that makes history explode, which T-120's edit story must respect *(Aug 2026, T-110 numbers, user-decided)* |
| Relay knobs at group scale (M11) | **`POCKET_K` 4 → 8 and `POCKET_PUTS_PER_MIN` 12 → 24 on the canonical relay; the 64-conn/room guard stays, now documented.** No new capability, no new endpoint — defaults and docs only; the relay stays dumb | T-110 measured the K=4 group failure live: 5 partitioned seats depositing before any merge silently evict one worldview, survivors can never re-deposit it (their state is already covered — not "ahead"), and only the evicted writer's own return heals the ring. K=8 covers the brief's 5–8-seat target plus reload churn (the ring tag is per-instance). **The bound moves, it doesn't vanish** — 9+ divergent writers still outrun it (measured: 40/45 for a cold joiner, healed to 45/45 by the returning writer) and the relay README's honesty section says so. PUTs/min doubled because clients self-pace to ~1 deposit/min each, so 24 ≈ 24 sustained same-NAT devices. Cost acknowledged: worst-case cold-open download is K sealed full-state copies. Re-verified post-change: 5 divergent seats → 5/5 deposits held, cold joiner reconstructs 25/25 *(Aug 2026, T-124, user-approved)* |
| Presence (M11) | **Raw awareness, app-defined payload; the SDK gains only a `get awareness()` passthrough** — no presence API, no new events, no protocol change. Sealed by construction: the encrypted transport substitutes the WebSocket class below the y-protocols layer (encrypted-ws.ts), so awareness frames cannot leak plaintext to the relay | Awareness already exists, shared across both transports (engine.ts:117), and SPEC §3 already blesses it as OPTIONAL/app-defined/best-effort. fosho passed awareness unsealed — the one part of its presence story not to inherit. App-first (M11 D5): real SDK surface waits for this app's evidence; this table's own event-contract row says why. Ghost presence stays a refusal — ephemera must never persist *(Aug 2026, M11 brief, user-approved)* |

---

## 6. Open questions (parked, not forgotten)

*Settled Aug 2026 (see §5): `wind()` returns an Entry handle; `on('entry')` emits diffs alongside a `spool.entries` getter; immutable-kind bodies stay lazy `Y.Text` for v1; the relay is a true dumb byte relay.*

- **Multi-writer beyond two people** — **verified, Aug 2026** (`packages/spools/src/multiwriter.test.ts`, T-013): three writers converge on concurrent winds (identical order everywhere, id tie-break holding even with identical `createdAt`), character-level body merges with no loss, concurrent edit+delete (both apply: tombstone hides, edit survives, restore reveals), concurrent delete-vs-restore (LWW picks a winner nondeterministically but *all peers agree* — the invariant that matters), and offline accumulation/rejoin. The remaining question is social, not technical: the link grants full write access to everything — including other people's entries — and that's the honest v1 contract.
- **Read-only spools / per-entry permissions** — deferred, eyes open: in an E2E-encrypted P2P system the relay *cannot* enforce permissions (it reads nothing) and clients *cannot be forced* to obey them (any key-holder writes valid CRDT updates). The ladder, if ever climbed: advisory flags (cheap, bypassable) → signed entries (real attribution, but reintroduces the identity layer deliberately stripped from fosho) → split read/write keys (breaks "one link, one key"). Banked so deferral stays safe: **`author` is self-declared in v1; cryptographic attribution, if ever wanted, arrives as an additive `sig` field — never a migration.**
- **Structured `data` payloads for immutable kinds** — **resolved (Aug 2026): the `data` field earned its spec sentence, decided from the M3 evidence and user-approved — see §5.** T-030 Notes hold the friction evidence that produced the verdict.
- **Relay persistence** — **resolved (Aug 2026): the pocket (M10)**, decided from the M10 brief and user-approved — see §5. Sealed full-state deposits, keyed-only, canonical relay volume-backed. The frame-log enabler note above ("append the opaque bytes already being forwarded") is retired on evidence that postdates it — sealing made frames unclassifiable, resync made the log mostly chatter; [docs/M10-async-brief.md](docs/M10-async-brief.md) §3.A holds the full erosion, T-100 the numbers. The pitch survives verbatim, now mechanically true: *v1: syncs when we're together; v2: the relay holds sealed envelopes it cannot open.*
- **Chat-scale growth** — opened by M11, eyes open: `gc:false` + in-doc history + whole-doc pocket deposits + the 8 MiB frame/deposit cap mean a long-lived group chat eventually outgrows the transport, and the 413 latch degrades it to live-only for the rest of the session — surfaced by a persistent warning line in both shipped clients (T-104), silent in none of them, but unrecoverable without a reload. **Measured (T-110, Aug 2026):** ~317 B/message flat, moments ~73 B in append-only rooms (the ~0.5 KB figure was the delete-heavy shape), so the crossing is **~26 500 messages** (~91 active hours at 240 msg/hr) — years at intimate scale, one heavy summer for a big room. Deposits are the sharper edge: 3.1 MiB/deposit at 10 k messages, up to 60 PUTs/hr per active device. The pruning/compaction/`splice` conversation stays parked until a real room approaches the number. Ring at group cardinality: T-110 proved K=4 silently drops a worldview when a 5th concurrent seat deposits before merging, and only the *evicted writer's* return heals it (survivors aren't "ahead" and never re-deposit) — re-sizing is T-124's sign-off, with two extra data points: the ring tag is per-instance (a reload takes a fresh slot) and 8 seats on one NAT fit inside 12 PUTs/min with little headroom.
- **Seat identity ladder (M11)** — the seat id is deliberately opaque so it can become an Ed25519 public key later, at which point the banked `sig` field (row above) gives real attribution with zero migration. Multi-seat → one person mapping is additive in the profile table. Signing would buy attribution, never enforcement — any key-holder still writes valid updates.
- **Assets / full customization (post-M11)** — the owner's long-term goal: theming and content backed by user-supplied storage (BYO buckets or a P2P mesh). Banked so deferral stays safe: **an asset never lives in the doc — the doc carries at most a URL and a content hash, so any future storage story is additive and the 8 MiB ceiling is never an asset problem.**
- Name check beyond npm: domains, GitHub org *(ticket T-002)*.

---

*Working doc. Revise when the code teaches us something. Keep the philosophy section stable; everything else is negotiable with evidence.*