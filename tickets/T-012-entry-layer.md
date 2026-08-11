---
id: T-012
title: "Entry layer: wind, entries, events, soft delete"
status: done
milestone: M1
depends: [T-010, T-011]
---

## Goal

The human-scale API over the raw doc: `wind()` returning a live Entry handle, `spool.entries`, diff events, soft delete, threading. After this ticket the SDK matches docs/SDK-API.md for everything except rewind/export/encryption.

## Context

All contracts specified in **docs/SDK-API.md** (decisions in DESIGN_DOC §5):
- Doc shape: `Y.Map('entries')` → nested per-entry `Y.Map` of metadata; per-entry `Y.Text` at root key `entry:<id>`, created **lazily** only when a body exists.
- `wind()` is sync, returns the live Entry handle.
- `on('entry')` emits `{added, updated, deleted}`; batched per Yjs transaction; **no replay on load**.
- Soft delete: `deletedAt` set; `spool.entries` excludes deleted; `restore()` clears it.
- Entry handles are live views (getters read through to Yjs), never snapshots; one handle instance per id (cache by id so `wind()` return, `entries` member, and event payloads are `===`).

Nobody outside the SDK touches raw `Y.Map`/`Y.Text` — but `spool.doc` and `entry.text` stay exposed as the power-user escape hatch.

## Tasks

- [x] Entry class: metadata getters, `body` get/set (lazy Y.Text creation on first set), `text` (null until body exists), `children`, `delete()`, `restore()`.
- [x] `wind(input)`: validate `kind` non-empty, uuid, stamp `author` (spool's option) + `createdAt`, write metadata map (+ body Y.Text if `body` given) in **one Yjs transaction**.
- [x] `spool.entries`: sorted by `createdAt`, deleted excluded; document tie-break (id) so order is deterministic across peers.
- [x] Observer wiring: deep observer on `entries` map + body Y.Text events → coalesce per transaction → `EntryChange`. Body edits surface as `updated`.
- [x] Deleted↔restored transitions map to `deleted`/`added` in the diff (define + test, note in SDK-API if the shape needs amending).
- [x] Unit tests for the above (two in-memory docs synced via `Y.applyUpdate` — no network needed).

## Acceptance criteria

- The docs/SDK-API.md "Entry points" + "Spool handle" + "Entry handle" examples run as written (modulo rewind/export stubs throwing `NotImplemented`).
- No-replay-on-load proven by test: populate doc, reopen, zero events fired before first change.
- Handle identity proven by test: `wind()` return === same entry from `spool.entries` === same in event payload.

## Notes / open questions

- `createdAt` is writer's wall clock — fine for intimate scale; note any test flakiness it causes (would motivate a logical-clock tiebreak, *not* a protocol change). → No flakiness; ties forced with fake timers confirm the id tie-break holds.
- **Event pipeline shape:** one `doc.on('afterTransaction')` handler + a shadow visibility map (`id → visible`), instead of stacked observers. A transaction's touched entry ids are recovered from `tr.changed` (the entries map, nested meta maps, and root `entry:<id>` texts via reverse lookup in `doc.share`); each id classifies against the shadow: invisible→visible = `added`, visible→invisible = `deleted`, visible→visible = `updated`. Natural per-transaction batching, one code path for local and remote changes.
- **No-replay mechanics:** the store arms after `whenReady`, snapshotting what already exists into the shadow. Corollary (documented contract, tested): changes made *before* `await`ing new/openSpool fire no events either.
- Decisions made where SDK-API was silent, none amending the shape:
  - Touching an *invisible* entry (e.g. body edit on a soft-deleted one) fires nothing; `restore()` surfaces it as `added`. Deleted→restored = `deleted`/`added`, as the ticket suggested.
  - A body text arriving *before* its metadata (partial sync) stays silent; the entry events once metadata lands.
  - `children` excludes soft-deleted, matching `spool.entries` (SDK-API note clarified).
  - Body existence = the root `Y.Text` is materialized in the local doc. A body created empty on another peer produces no update, so it doesn't exist here until its first character arrives — one honest sentence instead of an existence-tracking side channel.
- 43 tests green (14 new). `rewind()`/`export()` stubs throw `NotImplementedError` naming their milestone.
