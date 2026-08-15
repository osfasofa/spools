---
id: T-101
title: "Relay: the pocket capability"
status: todo
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

(filled during work)
