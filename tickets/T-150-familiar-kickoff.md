---
id: T-150
title: "familiar is born — repo, charter, the desk walking skeleton"
status: todo
milestone: M14
depends: [T-130]
---

## Goal

The fork of purpose gets its body: `osfasofa/familiar` exists, consumes the
published packages like a stranger, carries its charter, and runs the
riff's first shape end to end — a human winds a task onto the desk, the
agent claims it, works a leaf, reports a `finding`, and the record survives
the agent's death. One session from empty repo to a mission record you can
rewind.

## Context

Chartered at T-145 (as `pfam`; the owner corrected the name to
**`familiar`** — ECOSYSTEM.md and T-145's notes hold the supersession
record). The gate is satisfied: T-130 shipped 16 Aug 2026
(`spools@0.1.0` / `spools-relay@0.2.0` / `spools-keeper@0.1.0`,
registry-verified in T-130's notes). The warm start is
[docs/forks/familiar-riff.md](../docs/forks/familiar-riff.md) — measured:
claim convention deterministic 100/100 across replicas (85 same-ms ties
settled by the id tie-break), wake-up as one batched diff event,
append-vs-rewrite at 280 B vs 59 B/update with T-110's quadratic cliff on
the rewrite shape (`scratch/riff-spools-of-spools/agents-spike.mjs`).

Fork rules apply in full (ECOSYSTEM.md): own repo, own non-spool identity,
npm-only consumption, honesty culture kept, §1 lane exemption, never merges
back, learnings queue at the parked-with-evidence gate at stranger's rank.

## Tasks

Loom-side (this repo):

- [ ] Migrate `docs/forks/familiar-riff.md` → the fork repo as its founding
      doc; fold the riff's §8 gate-flags (`sig`'s first natural signer;
      read-only keys' first structural demand) into ECOSYSTEM.md's fork
      paragraph as the standing evidence-expected note; leave a one-line
      pointer where the riff lived.
- [ ] INDEX: this ticket `done` when the skeleton run is recorded in the
      fork's own notes — after this, familiar's work stops being loom
      tickets entirely.

Fork-side (`osfasofa/familiar` — its own culture from day one):

- [ ] Repo born: README in the fork's own voice, the honesty sentences up
      front (the link's total power; the relay's role; *an agent is
      something a person brings*), `npm i spools@^0.1.0` with a lockfile —
      the first external repo to live the npm-only rule.
- [ ] The charter page, from the riff's §1/§4/§5: disclosure ceremony +
      agent seats self-declare in the profile table; never cosplay;
      append-only / digest-don't-log / season-your-work / logs-are-assets;
      couriers-never-routers; the counterfeit-attention sentence — written
      *before* any cron ships.
- [ ] The desk walking skeleton: a Node agent (the keeper's shape, plus
      thinking) + any thin human surface (the no-build client pointed at
      the desk spool is enough). Flow: human winds `task` → agent claims
      (riff §3 convention) → agent creates the leaf spool, winds its link
      back onto the desk (sealed-reference-home from birth, riff §2) →
      winds `finding`s in the leaf → `leave()` flushes → kill the process →
      reopen from pocket/export and show the record whole.
- [ ] TESTING.md torture seed, house tradition: two agents racing one task
      on the live relay; wake-from-pocket with nobody online; `kill -9`
      mid-task (the honest loss window); the human renaming the agent in
      the profile table mid-mission.

## Acceptance criteria

- `osfasofa/familiar` exists on published packages only (no workspace
  links, no forks of the SDK), charter and honesty sentences shipped.
- The skeleton run happens against the canonical relay and the mission
  record survives agent death — demonstrated by reopening cold.
- The riff has migrated; the loom holds only the pointer and the §8
  gate-flags; this ticket's Notes record any SDK papercuts as evidence,
  filed at stranger's rank.

## Notes / open questions

- Repo creation and any npm/GitHub auth are owner-at-keyboard moments,
  T-002 style; everything else is preppable headless.
- First-session leans from the riff, recorded so the fork starts warm:
  desk before swarm; sealed references home from birth; hubs tiny
  (one human, one agent, one desk); the agent's shelf *is* its permission
  manifest — start the audit habit on day one.
- Deliberately not in this ticket: the gardener, the courier, swarms,
  memory constellations — the desk earns them one at a time, each through
  the fork's own notes.
- **Mission two is named** (owner riff, 18 Aug 2026 — riff §6, "the
  project familiar"): familiar manages the building of familiar. Tickets,
  decisions, and the standing brief live in a spool outside the repo;
  a session-start hook reads the brief + open tickets (context cost =
  open work, not project history); status = append-only newest-wins
  children carrying `data.commit`; milestone exports committed to the
  repo as the fossil record. Dogfood on the fork first — the loom
  migrates nothing.
