---
id: T-144
title: "lore leads the constellation — riff → brief, build order redirected"
status: done
milestone: M13
depends: [T-141]
---

## Goal

The owner's folklore riff ("pieces of lore, vehicles for lore, storage for
lore — easily lost and never found again, or cherished and held on to with
lots of intent") captured as a real vessel brief before it cools, and the
ecosystem plan's build order redirected to match.

## Context

Second M13 brainstorm session (Aug 2026). The owner reviewed T-141's
proposed order (baby book → off-grid → chess), asked to swap the lead for
something oral-tradition-shaped, then landed on folklore proper — "we're
just a lore app." The riff holds up mechanically, not just poetically:
touch-on-read + refresh-if-stale already implement "lore survives by being
retold"; the keeper is a lorekeeper by construction; `parent` threading is
the variant record; trading-as-retelling needs no new verb; and the
reunion case is the first genuine `splice` evidence the reserved verb has
ever had.

## Tasks

- [x] docs/vessels/lore.md — the brief: claim, the seven mechanical
      alignments, the shape (kinds `tale`/`telling`/`gloss`/`saying`/
      `relic` + `lore:*` settings, room-precedent seats, canon-as-social,
      trading-as-retelling), the register, the refusals (no wiki-ness),
      what it proves, open riff threads.
- [x] docs/ECOSYSTEM.md — lore row leads the portfolio; oral history
      folds in as its interview rhythm; baby book noted as a sibling
      ("a child's lore"); build order now lore → off-grid kit → chess,
      recorded as owner-directed supersession, not a silent rewrite.
- [x] WHITEPAPER.md §5 — the lore bullet joins "what it's for."

## Acceptance criteria

- The brief stands alone: a vessel repo can start from it without this
  session's context, and everything in it runs on SPEC v1.1 as-is.
- `splice` remains promised nowhere — the reunion case is recorded as
  *evidence at the gate*, exactly per the promotion rule.

## Notes / open questions

- Working name **lore**, deploy target `lore.spools.lol` per the
  subdomain pattern; the vessel repo owns its final name and design.
- Deliberately unresolved in the brief (vessel-repo decisions): the
  break-off ceremony's handling of pointing-home links, side-by-side
  variant view, seasonal campfires vs forever-spools (lean: seasons).
