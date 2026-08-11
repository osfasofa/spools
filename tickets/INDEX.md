# Spool — Ticket Index

Session-sized chunks of the build order (DESIGN_DOC §4). Each ticket is one file, one working session. Statuses: `todo` / `doing` / `done`. Update this table and the ticket's frontmatter together.

**Workflow:** pick the top unblocked `todo`, set it `doing`, work it, meet its acceptance criteria, set it `done`. Tickets record decisions made along the way in their Notes section; anything protocol-shaping also gets a row in DESIGN_DOC §5.

## M0 — Groundwork

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-001](T-001-monorepo-scaffold.md) | Monorepo scaffold | — | done |
| [T-002](T-002-claim-names.md) | Claim the name (npm, GitHub, domains) | — | todo |
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
| [T-060](T-060-rewind-api.md) | `rewind(ts)` via Yjs snapshots (+ `gc:false` investigation) | T-013 | todo |
| [T-061](T-061-history-scrubber.md) | History scrubber in the reference client | T-060 | todo |

## M7 — Spec

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-070](T-070-spec.md) | Write SPEC.md from the working system | T-041, T-051 | todo |

## M8 — Export / stash

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-080](T-080-export-stash.md) | `export()` portable file + stash | T-013 | todo |

## Parked (no ticket until evidence demands one)

- Structured `data` field for immutable kinds — T-030 records the verdict.
- Permissions / signed authorship — DESIGN_DOC §6 has the banked sentence.
- Relay persistence (v2) — DESIGN_DOC §6 has the enabler note.
- `splice`, more renderers (board, blog).
