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

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-100](T-100-spike-pocket.md) | **Spike:** pocket feasibility (midnight loop, per-tag ring, 200-trap, frame-log numbers) | — | done |
| [T-101](T-101-relay-pocket.md) | Relay: pocket endpoints, per-tag ring, TTL + touch-on-read, caps, `POCKET_DIR` | T-100 | done |
| [T-102](T-102-sdk-fetch-on-open.md) | SDK: token derivation, capability probe, fetch-merge on open, `pocket` event | T-100 | done |
| [T-103](T-103-sdk-deposit-scheduler.md) | SDK: deposit scheduler, `leave()` flush, deposit-if-ahead + refresh-if-stale | T-102 | done |
| [T-104](T-104-clients-pocket-beat.md) | Clients: "checking the pocket…" beat + midnight torture row | T-102 | done |
| [T-105](T-105-canonical-deploy.md) | Canonical relay deploy: Railway volume (+ Fly mounts) — **owner at keyboard** | T-101 | doing |
| [T-106](T-106-spec-amendment.md) | SPEC v1.1: optional pocket capability + honesty clause; SDK-API; docs | T-101, T-103 | done |
| [T-107](T-107-keeper.md) | `spools-keeper`: headless always-on peer (optional) | T-100 | done |

## Parked (no ticket until evidence demands one)

- Structured `data` field for immutable kinds — T-030 records the verdict.
- Permissions / signed authorship — DESIGN_DOC §6 has the banked sentence.
- `splice`, more renderers (board, blog).
- Pocket follow-ons deliberately out of M10: deposit DELETE (needs standing → identity ladder), plaintext deposits, in-session pocket polling, compression/delta deposits, multi-relay.
