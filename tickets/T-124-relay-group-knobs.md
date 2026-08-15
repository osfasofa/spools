---
id: T-124
title: "Relay knobs at group scale"
status: done
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

- [x] Take T-110's ring findings + T-111's ceiling findings to the owner with a
      concrete proposal (e.g. `POCKET_K` default 4 → 8, or leave-and-document).
- [x] Apply the signed-off changes: relay defaults, README knob table, and the
      canonical Railway deploy (env var if deviating from the new default).
- [x] Relay tests updated for any new default; the no-yjs grep-proof untouched.
- [x] Honest docs: what group scale means for the per-IP budget and the conn
      ceiling, in the README's honesty section.

## Acceptance criteria

- Whatever was decided is deployed to the canonical relay, §5-recorded, and the
  T-110 ring scenario re-run passes (a cold joiner reconstructs the union at
  the target seat count) — or the leave-as-is decision is recorded with its
  reasoning and the documented mitigation.

## Notes / open questions

- **Owner sign-off (Aug 2026): `POCKET_K` 4 → 8, `POCKET_PUTS_PER_MIN`
  12 → 24, the 64-conn guard stays and gets documented.** §5 row added
  ("Relay knobs at group scale (M11)"). Rationale + the acknowledged
  cold-open-download cost are in the row.
- Applied: server.js defaults (with the why in comments), README knob table
  + a new "Group-scale honesty" paragraph (the 9+-divergent-writers bound,
  the 24/min ≈ 24-devices arithmetic, and "a full room looks like a bad
  connection" for the 1013 wall). Relay tests pass untouched (12/12 — they
  pin their own knobs).
- **Canonical deploy verified live**: `railway up` on the linked service
  (env has only `POCKET_DIR` — stock knobs, so the new defaults govern).
  Post-deploy health kept all 11 rooms / 17 deposits (the volume held
  through the restart, same as T-105's check), and a 6-distinct-tag probe
  namespace retained **6/6 deposits** — impossible under K=4, so the new
  default is what's serving. Probe blobs are 60 B and TTL out in 60 days.
- Ring harness rewritten for the current stock knobs
  (`scratch/spike-room/ring.mjs`; the K=4 evidence lives in T-110's Notes):
  **R1** 5 divergent seats → 5/5 deposits held, cold joiner 25/25 — the AC's
  target-scale reconstruction; **R2** 9 divergent seats → 8 held, joiner
  40/45 (the moved bound); **R3** the evicted writer's return heals to
  45/45; **R4** converged seats whole at any K.
- Deferred with eyes open: persisting the ring tag per device (an SDK
  change — pocket.ts's tag is per-instance, so reloads churn slots). Banked
  as evidence for a post-M11 SDK pass; K=8's headroom absorbs it meanwhile.
