---
id: T-169
title: "Room-full lockout: per-IP room cap, and the SDK says 'full' instead of spinning"
status: done
milestone: M15
depends: [T-161]
---
## Goal

Knowing a room code can't lock the room, and a full room says so.

## Context

`MAX_CONNS_PER_ROOM` is 64 with no per-IP limit; the code is public by design
(in every URL and screenshot, visible to the relay). The 65th connection is
closed with 1013, which y-websocket retries forever — the room shows a spinner,
not an error (README + WHITEPAPER §7 document this as unfixed). Review finding
F4.

## Tasks

- [x] Relay: per-IP-per-room cap (proposal 8) behind `TRUST_PROXY`; README
      knob table. *(Shipped as `RELAY_CONNS_PER_IP_PER_ROOM`, default 0 =
      off — see Notes for why not 8.)*
- [x] SDK: observe close code 1013 (the encrypted WebSocket subclass sees
      `close` events; the plain path needs the provider's `connection-close`)
      → additive event `on('full')` and a `roomFull` getter (the status union
      stays closed, §5) → back off instead of hot-looping. *(SDK lane.)*
- [x] Room: notice line "this room is full — 64 connections." *(Room lane,
      5 Sep 2026.)*
- [x] Docs: retire the "a full room looks like a bad connection" sentence in
      the README and WHITEPAPER §7 once true. *(5 Sep 2026.)*

## Acceptance criteria

- The 65th connection produces a visible "room full" line within seconds.
  *(Needs the SDK + room halves.)*
- Per-IP cap test with two forwarded addresses. *(Done.)*

## Notes / open questions

### Landed — the SDK half (3 Sep 2026, SDK lane)

- **One path, not two.** y-websocket 3.1.0 already has the hook the ticket
  wanted to build: a `shouldReconnect(event)` predicate (its default treats
  4400–4499 as terminal) and a `closed` event that fires last, "so that a
  `closed` handler may call `provider.connect()`". The engine's predicate
  now also refuses 1013, the `closed` handler marks the room full, fires
  the listeners with the relay's reason (`'room full'`), and arms one
  timer that calls `connect()` after the backoff. Another 1013 lands right
  back in the same handler. The encrypted subclass overrides only
  `send`/`onmessage`, so the close event reaches the provider unchanged —
  tested with a keyed engine, not assumed.
- **Backoff: 30 s, `roomFullBackoffMs` on `SpoolEngineOptions`** (tests
  shrink it). Why 30 s and not exponential: a seat frees when a person
  leaves, which happens on human time; one upgrade attempt every 30 s from
  a waiting 65th costs the relay nothing and gets them in within half a
  minute of a seat opening. y-websocket's own loop was 200 ms → 2.5 s cap,
  forever — that is the spinner.
- **Surface:** `spool.roomFull` (boolean) and `on('full', (reason) =>
  …)`, mirrored on the engine as `roomFull` / `onFull`. `status` reads
  `offline` while standing back — honest (nothing is connecting) and the
  union stays closed. `ROOM_FULL_CLOSE_CODE` is exported as scaffolding for
  the room lane's tests.
- **The event fires on every refusal**, not on the false→true edge: each
  retry that is refused is a fact the app may want to show ("still full").
  Apps should render idempotently from `roomFull`; the room lane's notice
  line can subscribe once and read the getter.
- **A flicker to know about:** the relay completes the upgrade before
  closing, so the provider emits `connected` a few ms before the 1013
  close. `roomFull` clears on `connected` (that is also how a real
  admission clears it) and is set again on the close in the same tick —
  an app reading `roomFull` inside a `status` listener could see
  `connected`/false for one frame before `offline`/true and the `full`
  event. Rendering from the getter on the `full` event is the safe pattern.
  Clearing on `sync` instead was considered and rejected: a dumb relay
  never syncs a peer who is alone in the room, so `roomFull` would stick.
- **Tests** (engine.test.ts, +3, on a tiny `ws` server that accepts the
  upgrade and closes 1013 until told to admit): first refusal → `full`
  event, `roomFull`, `status === 'offline'`, exactly one attempt through
  250 ms of a 400 ms backoff (the stock loop would have tried twice more);
  second refusal after the backoff, said again; admit → connected,
  `roomFull` false, three attempts total. A keyed engine + `Spool` surface
  variant; and `leave()` during the backoff cancels the timer (no attempt
  after leaving).
- **Docs:** SDK-API (the `Spool` interface and a paragraph), CHANGELOG.
  The relay README's "which today's SDK experiences as an endless
  connect/drop cycle" (line ~144) and WHITEPAPER §7's "A full room looks
  like a bad connection" are now half-true: the SDK no longer spins, but
  the room does not yet show the line — those sentences retire with the
  room half, per the ticket's last task.
- Landed in commit `b2b751b` (filled in by the wrap-up commit).

### Remaining — relay lane, room lane, owner

- Relay: per-IP-per-room cap behind `TRUST_PROXY` + README knob table
  (relay lane; depends on T-161).
- Room: the "this room is full — 64 connections" notice, subscribing to
  `on('full')` and reading `roomFull` (room lane).
- Docs retirement of the two sentences above once the room shows the line.
- Acceptance run: 65 connections against a relay, the line visible within
  seconds (the SDK side is deterministic: the first refusal is reported on
  the first close).

The ticket stays `doing` until those report.

- **Relay half shipped (relay lane, 3 Sep 2026).** `RELAY_CONNS_PER_IP_PER_ROOM`
  counts a room's members from the same `clientIp(request)` (T-161's helper)
  at join; at the cap the socket is closed **1013** with reason
  `too many connections from this address` — the same code family as "room
  full" so the SDK half's `full` event covers both, with the reason telling
  them apart (browsers expose it as `event.reason`). Checked after the
  64-guard, so "room full" still wins when both apply. The address is kept
  in a `WeakMap` only while the knob is on; a freed seat is a seat again.
- **Default is 0 (off), not the proposed 8.** Behind Railway's proxy without
  `TRUST_PROXY` every client is the proxy's address, so an on-by-default cap
  of 8 would have locked the canonical relay's rooms at 8 sockets *total*
  the moment it deployed. The README says "enable together with
  `TRUST_PROXY`". Turning it on for the canonical relay is a defaults
  change — owner's call, after T-161's variable flip; 8 per address per
  room remains the proposal (a household's tabs, not a person).
- Tests (`test/hardening.test.js`): with `TRUST_PROXY=1` and a cap of 2,
  the third socket from `203.0.113.1` gets 1013 + the reason, `203.0.113.2`
  still joins, the same address opens a *different* room freely, and after
  one socket leaves a new one is admitted. Second test: stock knobs admit
  three sockets from one address (no cap at all), and with the cap set but
  `TRUST_PROXY` off, three different header values are still one address
  (the third is refused) — the header buys nothing.
- Not touched, on purpose: the SDK's handling of 1013 (still the
  connect/drop cycle the README describes) and the room's notice line —
  other lanes. This ticket stays `doing` until those land.

### Landed — the room half, and the close (5 Sep 2026)

- **The line.** `useRoom` carries `roomFull` (read from the getter on every
  `entry`/`status` event and on each `full` event — never cached on the
  edge, per the flicker note above) and `fullReason` (the relay's close
  reason). `App.tsx` renders one `.notice.warn.roomFull` line above the
  other notices: *"this room is full — the relay holds 64 connections per
  room and every one is taken. When someone leaves, this tab tries again on
  its own (about every half minute)."* A reason containing `address` (the
  per-IP cap) gets its own wording: *"too many tabs from this address…"*.
  Rendered from the getter, it clears itself the moment a connection is
  accepted — no dismiss button, nothing to remember.
- **Acceptance run, in the smoke suite (scenario 21).** 64 raw sockets take
  every seat of a fresh room on a local `spools-relay`; the app opens as the
  65th. Measured: the line was on screen **1 ms after the app reported
  ready** (the relay completes the upgrade and closes 1013 before the page
  has finished mounting); `status` read `offline` and `roomFull` true
  meanwhile; the raw seats were closed and the tab was **admitted after
  29.9 s** — the SDK's stand-back, exactly — with the line gone. 21/21
  green on the same run.
- **Two things the run taught:**
  1. *`status` is not the signal.* The SDK derives WebRTC signaling from the
     relay's host, and the local relay's signaling endpoint has no room cap
     — so with WebRTC on, `status` read `connected` (signaling reached)
     while the relay leg was refused. The SDK half's "status reads offline
     while standing back" is true of the websocket leg only; SDK-API §"A
     full room says so" now says so, and the room renders from `roomFull`,
     never from `status`. The scenario pins the ws-only contract by turning
     `RTCPeerConnection` off (the harness's existing offline idiom).
  2. *The first failure was the test's own link:* `room-smoke-905-full` is
     not a spool code (`word-word-NNN`), and the app said "this room
     wouldn't open" — which is the right behaviour for a bad link and a
     wrong test. The scenario mints `full-room-NNN` now.
- **Docs retired:** the relay README's "which today's SDK experiences as an
  endless connect/drop cycle — a full room looks like a bad connection" and
  WHITEPAPER §7's "A full room looks like a bad connection … Documented,
  unfixed, honest" bullet. The white paper's replacement keeps the honest
  half: there is no queue and no priority; the seat goes to whoever asks
  first after one frees. `apps/room/TESTING.md`'s smoke row reads 21.
- **Still the owner's, not this ticket's:** turning
  `RELAY_CONNS_PER_IP_PER_ROOM` on for the canonical relay (8 proposed) —
  a defaults call, now that `TRUST_PROXY` is live (T-161). The line already
  knows how to say it.
- Deployed with `scratch/deploy-room.sh` (gh-pages `room/` and
  chat.spools.lol). Both acceptance criteria met; **done.**
