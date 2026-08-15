---
id: T-126
title: "Room torture checklist"
status: todo
milestone: M11
depends: [T-114, T-116, T-117, T-118, T-119]
---

## Goal

The chat's own torture rows — the group-scale scenarios the existing checklist
never needed — automated where the harnesses allow, human-run where they don't,
recorded in `apps/client/TESTING.md` style (or a sibling `apps/room/TESTING.md`).

## Context

Ground rules inherited wholesale from T-021: two origins minimum (same-origin
tabs cheat), kill the relay process (DevTools offline lies), WebRTC off for
offline scenarios. Existing drivers to extend: `scratch/torture-t021/`,
`scratch/torture-t104/midnight.mjs` (zero-dep CDP), T-110/T-111's spike
harnesses.

## Tasks

- [ ] Scenario: concurrent renames of the same seat from two devices → newest
      wins, all peers agree.
- [ ] Scenario: reaction toggle race (react + un-react across two devices) →
      converged count, no double-count.
- [ ] Scenario: reply to a message that hasn't synced yet / whose parent is
      deleted → graceful stub, no crash.
- [ ] Scenario: 5-seat midnight — all write, all leave, cold sixth device
      reconstructs the union (the T-110 ring scenario, now through the real
      app).
- [ ] Scenario: offline divergence — two devices chat offline, reconnect,
      converge with zero lost messages.
- [ ] Scenario: 5 000-message spool cold open + live traffic (T-116's numbers,
      re-verified through the deployed app).
- [ ] The human rows (visibilitychange flush, real phones on cellular) listed
      for the owner, T-021-style.
- [ ] Results table committed, 2× consecutive green for the automated set.

## Acceptance criteria

- Every scenario passes against the current code with results recorded; the
  midnight and union scenarios pass against `DEFAULT_RELAY` from the deployed
  app (milestone acceptance #1–#5, #7).

## Notes / open questions

-
