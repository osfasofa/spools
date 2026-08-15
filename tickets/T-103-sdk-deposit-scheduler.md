---
id: T-103
title: "SDK: deposit scheduler"
status: done
milestone: M10
depends: [T-102]
---

## Goal

The other half of the loop: while you work, your spool quietly keeps the pocket current, and `leave()` doesn't tear down until the last deposit is in.

## Context

Mirror `HistoryLog` (history.ts:96-105, 174-193): armed only post-`whenReady`, `afterTransaction` listener **gated on `tr.local`** — T-102 applies deposits under a remote origin, so applied state can never self-feed a re-deposit. Session tag: 4 random bytes drawn at open. `leave()` ordering precedent is spool.ts:187-191 (`history.flush()` before engine teardown); the deposit flush is async and must complete before the websocket/doc die. Unload beacons are ruled out (64 KiB in-flight budget vs. 94 KB measured realistic doc — DESIGN_DOC §5 history row); the honest loss window is the last debounce.

## Tasks

- [ ] Scheduler: debounce ~10 s, min gap ~60 s (T-100-adjusted numbers), content transactions only, `tr.local` gate.
- [ ] Deposit build: `0xE2E3 ‖ v1 ‖ tag ‖ nonce ‖ ct` via existing `crypto.ts` `encrypt`; PUT to the tokened namespace.
- [ ] `leave()`: await a final flush before engine teardown; `visibilitychange → hidden`: best-effort early flush (real PUT).
- [ ] On open, post-merge: **deposit-if-ahead** (local state has anything the pocket lacked) and **refresh-if-stale** (newest fetched deposit older than half the advertised TTL) — findings 3-adjacent and 4 from the review round.
- [ ] Failure surfaces: 413/507 → `pocket` event + stop scheduling (degrade loudly to live-only); 429 → back off, keep min-gap discipline.
- [ ] The midnight **integration** test: A winds → deposits → leaves; B cold-opens against the same in-process relay → full spool. Plus the S3 per-tag sequence from T-100, now as a durable vitest.

## Acceptance criteria

- The full midnight loop passes headless in vitest end-to-end through the real SDK on both sides.
- A deposit-applied update never triggers a deposit (asserted, not assumed).
- `leave()` resolves only after the final PUT settles (or its failure is surfaced); tab-slam loss is exactly the last debounce window, documented in SDK-API notes.

## Notes / open questions

- The scheduler landed inside `PocketClient` (pocket.ts) rather than as a separate class — fetch and deposit share the token, tag, origin, and settled-state, and arming naturally follows the open-time fetch. Shape mirrors `HistoryLog` exactly: debounce (10 s) + min-gap (60 s), armed post-settle, `tr.local` gate. **Unlike HistoryLog there's no changed-type filter** — depositing never writes the doc, so `tr.local` alone is the entire self-feed guard (test 2 proves a reader who only applies never deposits).
- `leave()` ordering: `history.flush()` first (the moment lands in the doc), then `await pocket.flush()` (the final deposit carries it), then teardown — the flush test drives a 60 s debounce and still finds the deposit on the relay after `leave()`. Flush failure never blocks leaving; the doc is safe locally regardless.
- Deposit-if-ahead + refresh-if-stale both run at settle: ahead = any local state-vector clock beyond the union of applied deposits (empty pocket + non-empty doc counts); stale = newest deposit older than half the relay's advertised TTL. The repopulation test kills a memory-mode relay mid-test and watches the reopening device refill the pocket with zero new winds.
- Hard-limit degradation: 413 → `depositError: 'too-big'`, 507 → `'budget'` on the pocket state — scheduling stops (loud, once), live sync untouched. 429/network errors keep the dirty flag and retry on the next change under min-gap pacing.
- `visibilitychange → hidden` triggers a best-effort real-PUT flush (guarded `typeof document`); untested here (no DOM in the vitest env) — exercised manually in T-104's torture row.
- T-102's manual-deposit tests needed count relaxations (`≥`) — `leave()` now adds a twin deposit beside any manual PUT, which is the feature working, not a regression. Entry-level assertions unchanged.
- Full suite 105/105 (14 files); `tsup` + `tsc` green.
