---
id: T-170
title: "Backpressure and frame budget on the broadcast path"
status: done
milestone: M15
depends: []
---
## Goal

One slow or hostile connection can't grow relay memory or the egress bill.

## Context

`onBroadcastConnection` calls `peer.send` with no look at `bufferedAmount`,
so one slow consumer in a chatty room buffers without bound. Separately, a
code-holder without the key can push 8 MiB junk frames and the relay fans each
one out to up to 63 peers. SPEC §3 makes both "the relay's own business."
Review finding F5.

## Tasks

- [x] Skip a peer whose `bufferedAmount` exceeds a threshold (proposal
      16 MiB) and close it with a code the SDK can name (1008 or 1011 — not
      1013, which is "room full").
- [x] Per-connection frame budget (proposal 60 frames/s, 32 MiB/min); over
      budget → close with the same code family.
- [x] Tests: slow-consumer memory stays bounded; a flooder is closed and the
      room stays alive for everyone else.
- [x] README knob table + the honesty section's one sentence.

## Acceptance criteria

- Both tests pass; knobs documented. *(Done — four tests, see Notes.)*

## Notes / open questions

- **Shipped (relay lane, 3 Sep 2026).** Three knobs, all at the ticket's
  proposed values, `0` disables any one: `RELAY_MAX_BUFFERED_BYTES`
  (16 MiB), `RELAY_MAX_FRAMES_PER_SEC` (60), `RELAY_MAX_BYTES_PER_MIN`
  (32 MiB). Close code **1008** (policy) for both, reasons `slow consumer`
  and `frame budget exceeded`; 1013 stays "room full" only. Conformance
  untouched: frames are still forwarded byte-for-byte, sender excluded, and
  the message handler still never looks past `data.length`.
- Mechanism: on every inbound frame the loop skips a peer whose
  `bufferedAmount` (ws: socket write backlog + sender queue) is over the cap
  and calls `close(1008)` on it — `close()` leaves `OPEN` synchronously, so
  the existing `readyState` check skips it from then on and what is already
  queued is the bound. The budget is two fixed windows per connection (1 s
  frames, 60 s bytes); a connection we closed forwards nothing more (guard
  at the top of the handler — ws keeps emitting `message` while CLOSING).
  Fixed windows allow a 2× burst across a boundary; boring beats precise.
- **Measured** (`scratch`-style one-off, 64 KiB frames over loopback, the
  slow peer's socket paused): with the cap at 1 / 4 / 16 MiB the paused
  peer had been fed 1.5 / 4.8 / 16.8 MiB when the relay gave up on it —
  cap plus ~½ MiB of kernel slack plus one frame — while the healthy peer
  received all 64 MiB every time and the room's connection count dropped
  to 2 once the close handshake completed. So "bounded" means cap + kernel
  buffers, not cap exactly; on Railway the kernel share is the box's.
- A slow consumer that never drains still holds its queued bytes until ws's
  own 30 s close timeout destroys the socket (it then sees 1006, not 1008).
  Memory stops growing the instant the cap trips either way; the 30 s is
  the socket's lifetime, not the relay's exposure.
- The one honest boundary, in the README: a room *at* the 64-connection
  guard reconnecting in the same second (relay restart) has every member
  answering 63 SyncStep1s in one window — 63 frames/s and, for a big spool,
  63 state frames — which trips the budget and y-websocket reconnects with
  backoff (staggered, so the second round passes). A 5–8-seat room never
  gets near it; if a 64-seat room ever matters, raise the two knobs.
- Tests (`test/hardening.test.js`, real instances, 5/5 clean on a flake
  loop): slow consumer (paused peer, 48 MiB pushed, 4 MiB cap → 1008
  "slow consumer", healthy peer whole, room count back to 2); flooder
  (100 frames at a 20/s budget → exactly 20 fan out, 1008 "frame budget
  exceeded", the room still relays afterwards); byte budget (1000 B/min:
  three 300 B frames pass, the fourth closes); ordinary traffic on the
  stock knobs (three seats at 30 frames/s each, 60 frames heard by each,
  nobody closed).
- **Review at merge (3 Sep 2026): defaults raised** 16 MiB → 64 MiB
  buffered, 60 → 300 frames/s, 32 → 128 MiB/min. Reason: a cold joiner has
  one state frame per peer queued for it at once — five peers on a 3 MiB
  spool was already 15 MiB, and four peers at the 8 MiB cap would have
  closed the joiner as a "slow consumer" on arrival, which is the pocket's
  own headline case — and a member answers 63 SyncStep1s in one second
  after a relay restart, so the boundary bullet above is superseded (300/s
  clears it). The guards exist to catch floods, an order of magnitude past
  these lines; the measured bound (cap + ~½ MiB slack) holds at any value.
  The tests pin their own knobs, so nothing changed there.
