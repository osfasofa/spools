---
id: T-150
title: "familiar is born — repo, charter, the desk walking skeleton"
status: done
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

- [x] Migrate `docs/forks/familiar-riff.md` → the fork repo as its founding
      doc; fold the riff's §8 gate-flags (`sig`'s first natural signer;
      read-only keys' first structural demand) into ECOSYSTEM.md's fork
      paragraph as the standing evidence-expected note; leave a one-line
      pointer where the riff lived.
- [x] INDEX: this ticket `done` when the skeleton run is recorded in the
      fork's own notes — after this, familiar's work stops being loom
      tickets entirely.

Fork-side (`osfasofa/familiar` — its own culture from day one):

- [x] Repo born: README in the fork's own voice, the honesty sentences up
      front (the link's total power; the relay's role; *an agent is
      something a person brings*), `npm i spools@^0.1.0` with a lockfile —
      the first external repo to live the npm-only rule.
- [x] The charter page, from the riff's §1/§4/§5: disclosure ceremony +
      agent seats self-declare in the profile table; never cosplay;
      append-only / digest-don't-log / season-your-work / logs-are-assets;
      couriers-never-routers; the counterfeit-attention sentence — written
      *before* any cron ships.
- [x] The desk walking skeleton: a Node agent (the keeper's shape, plus
      thinking) + any thin human surface (the no-build client pointed at
      the desk spool is enough). Flow: human winds `task` → agent claims
      (riff §3 convention) → agent creates the leaf spool, winds its link
      back onto the desk (sealed-reference-home from birth, riff §2) →
      winds `finding`s in the leaf → `leave()` flushes → kill the process →
      reopen from pocket/export and show the record whole.
- [x] TESTING.md torture seed, house tradition: two agents racing one task
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

## Notes / session record (18 Aug 2026)

**Loom side, done.** The riff migrated to the fork
(`osfasofa/familiar` → `docs/familiar-riff.md`, preamble rewritten for its
new home and annotated with the two corrections the working code produced);
`docs/forks/familiar-riff.md` is now a pointer; the riff's §8 is folded into
ECOSYSTEM.md's fork section as **"Evidence expected from the fork"** —
`sig` as the first natural signer, read-only keys as the first structural
demand, plus the refusals restated beside them. `spools-of-spools.md`'s §8
cross-reference was adjusted to say the riff migrated.

Also added, beside the untracked-until-now `spool-vessel` skill:
`.claude/skills/spool-fork/SKILL.md`, written from this session — the Step 0
vessel-vs-fork test, the fork rules, charter-before-code, the Node-shaped SDK
notes, and the evidence channel. Both skills are now tracked; CLAUDE.md
points at them.

**Fork side, done and run.** `familiar` is a working repo (local, two
commits): README with the three honesty sentences and the reserved kinds;
CHARTER.md (disclosure ceremony, never cosplay, the write discipline,
consent-as-key-material, couriers-never-routers, the counterfeit sentence,
the swarm-storey limit, and an amendment rule that requires the charter to
move before the code it permits); `desk/` (new-desk, wind, agent, read, with
`work.mjs` as the thinking seam); a thin static client; offline convention
tests; TESTING.md round 1; NOTES.md as the notebook; CLAUDE.md as its session
guide.

The skeleton ran end to end **on the canonical relay**, desk
`olive-bloom-125`: four tasks wound, claimed, worked in leaves, reported.
Every script is a separate cold process (`persist: false`), so every run
proves the pocket path — `pocket: applied (N deposits)` on each open. The
record reads whole after the agent exits, both from the relay and from the
export files with no relay contacted.

Torture rows run: **two agents racing one task on the live relay** (both
claimed concurrently, both replicas agreed on `scout`, `runner` abandoned and
exited clean — the riff's 100/100 measurement, confirmed in the wild);
**wake-from-pocket with nobody online**; **`kill -9` mid-task**; **the human
renaming the agent mid-mission** (`scout` → `the intern`, agent kept its seat
and kept working). Unrun rows are marked ⬜ in the fork's TESTING.md — real
second devices, midnight from another machine, offline/reunion, wrong key,
back-pressure, a poisoned worker.

**Owner-at-keyboard moment, closed.** The owner created
`osfasofa/familiar` (private) at the end of this session and the three
commits are pushed — `main` is the default branch. One wrinkle recorded for
next time: this machine's SSH key authenticates as `jdomonell`, not
`osfasofa`, so the SSH remote couldn't see a private repo owned by the other
account; the push went over HTTPS with `gh`'s credential helper
(`git -c credential.helper='!gh auth git-credential' push https://github.com/osfasofa/familiar.git main`).
The fork's `origin` is still the SSH URL, which will fail the same way until
the key is added to `osfasofa` or the remote is switched to HTTPS. Not the
loom's problem — noted here because the next session will hit it.

## Evidence filed (stranger's rank, no asks)

The fork's own table is in its NOTES.md; the three items, verbatim in effect:

1. **No browser bundle in the published SDK.** `spools` is ESM with bare
   specifiers, so a no-build page outside this repo can't load it off disk.
   The fork bundles it itself with esbuild (`pnpm build:client`). Not a bug —
   a packaging gap worth knowing about, since "works from a USB stick" is a
   loom-only property today. **No ask.**
2. **Same-millisecond ties make "newest wins" an id lottery.** Two
   `familiar:profile` winds in the same ms resolve by uuid tie-break, so a
   rename can lose to the name it replaced. Every replica agrees — which is
   all the convention promised — but the room's `room:*` conventions have the
   same shape, and humans never tie while agents almost always do. Worth one
   sentence wherever newest-wins is documented; convention-level, not
   protocol. Reproduction: the fork's `test/conventions.test.mjs`.
3. **No synced signal, by design — so every networked script writes its own
   settle window** (`settle()` in the fork's `desk/lib.mjs`). One client's
   helper is just a helper; recorded so that a *second* independent claimant
   would trip the parked-with-evidence gate.

Nothing else. Three sessions of agent-shaped work (two spikes plus this one)
have now run on shipped surface with zero SDK changes, which is the finding
the thesis wanted: **the fork consumed the release like a stranger and it
sufficed.**

## Open questions

- Whether familiar deploys a human surface anywhere (a subdomain is a vessel
  pattern; the fork may simply stay local — it has no lane obligation to be
  reachable). Left to the fork.
- **Mission two is named** (owner riff, 18 Aug 2026 — riff §6, "the
  project familiar"): familiar manages the building of familiar. Tickets,
  decisions, and the standing brief live in a spool outside the repo;
  a session-start hook reads the brief + open tickets (context cost =
  open work, not project history); status = append-only newest-wins
  children carrying `data.commit`; milestone exports committed to the
  repo as the fossil record. Dogfood on the fork first — the loom
  migrates nothing.
