# M11 — the room: a group chat on the SDK

*Status: **signed off** (Aug 2026). Decisions D1–D5 below were approved by the
owner in the planning session; one open item (D4's real cost) is deliberately
left to T-110's numbers. This brief is the design record for the M11 rail in
[tickets/INDEX.md](../tickets/INDEX.md).*

## 1. The gap: everything so far is a feed

The v1 roadmap closed with three renderers proven over the same spool — list,
chat view, mixtape — and they are all the **same shape**: an append-ordered feed
of write-once things. Nothing built on this SDK has ever had mutable shared
state, ephemeral state, a stable participant, or a large `n`. Spool's central
claim (*views are skins over entries*) has therefore only been tested where it
is easiest to be true.

A Messenger-class group chat is the first client that demands all four at once:

- **identity** — messages must group by *who*, and nicknames must be editable
  by anybody, retroactively;
- **mutation** — a chat name, a nickname table, read positions;
- **ephemera** — online, typing: state that must *not* persist (ghost presence
  is a named refusal — see the M10 brief's frame-log erosion);
- **scale** — thousands of entries, where both existing clients' repaint-
  everything pattern and the `entries` getter's full sort (entry.ts:160) have
  never been felt.

The feature set: pseudonymous identities, nicknames editable by anybody,
arbitrary emoji reactions, inline replies, presence (online + typing), read
receipts, a custom chat name, basic themes. Parked out of M11 entirely: asset
pointers into BYO buckets / P2P mesh storage (§10).

## 2. What the constitution already gives us

Verified against SPEC v1.1 and the SDK source, not assumed:

- **Messages are free.** `kind: 'message'` is the sanctioned idiom; `parent`
  gives inline replies and reactions with no special cases (§5 threading row).
- **Presence is free, and it is sealed.** Awareness exists on every
  relay-connected spool, shared across both transports (engine.ts:117-134).
  Critically, the encrypted transport substitutes the WebSocket *class*
  (encrypted-ws.ts:80-91), so sealing sits below the y-protocols message layer:
  awareness frames are indistinguishable from sync frames on the wire and
  cannot leak plaintext presence to the relay. (fosho leaked exactly this —
  its encrypted-sync passed awareness through unsealed. We do not inherit it.)
  SPEC §3 already blesses awareness as OPTIONAL, app-defined, best-effort.
- **Mutation has one sanctioned expression**: wind a new entry (resolved
  last-write-wins at render), or rewrite your own entry's *body* — bodies are
  mutable (SPEC "changing text happens in the body"); metadata is write-once.

What the constitution does **not** have: any identity layer (deliberately
stripped from fosho), any document-level metadata (no title, roster, settings),
any ephemeral surface beyond raw awareness, and any answer to unbounded growth.

## 3. The design space (what sign-off decided)

### D1 — Identity: seats + a shared profile table ✅

Each device generates a random **seat id**, stored locally (localStorage,
beside `spool-author`), stamped on every entry it winds (in `data`). Display
names live in a shared profile table keyed by seat — so anyone can rename
anyone, and the change applies retroactively to old messages at render time.

Rejected alternatives: today's `author` string (fixed at open, spool.ts:86;
frozen per entry; cannot support editable nicknames — it stays *written* for
naive-client readability, but is no longer the display path); full Ed25519
identity lifted from fosho (the top rung of §6's ladder — real attribution, but
it reintroduces the layer deliberately stripped, and the middle rungs are
untried).

**Forward-compatibility requirements (load-bearing):**
- The seat id is an **opaque, variable-length string**. Never parse it, never
  assume a length. This is what lets it become an Ed25519 public key later
  without touching the data model.
- A seat is a **device, not a person**. The profile table must stay capable of
  mapping several seats to one display identity (multi-device arrives day one:
  laptop + phone = two seats).
- The banked upgrade (not built): seat id becomes a public key; entries gain an
  additive `sig` field, per §6 — *never a migration*. Signing buys
  **attribution, not enforcement**: any key-holder still writes valid CRDT
  updates, so "only I can rename me" is forever detectable, never preventable.

### D2 — Shared settings live as entries, not a new root type ✅

Chat name and the profile table are entries of reserved kinds
(`room:name`, `room:profile`, …exact names are T-113/T-114's call), filtered
out of the message view, resolved **newest-wins** at render. The forward-compat
rule means naive clients render them via the unknown-kind fallback rather than
seeing nothing; `rewind()` covers them; no private structure is invented.

Rejected alternative: a new Yjs root type via the `spool.doc` escape hatch —
legal under SPEC's "unknown root types" clause and cheaper per update, but it
is structure no other client renders, invisible to rewind, and it dodges the
experiment this milestone exists to run. **This is the mutation-as-entry
experiment. Measure it** (T-110, T-127).

Accepted cost: every rename is permanent under `gc:false`. Fine for names —
they change a handful of times in a spool's life.

### D3 — Read receipts persist ✅ / D4 — as one body-rewritten entry ✅, priced by T-110 ⚠

"Seen" survives closing the tab. One marker per participant — never one per
message (`gc:false` would make per-message receipts permanent and
O(messages × participants)).

D2 and D3 collide: a persisted cursor must update in place, which write-once
metadata forbids. The sanctioned way out: **each participant winds exactly one
`room:read` entry and rewrites its body** as their cursor advances — bodies are
mutable, it is O(participants), and it touches only your own entry (SPEC
forbids clearing another's body root).

**⚠ The open item — D4 costs ~6× the original estimate.** The ~90 B/rewrite
figure missed an interaction, verified in code: a body rewrite is a local
content transaction, and `HistoryLog` schedules a moment on *any* local content
transaction (history.ts:174-184) — so each cursor advance past the 10 s min-gap
also appends a **~0.5 KB permanent snapshot**, and separately marks the pocket
dirty, triggering a whole-document deposit. Consequence: **a lurker who never
says a word generates the doc growth and deposit traffic of an active writer,
just by scrolling.** Resolution (owner-approved): T-110 measures the real
per-cursor cost; the numbers pick between (a) hold D4 with a hard throttle
(advance on blur/idle only, floor ≥ the history min-gap) or (b) ephemeral
awareness-only "seen", which would amend D3. T-121 is gated on that call.

> **Resolved (T-110, Aug 2026): (b) ephemeral awareness-only — D3 amended,
> D4's mechanism rejected.** Measurement made the estimate above an
> *underestimate*: the body-rewrite cursor is quadratic (~2.7·n² B cumulative
> — each rewrite's delete-set range never merges under the interleaved history
> log and every later moment re-encodes the whole ds; ~2 000 advances spend
> the entire 8 MiB cap). A flat third option (append-only `room:read`
> entries, ~359 B/advance) was offered and declined. T-110's Notes hold the
> tables; DESIGN_DOC §5's M11 mutable-state row records the decision.

### D5 — App-first; the SDK gains one line ✅

The app uses the escape hatches: `spool.doc` where needed, a directly
constructed `SpoolEngine` (it is exported) to reach awareness. The SDK changes
exactly once this milestone: a `get awareness()` passthrough on `Spool`
(T-112). Presence, profiles and settings earn real SDK surface in a *later*
milestone, from evidence — the spec is written last, from working code, and §5
row 13 already recorded that event contracts calcify hardest.

## 4. Traps, pre-paid

Each of these already cost a session somewhere in T-020…T-105. The tickets
must not pay for them again:

- `entry.data` mutations **silently don't sync** (entry.ts:70) — read-only by
  convention, no error. The likeliest confusing bug of the milestone.
- **No event replay on load** — render from `spool.entries`, then subscribe.
- **Never denormalize a nickname into a message** (fosho's chat.ts did; renames
  never propagated). Store the seat; resolve the name at render.
- `synced` **never fires in an empty room** and the connection cycles ~30 s
  (SPEC §3 non-normative note). Key "who's online" to *peers*, never `synced`.
- A full rerender **eats composer focus** mid-typing (T-030 — mount/update
  split exists for exactly this).
- `ev.currentTarget` inside a `setState` updater crashed the mixtape on the
  second keystroke (T-090).
- Two same-origin tabs **fake convergence** (BroadcastChannel + shared IDB).
- `entry.body`'s setter rewrites wholesale (entry.ts:91-98) — fine editing your
  own message, lossy under concurrent edits of one body.
- Clock skew: sort is writer's wall clock + id tie-break, so one fast phone
  pins itself to the bottom and **a reply can sort before its parent**. Render
  reply structure structurally; annotate future timestamps.
- 👍 and 👍🏽 are different `body` strings — normalize before grouping reactions.

## 5. The growth problem (the milestone's real risk)

A long-lived chat is the one document shape this system has no answer for.
None of this blocks the MVP; all of it must be measured (T-110) and recorded
honestly (T-127) rather than discovered in production:

- `gc:false` is mandatory (+34% measured); nothing is ever hard-deleted.
- The in-doc `history` array grows ~0.5 KB/moment with **no pruning path** —
  roughly 180 KB per active hour.
- Every pocket deposit is the **whole document** (pocket.ts:314); no delta path.
- **8 MiB caps both** pocket deposits and websocket frames — past it, a cold
  joiner can't be served on either path.
- The 413 latch is **permanent for the session** (pocket.ts:312) and degrades
  silently to live-only. The app must surface `on('pocket')` `depositError`.
- The pocket ring is **K=4, sized for two-person spools**: 5+ concurrent seats
  can evict a worldview before anyone merges it — silent incompleteness, the
  exact failure M10 rejected the frame-log for. Changing the canonical relay's
  `POCKET_K` is protocol-adjacent: raise it with evidence in T-110, decide with
  the owner, execute in T-124.
- Relay bounds: 64 connections/room (tabs, not people); 12 pocket PUTs/min
  **per IP** — a household on one NAT shares that budget.

## 6. Design sketch (draft until T-110/T-113 say otherwise)

- **Visual design is settled** (owner design spike, Aug 2026):
  [docs/design/room/README.md](design/room/README.md) is the high-fidelity
  handoff — exact tokens for all four themes (blackout/terminal/daylight/paper),
  per-component measurements, all five screens, and the SDK mapping (it uses
  this brief's wind kinds verbatim). The `.dc.html` files beside it are
  interactive **references to recreate in React, not code to ship**. Where that
  README specifies visuals, it wins; where this brief specifies mechanics and
  constraints, it wins.
- **App**: `apps/room` — Vite + React, `base: './'`, forked from the mixtape's
  `useSpool` pattern; deployed early to `gh-pages` beside the mixtape so every
  ticket after the scaffold is a real multi-device test.
- **Message**: `wind({ kind: 'message', body, data: { seat }, parent? })`.
- **Profile**: `wind({ kind: 'room:profile', body: <display name>, data:
  { seat: <target> } })` — newest wins per target seat; `author` doubles as the
  free audit trail ("renamed by —").
- **Room name**: `wind({ kind: 'room:name', body: <name> })` — newest wins.
- **Read cursor**: one `room:read` entry per seat, body = last-read entry id,
  rewritten under the T-110-derived throttle (pending the D4 call).
- **Presence**: `awareness.setLocalStateField('room', { seat, typing })` —
  sealed by construction; online = presence of the field, expiry by awareness's
  own 30 s timeout; typing debounced hard.
- **Collision legibility**: derive a stable color + short suffix from the seat
  id, always rendered — duplicate nicknames and unnamed seats stay legible
  without any uniqueness rule.
- **Arrival**: an explicit state machine (`checking the pocket… → connected,
  nobody here → catching up → this room is really empty`) — never a bare empty
  state; naming is non-blocking (§1: no onboarding).
- **Honesty in the UI**: anyone with the link can edit or delete anything —
  one plain sentence, not a surprise; a closed tab hears nothing — no push, no
  server that knows you exist.

## 7. Guardrails — what does *not* change

- **SPEC.md does not move for the MVP.** Everything above is app convention:
  reserved kinds, a `data.seat` field, awareness payload shapes. If the app
  ships this way, *that* is the milestone's headline finding (§9). If something
  genuinely cannot be built without a protocol change, that evidence goes to
  the owner — never a silent deviation, never an app bent to protect the thesis.
- Philosophy §1, all six bullets. In particular: no accounts, no onboarding
  gate, no growth loops; the link is the only way in.
- The relay stays dumb; no new relay capability. (T-124 may retune existing
  knobs — with sign-off.)
- No permissions, no blocking, no read-only: §6's ladder stays parked; the
  honest sentence is the deliverable.
- `author` keeps being written on every entry.
- The status union stays closed; anything new is additive events or app state.

## 8. Proposed tickets

The rail in [tickets/INDEX.md](../tickets/INDEX.md) is the source of truth;
summary: T-110 (chat-hour budget spike — **the gate**), T-111 (awareness at
group scale spike), T-112 (SDK awareness passthrough), T-113 (scaffold + feed),
T-114 (seats + profiles), T-115 (deploy early), T-116 (scroll/windowing/
ordering), T-117 (arrival), T-118 (reactions + inline replies), T-119
(presence) — *MVP line* — T-120 (edit/delete/honest contract), T-121 (read
receipts, gated on the D4 call), T-122 (room name + per-device theme), T-123
(unread + notifications), T-124 (relay knobs — sign-off required), T-125
(phone + a11y), T-126 (room torture checklist), T-127 (docs/§5/SPEC — last,
from working code).

Deliberate cuts (owner-approved): shared theme → per-device (T-090's label
precedent: a theme is your handwriting); typing indicators gated on T-111's
numbers, shipped last or dropped; no emoji picker (OS keyboard + recents row —
"arbitrary emoji" is fully satisfied without a 2 000-entry dataset); no push
notifications, no search, no media attachments (the latter belong with the
parked asset work and would hit 8 MiB immediately).

## 9. Milestone acceptance

Against the deployed client and `DEFAULT_RELAY`:

1. **Three real devices**, ≥2 on different networks, hold a conversation with
   reactions and inline replies.
2. **Nicknames**: A renames B; C sees it, and it applies to B's *old* messages
   (the retroactive property fosho's denormalization lost).
3. **Presence**: A sees B online; B closes the tab and drops. Keyed to peers.
4. **Arrival**: a fourth device opens cold and never sees a state that looks
   like data loss.
5. **Midnight**: B writes and goes offline; C cold-opens from a fresh profile
   and collects from the pocket.
6. **Sealing, proven**: no plaintext presence observable at the relay — capture
   frames and look. (The claim fosho got wrong; prove it, don't assume it.)
7. **Scale**: the feed stays usable at a few thousand messages.
8. **Growth numbers recorded**: doc bytes and history accretion per active
   hour, deposit size vs the 8 MiB cap, per-cursor cost, ring behavior at 5+
   concurrent seats.

Extend the existing harnesses (`apps/client/TESTING.md`,
`scratch/torture-t104/midnight.mjs`) rather than reinventing them.

## 10. Parked by this brief, on purpose

- **Asset pointers / distributed storage** (the owner's "eventually"): full
  customization via links to assets held in BYO buckets or a P2P mesh. Banked
  so deferral stays safe: **an asset never lives in the doc — the doc carries
  at most a URL and a content hash, so any future storage story is additive
  and the 8 MiB ceiling is never an asset problem.**
- Promoting seats/profiles/presence to real SDK surface (a later milestone,
  from this app's evidence).
- The `sig` upgrade (§6's ladder, unchanged).
- Pruning/compaction/`splice` — unless T-110's numbers force the conversation
  earlier.
- Blocking, muting, permissions of any kind.
