---
id: T-103
title: "SDK: deposit scheduler"
status: todo
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

(filled during work)
