---
id: T-164
title: "Start a new room — the way out when someone turns bad"
status: todo
milestone: M15
depends: []
---
## Goal

A one-tap gesture for the only remedy the design offers against a bad actor:
a new spool, handed only to the people you want.

## Context

No block, ban, or removal, by decision (DESIGN_DOC §6 permissions ladder).
ETHOS rule 10 carves out the actually dangerous person and the software has no
mechanism for the exception; today the remedy requires knowing to open the
bare URL. Review finding F16.

## Tasks

- [ ] Settings → "start a new room": `newSpool()`, navigate to its link, copy
      the link. The old room stays in the stash (export or forget it in its
      own settings — T-163).
- [ ] Fine print sentence: *"there is no way to remove someone. make a new
      room and hand the new link only to the people you want."*
- [ ] Notice on arrival in the new room: "your old room is still on this
      device."

## Acceptance criteria

- From any room, one tap lands in a fresh keyed room with its link copied;
  the old room still opens from its old link.

## Notes / open questions

- Carrying history across is `splice` — parked (DESIGN_DOC §2, INDEX Parked).
  Not this ticket.
