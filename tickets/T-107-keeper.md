---
id: T-107
title: "spools-keeper: the always-on peer"
status: todo
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

(filled during work)
