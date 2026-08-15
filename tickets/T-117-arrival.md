---
id: T-117
title: "Arrival: first run + the empty-room trap"
status: todo
milestone: M11
depends: [T-113, T-114]
---

## Goal

A newcomer's first ten seconds never look like data loss. `whenReady` resolves
on *local* persistence, not the network, so a first open shows an empty room
indistinguishable from "everything is gone" — the mixtape survived on the pocket
beat alone; a chat's arrival is where trust is won or lost.

## Context

The state machine the brief owes: `checking the pocket… → connected, nobody else
here → someone's here, catching up → this room really is empty`. Never a bare
"no messages yet". Status `connected` means relay-reachable, not peer-present
(SPEC §3) — key everything to peers/awareness. Naming must be **non-blocking**:
a name gate on entry violates §1 ("no onboarding"); T-114's unnamed-seat
rendering makes that safe.

## Tasks

- [ ] The arrival state machine, driven by pocket phase + awareness peers +
      first entry event; each state has honest copy.
- [ ] Non-blocking first-run naming: join instantly as an unnamed seat, with a
      gentle inline prompt that can be ignored forever.
- [ ] Share affordance ("invite someone") surfacing `spool.share()`, with the
      honest sentence beside it: whoever holds this link reads everything and
      writes anything — there is no partial history and no read-only.
- [ ] Cold-open path exercised against production (fresh profile, pocket
      populated, nobody online) and against a truly empty room.

## Acceptance criteria

- A fresh device on a populated-but-sleeping room sees the checking beat then
  content — never an unexplained empty state. A fresh device on a genuinely
  empty room sees "really empty", calmly, with zero console errors.
- No blocking prompt anywhere on the arrival path.

## Notes / open questions

-
