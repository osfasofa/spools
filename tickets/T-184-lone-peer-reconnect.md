---
id: T-184
title: "A lone peer holds its socket — feed y-websocket's dead-socket timer from the resync tick — sign-off"
status: done
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

- [x] **Sign-off:** option 1 — owner, 5 Sep 2026.
- [x] `engine.ts`: refresh the provider's last-message timestamp while the
      socket is open (a 10 s timer of the SDK's own — see Notes on why not
      the resync tick itself); untouched during `roomFull` stand-back, where
      the socket is closed anyway.
- [x] Test: a lone peer on the workspace relay holds **one** socket for
      65 s (the relay counts every upgrade; one `connected` transition), then
      the relay is closed under it and the client says offline within 5 s.
      Plus the control: with the heartbeat off, the relay sees a second
      upgrade inside 40 s — the T-183 metronome, reproduced in the suite.
- [x] CHANGELOG (SDK, under the unreleased 0.2.1 — patch lane; ships with
      T-185).
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
- **Signed off and landed, 5 Sep 2026 — option 1.** One deviation from
  the ticket's own wording: "on the resync tick" isn't reachable. The
  resync is y-websocket's private `_resyncInterval`, and the SyncStep1 it
  sends goes out through `ws.send` — which the SDK only wraps for *keyed*
  spools (the sealed-transport subclass), so hooking the send would have
  fixed keyed rooms and left keyless ones on the metronome. The engine
  runs its own `setInterval` instead: every 10 s (a third of the 30 s
  constant, so a missed tick still lands inside the window), if
  `provider.wsconnected`, set `provider.wsLastMessageReceived = Date.now()`
  — the same clock the provider uses (`lib0/time.getUnixTime` *is*
  `Date.now`). Both fields are public on the provider's type. The timer is
  `unref()`'d so it never keeps the keeper's process alive, and `leave()`
  clears it. New engine option `socketHeartbeatMs` (default 10 000, 0 =
  the provider's own behaviour) exists so the control test can reproduce
  the bug; it is `@internal` like the engine and not on the SDK surface.
- Measured in the suite (`engine.test.ts`): with the heartbeat, one
  upgrade in 65 s and one `connected` transition; without it, the second
  upgrade arrives at ~33–36 s, exactly T-183's beat. The dead-relay half:
  closing the relay under the lone peer flips `status` off `connected`
  within the 5 s bound (the close event still reaches the provider; the
  heartbeat only feeds the *message* clock, never the close path). The two
  tests add ~100 s to the SDK suite — the ticket asked for > 60 s of real
  time and there is no honest way to fake y-websocket's constant.
- What this bakes in, restated for the record: a half-open socket that the
  relay never terminates (its ping/pong is the detector now) lingers until
  the client's next write errors, where the provider's own timer would have
  caught it inside 30 s. The canonical relay pings every `PING_TIMEOUT_MS`
  and terminates on a missed pong, so the window is that interval, not
  forever.
- The keeper needs no change; it picks the default up from the SDK. Night
  three is the owner's confirmation, not the proof.
