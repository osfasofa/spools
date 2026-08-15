---
id: T-126
title: "Room torture checklist"
status: done
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

- [x] Scenario: concurrent renames of the same seat from two devices → newest
      wins, all peers agree. *(smoke 6)*
- [x] Scenario: reaction toggle race (react + un-react across two devices) →
      converged count, no double-count. *(torture T1 — truly concurrent)*
- [x] Scenario: reply to a message that hasn't synced yet / whose parent is
      deleted → graceful stub, no crash. *(smoke 10)*
- [x] Scenario: 5-seat midnight — all write, all leave, cold sixth device
      reconstructs the union (the T-110 ring scenario, now through the real
      app). *(torture T3 — against DEFAULT_RELAY, cold joiner = the deployed
      client)*
- [x] Scenario: offline divergence — two devices chat offline, reconnect,
      converge with zero lost messages. *(torture T2 — relay process killed
      and reborn, RTC off)*
- [x] Scenario: 5 000-message spool cold open + live traffic (T-116's numbers,
      re-verified; the served bundle is byte-identical to the deployed one).
      *(room-scale.mjs)*
- [x] The human rows (visibilitychange flush, real phones on cellular) listed
      for the owner, T-021-style. *(apps/room/TESTING.md H1–H5)*
- [x] Results table committed, 2× consecutive green for the automated set.

## Acceptance criteria

- Every scenario passes against the current code with results recorded; the
  midnight and union scenarios pass against `DEFAULT_RELAY` from the deployed
  app (milestone acceptance #1–#5, #7).

## Notes / open questions

- The ledger is **`apps/room/TESTING.md`**: five automated suites (smoke ×15,
  torture ×3, scale, ring, awareness) with commands, coverage, and the
  two-consecutive-green results table (15 Aug 2026), plus the five human
  rows H1–H5 for the owner.
- New harness: `scratch/torture-room/torture.mjs`. Highlights:
  - **T1** runs the reaction race truly concurrently (both devices react in
    the same instant, then both un-react) — one chip, count 2, then clean
    zero, both sides.
  - **T2** kills the relay **process** mid-conversation (T-021's rule) with
    RTC disabled, has both sides write blind, restarts the relay on the same
    port — both converge to the 7-entry union, nothing lost.
  - **T3** is milestone acceptance #5 through the real app against
    production: five app devices (five distinct localhost origins) write and
    `leave()` on `DEFAULT_RELAY`; the cold sixth is the **actual deployed
    client at osfasofa.github.io**, which reconstructs 15/15 messages across
    all 5 seats from the production pocket, `phase=applied`.
- Milestone acceptance status: #2–#5, #7, #8 automated-green (nicknames,
  presence, arrival, midnight, scale, growth numbers); #6 sealing proven in
  T-111 (frame capture + control); #1's "three real devices, two networks"
  half is human row H1 for the owner, as is the cellular row from T-115 and
  the T-125 hardware checklist.
