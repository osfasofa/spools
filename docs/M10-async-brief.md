# M10 — the pocket: asynchronous sync

**Status: signed off — Aug 15, 2026.** All four decisions in §5 were answered by the owner as recommended: the pocket is adopted (frame-log sketch retired), keyed-only (the relay stores ciphertext or nothing), the canonical relay runs it volume-backed with a ~60-day courtesy TTL, and the keeper is in scope as T-107. Naming settled: **pocket** (the owner's coinage) / **deposit**. A same-day review round on PR #1 surfaced four findings (griefable ring, unbounded aggregate storage, ring-flush divergence loss, TTL starvation on quiet spools); their resolutions — including two owner-approved protocol additions, the **key-derived pocket namespace** and the **per-tag ring** — are folded into §3.B/§5/§6 below. Decision rows live in DESIGN_DOC §5; tickets T-100–T-107 track execution. This document remains the design record; where spike evidence later adjusts a draft number, the ticket notes what changed.

**TL;DR.** Spool's soul is asynchronous intimacy — leave something, they find it later — but its transport is synchronous-only: state transfers exclusively between simultaneously-online peers, so the flagship gesture ("I made you a mixtape, open it whenever") fails on first contact whenever the maker is asleep. The recommendation is **the pocket**: clients periodically hand the relay a *sealed full-state copy* of the spool; the relay holds the last few, unreadable to it, and hands them to whoever opens the link later. Plus, independently, a **keeper** — a headless peer you run on your own hardware. The §6 banked sketch (log-and-replay the forwarded frames) gets retired on evidence gathered while writing this brief. The §6 *pitch* survives verbatim: "the relay holds sealed envelopes" — it just never said the envelopes had to be the wire frames.

---

## 1. The gap: the midnight mixtape

The flagship story, played honestly against the current system:

- **9:00 pm** — A makes a spool, winds eight tracks onto it, texts B the link, closes the laptop. Every change is safe in A's IndexedDB, sealed. The relay forwarded A's frames to a room containing nobody, which is to say: it discarded them, by design.
- **12:00 am** — B taps the link on a fresh device. The client connects, asks the room "what do you have that I don't?" (SyncStep1). The room is empty. Nothing answers, because in this protocol only *peers* answer — the relay can't (SPEC §3: peers are each other's server). The SDK re-asks every 20 s; an empty room stays silent at any frequency.
- **What B sees:** an empty spool. No error — this isn't a bug, it's the documented v1 contract ("syncs when we're together", DESIGN_DOC §5 relay-persistence row). B concludes the link is broken, or worse, that the gift was empty.
- **8:00 am** — if A happens to reopen while B is still connected, everything flows and the spool is whole. The system requires the two of them to overlap, live, at least once per change. That is a walkie-talkie contract for a medium whose whole point is *not having to be there at the same time*.

Nothing is ever lost — A's device holds everything. But "nothing is lost" and "the gift arrives" are different promises, and v1 only makes the first.

## 2. How sync works today (the machinery, step by step)

Every claim here is cited; this section doubles as the teaching walkthrough for anyone new to the codebase.

1. **A wind is a local write.** `wind()` mutates the local `Y.Doc`; the persistence layer seals each update with secretbox and stores it in IndexedDB (rows prefixed `0xE2 0xE2`, `encrypted-idb.ts`; at-rest decision, DESIGN_DOC §5).
2. **Changes leave as sealed frames.** For a keyed spool, every outgoing websocket frame is sealed: `0xE2 0xE1 ‖ nonce ‖ ciphertext`, fresh random nonce per frame (`encrypted-ws.ts:21-34`; SPEC §4). The relay sees ciphertext with a two-byte name tag.
3. **The relay's entire job is eight lines.** For each inbound frame: hand the bytes to everyone else in the room, unread (`packages/spools-relay/server.js:75-82`). No parsing, no document, no memory. **A frame sent to an empty room evaporates.** This is the privacy design working exactly as intended — the relay MUST NOT parse, transform, filter, or persist frames (SPEC §3, SPEC.md:204-205).
4. **Catch-up is peer-answered.** On connect, a client sends SyncStep1 — "here's my state vector, send what I lack." Only another live client can answer with SyncStep2 (SPEC §3: a standard y-websocket *server* would answer, but a standard y-websocket server reads content and is therefore not a compliant relay).
5. **The resync rule heals reunions, not absences.** y-websocket asks exactly once, at connect — through a dumb relay, a peer that asked an empty room would wait forever even after others arrive. T-003's S3a scenario caught this ("FAIL — the real finding", T-003 results table), and the fix is the §5 client-resync rule: re-send SyncStep1 every ~20 s (`engine.ts:96`; SPEC §3 makes it a MUST). But re-asking an empty room is still silence — resync fixes *who answers when someone is finally there*, not *nobody being there*.
6. **Therefore state lives in exactly two kinds of places: A's device and B's device.** There is no third copy anywhere. If their online windows never overlap, no bytes ever transfer. (Side effect, documented in SPEC §3's non-normative warning: alone in a room, the provider's `synced` never fires and its ~30 s message-timeout cycles the connection indefinitely — harmless, but it means the "waiting" state is also noisy.)

The gap is structural, not a missing feature toggle: the relay was *designed* to be unable to help, and that inability is the privacy guarantee. Any fix has to add a capability without subtracting the guarantee.

## 3. The design space

Four options, each given its honest hearing.

### A — frame log + replay (the §6 banked sketch)

DESIGN_DOC §3 layer 3 and §6 park this as *"persistence is appending the bytes already being forwarded and replaying them on join."* Its appeal is real: zero new client code (replayed frames arrive like live traffic), zero new formats, the relay stays parse-free (append and replay are both byte-blind), and it works for spools whose writers never reopen.

Writing this brief eroded it into the ground:

1. **The log is mostly noise, and the relay can't tell.** Sealed frames are indistinguishable ciphertext by design — fresh nonce per frame, no readable type byte (`encrypted-ws.ts`). The relay cannot tell a document update from a resync ping from an awareness heartbeat. A connected client emits a SyncStep1 every 20 s — **180/hour per client** — plus awareness updates, plus reconnect handshakes every ~30 s message-timeout cycle when alone (SPEC §3 warning). The log grows with *connection time*, not content. An evening of idle presence outweighs the mixtape it's supposed to preserve.
2. **Replay resurrects ghosts.** Replayed awareness frames assert the presence of people long gone; replayed SyncStep1s trigger every current member to answer with SyncStep2 (T-003 S4 measured redundant step2s as harmless *at live scale* — replay multiplies them by log length).
3. **Eviction strands causality, silently.** Yjs updates carry dependency clocks. Cap the log (any real relay must) and evict old frames, and a joiner can replay frames whose dependencies were evicted — those updates sit unintegrated in the pending queue, and the joiner renders an incomplete spool *with no way to know it's incomplete*. Silent incompleteness is precisely the failure rewind refused to accept (SPEC §2: "not knowing is different from nothing").
4. **Dedup is impossible.** Identical content reseal into different bytes every time (fresh nonce), so the log can't even collapse the 180 identical re-asks an hour.
5. **For plaintext spools it is a content recorder.** Unkeyed spools send ordinary Yjs frames; a frame log durably records their content on the server. The honesty clause's clean line — the relay sees "IP addresses, room codes, frame sizes and timing" (SPEC §4) — would gain an asterisk exactly where the project can least afford one.
6. **It requires weakening the spec.** "MUST NOT … persist frames (v1)" (SPEC.md:204-205) would need its "persist" deleted in v1.1. T-003 already rejected a relay that "replays … protocol frames" once, as healing-option 2: "contradicts the §5 'relay never parses' decision" — replay without understanding turned out to be replay of garbage.

The sketch was banked before encryption (M5) and resync (T-003) existed. Both postdate it, and both are what kill it: sealing made frames unclassifiable; resync made the stream mostly chatter. This is new evidence, which is what the house rules require to relitigate a parked position — and T-100 will quantify point 1 empirically so the sketch retires on numbers, not vibes.

### B — sealed state deposits: the pocket (recommended)

Don't record the play-by-play; deposit the position. Clients already know how to seal bytes with the link's key, and `Y.encodeStateAsUpdate(doc)` is already the canonical "entire spool as one blob" (it's the export file's `doc` half, SPEC §5).

Mechanics:

- **Deposit:** while open, a client debounce-schedules `seal(Y.encodeStateAsUpdate(doc))` and PUTs it to the relay over HTTP — same origin as the websocket, new path. The relay stores the blob it cannot read.
- **Hold:** the relay keeps the **last K deposits per room** (K≈4; *shipped default now 8 — raised for group rooms with sign-off, T-124/M11*), each with a timestamp, TTL'd (~60 days), byte-capped. It's a pocket, not an archive: devices remain the spool's home.
- **Fetch:** on open, after local persistence loads (`whenReady`), the client GETs the room's deposits, decrypts each, drops any that fail authentication (counting them, exactly like undecryptable frames), and applies the survivors with `Y.applyUpdate`. Applying a state update is a CRDT merge — the same semantics `importSpool` already ships ("restoring into nothing and reunifying with existing state are the same operation", `export.ts`; SPEC §5). There is no clobber path; a stale deposit merges to a no-op.

Facts that make it attractive, all verified against current source:

- **Deposits are not frames.** Every MUST NOT in SPEC §3 and relay-conformance rule 2 stays true *verbatim*. The broadcast path is untouched. The spec grows an optional capability; it rewrites nothing. (The §6 pitch — "the relay holds sealed envelopes" — becomes literally, mechanically true.)
- **Existing clients render midnight-fetched state with zero code changes.** Applied deposits mutate `entries`, which fires the SDK's ordinary `entry` diff events (`spool.ts:124`, the §5 event-contract decision). The ugly list client and the mixtape client both just… show the entries. Only the SDK changes.
- **The failure mode when nothing works is exactly v1.** Empty pocket, dead relay, expired TTL, memory-mode restart: the client merges nothing and behaves precisely like today. The feature only ever adds.
- **Poisoning is fenced out by a key-derived namespace.** The room code is a rendezvous name, not a secret (SPEC §1) — and the relay cannot verify ciphertext, by design — so a bare `/pocket/<room>` would let anyone holding the code PUT well-framed garbage and *evict every legitimate deposit* (PR #1 review, finding 1; rate limits only slow a patient attacker). Instead, deposits live under `/pocket/<room>/<token>` where the token is a one-way, domain-separated hash of the key: only link-holders can write — or even fetch — where link-holders read. The relay never learns the key and can't verify the token either; the token's entire power is that strangers can't guess it. Code-only garbage lands in namespaces no reader ever derives, bounded by the relay-wide budget below. Defense-in-depth stays: clients still verify every deposit on read and drop-and-count failures through the same surface as `on('undecryptable')` — a key-holder writing garbage is inside the documented trust boundary (the honest contract of intimate scale), and nothing unauthenticated is ever handed to Yjs (SPEC §4's rule, reapplied). Bonus alignment: no key → no token → no pocket; decision 2 (keyed-only) becomes structural rather than policed.

Costs and sharp edges, stated honestly:

- **The relay grows a third job.** `server.js:205`'s comment — "exactly two jobs; everything else is a wrong number" — stops being true. It gains HTTP endpoints, storage, eviction, and (for durability) a disk. It stays yjs-free (blobs are opaque; the "imports neither yjs nor y-websocket" proof keeps passing), but "aggressively boring" takes a real hit. This is the price of the milestone and the main thing sign-off is *for*.
- **Old relays are a trap that must be engineered around.** Today's relay answers **200 + health JSON to every HTTP method and path** (`server.js:186-194`). A naive client PUTting to an old relay gets 200 and concludes the mixtape is safe — it isn't. So: deposits and fetches travel in a versioned envelope (the `spool-export` precedent: magic + version, readers reject what they don't recognize), capability is detected via a `pocket` block in the health JSON, and a 200 whose body isn't a pocket envelope means **no capability**, never "empty pocket". (One mitigating accident: the old relay's CORS header allows only `GET, OPTIONS` (`server.js:180`), so browser PUTs die loudly at preflight; it's the non-browser depositor that would be silently fooled.)
- **The last seconds before a tab dies are genuinely hard.** `leave()` awaits a final deposit before teardown (slotting exactly where `history.flush()` already sits, `spool.ts:187-191`). But a tab slammed shut mid-session can't reliably deposit: `sendBeacon`/keepalive budgets cap at ~64 KiB in flight, and a realistic 200-entry spool already measures **94 KB** (§5 history row) — so unload beacons are out, and the honest statement is: *a tab-slam loses at most the last debounce window*, same class of loss as an unflushed history moment.
- **TTL needs a repopulation rule — and a refresh rule.** Deposits expire; live spools must self-refresh. On open, after merging pocket and local state, a client deposits if it holds anything the pocket lacks ("deposit-if-ahead"). That alone starves quiet spools (PR #1 review, finding 4): a much-opened but *unchanged* spool never re-deposits and ages out anyway. So additionally: the relay refreshes a ring's TTL on read (touch-on-read — its own operational business), and clients re-deposit when the newest fetched deposit is older than half the advertised TTL ("refresh-if-stale", belt to the relay's suspenders). Now "a spool that keeps being opened keeps being covered" is true as stated, and a spool nobody opens for ~60 days ages out of the pocket while remaining forever on its devices.
- **K=1 is not enough — and an unpartitioned ring isn't either.** Each deposit is one writer's worldview: two writers diverging offline → their latest deposits each lack the other's entries, so a fresh joiner needs several recent worldviews to union. But a plain last-K ring fails a subtler way (PR #1 review, finding 3): a solo writer's next K debounced deposits can flush a diverged peer's *only* worldview before anyone merges it — divergence would then heal only on that peer's next open. So the envelope carries a **4-byte plaintext depositor tag** (random per session), and the relay keeps **the newest deposit per distinct tag, at most K tags** (K≈4; *shipped: 8 — T-124*), evicting the stalest tag: a writer's repeated deposits replace their *own* slot and can never flush a peer's. Tags are spoofable by key-holders — inside the trust boundary, stated honestly — and the ring still self-collapses: the first client to merge deposits the union under its own tag, and stale tags age out by TTL. T-100 must demonstrate the K=1 failure, the solo-flush failure of an unpartitioned ring, and the per-tag recovery.

### C — the relay parses and filters

Keep a real document server-side, or filter frames intelligently. Dead on arrival twice over: it cannot work (sealed frames are ciphertext; there is nothing to parse) and where it could work (plaintext spools) it is exactly the y-websocket-server design the §5 relay-role decision exists to reject — a server that materializes content. Listed only so the design space is complete.

### D — the keeper (recommended alongside, independent)

`npx spools-keeper <link>` — a headless client on hardware *you* control (a Pi, a NAS, a $4 VPS) that opens the spool and never leaves. It holds the key legitimately — it was handed the link, and the link is the key exchange (SPEC §1). To every other peer it's just a member who always answers SyncStep1; to the household it's the copy that's always awake.

- **Zero protocol change. Zero relay change. Zero spec change.** It's a client; it's *already conformant*.
- Persistence without inventing storage: hold the doc in memory, `export()` to a file on idle, `importSpool` on start — the M8 format is already the round-trip.
- What it doesn't do: fix the flagship case for people who won't run a box, which is nearly everyone the mixtape story is about. It's the philosophically pure answer ("your data, your always-on device") and the perfect escape hatch for people who distrust even a ciphertext-holding relay — but as *the* answer it makes "works when you're apart" a privilege of the self-hosting class.

### The comparison, compactly

| | A — frame log | B — pocket | C — parsing relay | D — keeper |
|---|---|---|---|---|
| Fixes midnight mixtape | partially (until eviction lies) | **yes** | plaintext only | only for box-runners |
| Relay stays content-blind | keyed: yes; plaintext: **no — records content** | **yes, unconditionally** (keyed-only pocket) | no | yes (relay untouched) |
| Spec impact | weakens a MUST NOT | **additive capability**, MUST NOTs verbatim | violates §5 core decision | **none** |
| Client impact | none (its one virtue) | SDK only; clients free via `entry` events | n/a | new package, SDK reused |
| Correctness under eviction | **silent incompleteness** | merge of whole states — always self-consistent | n/a | n/a (full peer) |
| Storage growth | with connection time | with doc size × K | with doc size | one device's disk |
| Honesty clause | gains an asterisk | gains a clean sentence | gutted | unchanged |

## 4. Recommendation

**Adopt B (the pocket) as M10; build D (the keeper) as its independent final ticket; retire A; C was never alive.** And do it in this order deliberately: the pocket is the fix for the people the project is *for*; the keeper is the fix for the people the project is *from*.

This retires a §6 banked sketch, which the house rules allow only on new evidence — the evidence is §3.A above (encryption made frames unclassifiable; resync made the stream mostly chatter; both postdate the sketch), and T-100 makes it quantitative. The §6 *pitch sentence* — "v2 option: the relay holds sealed envelopes" — is kept, made true, and promoted to the spec.

## 5. What sign-off actually decides

Four decisions, each with what it costs, what it bakes in, and what stays loose:

1. **Adopt the pocket; retire the frame-log sketch.** Costs: the relay grows a third job and (optionally) a disk. Bakes in: sealed-full-state as the async unit — future refinements (delta deposits, compression) stay possible inside the envelope's version field. Stays loose: everything client-side is SDK-internal. *Recommendation: yes.*
2. **Keyed-only pocket.** The relay stores ciphertext or nothing: plaintext spools stay live-only, and "the relay never stores content" becomes unconditional physics rather than a per-spool footnote. Costs: plaintext spools (the minority, and the ones that already accepted a content-visible wire) don't get async. Bakes in: nothing — relaxable later by adding, never tightenable after allowing. *Recommendation: yes, emphatically; this is what keeps the honesty clause one sentence.*
3. **Canonical-relay posture.** Does the default relay (`spool.ts:15`, Railway) run the pocket, disk-backed, and what TTL do we promise? Note that fly.toml currently says *"The relay is stateless: scale-to-zero is safe (no connections = nobody waiting; Fly wakes it on the next one)"* — a pocket falsifies exactly that comment: deposits *are* somebody waiting, so memory-mode + scale-to-zero would evaporate the pocket during precisely the gaps it exists to bridge. If the canonical relay opts out, M10 ships but the flagship default-link story stays broken. Costs: a volume (dollars/month, small) and a real retention promise. *Recommendation: yes — volume-backed, TTL 60 days, documented as a courtesy window, not an archive.*
4. **Keeper in or out of M10.** *Recommendation: in, as the optional last ticket (T-107) — it's small, independent, and it's the escape hatch that keeps decision 3 from being load-bearing for everyone.*

**Naming (settled by the owner, recorded per the §2 tradition):** the capability is the **pocket**; the blob is a **deposit** (boring on purpose). Considered and passed over: *mailbox* (implies an addressee — Spool deliberately has none), *locker/shelf* (cold, and locker implies the holder can't lose it — a TTL says otherwise). Metaphor-budget note: "pocket" is a second everyday-object noun beside spool/wind/rewind — same budget class "mailbox" would have occupied, spent on warmth that is also the more *accurate* physics (a pocket holds; it doesn't address). Faint collisions (a defunct read-later app; a niche crypto relay network) noted and dismissed — this is a protocol term, not a package name. Sentence test: *"Leave a sealed copy in the relay's pocket, so it's there when your friend opens the link while you're asleep."* Zero glossary.

**Post-review additions (same day, PR #1 review round, owner-approved):** two protocol-level hardenings — (5) the **key-derived namespace**: deposits live at `/pocket/<room>/<token>`, token a one-way domain-separated hash of the key, so only link-holders can write or read the pocket (finding 1: a code-only attacker could otherwise evict every real deposit with well-framed garbage); (6) the **per-tag ring**: the envelope carries a 4-byte plaintext depositor tag and the relay keeps newest-per-tag, ≤K tags (finding 3: an unpartitioned last-K ring lets a solo writer flush a diverged peer's only worldview). Two further findings resolved without new protocol surface, since SPEC delegates operational choices to the relay: a relay-wide storage budget with per-IP admission (finding 2 — per-room caps don't bound invented room names), and TTL touch-on-read plus client refresh-if-stale (finding 4 — deposit-if-ahead alone starves quiet spools).

## 6. Design sketch (draft until T-100 says otherwise)

Everything here is spike-fodder, not spec. Numbers are starting points.

- **Deposit blob:** `0xE2 0xE3 ‖ version(1 byte, =1) ‖ tag(4 bytes) ‖ nonce(24) ‖ ciphertext` — secretbox over `Y.encodeStateAsUpdate(doc)`, same key-as-is, no KDF, continuing the magic family (`0xE2E1` wire, `0xE2E2` at rest, `0xE2E3` deposited). The plaintext header (magic + version + tag, 7 bytes) is the *only* part the relay ever reads — enumerated as such in the honesty clause; the tag is 4 random bytes drawn per session, replaced on every open (a ring-partition key, not an identity). Version byte per the export-file lesson: readers MUST reject a version they don't understand.
- **Namespace token:** `token = base64url(SHA-512("spool-pocket-v1" ‖ key)[0..12))` — 12 bytes, 16 URL-safe chars, derived by clients only (draft derivation; T-100 settles the exact construction). One-way and domain-separated: the relay stores it in paths but can never recover the key from it, and never verifies it — its entire power is that a code-only stranger can't guess it. No key → no token → no pocket (decision 2, now structural).
- **Endpoints** (same origin as `/yjs`, the one-URL convention extended):
  - `PUT /pocket/<room>/<token>` — body: one deposit blob, `application/octet-stream`. Responses: `200 {"format":"spool-pocket","version":1,"stored":true}`, `413` too big, `429` rate-limited, `507` relay budget exhausted.
  - `GET /pocket/<room>/<token>` — `200 {"format":"spool-pocket","version":1,"ttlDays":60,"deposits":[{"at":<ms>,"blob":"<base64>"}, …]}`, newest first, one per tag, at most K. Base64 inflation accepted at intimate scale; JSON keeps it curl-able and makes the old-relay trap detectable.
  - Health JSON (already served on every path) gains `"pocket":{"rooms":N,"deposits":M,"ttlDays":60,"maxBytes":…}` — its **absence is the capability probe**. Counts only, never namespace ids — same discipline as the existing health JSON ("counts only, never content", `server.js:12`).
  - Anything at these paths returning 200 *without* `"format":"spool-pocket"` = old relay = no capability. Never "empty pocket".
- **Relay storage:** per `(room, token)` namespace, the newest deposit per distinct tag, at most K tags (evict the stalest tag on the K+1th); the whole ring TTL-swept, **touched on read** (a GET refreshes expiry — operational courtesy, finding 4). Default in-memory (npx-and-done stays npx-and-done, degrading to v1 semantics on restart); `POCKET_DIR` makes it a directory of blobs — no database, files at `<room>/<token>/<tag>`. **Aggregate bounds (finding 2):** a relay-wide byte budget with stalest-namespace-first eviction, plus boring per-IP admission caps on PUTs — per-room caps alone don't bound `8 MB × invented room names`. Knobs: `POCKET_DIR`, `POCKET_TTL_DAYS` (60), `POCKET_MAX_BYTES` (8 MB, matching `MAX_FRAME_BYTES`), `POCKET_K` (4 tags; *shipped default now 8 — T-124*), `POCKET_MAX_TOTAL_BYTES` (draft 1 GB), per-IP PUT rate. All numbers draft-until-spiked. The relay still imports neither yjs nor y-websocket — deposits are opaque files whose first 7 bytes it reads; the existing grep-proof keeps passing.
- **SDK, fetch side (T-102):** on open — derive the namespace token from the key (no key → skip the pocket entirely) → probe capability (cached per relay origin) → after `whenReady` (which stays purely local, unchanged) → GET, verify envelope, decrypt each deposit, drop-and-count failures, `Y.applyUpdate` each survivor with a distinct transaction origin. Emits an additive `pocket` event (`checking` / `applied` / `empty` / `unavailable`) — the `SpoolStatus` union stays closed.
- **SDK, deposit side (T-103):** a scheduler mirroring `HistoryLog` (`history.ts:96-105,174-193`): armed only after `whenReady`, listens to `afterTransaction`, **gated on `tr.local`** — pocket-applied updates arrive as remote-origin transactions, so applied state can never schedule a re-deposit; no self-feeding loop by construction. Debounce ~10 s, min gap ~60 s (deposits are heavier than moments); the session's 4-byte tag is drawn at open. `leave()` awaits a final deposit before engine teardown, beside `history.flush()`; `visibilitychange → hidden` triggers a best-effort early flush (a real PUT, not a beacon — see the 64 KiB note). On open, after the T-102 merge: deposit-if-ahead (repopulation) and **refresh-if-stale** — re-deposit when the newest fetched deposit is older than half the advertised TTL, so quiet-but-loved spools stay covered (finding 4).
- **Loud failures, per house style:** `413` → surface via the `pocket` event and degrade to live-only (never silently shrink the doc); undecryptable deposits counted and surfaced ("someone put garbage in the pocket"); capability probe failures are `unavailable`, indistinguishable from an old relay, and that's fine — v1 behavior is the floor.

## 7. Guardrails — what does *not* change

- The broadcast path: byte-blind fan-out, sender excluded, verbatim (`server.js:75-82`).
- SPEC §3's "MUST NOT parse, transform, filter, or persist frames" — survives untouched, "(v1)" and all; the amendment is additive (§8, T-106).
- The link grammar. No new fragment parameter; the pocket is feature-detected from the relay the link already names. Old links get the capability for free; new links work against old relays.
- `whenReady` stays "local persistence loaded", never network-dependent.
- The status union (`engine.ts:10`) stays `offline | connecting | connected`; pocket activity is an additive event, per the forward-compatibility habit.
- No identity, no accounts, no auth, no addressing. A deposit has no author — it's a worldview, not a message. (The namespace token is a capability derived from the key the link already carries, and the depositor tag is 4 random bytes redrawn every session — a ring-partition key with no continuity. Neither names a person; neither is verifiable; neither is identity.)
- The relay's no-yjs-import proof, the room-code grammar, both wire protocols, the export format, rewind, stash: untouched.
- Philosophy §1, all six bullets — in particular, a relay remains optional and interchangeable: the pocket is a courtesy a relay may extend, not a place a spool lives.

## 8. Proposed tickets (land in INDEX.md only after sign-off)

| Ticket | Title | Depends | Gates |
|---|---|---|---|
| T-100 | **Spike:** pocket feasibility — midnight loop headless (incl. cold open via fake-indexeddb), K=1 divergence failure + unpartitioned-ring solo-flush failure + per-tag recovery, cross-namespace garbage invisible to readers, old-relay 200-trap caught by envelope, **frame-log noise quantified** (retire A on numbers, T-003-style results table) | — | everything below |
| T-101 | Relay: pocket capability — tokened endpoints, per-tag ring, TTL sweep + touch-on-read, per-blob/aggregate/per-IP caps, env knobs, memory default + `POCKET_DIR`, health block, no-yjs grep-proof kept | T-100 | |
| T-102 | SDK: fetch-on-open — token derivation, capability probe, envelope verify, drop-and-count, merge after `whenReady`, additive `pocket` event | T-100 | |
| T-103 | SDK: deposit scheduler — `tr.local` gate, debounce/min-gap, `leave()` final flush, `visibilitychange`, deposit-if-ahead + refresh-if-stale; midnight integration test | T-102 | |
| T-104 | Clients: "checking the pocket…" beat; TESTING.md gains the midnight torture row (mostly free via `entry` events) | T-102 | |
| T-105 | Canonical relay deploy: Railway volume (and the Fly-mounts variant for the deploy button) — **needs the owner at the keyboard** (T-002/T-041 precedent) | T-101 | |
| T-106 | SPEC v1.1 amendment (optional pocket capability + envelope + token derivation), honesty-clause extension (the relay now *holds* ciphertext and observes deposit sizes/times, an opaque per-spool namespace id, and distinct session tags), SDK-API.md, DESIGN_DOC cross-refs | T-101, T-103 | spec written last, from working code |
| T-107 | `spools-keeper` — headless always-on peer, `export()`/`importSpool` persistence | T-100 | optional, independent |

## 9. Milestone acceptance — the midnight test

M10 is done when, with no scheduling of humans:

1. A opens a keyed spool against the canonical relay, winds entries, `leave()`s, and goes fully offline. B cold-opens the link on a device that has never seen the spool. **The full spool renders within seconds.** Proven twice: cross-device against the deployed canonical relay, and headless in vitest (relay in-process, fake-indexeddb cold client).
2. The same flow against an **old relay** (0.1.x) degrades to exactly v1 behavior, loudly enough that the SDK reports `unavailable`, and nothing is lost or corrupted.
3. A memory-mode relay restart mid-gap degrades to exactly v1 behavior.
4. Two writers diverge offline; a third device cold-opens and holds the union — *including* after one writer has made K further solo deposits (the per-tag ring test; the unpartitioned ring demonstrably fails this exact sequence in T-100).
5. The relay's grep-proof (no yjs imports) and the instrumented relay-blindness test still pass; a wrong-key deposit is dropped, counted, and never touches the doc.
6. A code-only attacker (no key) can neither read the pocket nor displace its deposits: writes to guessed namespaces are invisible to readers and bounded by the relay's aggregate budget.

## 10. Parked by this brief, on purpose

- **DELETE / deposit auth** — removing deposits early means proving *standing*, which is the identity ladder (§6); TTL is the v1 answer to "make it go away".
- **Plaintext-spool deposits** — excluded by decision 2; revisit only if a real client demands it, per the scope rule.
- **Pocket polling while open** — the live path already covers co-presence; the pocket is checked at open (and repopulated after). No polling in v1.
- **Compression, delta deposits** — the envelope's version byte is the door; walk through it only when a measured spool says 8 MB is real.
- **Multi-relay redundancy, pocket federation** — no. Zero relay-to-relay coordination is a §1-adjacent commitment.

---

*Companion reading: DESIGN_DOC §5 (relay role, client resync, at-rest/two-transport crypto, history/gc), §6 (the parked fork this brief resolves); SPEC §3–§5; T-003 (the spike that shaped the relay), T-051 (the sealing this reuses), T-080 (the merge semantics this reuses). This brief follows the house rule that the spec is written last: T-106 is the only ticket allowed to touch SPEC.md, and it goes last.*
