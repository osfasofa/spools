---
id: T-100
title: "Spike: pocket feasibility"
status: done
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

Spike lives in `scratch/spike-pocket/` (pocket relay ~130 lines, harness ~230). Run: `pnpm install --ignore-workspace && node spike.js`. Stack: the **published** `spools@0.0.1` driven through its public API only, ws, tweetnacl, fake-indexeddb, yjs 13.6.32. Container had Node 22 (mise/Node 24 unavailable in this session's environment); nothing used is version-sensitive.

### Scenario results

| # | Scenario | Result | One-liner |
|---|---|---|---|
| S1 | Midnight loop (writer gone, cold reader) | **PASS** | B renders all 8 tracks + 1 rewind moment from the pocket alone; room was empty |
| S2 | Cold open persists (fake-indexeddb) | **PASS** | pocket-applied state survives close/reopen via encrypted IndexedDB; empty room = storage-only by construction |
| S3a | K=1 divergence | **PASS** | predicted failure confirmed: only B's 3 entries survive; A's worldview evicted |
| S3b | Unpartitioned ring, K solo re-deposits | **PASS** | review finding 3 confirmed: 4 solo deposits from A flush B's only worldview out of a last-4 ring |
| S3c | Per-tag ring, same sequence | **PASS** | 2 deposits (newest per tag), union holds all 5 entries — solo re-deposits only replace A's own slot |
| S3d | Self-collapse after merge | **PASS** | the merger's single newest deposit contains the whole union; older tags become redundant and age out |
| S4a | Cross-namespace garbage | **PASS** | six garbage deposits under a guessed token never touch the ring readers actually derive |
| S4b | In-namespace garbage drop-and-count | **PASS** | relay stores what it cannot verify (by design); reader drops 1, counts it, doc untouched |
| S5 | Old-relay 200-trap | **PASS** | old relay 200s every GET/PUT with health JSON; envelope + health-block rules read it as NO capability, never "empty" |
| S6 | Frame-log noise (idle keyed client, stock 20 s resync) | **PASS** | 11 frames / 584 B per 70 s idle ⇒ ~566 frames ≈ **29.3 KiB per idle hour vs 710 B of content — a frame log records ~42× the doc per hour of nothing** |

### The numbers that retire option A (S6)

Measured at the honest default (`resyncIntervalMs` 20 s, which `newSpool` doesn't even expose for compression — so this ran in real time): an idle, alone-in-a-room keyed client produced 11 frames / 584 B per 70 s. The arithmetic floor is 180 resync SyncStep1s/hour; the measured rate (~566 frames/hr) is ~3× that because the provider's alone-in-a-room ~30 s message-timeout reconnect cycling (the SPEC §3 non-normative warning, observed live) adds a step1+awareness burst per cycle. Every frame is sealed and indistinguishable — nothing for a log to filter on. The banked frame-log sketch is hereby retired on evidence, per the brief's §3.A.

### Surprises & deviations

- **The whole midnight loop needed zero private API.** `importSpool` accepts a minimal export shell (`parseExport` reads only `format`/`version`/`code`/`doc`), so deposit-apply = wrap + import. T-102 can reuse exactly this merge path internally.
- **Review findings 1 and 3 reproduced verbatim** (S4a shows the namespace fix fencing them out; S3b is the reviewer's overwrite sequence, failing exactly as predicted).
- Token derivation needs no new dependency: `nacl.hash` is SHA-512; `token = base64url(SHA-512("spool-pocket-v1" ‖ key)[0..12))` — 16 URL-safe chars. Construction confirmed workable; T-106 writes it normatively.
- `fake-indexeddb/auto` must be imported **before** `spools` — the engine's `inBrowser` check is module-load-time. T-102/T-103 test harnesses will hit the same gotcha.
- Harness trivia: copying `server.js` with a provenance comment pushed its shebang to line 3 — a mid-file shebang is an ESM SyntaxError. The S5 control is the byte-identical relay minus that line.
- Deviation from the brief's ticket line: plain node scripts, not vitest (T-003 precedent; one command, zero config). The durable vitest home for the midnight loop is T-103's integration test, as planned.

### Verdict

**(a) The sketch works as drafted.** All draft choices survived contact: envelope layout (`0xE2E3‖v1‖tag‖nonce‖ct`), token derivation, K=4 per-tag ring, JSON+base64 GET envelope, capability detection. No adjustments required; T-101 is unblocked and can implement the sketch as written (plus the aggregate-budget/touch-on-read items from the review round, which the spike didn't need to prove — they're bookkeeping, not physics).
