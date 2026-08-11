---
id: T-060
title: rewind(ts) via Yjs snapshots (+ gc:false investigation)
status: todo
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

- [ ] Investigation above; findings in Notes with numbers.
- [ ] gc policy decision → DESIGN_DOC §5.
- [ ] Snapshot bookkeeping mechanism (chosen in investigation) implemented.
- [ ] `rewind(ts)` per SDK-API; update SDK-API's sketch to the real shape.
- [ ] Tests: wind → edit → delete → rewind to each phase shows the right world; rewind result immutable; present unaffected.

## Acceptance criteria

- Rewind returns correct historical states across winds, edits, and soft deletes in tests.
- Size-cost numbers are written down (the demo pitch needs an honest asterisk if docs grow fast).
- DESIGN_DOC §5 row for the gc decision.

## Notes / open questions

- (investigation numbers land here)
