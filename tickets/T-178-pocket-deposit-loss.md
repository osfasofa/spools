---
id: T-178
title: "Pocket deposits can be lost at leave — evidence from syrup and manyhands"
status: todo
milestone: M16
depends: [T-161]
---

## Goal

A deposit never fails silently. Where loss is physics, the SDK says so;
where it is a race or a swallowed error, it stops happening.

## Context

Two vessels found it independently and neither filed it (ECOSYSTEM's rule 7
says friction flows back as evidence — this ticket is that filing):

- **syrup**, `HANDOFF.md` §5 (Sep 2026): *"a spool lives in the pocket only
  after `leave()` flushes … Headless builders that close without leave()
  produce rooms that come back EMPTY. Worse: a profile revisiting a room it
  created can fail to deposit NEW winds (solar moons vanished twice)."* Its
  workaround: furnish rooms from fresh browser contexts, one room per
  context.
- **familiar / manyhands**, evidence #8 (Aug 2026): across N=80 swarm runs,
  *"deposit loss, not settle timing"* — 0–4 of 80 lost per run; fixed
  downstream by verifying deposits landed and retrying.

Reading `pocket.ts` and `server.js`, four candidate mechanisms — the repro
should tell them apart:

1. **429 on leave, swallowed.** A rate-limited PUT sets `dirty` and waits
   for the min-gap, but `leave()` destroys the client right after
   `flush()`, so the final deposit is lost with no `depositError` (429
   isn't one). The canonical relay's per-IP bucket is effectively global
   behind Railway (T-161), so swarms and test suites are exactly the
   high-rate case that trips it.
2. **Unload without keepalive.** The `visibilitychange` flush is a plain
   `fetch`; a tab or headless context closing mid-PUT cancels it.
   `keepalive: true` survives unload for bodies ≤ 64 KiB, which covers most
   intimate spools.
3. **`persist: false` has no heal path.** Deposit-if-ahead on the next open
   repairs a lost deposit for persisted spools (IndexedDB still holds the
   winds) — never for memory-only clients: syrup's satchel and peeks,
   headless builders, the keeper before its first export.
4. **The ring, by design.** More than `POCKET_K` isolated writers outrun the
   ring (documented in the relay README). N=80 may be partly this; the
   repro must separate it from 1–3.

## Tasks

- [ ] Repro harness (`scratch/`): persist:false writer winds and leaves
      within the debounce; same under a forced 429 (a relay with
      `POCKET_PUTS_PER_MIN=1`); same with the context closed mid-PUT.
- [ ] On `leave()`, retry a 429'd final deposit with backoff inside a
      bounded wait (proposal: 3 tries within ~5 s), and surface the outcome
      — `depositError: 'rate-limited'` on the pocket state, or a value
      resolved by `leave()`; **sign-off** on which (the status union stays
      closed; this is additive either way).
- [ ] `keepalive: true` on the flush PUT when the sealed blob is ≤ 64 KiB.
- [ ] Docs: SDK-API pocket section and the keeper README name the
      persist:false gap plainly.
- [ ] Tell syrup and manyhands to drop their workarounds once shipped.

## Acceptance criteria

- The harness shows zero loss under 429 and under context close for small
  spools, and a named error where loss remains.
