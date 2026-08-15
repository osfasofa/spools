---
id: T-100
title: "Spike: pocket feasibility"
status: todo
milestone: M10
depends: []
---

## Goal

Answer with running code: **does the pocket loop actually deliver the midnight mixtape, and do the review-round hardenings hold?** Plus one demolition job: quantify the frame-log alternative's noise so option A retires on numbers, not prose. The verdict gates every other M10 ticket.

## Context

Brief §6 is the sketch under test (envelope `0xE2E3‖v1‖tag‖nonce‖ct`, key-derived namespace, per-tag K-ring); brief §3.A holds the frame-log claims to measure. Precedents: T-003 for the spike shape (scratch dir, `pnpm install --ignore-workspace`, results table + verdict), `scratch/spike-dumb-relay/` for the harness pattern. Drive the real published SDK where possible (T-090 precedent); reuse `crypto.ts` primitives for sealing.

Draft numbers the spike may overturn (record what changed in Notes): token derivation construction, K=4, debounce/min-gap, JSON-base64 GET response vs binary.

## Tasks

- [ ] Spike relay (~60 lines, throwaway): copy of `server.js`'s broadcast half + `PUT/GET /pocket/<room>/<token>` with per-tag ring in memory, K configurable.
- [ ] **S1 midnight loop:** keyed client A (real SDK, `persist: false`, `WebSocketPolyfill`) winds entries with bodies → seals `Y.encodeStateAsUpdate` → PUT → `leave()`s. B cold-opens the empty room, GETs, decrypts, `Y.applyUpdate` → full convergence (entries, bodies, history array).
- [ ] **S2 cold open with persistence:** same loop with `fake-indexeddb` — B persists, closes, reopens fully offline → entries still there, sealed at rest.
- [ ] **S3 divergence:** A and B diverge offline, both deposit (distinct tags). C cold-opens → union. Then the review sequence: **K=1 fails** (last write only) and **an unpartitioned last-K ring fails after K solo deposits from A** (B's worldview flushed) — the per-tag ring passes both.
- [ ] **S4 namespace fencing:** PUTs under a wrong token are invisible to readers deriving the true token; a reader-side garbage deposit (right namespace, wrong key — a key-holder gone weird) is dropped + counted, doc untouched.
- [ ] **S5 old-relay 200-trap:** against the *actual current* `server.js`: GET/PUT get `200` + health JSON; the envelope check (`format: "spool-pocket"` absent) must read as *no capability*, never "empty pocket".
- [ ] **S6 frame-log noise:** instrumented relay counts frames/bytes by category for a connected-but-idle keyed client (compressed `resyncIntervalMs`), extrapolated to the 20 s default per hour, vs. the doc's actual content bytes. The brief's ~180 step1/hr claim, measured.
- [ ] Results table + verdict + draft-number adjustments in Notes below.

## Acceptance criteria

- Every scenario has a recorded pass/fail with a one-liner, T-003 style.
- A clear verdict: (a) sketch works as drafted, (b) works with named adjustments (list them), or (c) a structural problem sends M10 back to the brief.
- The S6 numbers are in the table — option A's retirement becomes empirical.
- Spike code lives in `scratch/spike-pocket/`, runnable with two commands, not shipped.

## Notes / open questions

(filled during the spike)
