---
id: T-003
title: "Spike: dumb-relay feasibility"
status: todo
milestone: M0
depends: []
---

## Goal

Answer one question with running code: **do y-websocket clients sync correctly through a relay that only broadcasts bytes and never parses them?** The answer gates the relay design (T-040) and a headline claim of the whole project.

## Context

DESIGN_DOC §5 (relay role decision). Standard y-websocket servers (`setupWSConnection`) parse every message and keep a server-side doc — that's how they serve late joiners and why they can't carry encrypted frames. A dumb broadcaster instead relies on *peers* answering each other's sync steps: client A joins, sends SyncStep1, relay fans it out, client B answers with SyncStep2 directly through the pipe.

Expected wrinkles to probe:
- **Late join with no peers online:** nobody answers SyncStep1 → the doc simply doesn't catch up until a peer appears. That matches Spool's v1 story ("syncs when we're together") — confirm the client degrades gracefully (no error spiral, no reconnect storm).
- **Awareness protocol** messages fanning out to N peers — verify no confusion.
- **Echo:** should the relay send a client's own frames back to it? (Suspect no — exclude sender from fan-out. Verify.)
- 3+ clients: redundant SyncStep2 answers — wasteful but harmless? Measure roughly.

Harness pattern: fosho `scripts/backup-daemon.ts` — Node + `globalThis.WebSocket = ws` polyfill + `WebsocketProvider`. Throwaway code; lives in `scratch/` or the spike branch, not shipped.

## Tasks

- [ ] ~50-line broadcast server: `ws`, room = URL path, fan-out to room members (sender excluded), no parsing.
- [ ] Two Node clients on one room: A writes, B receives; B writes, A receives.
- [ ] Late-join: A writes 100 updates, *then* B connects → B converges (while A online).
- [ ] Both-offline gap: A writes, disconnects; B connects alone → B sees nothing, no errors; A returns → converge.
- [ ] Three clients concurrent writes → all converge.
- [ ] Write up findings below: verdict, wrinkles hit, implications for T-040.

## Acceptance criteria

- Every scenario above has a recorded pass/fail with a one-line explanation.
- A clear verdict: **(a) dumb relay works as-is**, or **(b) needs a defined tweak** (e.g. relay replays a connection's first frames), or **(c) fallback to DESIGN_DOC option "both, honestly labeled"** — dumb relay for private spools, y-websocket servers documented as content-visible fallback.

## Notes / open questions

- (spike findings land here; protocol-shaping outcomes also get a DESIGN_DOC §5 row)
