---
id: T-003
title: "Spike: dumb-relay feasibility"
status: done
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

- [x] ~50-line broadcast server: `ws`, room = URL path, fan-out to room members (sender excluded), no parsing.
- [x] Two Node clients on one room: A writes, B receives; B writes, A receives.
- [x] Late-join: A writes 100 updates, *then* B connects → B converges (while A online).
- [x] Both-offline gap: A writes, disconnects; B connects alone → B sees nothing, no errors; A returns → converge.
- [x] Three clients concurrent writes → all converge.
- [x] Write up findings below: verdict, wrinkles hit, implications for T-040.

## Acceptance criteria

- Every scenario above has a recorded pass/fail with a one-line explanation.
- A clear verdict: **(a) dumb relay works as-is**, or **(b) needs a defined tweak** (e.g. relay replays a connection's first frames), or **(c) fallback to DESIGN_DOC option "both, honestly labeled"** — dumb relay for private spools, y-websocket servers documented as content-visible fallback.

## Notes / open questions

Spike lives in `scratch/spike-dumb-relay/` (relay ~30 lines, harness ~200). Run: `pnpm install --ignore-workspace && node spike.js`. Stack: y-websocket **3.1** (the major we adopted post-fosho), yjs 13.6.32, Node 24.

### Scenario results

| # | Scenario | Result | One-liner |
|---|---|---|---|
| S1 | Two clients, live sync both directions | **PASS** | A↔B converge through the blind pipe; step1 answered by peer's step2 |
| S1b | Awareness fan-out | **PASS** | both peers see each other's awareness state; no confusion |
| S2 | Late join, peer online (100 prior updates) | **PASS** | B converges from a **single step2** frame carrying all 100 keys |
| S3 | Join with nobody home | **PASS** | B waits quietly: 0 keys, 0 errors, no reconnect storm — matches "syncs when we're together" |
| S3a | Rejoin heals the waiting peer (stock options) | **FAIL — the real finding** | B never converges: it sent its step1 once (to an empty room) and nothing ever re-asks; A's rejoin step1 only pulls state *toward A* |
| S3b | Same, clients set `resyncInterval` | **PASS** | B converges within one resync period; relay untouched |
| S4 | Three clients, 20 concurrent writes each | **PASS** | all at 60 keys; redundancy measured: 40 update frames rx per client (= writes × (N−1), linear), only 3–4 redundant step2s each — harmless at intimate scale |
| S5 | Echo relay (sender included in fan-out) | **PASS but wasteful** | still converges; each client answers its *own* echoed step1 with a pointless step2 — confirms **exclude sender** is correct |

### The one wrinkle that matters (S3a)

y-websocket's client was designed against a stateful server: it asks (step1) exactly once, at connect. Through a dumb relay, peers answer each other's questions — but nobody ever *re-asks*. So a peer that joined an empty room and waits will receive **live** updates fine, yet never pulls **pre-existing** state a later-arriving peer brings. Confirmed in source (v3.1 `y-websocket.js`: step1 sent only in `onopen` and in the `resyncInterval` timer) and empirically.

The healing options considered:
1. **Client-side periodic step1 (`resyncInterval`)** — built into y-websocket, relay stays byte-blind, converges within one interval. Cost: a tiny state-vector frame per client per interval.
2. Relay replays/notifies on join — requires the relay to understand or replay protocol frames; contradicts the §5 "relay never parses" decision.
3. Event-driven re-ask on peer-join — impossible: a websocket client has no membership signal without inventing relay chatter.

→ Option 1 is the only one consistent with the dumb-relay decision. **Proposed for §5 (pending user sign-off): Spool clients MUST run a periodic resync (SDK sets `resyncInterval`, order of 15–30 s; exact value tuned in T-010/T-021).**

### Verdict

**(a) Dumb relay works as-is.** No relay tweak needed. Two obligations land elsewhere:
- **T-010 (SDK):** set `resyncInterval` on the websocket provider — this is what makes offline-gap reunions converge.
- **T-040 (relay):** fan-out must exclude the sender (echo is pure waste, S5); room = URL path works unchanged with the stock client.
