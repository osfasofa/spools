---
id: T-101
title: "Relay: the pocket capability"
status: done
milestone: M10
depends: [T-100]
---

## Goal

`spools-relay` grows its third job, honestly: hold sealed deposits it cannot read. Everything the brief §6 sketch promises the relay does, with T-100's adjustments applied — while the broadcast half stays byte-for-byte untouched.

## Context

Brief §6 (endpoints, per-tag ring, TTL) and the review-round bounds (§5 post-review): aggregate budget + per-IP admission (finding 2), touch-on-read (finding 4). House constraints: plain ESM JS, no build step, no new heavy deps, and the header comment's proof — the relay imports neither yjs nor y-websocket — must stay true (deposits are opaque blobs; only the 7-byte plaintext header is read).

## Tasks

- [ ] `PUT /pocket/<room>/<token>` — validate sizes + envelope header (magic/version/tag), store in the per-tag ring (newest per tag, ≤`POCKET_K` tags, evict stalest tag). Responses per brief: 200 envelope JSON / 413 / 429 / 507.
- [ ] `GET /pocket/<room>/<token>` — envelope JSON, newest-first, one per tag; touch-on-read refreshes the ring's TTL.
- [ ] CORS: allow PUT on `/pocket/` paths (the global header currently allows only `GET, OPTIONS` — browser depositors die at preflight otherwise); everything else unchanged.
- [ ] TTL sweep (`POCKET_TTL_DAYS`, default 60); memory store default, `POCKET_DIR` for files at `<room>/<token>/<tag>` — no database.
- [ ] Aggregate bounds: `POCKET_MAX_TOTAL_BYTES` with stalest-namespace-first eviction; boring per-IP PUT admission caps. Per-blob `POCKET_MAX_BYTES` (default = `MAX_FRAME_BYTES`).
- [ ] Health JSON gains the `pocket` block (counts + advertised limits only — never namespace ids, matching "counts only, never content").
- [ ] Tests: node test scripts proving ring/TTL/caps/trap behavior against a running instance (relay stays build-free); the no-yjs grep-proof still passes.
- [ ] README: the capability, the knobs, and the honesty sentence — what the relay now holds and observes.

## Acceptance criteria

- All endpoint behaviors demonstrably match the brief (or T-100-adjusted) sketch, including the 200-envelope discipline that defeats the old-relay trap.
- A relay started with no pocket env vars behaves exactly like today except for the new endpoints; restart in memory mode degrades to v1 semantics, silently and safely.
- Broadcast half diff: zero lines. Grep-proof: passing.

## Notes / open questions

- Landed as one new section in `server.js` (+214/−3; the 3 removed lines are the extended header comment and the CORS methods line). **The broadcast fan-out is diff-identical** — the upgrade router still has exactly two jobs, so its "everything else is a wrong number" comment stays true; the pocket is HTTP, not an upgrade.
- 12 node:test tests (`pnpm test`), each spawning real server instances with per-test knobs: health shape (old fields intact + pocket block), broadcast untouched (fan-out, sender excluded), envelope roundtrip, 400/413 refusals, per-tag ring (same tag replaces; K+1th evicts stalest), namespace isolation, 429 per-IP admission, relay-wide budget with stalest-first eviction + 507, TTL sweep with touch-on-read survival (real timers, ~2.6 s TTL), `POCKET_DIR` restart persistence (one plain file per tag, index rebuilt from mtimes), 405/bad-segment discipline, and the no-yjs absence proof — now enforced by a test rather than asserted by a comment.
- Disk mode deliberately boring: no database, no sidecar index — `<room>/<token>/<tag>` files; boot rescans and touch times restart as deposit times (documented). Namespace segments are charset-gated (`[A-Za-z0-9_-]{1,64}`) as the path-traversal guard; codes and base64url tokens both fit.
- Node 22's `--test` wants file globs, not bare directories (`node --test test/*.test.js`).
- Deviation from the brief's draft: none of substance. Health block field is `rooms` (distinct room segments) as drafted; 507 body says `error: 'relay storage budget exhausted'`.
- Container note (same as T-100): Node 22 + corepack pnpm 11.21; repo pins Node 24 via mise, unavailable here — nothing used is version-sensitive (node:test needs ≥18, engines already say ≥18).
