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

- [x] Relay: per-IP-per-room cap (proposal 8) behind `TRUST_PROXY`; README
      knob table. *(Shipped as `RELAY_CONNS_PER_IP_PER_ROOM`, default 0 =
      off — see Notes for why not 8.)*
- [ ] SDK: observe close code 1013 (the encrypted WebSocket subclass sees
      `close` events; the plain path needs the provider's `connection-close`)
      → additive event `on('full')` and a `roomFull` getter (the status union
      stays closed, §5) → back off instead of hot-looping. *(SDK lane.)*
- [ ] Room: notice line "this room is full — 64 connections." *(Room lane.)*
- [ ] Docs: retire the "a full room looks like a bad connection" sentence in
      the README and WHITEPAPER §7 once true. *(After the SDK half lands.)*

## Acceptance criteria

- The 65th connection produces a visible "room full" line within seconds.
  *(Needs the SDK + room halves.)*
- Per-IP cap test with two forwarded addresses. *(Done.)*

## Notes / open questions

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
