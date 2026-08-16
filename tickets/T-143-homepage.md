---
id: T-143
title: "Publish the white paper to a homepage — owner at keyboard"
status: todo
milestone: M13
depends: [T-140, T-130]
---

## Goal

WHITEPAPER.md reachable at a public URL the owner approves — the project's
front door for a human who was handed nothing yet.

## Context

The paper was written to publish without edits (T-140). Two venue
precedents exist: `spools.lol` (the apex is unused; `chat.spools.lol`
already ships as a Vercel prebuilt-static project via
`scratch/deploy-room.sh`) and GitHub Pages (`osfasofa.github.io/spools/`,
mixtape at root, room under `/room/`). Sequenced after T-130 deliberately:
the paper's "Hold one" section points at npm, and the standing rule is
that docs may not advertise a registry state that isn't true.

## Tasks

- [ ] Owner decisions: venue (`spools.lol` apex on Vercel — recommended,
      matches the chat precedent and gives the paper the project's own
      name — vs gh-pages root), and form (the rendered paper *is* the
      page, no build step, house-static discipline; vs a small landing
      page linking it).
- [ ] Render/publish (static; the client apps' no-tracking, no-analytics
      rule applies to the homepage too).
- [ ] README + WHITEPAPER cross-link the live URL once it exists.

## Acceptance criteria

- The paper is live at the chosen URL, owner-approved, after T-130 (so
  every command in "Hold one" works as printed).
- No analytics, no accounts, nothing that phones home — the homepage obeys
  the same refusals it describes.

## Notes / open questions

- Owner review of the paper itself happens here at the latest — T-140
  landed the draft in-repo; nothing publishes beyond the repo without the
  owner reading it.
