---
id: T-061
title: History scrubber in the reference client
status: todo
milestone: M6
depends: [T-060]
---

## Goal

The demo that sells the vision: drag a scrubber, watch the mixtape un-grow back to the first track. This is `rewind()` made visceral.

## Context

DESIGN_DOC §4 calls this "the memory feature; the demo that sells the vision." It rides on T-060's API and the T-030 renderers — scrubbing should work in *every* view (list, chat, mixtape), because rewind is a data-layer fact, not a view feature.

## Tasks

- [ ] Scrubber UI: timeline from spool's first `createdAt` to now; drag → `rewind(ts)` → render snapshot through the current view's renderer; release/exit → back to live.
- [ ] "Rewinding" mode is visually unmistakable (you're in memory, not the present — no winding while rewinding).
- [ ] Renderers accept `EntrySnapshot[]` as well as live entries (they're skins over data — prove it again here).
- [ ] Snapshot granularity felt-experience check: if T-060's bookkeeping makes scrubbing chunky, note it — polish only if cheap.
- [ ] A 30-second happy-path GIF/recording for the eventual README (this is the pitch asset).

## Acceptance criteria

- Scrub back and forth over a spool with 30+ entries incl. edits and deletes; every view renders coherent history; returning to live is instant and safe.
- The recording exists and makes someone say "oh, I get it."

## Notes / open questions

- (UX findings; anything that suggests SDK-API changes goes to T-060/SDK-API)
