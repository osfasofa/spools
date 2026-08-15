---
id: T-111
title: "Spike: awareness at group scale"
status: done
milestone: M11
depends: []
---

## Goal

Prove presence for 5–8 seats is sealed, cheap, and ghost-free — headlessly,
before any UI exists. The sealing half is already answered in code
(encrypted-ws.ts:80-91 substitutes the WebSocket class below the y-protocols
layer); this spike's real job is the **group** half.

## Context

Brief §2: awareness exists on every relay-connected spool, shared across both
transports (engine.ts:117-134), OPTIONAL/app-defined per SPEC §3. Known traps:
`synced` never fires in an empty room (key UX to peers); awareness self-
heartbeats at 15 s and prunes at 30 s; a killed tab leaves ghost state until the
timeout; the resyncInterval re-sends SyncStep1 only, not awareness. fosho leaked
awareness plaintext — we must *prove* we don't.

## Tasks

- [ ] Headless harness: 6–8 seats on one keyed spool via a local relay, each
      setting an app-defined presence field; verify all seats see all others.
- [ ] **Sealing proof**: capture frames at the relay (log raw bytes in a test
      relay instance); assert every frame starts with a sealed-transport magic
      and no presence string is grep-able. This is milestone acceptance #6 —
      prove it here first, cheaply.
- [ ] Ghost test: kill a tab mid-typing-state; measure how long the ghost
      persists on the others (expect ≤ ~30 s); confirm a clean `leave()` clears
      instantly.
- [ ] Traffic: count awareness frames/minute for a seat toggling typing at
      keystroke rate vs debounced; produce the debounce recommendation for
      T-119, and the verdict on whether typing indicators are affordable at all
      (the brief gates them on this number).
- [ ] Poke the 64-conn ceiling: what does seat #65 actually see? Record it.

## Acceptance criteria

- All findings (sealing assertion, ghost duration, frames/min, conn-ceiling
  behavior) recorded in Notes with the harness committed under `scratch/`.
- A go/no-go on typing indicators, with the debounce number T-119 should use.

## Notes / open questions

Harness: `scratch/spike-room/awareness.mjs` — 7 headless `SpoolEngine` seats
(the D5 idiom: engine constructed directly; `get awareness()` lands in T-112)
against a frame-logging dumb broadcaster (protocol-identical to the relay's
broadcast half), plus the real relay for the ceiling test. The ghost victim
rides its own listener port so "kill" = drop socket + refuse reconnects — a
faithful killed tab: no awareness-removal message ever sent.

### Findings

- **Group presence works, but latecomers converge on the heartbeat, not
  instantly.** All 7 seats saw all 6 others — in **18.4 s** from first
  connect. A dumb relay stores nothing, so a joiner is *seen* immediately (it
  broadcasts its own state on connect) but *sees* existing seats only as
  their ≤15 s awareness heartbeats arrive. T-117/T-119 must treat presence as
  "filling in over ~15 s" — never conclude "nobody here" from an instant
  read. Cheap app-level fix worth trying in T-119: when a previously-unknown
  clientID appears, re-set your own local state (a touch re-broadcasts it) —
  latecomers then converge in ~RTT instead of a heartbeat cycle.
- **Sealing: PROVEN (milestone acceptance #6, headless).** 112 frames
  captured at the relay across the 7-seat session: every one starts 0xE2E1,
  zero presence strings grep-able in the concatenated bytes. The keyless
  control room *did* show its sentinel in plaintext — the capture would have
  caught a leak. Sealed awareness frames run ~80–105 B (42 B envelope over
  ~40–60 B of y-protocols payload).
- **Ghosts: 31.2 s** for a killed tab's `typing: true` to vanish from peers
  (the 30 s awareness timeout plus heartbeat phase). **Clean `leave()`
  clears in 51 ms** — the SDK teardown does broadcast the removal before the
  socket drops; no app-side `setLocalState(null)` needed. T-119 should still
  idle-clear `typing` client-side (~3 s) so the worst crash-ghost shows
  "online", briefly, rather than "typing" for half a minute.
- **Traffic: typing indicators are GO — transitions-only.** Per-keystroke
  `setLocalStateField` = **323 frames/min** from one seat (every set bumps
  the clock and broadcasts, even with identical payload); transitions-only
  (true on first keystroke, false on idle) = 49 frames/min ≈ the 23–45/min
  idle baseline. The star topology echoes: y-websocket re-broadcasts every
  received awareness update, so room-wide idle traffic at 6 seats measured
  **135 frames/min** (≈ n× one seat's rate); a naive typer at 8 seats would
  put ~2 400 frames/min through the relay. Bytes stay trivial either way
  (~10–30 KB/min room-wide) — the debounce is frame-rate/battery hygiene.
  **T-119 numbers: set `typing: true` on the first keystroke, clear after
  3 s idle or on send; never per keystroke.**
- **The 64-conn ceiling is a silent flap loop, not an error.** Conn #65 is
  closed with code 1013 "room full"; a real SDK seat at the wall cycles
  `connected → offline → connecting → connected…` roughly every second,
  forever — y-websocket treats the accept-then-close as a drop and retries.
  `status` briefly reads "connected" each cycle, so an app cannot key
  anything on that at the wall. At intimate scale 64 conns (tabs, not
  people) is unreachable; the honest sentence for T-127: a full room looks
  like a bad connection, and only the close code (which the SDK does not
  surface — evidence bank for a future milestone, not a D5 change) says why.
