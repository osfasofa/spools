# Spool — Design Document

> **An artifact that can change, that's passed around.**
> Ad hoc side channels between people — not a place you go, a thing you hold.

This is the founding reference document for Spool: a small protocol, SDK, relay, and reference client for intimate, local-first, peer-to-peer shared spaces. It captures the philosophy, architecture, vocabulary, and build order agreed during the initial design sessions. Treat it as the source of truth until the working code earns the right to revise it.

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
| **stash** *(reserved)* | Local archiving concept for a future release. |
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
3. *(Deferred, v2 decision)* optional encrypted-blob persistence so a spool can sync even when peers are never simultaneously online. Do not spec until needed. Note: the dumb-relay design makes this cheap later — persistence is appending the bytes already being forwarded and replaying them on join.

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
- [ ] **4. Relay packaging** — extract fosho `server.js` → `spools-relay`, `npx` + deploy button.
- [ ] **5. `rewind()`** — Yjs snapshot history + a scrubber in the reference client. The memory feature; the demo that sells the vision.
- [ ] **6. Spec doc** — written from the working system.
- [ ] **7. Export / stash** — spool as portable file; local archive management.
- [ ] Later: encryption hardening pass, optional relay persistence, `splice`, more renderers (board, blog).

**Immediate errands:** publish `spools@0.0.1` stub on npm to claim the name; check domains.

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
| Relay persistence | Parked for v2 | Dumb relay keeps the door wide open (append forwarded bytes, replay on join); v1 story stays "syncs when we're together" |
| Client resync | Spool clients MUST run periodic resync (SDK sets `resyncInterval`, ~15–30 s) | A dumb relay can't answer a waiting peer; peers must re-ask. Proven in T-003: without it, offline-gap reunions never heal the waiting side (y-websocket sends SyncStep1 only at connect). Cost: one tiny state-vector frame per client per interval *(Aug 2026, T-003 spike)* |
| Deleted-entry access | `spool.deleted` getter — same live handles and sort as `entries` | The API's first consumer (T-020's client) needed a restore UI on day one and had to fall back to the raw-doc escape hatch; the getter mirrors `entries`, and `restore()` already lives on the handle *(Aug 2026, T-020)* |

---

## 6. Open questions (parked, not forgotten)

*Settled Aug 2026 (see §5): `wind()` returns an Entry handle; `on('entry')` emits diffs alongside a `spool.entries` getter; immutable-kind bodies stay lazy `Y.Text` for v1; the relay is a true dumb byte relay.*

- **Multi-writer beyond two people** — **verified, Aug 2026** (`packages/spools/src/multiwriter.test.ts`, T-013): three writers converge on concurrent winds (identical order everywhere, id tie-break holding even with identical `createdAt`), character-level body merges with no loss, concurrent edit+delete (both apply: tombstone hides, edit survives, restore reveals), concurrent delete-vs-restore (LWW picks a winner nondeterministically but *all peers agree* — the invariant that matters), and offline accumulation/rejoin. The remaining question is social, not technical: the link grants full write access to everything — including other people's entries — and that's the honest v1 contract.
- **Read-only spools / per-entry permissions** — deferred, eyes open: in an E2E-encrypted P2P system the relay *cannot* enforce permissions (it reads nothing) and clients *cannot be forced* to obey them (any key-holder writes valid CRDT updates). The ladder, if ever climbed: advisory flags (cheap, bypassable) → signed entries (real attribution, but reintroduces the identity layer deliberately stripped from fosho) → split read/write keys (breaks "one link, one key"). Banked so deferral stays safe: **`author` is self-declared in v1; cryptographic attribution, if ever wanted, arrives as an additive `sig` field — never a migration.**
- **Structured `data` payloads for immutable kinds** — **verdict in from M3 (T-030, Aug 2026), decision pending user sign-off.** The mixtape renderer was built on markdown-smuggled track bodies (`[Title — Artist](url)` + note). It works, and degrades beautifully in naive views — but the format is unparseable in principle (titles containing ` — `, urls containing `)`), every renderer must ship a bug-compatible parser copy, and fields can't be edited independently. The smuggle format *is* a schema, just hiding in a regex. Recommendation: `data` earns its spec sentence — plain-JSON machine fields, written once at wind time (LWW is honest for immutable data), with body kept for the human note so naive-view readability survives. T-030 Notes hold the full evidence.
- **Relay persistence** — still the biggest v2 fork, but the dumb-relay decision made it cheap: persist = append the opaque bytes already being forwarded; replay on join. Costs that remain real: the relay stops being stateless (retention, quotas, abuse surface). Pitch stays honest: *v1: syncs when we're together; v2 option: the relay holds sealed envelopes.*
- Name check beyond npm: domains, GitHub org *(ticket T-002)*.

---

*Working doc. Revise when the code teaches us something. Keep the philosophy section stable; everything else is negotiable with evidence.*