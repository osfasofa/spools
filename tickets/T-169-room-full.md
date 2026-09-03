---
id: T-169
title: "Room-full lockout: per-IP room cap, and the SDK says 'full' instead of spinning"
status: todo
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
- [ ] SDK: observe close code 1013 (the encrypted WebSocket subclass sees
      `close` events; the plain path needs the provider's `connection-close`)
      → additive event `on('full')` and a `roomFull` getter (the status union
      stays closed, §5) → back off instead of hot-looping.
- [ ] Room: notice line "this room is full — 64 connections."
- [ ] Docs: retire the "a full room looks like a bad connection" sentence in
      the README and WHITEPAPER §7 once true.

## Acceptance criteria

- The 65th connection produces a visible "room full" line within seconds.
- Per-IP cap test with two forwarded addresses.
