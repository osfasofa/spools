---
id: T-110
title: "Spike: the chat-hour budget"
status: todo
milestone: M11
depends: []
---

## Goal

Numbers, not opinions, for the three questions the M11 brief left open: how fast
a chat document grows, what a read-cursor rewrite really costs, and what the
pocket ring does at group cardinality. **This spike gates T-121 (read receipts)
and informs T-124 (relay knobs); its findings decide the open D4 question**
(brief §3) — throttle-hard vs ephemeral-only — which goes back to the owner with
the measurements attached.

## Context

Brief §5 holds the risk inventory: `gc:false` (+34% measured), in-doc history
(~0.5 KB/moment, no pruning path), whole-doc deposits (pocket.ts:314), the 8 MiB
cap on both frames and deposits, the permanent 413 latch (pocket.ts:312), and
the K=4 ring sized for two-person spools. The D4 pricing problem is verified in
code (history.ts:174-184 schedules a moment on any local content transaction —
a cursor body-rewrite included) but not yet measured.

## Tasks

- [ ] Node script (`scratch/spike-room/budget.mjs`): wind N messages at a
      realistic cadence into a memory-mode spool with stock history tuning;
      print `Y.encodeStateAsUpdate(doc).byteLength` and `history.length` at
      100 / 500 / 2 000 / 10 000 messages. Derive the 8 MiB crossing point in
      messages and in active hours.
- [ ] Same script: 100 throttled cursor body-rewrites with no other activity;
      diff doc bytes + moment count before/after. Price one cursor advance in
      real permanent bytes (the D4 number).
- [ ] Ring test: extend `scratch/torture-t104/midnight.mjs` to five concurrent
      seats depositing against a local relay with stock knobs; cold-open a
      sixth origin and diff its entry set against the union written. Does K=4
      lose a worldview? (Note the brief's mitigation claim — the first merger
      re-deposits the union — and check whether it actually saves the cold
      joiner here.)
- [ ] Write the verdicts in Notes; take the D4 call to the owner with numbers.

## Acceptance criteria

- A table of doc bytes / history count / deposit size at the four message
  counts, plus the measured per-cursor cost and the ring verdict, recorded in
  Notes.
- The D4 decision (throttle-hard vs ephemeral-only) made by the owner on that
  evidence and recorded here + in DESIGN_DOC §5's M11 mutable-state row.

## Notes / open questions

-
