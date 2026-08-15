---
id: T-107
title: "spools-keeper: the always-on peer"
status: done
milestone: M10
depends: [T-100]
---

## Goal

`npx spools-keeper <link>` — a headless client on hardware you control that keeps the spool answered: to peers it's just a member who never sleeps; to the household it's the philosophically pure alternative to trusting any relay with ciphertext. Optional M10 ticket; zero protocol/relay/spec change.

## Context

Brief §3.D. It's a *client*: it was handed the link, and the link is the key exchange (SPEC §1). Node runtime: `persist: false` + `WebSocketPolyfill` (engine options), durability via the M8 round-trip — `importSpool`-shaped restore on start, debounced `export()` to a file on change. It answers SyncStep1 by construction (stock provider — peers are each other's server). If T-103 has landed, deposit participation comes free through the SDK; if not, the keeper still fixes the gap for its household the pure way.

## Tasks

- [ ] Package scaffold (`packages/spools-keeper`, plain ESM, thin over the SDK; aggressively boring).
- [ ] CLI: `npx spools-keeper <link> [--file <path>]` — restore if the file exists, connect, export debounced-on-idle, clean shutdown flush.
- [ ] Logs that respect the room: connection state and counts only — never content, never the key, never the full link.
- [ ] README: what it is, what it isn't (not a relay, not a service), and the honesty sentence: it holds the key because you handed it the link.
- [ ] Smoke: keeper up → writer winds + leaves → fresh client cold-opens and converges from the keeper alone (no pocket involved).

## Acceptance criteria

- The midnight scenario passes with *only* a keeper (v1 relay, no pocket) — proving the zero-protocol-change claim.
- Kill -9 mid-run loses at most the export debounce window; restart resumes from the file.

## Notes / open questions

- `packages/spools-keeper`: one ~120-line plain-ESM script over the SDK's public surface, no build step (the relay's discipline, inherited). `npx spools-keeper '<link>' [--file <path>]`.
- Restore-or-open turned out to be one expression: file exists → `importSpool` (applies + connects), else `openSpool`. Durability is `spool.doc.on('update')` → debounced `export()` to `tmp+rename` — body edits and history moments included (entry events alone would miss moment appends).
- A pleasant consequence discovered while writing the test: **the keeper is the async answer for keyless spools** — the pocket is keyed-only by decision 2, so plaintext spools' midnight story is exactly this. The smoke test leans into it: keyless spool on the real relay (pocket structurally out of the picture), writer leaves, cold reader converges from the keeper alone; then kill -9, restart from the file, and a third device converges from the restored keeper.
- For keyed spools the keeper composes with the pocket for free: `leave()` on shutdown flushes a deposit (T-103), and while running it answers live like any peer.
- Test gotcha worth remembering: after restarting the keeper, wait for `health.relay.connections ≥ 1` before opening the probe device — otherwise the probe's first SyncStep1 lands in an empty room and convergence waits a full 20 s resync interval.
- Engines `>=22`: `openSpool` in Node relies on the global `WebSocket` (the SDK's public open functions don't expose `WebSocketPolyfill`; fine for Node ≥21, documented here rather than widening the SDK surface).
- Publishing to npm is an owner-at-keyboard errand (T-002 precedent), listed in the M10 handoff.
