---
id: T-013
title: SDK tests incl. multi-writer verification
status: todo
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

- [ ] Three-writer suite: concurrent `wind()`s converge (all entries present, deterministic order); concurrent edits to the *same* body converge without loss (character-level merge, the reason bodies are Y.Text); concurrent edit + soft-delete of the same entry converges.
- [ ] Offline/rejoin: writer C accumulates changes offline (updates buffered), rejoins, everyone converges.
- [ ] Event-diff correctness under sync bursts: one remote transaction with 5 winds → exactly one `EntryChange` with 5 `added`.
- [ ] Lazy-body invariant: entry wound without body has no `entry:<id>` key in the doc (inspect raw doc).
- [ ] `persist: false` spools leave no IndexedDB residue (browser-env test or documented manual check).
- [ ] Record the multi-writer verdict in DESIGN_DOC §6 (turn "verify" into "verified, date, test file").

## Acceptance criteria

- `pnpm -r test` green; suite runs < 30s with network tests excluded by default.
- DESIGN_DOC §6 multi-writer bullet updated with the verdict and a pointer to the test file.

## Notes / open questions

- Anything Yjs does surprisingly under concurrency gets written down here — this ticket is the SDK's lab notebook.
