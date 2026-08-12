---
id: T-060
title: rewind(ts) via Yjs snapshots (+ gc:false investigation)
status: done
milestone: M6
depends: [T-013]
---

## Goal

`spool.rewind(timestamp)` — the memory feature. View the spool as it was: which entries existed, what bodies said. Read-only time travel; the present is never mutated.

## Context

- Yjs mechanism: `Y.snapshot(doc)` + `Y.createDocFromSnapshot` / `Y.equalSnapshots`. **Hard constraint to investigate first: restoring historical state requires the doc to run with `gc: false`** (garbage collection keeps docs small by forgetting deleted content — exactly the content rewind needs).
- Investigation before implementation (timebox it, write numbers down):
  - Size cost: realistic mixtape/chat spool (say 200 entries, edits, deletes) with gc on vs off — doc byte size, IDB size, load time.
  - Retro-compatibility: docs that ran with gc on before this ticket — what's actually recoverable? (Expect: structure of live entries yes, deleted content no. Verify.)
  - Timestamp→snapshot mapping: Yjs snapshots aren't timestamped by themselves. Options: periodic snapshot log stored in the doc (e.g. a `snapshots` Y.Array, written on idle), or lazily reconstruct from update log. Choose the boring one that ships.
- API shape (docs/SDK-API.md sketch): `rewind(ts)` returns read-only `EntrySnapshot[]` — plain objects (id, author, kind, parent, body-as-string, createdAt/deletedAt), **not** live Entry handles. Define whether soft-deleted-at-that-time entries appear (they should — that's the point of memory).
- Decision cascade: if gc:false is the price, does *every* spool pay it (simple, one story) or is it opt-in (`newSpool({ history: true })`)? Evidence from the size numbers decides; log in DESIGN_DOC §5.

## Tasks

- [x] Investigation above; findings in Notes with numbers.
- [x] gc policy decision → DESIGN_DOC §5.
- [x] Snapshot bookkeeping mechanism (chosen in investigation) implemented.
- [x] `rewind(ts)` per SDK-API; update SDK-API's sketch to the real shape.
- [x] Tests: wind → edit → delete → rewind to each phase shows the right world; rewind result immutable; present unaffected.

## Acceptance criteria

- Rewind returns correct historical states across winds, edits, and soft deletes in tests.
- Size-cost numbers are written down (the demo pitch needs an honest asterisk if docs grow fast).
- DESIGN_DOC §5 row for the gc decision.

## Notes / open questions

- **Size numbers** (`scratch/spike-rewind/spike.mjs`, 2026-08-11): realistic spool (200 entries, 300 wholesale edits, 1000 char edits, 40 soft deletes) encodes to **70.1 KB gc:on vs 94.0 KB gc:off — +34%**; load single-digit ms either way. The honest asterisk for the demo pitch: one body wholesale-replaced 1000× is **0.1 KB gc:on vs 87.8 KB gc:off** (~90 B per replaced edit, kept forever) — winds are cheap, editor churn on one body is linear in history. Snapshot log: ~470 B per moment at end-of-life (the delete-set is the growing part, still sub-KB after 1650 txns); 30 moments ≈ 11.5 KB, 154 ≈ 58 KB.
- **gc policy: universal gc:false, user-approved (2026-08-11)** — §5 row. The deciding argument beyond size being trivial at intimate scale: gc is per-doc, so opt-in would let one gc:on peer serve a gutted past to late joiners — mixed rooms give peers *different recoverable histories*. One story or no story.
- **Retro-compat, verified**: a snapshot predating a doc's gc:on life returns **silently empty bodies** — no throw. So pre-T-060 spools rewind only from their first post-upgrade moment; nothing to migrate, nothing corrupts. (Their `history` array starts empty anyway — the constraint is invisible in practice.)
- **Timestamp→snapshot mapping**: the boring one — a `history` root Y.Array of `{ts, snap}` (plain JSON, base64 `Y.encodeSnapshot`), appended by the writing peer, debounced 2 s idle / ≥ 10 s apart, deduped via `Y.equalSnapshots`, flushed on `leave()`. Rejected: reconstructing from the update log (no wall-clock on Yjs items; real invention) and per-transaction logging (log churn for no scrubber value). The append itself is a transaction — the logger ignores transactions that touch only the history array, or it would feed itself.
- **Yjs gotcha, verified in the spike**: `Y.createDocFromSnapshot` with a snapshot referencing structs the local doc hasn't received dies with a bare `TypeError` deep in yjs — so `rewind()` checks snapshot-sv ⊆ local-sv first and *skips* unsatisfiable moments (falls back to the nearest earlier one; `SpoolHistoryError` if none). Tested by hand-crafting an alien moment into the array.
- `rewind()` before the first recorded moment **throws** `SpoolHistoryError` rather than returning `[]` — an empty array would claim the spool didn't exist; not knowing ≠ nothing.
- Client vendor bundle rebuilt: the shipped client now runs gc:false and logs moments, so T-061's scrubber has history waiting when it lands.
