---
id: T-142
title: "docs/RELEASING.md — release policy + T-130 amendments"
status: done
milestone: M13
depends: []
---

## Goal

The standing release policy T-130 executes: what versions mean (SPEC vs
envelope bytes vs package semver), the "release when npm would otherwise
lie" trigger, the publish liturgy, the consumption contract vessels rely
on, and the sign-off decisions to settle at publish time — plus the
concrete hazard fixes folded back into T-130 so the release stays a
checklist.

## Context

Session findings while grounding the ecosystem plan (Aug 2026):

- The keeper's `"spools": "workspace:^"` is rewritten to `^0.1.0` at pack
  time — T-130's relay → keeper → SDK order leaves a window where
  `npm i spools-keeper` cannot resolve; its "none actually depend on each
  other" is wrong for the keeper. Order must be **relay → SDK → keeper**.
- `packages/spools-keeper` has no LICENSE file (T-130's own preflight
  requires one; the other two packages have it).
- The SDK has **no peerDependencies** (yjs et al. are regular deps) and is
  ESM-only; `index.ts` exports more than SDK-API documents. All three are
  cheapest to settle before any external repo depends on the SDK.
- Keeper `engines >=22` vs relay `>=18` — divergence should be a choice.
- No git tags exist; no prepublishOnly anywhere yet (T-130 already adds).

## Tasks

- [x] docs/RELEASING.md: the one rule, version semantics (0.x minor =
      breaking lane; SPEC is the stable thing), package table, publish
      liturgy with corrected order, consumption contract, sign-off
      decisions with trade-offs + recommendations, rejected alternatives
      (changesets, CI auto-publish, cadence).
- [x] T-130: fix the publish-order bullet; add tasks for the keeper
      LICENSE, the SDK README status-line rewrite, and the
      settle-with-owner items (yjs/y-protocols peering, export-surface
      line, engines); Notes point at RELEASING.md.

## Acceptance criteria

- T-130 can be executed top to bottom with zero design decisions left in
  it — everything judgment-shaped either has a recommendation in
  RELEASING.md marked **sign-off**, or was fixed here.
- The policy doc survives T-130: it reads correctly before, during, and
  after that release.

## Notes / open questions

- Recommendations recorded (all sign-off at publish, not decided here):
  yjs + y-protocols → peers at 0.1.0; export line drawn in prose, not by
  trimming; CI stays absent while there's one maintainer and one hardware
  key.
- 1.0 criterion proposed: after ≥1 external vessel ships on a published
  0.x and a full milestone passes with zero breaking surface changes —
  1.0 records calcification, it doesn't promise it.
