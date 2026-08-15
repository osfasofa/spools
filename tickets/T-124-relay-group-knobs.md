---
id: T-124
title: "Relay knobs at group scale"
status: todo
milestone: M11
depends: [T-110, T-111]
---

## Goal

The relay's two-person-era defaults are re-examined against T-110/T-111's group
evidence — chiefly `POCKET_K = 4`, which at 5+ concurrent seats can evict a
worldview before anyone merges it (silent incompleteness: the failure mode M10
rejected the frame-log for).

## Context

**Protocol-adjacent — owner sign-off required before changing any default**, and
the change lands as a DESIGN_DOC §5 row. Changing `POCKET_K` alters what a cold
reader can reconstruct; it is not a mere tuning knob. Also in scope from the
evidence: the 12 PUTs/min **per-IP** admission (a household on one NAT shares
it), and what seat #65 experiences at the 64-conn ceiling (today: a failing
websocket and `connecting` forever). The relay stays dumb — no new capability,
no new endpoint; defaults and docs only.

## Tasks

- [ ] Take T-110's ring findings + T-111's ceiling findings to the owner with a
      concrete proposal (e.g. `POCKET_K` default 4 → 8, or leave-and-document).
- [ ] Apply the signed-off changes: relay defaults, README knob table, and the
      canonical Railway deploy (env var if deviating from the new default).
- [ ] Relay tests updated for any new default; the no-yjs grep-proof untouched.
- [ ] Honest docs: what group scale means for the per-IP budget and the conn
      ceiling, in the README's honesty section.

## Acceptance criteria

- Whatever was decided is deployed to the canonical relay, §5-recorded, and the
  T-110 ring scenario re-run passes (a cold joiner reconstructs the union at
  the target seat count) — or the leave-as-is decision is recorded with its
  reasoning and the documented mitigation.

## Notes / open questions

-
