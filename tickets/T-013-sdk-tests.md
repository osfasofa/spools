---
id: T-013
title: SDK tests incl. multi-writer verification
status: done
milestone: M1
depends: [T-012]
---

## Goal

Confidence pass over the whole SDK, including the parked question DESIGN_DOC §6 asks us to verify: **multi-writer beyond two people just works.** This closes milestone M1.

## Context

T-011/T-012 carry their own unit tests; this ticket is the integration layer. Two harness shapes, both networkless where possible:

- **In-memory sync**: N `Y.Doc`s cross-applied via `Y.applyUpdate` / update events — deterministic, fast, covers CRDT-level behavior.
- **Node + real provider** (only if needed for provider-level behavior): `globalThis.WebSocket = ws` polyfill per fosho `scripts/backup-daemon.ts:24–26`, against a local relay or fosho's deployed one. Keep these few and skippable (network flake).

## Tasks

- [x] Three-writer suite: concurrent `wind()`s converge (all entries present, deterministic order); concurrent edits to the *same* body converge without loss (character-level merge, the reason bodies are Y.Text); concurrent edit + soft-delete of the same entry converges.
- [x] Offline/rejoin: writer C accumulates changes offline (updates buffered), rejoins, everyone converges.
- [x] Event-diff correctness under sync bursts: one remote transaction with 5 winds → exactly one `EntryChange` with 5 `added`.
- [x] Lazy-body invariant: entry wound without body has no `entry:<id>` key in the doc (inspect raw doc).
- [x] `persist: false` spools leave no IndexedDB residue (browser-env test or documented manual check).
- [x] Record the multi-writer verdict in DESIGN_DOC §6 (turn "verify" into "verified, date, test file").

## Acceptance criteria

- `pnpm -r test` green; suite runs < 30s with network tests excluded by default.
- DESIGN_DOC §6 multi-writer bullet updated with the verdict and a pointer to the test file.

## Notes / open questions

- Anything Yjs does surprisingly under concurrency gets written down here — this ticket is the SDK's lab notebook.
- **Verdict: multi-writer just works.** `src/multiwriter.test.ts`, all in-memory (no network tests needed — provider-level behavior was already covered by `engine.test.ts` against a local dumb relay). Full suite: 53 tests, ~330 ms.
- Behaviors worth knowing (none surprising, all now pinned by tests):
  - **Concurrent edit + delete both apply.** The tombstone hides the entry while the body edit merges underneath; `restore()` reveals the edited body. Soft-delete-as-tombstone earns its keep here — a hard delete would have thrown away bob's concurrent context.
  - **Concurrent delete-vs-restore is LWW on the `deletedAt` key**: which side wins is nondeterministic (Yjs client-id ordering), but every peer agrees on the winner. Agreement, not the specific outcome, is the invariant our test asserts — same posture the design doc takes on `author` honesty.
  - **Order determinism holds cross-writer even with identical `createdAt`** (forced via fake timers): the id tie-break yields the same sequence on every peer.
  - Sync-burst diffs classify exactly (a single applied update carrying a wind + an edit + a delete → one event with one entry in each bucket).
- `persist: false` in Node: construction succeeding *is* the residue proof (Node has no `indexedDB`; `persist: true` throws). Manual browser check for the paranoid: DevTools → Application → IndexedDB after using a `persist: false` spool — no database named after the code appears (the db is only created by `IndexeddbPersistence`, which `persist: false` never constructs).
- Harness note: `syncAll` does 2 rounds of pairwise state-vector exchange = transitive closure for any topology; "offline" is just being left out of a `syncAll` call. Deterministic, no timers, no flake.
