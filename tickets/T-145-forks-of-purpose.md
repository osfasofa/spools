---
id: T-145
title: "Forks of purpose — the agent-workspace track, chartered beside the lane"
status: done
milestone: M13
depends: [T-141]
---

## Goal

The owner wants the agent-workspace direction explored in parallel, in its
own repo — without bending §1's human lane or blurring the project's
identity. This ticket writes down the structure that makes both true at
once: the "fork of purpose" class in the ecosystem plan, and the white
paper's §6 sentence adjusted so it stays exactly honest.

## Context

The white paper named agent workspaces a fork of purpose "built by someone
else"; the owner then claimed the exploration (second M13 session, Aug
2026). The framing survives — the fork still lives outside this project,
under another name — but "someone else" needed to become "another name,
another repo, its own conscience." The mechanical fit was already noted in
the critique that seeded M13: the SDK runs in Node, a link is a per-task
capability, `rewind` is the audit trail — and the room's D1 convention ("a
seat is a device, not a person") accommodates agent writers without one
word changing.

## Tasks

- [x] docs/ECOSYSTEM.md — "Forks of purpose" section: definition (own
      repo, own non-spool name, npm-only, honesty culture kept, §1 lane
      exemption, never merges back, feedback only through the
      parked-with-evidence gate at stranger's rank), the agent-workspace
      charter paragraph, name candidates for the owner (`familiar`,
      `scribe`, `logbook`), and the shared T-130 gate.
- [x] WHITEPAPER.md §6 — the "someone else" clause adjusted; the refusal
      ("this roadmap stays people") stands verbatim in force.

## Acceptance criteria

- A reader of ECOSYSTEM.md can tell a vessel from a fork of purpose in one
  paragraph, and knows the fork's learnings outrank nobody's at the gate.
- The white paper's §6 stays true under the plan (owner explores the fork,
  the lane stays human) — no sentence in it needs a wink to survive.

## Notes / open questions

- Repo name is the owner's call (candidates above); creation waits for the
  name and for T-130 (the fork consumes `spools@0.1.0` from the registry
  like any stranger).
- **Named (Aug 2026, owner): `pfam`.** Candidates `familiar`/`scribe`/
  `logbook` passed over. Diligence recorded in ECOSYSTEM.md: npm name
  free (404, probably never needed — it's an app, not a package); faint
  Pfam protein-database collision noted and dismissed. Repo
  `osfasofa/pfam` is born after T-130; only the name is claimed here.
- First spike sketch, recorded so the fork repo starts warm: an agent
  holds a spool link for one task; winds `finding`/`question`/`decision`
  entries as it works; the human opens the link on a phone, steers by
  threading replies; `leave()` flushes the final deposit so the record
  survives the agent's container; export is the mission record. Zero
  protocol pressure expected; anything that appears queues at the gate.
