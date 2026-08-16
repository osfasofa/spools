---
id: T-141
title: "docs/ECOSYSTEM.md — vessels in their own repos"
status: done
milestone: M13
depends: [T-140]
---

## Goal

The standing plan for how apps get built now that the loom (this repo) is
no longer the only place code lives: vessels in their own repos, consuming
the published npm packages like strangers would, feeding evidence back
through the "parked with evidence" promotion gate instead of feature
requests.

## Context

SDK-API.md already states the promotion rule (surface moves only when a
second client wants what the first built by convention) and carries four
candidates from the room. The room also rehearsed the vessel deploy shape
(static dist, prebuilt push, subdomain — chat.spools.lol). What was missing
is the written model: why separate repos, what a vessel owes the culture,
which vessels are worth building, in what order, and the hard gate on
T-130 (today's `spools@0.0.1` on npm predates encryption/rewind/export/
pocket — a vessel started against it would poison the npm-only rule).

## Tasks

- [x] docs/ECOSYSTEM.md: the model (loom vs vessels), the feedback loop,
      the portfolio table (each candidate with the human story + what it
      uniquely proves + size), a proposed build order, the good-citizen
      constitution, naming, and the T-130 sequencing gate.

## Acceptance criteria

- The doc stands alone: a future session (or an outside builder) can start
  a vessel repo from it without re-deriving the culture.
- Build order is explicitly a proposal for the owner, not a decision.
- No SDK surface is promised to any vessel — the promotion gate is the
  only path in, and the doc says so.

## Notes / open questions

- **Proposed order (owner picks):** baby book → off-grid kit →
  correspondence chess; quiet pad deliberately fourth because it's the
  vessel most likely to force the yjs-peering packaging decision, which
  should land at T-130, not mid-vessel.
- **Superseded (Aug 2026, owner — T-144):** the order now leads with
  **lore** ([docs/vessels/lore.md](../docs/vessels/lore.md)) — the
  folklore vessel absorbs the baby book's thesis (a child's lore) and
  oral history's rhythm; baby book and memorial stay in the portfolio as
  sibling vessels. Off-grid and chess hold their slots; quiet pad stays
  fourth.
- The room stays in this repo (the SDK's lab animal); extraction is a
  later, cheap decision if it earns a product life.
- Parked in the doc, no ticket: `create-spool-vessel` scaffold (lean no),
  shared CI recipe (inherit "none"), what a *finished* vessel repo looks
  like (first finished vessel decides).
