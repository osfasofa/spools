---
id: T-146
title: "familiar riffed → the fork charter (docs/forks/familiar.md)"
status: done
milestone: M13
depends: [T-145]
---

## Goal

The lore treatment applied to the fork: familiar riffed against the
shipped mechanics until the poetry is load-bearing, then landed as a
charter the fork repo can start from.

## Context

Third M13 session (Aug 2026). The folklore definition of a familiar — a
small spirit bound to one person that fetches, reports, is fed by its
keeper, and answers through them — maps onto shipped mechanisms with the
same eerie precision lore had: the link is the pact (per-errand
capability), the pocket is the owl (3 a.m. results sealed and waiting,
zero delivery backend), `leave()` is the dying act (the record outlives
the container), `rewind` is a ledger not a lock (vandalism visible, never
prevented), presence-dies-with-the-process is the no-exhaust privacy
posture, and D1's "a seat is a device, not a person" was true for
machines before anyone asked.

## Tasks

- [x] docs/forks/familiar.md — claim, mechanism map, the shape
      (per-errand spools, kinds `pact`/`finding`/`question`/`decision`/
      `relic` + `fam:*`, room seats verbatim, "a familiar reports; it
      does not narrate"), register (hearth not dashboard; dismiss not
      terminate), refusals (no swarm, no hosted service, no ambient
      capability, no exhaust, the human answers), honest limits, gate
      evidence, open threads.
- [x] docs/ECOSYSTEM.md — forks section points at the charter until the
      repo is born (lore's migration pattern).

## Acceptance criteria

- The charter stands alone: `osfasofa/familiar` can start from it without
  this session's context, on SPEC v1.1 as-is, npm-only after T-130.
- Nothing is promised to or asked of the loom — both gate items are
  framed as evidence at a stranger's rank.

## Notes / open questions

- The v0 discovery worth underlining: **no new client is needed** — the
  room already renders unknown kinds as labeled fallbacks, `message`
  natively, and presence dots, so a ~100-line Node familiar is watchable
  and steerable from the room client today. The unknown-kind rule earns
  its keep on first contact with the future.
- Two parked items gain second witnesses here: `relic` (lore + familiar
  independently want the URL+hash pointer kind) and pocket ring-tag
  persistence (room found reload churn; familiar finds restart churn).
  Both are gate evidence, not requests.
- The charter's sharpest sentence is capability hygiene, shipped as UI
  copy: "never hand your familiar a spool you wouldn't let it rewrite.
  one errand, one spool."
