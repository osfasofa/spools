---
id: T-184
title: "A lone peer holds its socket — feed y-websocket's dead-socket timer from the resync tick — sign-off"
status: todo
milestone: M17
depends: [T-183]
---

## Goal

A client alone in a room keeps one websocket open for as long as the relay
does, instead of tearing it down and reconnecting every 33 seconds. Zero
protocol change, zero relay change; a few lines in the SDK's engine, and
every client benefits — a keeper on a wall, a browser tab left open on a
quiet spool, a vessel's headless seat.

## Context

T-183's second night measured it (`tickets/T-183-keeper-narration.md`,
Notes, the verdict block): two spools held by the keeper, nobody else in
either room, **5,326 reconnects in a night** — median gap 33.0 s, p90
33.1 s, offline 2.6 s each — to the tenth of a second on both spools
independently. The experiment that found the cause: a second Node client
sat in one room for 120 s and that spool went to **0 reconnects** while the
other, still alone, kept the beat.

The mechanism, verified in source:

- `y-websocket/src/y-websocket.js:99` — `const messageReconnectTimeout = 30000`,
  a **module constant, not an option** — closes the socket when no
  *message* has arrived in 30 s.
- A dumb relay never answers a lone peer's SyncStep1: peers are each
  other's server (DESIGN_DOC §5, "Relay role"), so with nobody else in the
  room nothing ever comes back.
- The relay's ping frames are websocket control frames; the provider never
  sees them as messages, so they don't refresh `wsLastMessageReceived`.
- Backoff caps at `maxBackoffTime` 2 500 ms → the observed 2.6 s offline.
  30 s + backoff = 33.0 s, forever.

T-182's first night showed only 50 because the owner's browser tab was in
the room most of the night, answering the 20 s resync; the 13–20 minute
gaps were that tab's screen going dark. Fifty and five thousand are one
mechanism, with and without company.

**What it costs today:** a TCP+TLS handshake and a fresh room join every
33 s per lone spool — ~2,600 a day per peg against the canonical relay. A
wall of ten spools is 26,000 connections a day from one household IP, a
number the relay's per-address caps (T-169) and Railway's edge may
eventually have opinions about. Zero entries lost; the export files stayed
right. Wasteful and noisy, not broken.

## Options (priced in T-183; the owner decides)

1. **Feed the provider.** On the SDK's own resync tick (`engine.ts`, the
   ~20 s SyncStep1 re-ask that DESIGN_DOC §5 "Client resync" already
   mandates), bump `provider.wsLastMessageReceived = Date.now()` — the
   field is public. This neuters y-websocket's *client-side* dead-socket
   detection. Liveness is still covered from the other end: the relay
   terminates a peer that misses a pong (`server.js` keepAlive, 30–60 s),
   the client sees that close and reconnects as before. Cheapest; a few
   lines; every client benefits. **Bakes in:** trusting the relay's ping
   for liveness. A half-open socket whose server-side terminate never
   arrives would linger until the client's next write errors, instead of
   being caught within 30 s.
2. **The relay answers.** Any application message would do — but the relay
   is opaque bytes by design, and a keyed client counts an unencrypted
   frame as `undecryptable`. **Rejected on the record:** it un-dumbs the
   relay.
3. **Fork the constant.** Patch or vendor y-websocket to make the timeout
   an option. A dependency fork for one number. **No.**
4. **Accept and document.** "A keeper alone reconnects every 33 s." Honest
   and free, and the relay pays for it in handshakes.

*Lean:* option 1. It is SDK-shaping (a liveness trade the SDK makes on
every client's behalf), not protocol-shaping — SPEC does not move — so it
wants the owner's sign-off, not a §5 row unless the owner wants one.

## Tasks

- [ ] **Sign-off:** option 1, or 4 — owner.
- [ ] `engine.ts`: on each resync tick, refresh the provider's
      last-message timestamp (only while the socket is open; never touch
      it while `roomFull` stand-back is in effect, so T-169's backoff is
      unchanged).
- [ ] Test: a lone peer on the workspace relay holds **one** socket for
      > 60 s — count `status` transitions / `ws` closes, expect zero. And
      the reverse: kill the relay under a lone peer, the client still
      notices (goes `offline`) within the relay's keepAlive window +
      backoff, so liveness from the other end is proven, not assumed.
- [ ] CHANGELOG (SDK, patch lane per RELEASING.md — no default or
      behavior a caller can see changes; the socket just stops churning).
- [ ] Keeper: nothing to change. Night three on the wall with the new
      build reads no 33 s metronome (owner at keyboard, optional — the test
      is the proof; the night is the confirmation).

## Acceptance criteria

- The test above is green: a lone peer holds one socket for > 60 s on the
  workspace relay, and still notices a dead relay.
- `spools-keeper` on the canonical relay, alone in a room, logs zero
  reconnects over an hour (T-183's narration shows it).

## Out of scope

- Anything on the relay (option 2 is rejected; T-183's "file evidence
  against the relay" rule stands — and the verdict is client-side).
- The unrelated 13–20 minute cadence from night one — explained in T-183
  as the owner's tab sleeping; nothing to do.

## Notes / open questions

- Drafted 5 Sep 2026 from T-183's verdict block, which asked for exactly
  this: "option 1, as its own ticket, with a test that a lone peer on the
  workspace relay holds one socket for > 60 s." Filed at the sync-up so it
  stops living only inside another ticket's Notes. Not implemented — the
  sign-off comes first.
