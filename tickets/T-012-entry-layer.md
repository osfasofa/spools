---
id: T-012
title: "Entry layer: wind, entries, events, soft delete"
status: todo
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

- [ ] Entry class: metadata getters, `body` get/set (lazy Y.Text creation on first set), `text` (null until body exists), `children`, `delete()`, `restore()`.
- [ ] `wind(input)`: validate `kind` non-empty, uuid, stamp `author` (spool's option) + `createdAt`, write metadata map (+ body Y.Text if `body` given) in **one Yjs transaction**.
- [ ] `spool.entries`: sorted by `createdAt`, deleted excluded; document tie-break (id) so order is deterministic across peers.
- [ ] Observer wiring: deep observer on `entries` map + body Y.Text events → coalesce per transaction → `EntryChange`. Body edits surface as `updated`.
- [ ] Deleted↔restored transitions map to `deleted`/`added` in the diff (define + test, note in SDK-API if the shape needs amending).
- [ ] Unit tests for the above (two in-memory docs synced via `Y.applyUpdate` — no network needed).

## Acceptance criteria

- The docs/SDK-API.md "Entry points" + "Spool handle" + "Entry handle" examples run as written (modulo rewind/export stubs throwing `NotImplemented`).
- No-replay-on-load proven by test: populate doc, reopen, zero events fired before first change.
- Handle identity proven by test: `wind()` return === same entry from `spool.entries` === same in event payload.

## Notes / open questions

- `createdAt` is writer's wall clock — fine for intimate scale; note any test flakiness it causes (would motivate a logical-clock tiebreak, *not* a protocol change).
