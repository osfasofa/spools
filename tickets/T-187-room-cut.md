---
id: T-187
title: "Room: the cut — start a new reel from here; the tape counter; full is a cut, not a wall"
status: todo
milestone: M16
depends: [T-186]
---

## Goal

In the room, a person points at an entry and cuts: a new keyed reel opens
on the same relay with everything from there on, in order, replies-to-the-
cut flattened and said so; the old reel is untouched and still opens; the
new reel's `rewind()` starts at the cut. A second device cold-opens the new
link from the pocket and sees the same reel. (Brief §9.1.)

## Context

T-180's decisions 4 and 5 (DESIGN_DOC §5 "The splice family"): the thread
rule is **flatten**, stated on the button ("replies to what you cut become
plain entries"); the seam is **by entry**, never by time (the reel spike's
`createdAt` ties); identity is preserved, no knob. T-164's "start a new
room" is the whole cut already shipped — this ticket gives it a from-here
gesture and a reel to splice onto. The reel riff (`docs/riffs/the-reel.md`
§4, §7) supplies the counter and the reserved length kind.

## Tasks

- [ ] The cut: an entry's menu gains "start a new reel from here" —
      select by the SDK's own order from that entry on, flatten parents not
      in the selection, `newSpool` on the old link's relay, `splice`, wind
      the sealed `home` link into the new reel; the button's sentence carries
      the flatten rule and "the new reel has no past".
- [ ] `next` on the old reel: sealed by default if the first real cut wants
      it (the brief left this to the first cut — decide here, note it).
- [ ] The tape counter: bytes and entries against the link's relay's
      advertised `pocket.maxBytes` (from its health JSON; never a constant);
      "full is a cut, not a wall" near the T-104 warning line.
- [ ] The reserved reel-length kind (advisory, newest-wins, like the room
      name): the maker's soft length inside the relay's hard cap; the counter
      reads it when present.
- [ ] Smoke scenarios for each; the two-device cold-open of the new reel.
- [ ] The mixtape: the same cut if it wants one (apps copy prose).

## Acceptance criteria

- Brief §9.1 and §9.2, in the room, in the smoke suite.

## Notes / open questions

