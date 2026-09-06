---
id: T-186
title: "SDK: splice(records) — the identity-preserving write; Entry.snapshot(); SpoolSpliceError; the reel-spike fixture as tests; the three recipes in SDK-API"
status: doing
milestone: M16
depends: [T-180]
---

## Goal

The one primitive the splice review chose (T-180, signed off 5 Sep 2026;
DESIGN_DOC §5 "The splice family"): `spool.splice(records)` writes complete
entry records — identity, time, author, parent, data, body — into a spool
exactly as given, in one transaction, idempotently, and refuses to write a
lie. With it the cut is three lines in any client, and the fork and the
rejoin are recipes in SDK-API that a test runs as written.

## Context

The brief is `docs/M16-splice-brief.md`; this ticket builds its §6 sketch
and is measured against its §9. Three clients (lore's v1, syrup's
`/branch`, the room's T-164) each reached under the SDK to copy entries
because `wind()` stamps `id` *and* `createdAt` — a retelling built from it
loses identity and order. The reel spike (`scratch/riff-reel/spike.mjs`)
already wrote the primitive by hand through `spool.doc` (§4 of the spike);
this ticket moves those twelve lines into `entry.ts` and gives them a
contract.

## The shape (§6, verbatim where it applies)

- `spool.splice(records: EntrySnapshot[]): Entry[]` — returns live handles
  in input order (the existing handle for an id already present).
  Synchronous, like `wind()`.
- `EntrySnapshot` is the input type — no new type. `Entry.snapshot()` is
  added so `keep.map(e => e.snapshot())` is the whole selection step;
  `export()` uses it too (one snapshot shape, one place).
- **Validation before any write:** string non-empty `id` and `kind`,
  string `author`, finite `createdAt`; every `parent` resolves inside the
  batch or in the target's `entries` map (soft-deleted parents count).
  One bad record rejects the whole batch with `SpoolSpliceError`
  (`.id` = the record, `.rule` = which rule), before a single write.
- **Write:** one `doc.transact` — for each *new* id: the meta map with the
  given fields (`data` structured-cloned, `deletedAt` carried verbatim),
  `entriesMap.set(id, meta)`, body text inserted when non-empty. The
  store's shadow/visibility bookkeeping and `entry` diff events fire as for
  any transaction.
- **Idempotence:** ids already in `entriesMap` are skipped entirely — no
  meta write, no body write, no event. A second `splice()` of the same
  input changes nothing in the doc, byte for byte.
- **Policy-free:** no selection, no flattening, no provenance, no key. The
  caller flattens explicitly (`{ ...rec, parent: undefined }`).

## Tasks

- [ ] `entry.ts`: `Entry.snapshot()`; `EntryStore.splice()` with the
      validation and the transaction; `SpoolSpliceError`.
- [ ] `spool.ts`: `splice()` passthrough; `export()` built on
      `Entry.snapshot()`.
- [ ] `index.ts`: export `SpoolSpliceError`.
- [ ] Tests (`splice.test.ts`), the brief's list: the reel spike's cut as
      the fixture (5 000 entries, half soft-deleted, the live half cut with
      flattening — identical order and bodies, every kept thread resolves);
      re-running is byte-identical; a dangling parent rejects before any
      write; parent-in-batch and parent-in-target both accept; a soft-deleted
      parent in the target accepts; soft-deleted records cross with
      `deletedAt`; `rewind()` in the new reel starts at its first moment;
      `entry` events fire once, as `added`, for the batch; a cold peer opens
      the reel from the pocket whole (the T-104 idiom against the real
      relay); the fork and rejoin recipes converge and *do* resurrect.
- [ ] SDK-API: the `splice()` section (shape, rules, the honesty sentence)
      and the three recipes — the cut, the fork (with branch-from-a-moment),
      the rejoin — as prose to copy; the parked entries retired.
- [ ] CHANGELOG `## 0.3.0 — unreleased` (minor lane: new surface).
- [ ] `pnpm client:vendor` so the static client's bundle carries it.

## Acceptance criteria (the brief's §9, the SDK's share)

- Running the cut twice from the same input produces a byte-identical
  second reel; splicing the kept entries back into the old reel is a no-op.
- A record with a dangling parent is refused before a single write, with
  an error naming the record.
- The fork and rejoin recipes, run from SDK-API's prose in a test,
  converge — and the test asserts the resurrection.
- `pnpm -r test` green; the relay's no-yjs proof untouched; SPEC.md's diff
  is empty.

## Notes / open questions

