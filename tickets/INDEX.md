# Spool — Ticket Index

Session-sized chunks of the build order (DESIGN_DOC §4). Each ticket is one file, one working session. Statuses: `todo` / `doing` / `done`. Update this table and the ticket's frontmatter together.

**Workflow:** pick the top unblocked `todo`, set it `doing`, work it, meet its acceptance criteria, set it `done`. Tickets record decisions made along the way in their Notes section; anything protocol-shaping also gets a row in DESIGN_DOC §5.

## M0 — Groundwork

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-001](T-001-monorepo-scaffold.md) | Monorepo scaffold | — | done |
| [T-002](T-002-claim-names.md) | Claim the name (npm, GitHub, domains) | — | done |
| [T-003](T-003-spike-dumb-relay.md) | **Spike:** dumb-relay feasibility | — | done |

## M1 — SDK core

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-010](T-010-engine-extraction.md) | Engine extraction from fosho | T-001 | done |
| [T-011](T-011-links-and-codes.md) | Links, codes, `newSpool`/`openSpool`/`share` | T-001 | done |
| [T-012](T-012-entry-layer.md) | Entry layer: `wind`, entries, events, soft delete | T-010, T-011 | done |
| [T-013](T-013-sdk-tests.md) | SDK tests incl. multi-writer verification | T-012 | done |

## M2 — Reference client v0

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-020](T-020-ugly-list-client.md) | Ugliest possible list client | T-012 | done |
| [T-021](T-021-sync-torture-checklist.md) | Sync torture checklist (refresh, offline, reconnect) | T-020 | done |

## M3 — Mixtape renderer

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-030](T-030-mixtape-renderer.md) | `track`/`reaction` kinds + view switcher (views-are-skins) | T-021 | done |

## M4 — Relay packaging

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-040](T-040-spools-relay.md) | `spools-relay`: dumb broadcaster + signaling | T-003 | done |
| [T-041](T-041-relay-shipping.md) | `npx spools-relay` + deploy button + honesty clause | T-040 | done |

## M5 — Encryption

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-050](T-050-encryption-primitives.md) | Lift primitives + encrypted IndexedDB | T-012 | done |
| [T-051](T-051-encrypted-transport.md) | Encrypted transport over the dumb relay | T-050, T-040 | done |

## M6 — rewind()

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-060](T-060-rewind-api.md) | `rewind(ts)` via Yjs snapshots (+ `gc:false` investigation) | T-013 | done |
| [T-061](T-061-history-scrubber.md) | History scrubber in the reference client | T-060 | done |

## M7 — Spec

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-070](T-070-spec.md) | Write SPEC.md from the working system | T-041, T-051 | done |

## M8 — Export / stash

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-080](T-080-export-stash.md) | `export()` portable file + stash | T-013 | done |

## M9 — Clients (post-v1)

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-090](T-090-mixtape-client.md) | Mixtape client — the nice one (Vite + React) | T-080 | done |

## M10 — Async sync (the pocket)

Signed off Aug 2026 (all four decisions + two review-round hardenings); design record: [docs/M10-async-brief.md](../docs/M10-async-brief.md). The relay gains an optional capability: it holds the last few sealed full-state deposits per key-derived namespace — ciphertext or nothing — so the spool is there when a friend opens the link while the writer sleeps. T-100 gates everything; T-106 (SPEC) goes last, per the constitution.

**Complete, 15 Aug 2026.** The canonical relay runs the pocket volume-backed (60-day TTL, stock knobs); deposits survive restarts, and a cold reader collects them with nobody online. A test client is deployed at <https://osfasofa.github.io/spools/> (mixtape `dist/` on the `gh-pages` branch). **M10 closed — and with it the v1 roadmap: every ticket T-001…T-107 is done.**

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-100](T-100-spike-pocket.md) | **Spike:** pocket feasibility (midnight loop, per-tag ring, 200-trap, frame-log numbers) | — | done |
| [T-101](T-101-relay-pocket.md) | Relay: pocket endpoints, per-tag ring, TTL + touch-on-read, caps, `POCKET_DIR` | T-100 | done |
| [T-102](T-102-sdk-fetch-on-open.md) | SDK: token derivation, capability probe, fetch-merge on open, `pocket` event | T-100 | done |
| [T-103](T-103-sdk-deposit-scheduler.md) | SDK: deposit scheduler, `leave()` flush, deposit-if-ahead + refresh-if-stale | T-102 | done |
| [T-104](T-104-clients-pocket-beat.md) | Clients: "checking the pocket…" beat + midnight torture row | T-102 | done |
| [T-105](T-105-canonical-deploy.md) | Canonical relay deploy: Railway volume (+ Fly mounts) — **owner at keyboard** | T-101 | done |
| [T-106](T-106-spec-amendment.md) | SPEC v1.1: optional pocket capability + honesty clause; SDK-API; docs | T-101, T-103 | done |
| [T-107](T-107-keeper.md) | `spools-keeper`: headless always-on peer (optional) | T-100 | done |

## M11 — the room (group chat)

Signed off Aug 2026 (decisions D1–D5); design record: [docs/M11-room-brief.md](../docs/M11-room-brief.md). A Messenger-class group chat as the next SDK testbed — the first client demanding mutable shared state, ephemeral presence, and stable pseudonymous identity, all as **app conventions with zero protocol change** (that SPEC doesn't move is the thesis; if it must, that evidence goes to the owner). T-110 gates the read-receipt design (the D4 pricing question) and the growth story; T-127 (docs/SPEC) goes last, per the constitution. Tickets below the *MVP line* are follow-on, not launch-blocking.

**Closed, 15 Aug 2026 — the thesis held: SPEC v1.1 never moved.** The room is live at <https://osfasofa.github.io/spools/room/> on `DEFAULT_RELAY`, torture-verified twice over (`apps/room/TESTING.md`), with D4 resolved ephemeral-only on T-110's quadratic measurement and the relay's group knobs raised with sign-off (T-124: K=8, 24 PUTs/min). The brief's close-out block records every deviation. Remaining with the owner: the real-hardware rows (T-125's checklist + TESTING.md H1–H5 — three real devices, cellular, VoiceOver/TalkBack); T-125 stays `doing` until that pass reports.

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-110](T-110-spike-chat-budget.md) | **Spike:** the chat-hour budget (doc growth, cursor cost, ring at group scale) | — | done |
| [T-111](T-111-spike-awareness.md) | **Spike:** awareness at group scale (ghosts, traffic, 64-conn wall, sealing proof) | — | done |
| [T-112](T-112-sdk-awareness-passthrough.md) | SDK: `get awareness()` passthrough (the one SDK change) | — | done |
| [T-113](T-113-room-scaffold.md) | `apps/room` scaffold + message feed (mobile constraints in AC) | — | done |
| [T-114](T-114-seats-profiles.md) | Seats + the profile table (nicknames anyone can edit) | T-113 | done |
| [T-115](T-115-deploy-early.md) | Deploy early to gh-pages (every later ticket becomes multi-device) | T-113 | done |
| [T-116](T-116-scroll-ordering.md) | Scroll, windowing, ordering (clock skew, reply-before-parent) | T-113 | done |
| [T-117](T-117-arrival.md) | Arrival: first run + the empty-room trap | T-113, T-114 | done |
| [T-118](T-118-reactions-replies.md) | Reactions (any emoji, toggle, normalize) + inline replies | T-114 | done |
| [T-119](T-119-presence.md) | Presence: online dots (+ typing, gated on T-111's numbers) | T-111, T-112, T-114 | done |
| — | *— MVP line — below is follow-on —* | | |
| [T-120](T-120-edit-delete.md) | Edit, delete, and the honest write contract | T-113, T-114 | done |
| [T-121](T-121-read-receipts.md) | Read receipts: ephemeral awareness-only (D4 decided in T-110) | T-110, T-111, T-112, T-114 | done |
| [T-122](T-122-room-name-theme.md) | Room name (shared) + themes (per-device) | T-114 | done |
| [T-123](T-123-unread-notifications.md) | Unread divider + in-tab notifications (and the honest closed-tab sentence) | T-119 or T-121 | done |
| [T-124](T-124-relay-group-knobs.md) | Relay knobs at group scale (`POCKET_K` — **sign-off required**) | T-110, T-111 | done |
| [T-125](T-125-phone-a11y.md) | Phone + accessibility polish pass | T-116…T-119 | doing |
| [T-126](T-126-room-torture.md) | Room torture checklist (3+ devices, races, midnight, scale) | MVP set | done |
| [T-127](T-127-m11-docs.md) | Brief/§5/SPEC amendment — **last**, from working code | everything | done |

## M12 — Release

Pure execution, no open design questions. Drafted at M11 close (what's on npm no longer matches what's true); **owner at keyboard for the publish itself**, everything else preppable. Not urgent by standing decision (T-002's "don't treat the squatting clock as pressure").

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-130](T-130-npm-release.md) | npm release: real SDK 0.1.0, relay 0.2.0 (T-124 knobs), keeper first publish | — | todo |

## Parked (no ticket until evidence demands one)

- Structured `data` field for immutable kinds — T-030 records the verdict.
- Permissions / signed authorship — DESIGN_DOC §6 has the banked sentence.
- `splice`, more renderers (board, blog).
- Pocket follow-ons deliberately out of M10: deposit DELETE (needs standing → identity ladder), plaintext deposits, in-session pocket polling, compression/delta deposits, multi-relay.
