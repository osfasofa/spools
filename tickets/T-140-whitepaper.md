---
id: T-140
title: "WHITEPAPER.md — the public story, from working code"
status: todo
milestone: M13
depends: []
---

## Goal

The brainstorm boiled into one outward-facing document at the repo root:
what Spool is, what's been built (with the evidence), what it's for, what
it refuses to become, its honest limits, what it can grow into, and the
ethos — written so it can later be published to a homepage (T-143) without
edits. The constitution applies: written from the shipped system, nothing
aspirational, every number traceable to a measurement already recorded in
SPEC/DESIGN_DOC/briefs/tickets.

## Context

Follows the outside critique (Aug 2026) that pre-dated M10/M11 — its five
criticisms are each now either fixed (async gap → the pocket + keeper),
addressed in UX (the link's total power, said out loud in the room), or
measured and owned (growth budget; small-by-design as the win condition).
The paper leans on repo docs agreeing with shipped reality, so the small
truth-ups land first (chat.spools.lol in README, the stale "silent" latch
sentence in §6, T-002's domain note, the M10 brief's K≈4 → 8 pointers).

## Tasks

- [ ] Truth-ups the paper cites (separate commit, before the paper).
- [ ] WHITEPAPER.md at the repo root — manifesto front, evidence body:
      claim / what a spool is / what exists / how it works / what it's for /
      what it refuses / honest limits / what it can become / ethos / hold one.
- [ ] README: link the paper (start-here line) and the two M13 planning
      docs.
- [ ] Vocabulary audit: §2-conformant (spool/entry/wind/rewind/open/kind/
      stash/pocket/deposit); "vessel" used sparingly as the informal word
      for apps, not promoted to protocol vocabulary.

## Acceptance criteria

- The paper covers all seven asks from the session brief (done / want to
  do / what for / can be / shouldn't be / ethos / publishable), makes no
  claim the repo can't back, and quotes measured numbers only.
- Docs the paper cites agree with shipped reality (truth-ups landed).
- Owner review gates any publish beyond the repo — that's T-143, not this
  ticket.

## Notes / open questions

- **Register chosen (session recommendation, owner may re-register):**
  hybrid — manifesto voice up front, concrete evidence body behind it,
  refusals and limits as first-class sections. Rationale: the session
  brief asked for "almost a manifesto or a white paper" and listed content
  spanning both; the house style already writes philosophy and measurement
  in one voice.
- **Agent-workspace direction:** named in §6 as a fork-of-purpose (the
  shape fits; the lane is human) rather than embraced, omitted, or listed
  as a hard refusal. Flagged for owner veto — it's the one editorial call
  in the paper with real identity weight.
- Growth story framed as keepsake-lifespan ("finish the spool, export the
  file, start the next") on top of §6's measured crossing — framing only,
  no new commitment; compaction stays parked.
