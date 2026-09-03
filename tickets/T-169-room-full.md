---
id: T-169
title: "Room-full lockout: per-IP room cap, and the SDK says 'full' instead of spinning"
status: doing
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

- [ ] Relay: per-IP-per-room cap (proposal 8) behind `TRUST_PROXY`; README
      knob table.
- [x] SDK: observe close code 1013 (the encrypted WebSocket subclass sees
      `close` events; the plain path needs the provider's `connection-close`)
      → additive event `on('full')` and a `roomFull` getter (the status union
      stays closed, §5) → back off instead of hot-looping.
- [ ] Room: notice line "this room is full — 64 connections."
- [ ] Docs: retire the "a full room looks like a bad connection" sentence in
      the README and WHITEPAPER §7 once true.

## Acceptance criteria

- The 65th connection produces a visible "room full" line within seconds.
- Per-IP cap test with two forwarded addresses.

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
- Landed in commit `TBD-T169` (filled in by the wrap-up commit).

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
