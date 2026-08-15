---
id: T-121
title: "Read receipts: the throttled cursor"
status: todo
milestone: M11
depends: [T-110, T-114]
---

## Goal

"Seen" that survives closing the tab (D3), implemented per whichever design
T-110's numbers selected (the open D4 question): the body-rewritten
one-entry-per-seat cursor with a hard throttle, or ephemeral awareness-only
"seen" (which amends D3 and gets recorded as such in §5).

## Context

**Do not start this ticket before T-110's D4 verdict is in its Notes.** The
verified trap: a cursor body-rewrite is a local content transaction, so each
advance past the min-gap also appends a ~0.5 KB permanent history moment
(history.ts:174) and dirties the pocket toward a whole-doc deposit — a lurker
writes like an active writer. If the cursor ships, the throttle floor is ≥ the
history min-gap and advances happen on blur/idle/leave — never on scroll ticks.

## Tasks

- [ ] Implement the T-110-selected design. If cursor: one `room:read` entry per
      seat, body = last-read entry id, rewritten under the throttle; resolver
      renders "seen by" from the newest cursor per seat.
- [ ] "Seen by" row on the last message read (avatars/suffix-chips via the
      profile resolver), per-seat, merged per T-114's multi-device choice.
- [ ] Measure in situ: doc growth over a real multi-device session with cursors
      active vs the T-110 prediction; record the delta in Notes and finalize
      the DESIGN_DOC §5 row's pending-pricing clause.

## Acceptance criteria

- A reads, closes the tab, reopens — "seen" state is where they left it (or,
  if the ephemeral design won, the §5/D3 amendment is recorded and the
  ephemeral behavior verified instead).
- Growth measured and within the T-110-predicted envelope.

## Notes / open questions

-
