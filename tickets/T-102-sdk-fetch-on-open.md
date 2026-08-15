---
id: T-102
title: "SDK: pocket fetch-on-open"
status: todo
milestone: M10
depends: [T-100]
---

## Goal

Opening a keyed spool checks the pocket: derive the namespace token, probe capability, fetch, verify, decrypt, merge — so the midnight open renders the full mixtape with no client code changes anywhere.

## Context

Brief §6 fetch side. The merge is `importSpool` semantics (`Y.applyUpdate` after `whenReady` — which stays strictly local, engine.ts:82). Mirror the drop-and-count discipline of `on('undecryptable')` (engine.ts:151-154) for deposits that fail authentication. `SpoolStatus` stays closed; pocket activity is an additive `on('pocket')` event (`checking` / `applied` / `empty` / `unavailable`), joining the overload list at spool.ts:124-127.

## Tasks

- [ ] Token derivation from the key (T-100's settled construction), domain-separated; no key → the pocket code path doesn't exist for this spool.
- [ ] Capability probe via health JSON `pocket` block, cached per relay origin; HTTP origin derived from the ws relay URL.
- [ ] GET + envelope verification: version-gated, and the 200-trap rule — a 200 without `format: "spool-pocket"` is `unavailable`, never `empty`.
- [ ] Decrypt each deposit; drop-and-count failures (surfaced alongside the undecryptable counter); `Y.applyUpdate` survivors after `whenReady`, distinct transaction origin (so T-103's `tr.local` gate ignores them by construction).
- [ ] `on('pocket')` event + a `spool.pocket` snapshot getter if the event alone proves awkward for clients (decide with T-104's needs in view; record the call in Notes).
- [ ] Failure surfaces: network/HTTP errors → `unavailable` + degrade to live-only; never block `whenReady` or `open()` on the pocket.
- [ ] Tests: vitest against an in-process T-101 relay + the old-relay control (real `server.js`), including the trap, wrong-key deposits, and cold open via `fake-indexeddb`.

## Acceptance criteria

- Midnight fetch works headless in vitest: cold client + populated pocket → full entries, `pocket` event sequence `checking → applied`.
- Old relay → exactly v1 behavior + `unavailable`; nothing thrown, nothing lost.
- A plaintext spool never touches pocket code (keyed-only is structural).

## Notes / open questions

(filled during work)
