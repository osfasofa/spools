---
id: T-156
title: "cut + words on the tape — mends, sayings, glosses"
status: todo
milestone: M14
depends: [T-154]
---

## Goal

The blade and the pen: cut a take at the playhead, move/trim what's there (append-only, newest-wins), and let words ride the tape — title cards, liner notes, annotations.

## Tasks

- [ ] Cut: selected take + playhead → soft-delete original, wind two takes sharing the blob with adjacent `offset`/`dur` windows and `origin: { take }` (DESIGN §3). Restore un-cuts (children tombstoned back? no — cut children stay; restore is the original's own gesture; note the honest asymmetry).
- [ ] `mend`: move (drag a take to a new `at`/track) and trim (edge drag) wind `mend` entries with full replacement `tape` blocks, `parent` = the take; render applies newest surviving mend; every mend visible later in the telling.
- [ ] `saying`: text pinned at a tape position (`data.tape.at`), rendered as a card on/above the tape; composer at the playhead.
- [ ] `gloss`: threaded annotation on a take/saying (tap → sheet → gloss), rendered in the take's detail sheet.
- [ ] Selection + action sheet (room-pattern) for take gestures: caption, cut, mend-nudge, gloss, delete/restore.

## Acceptance criteria

- Cut produces two takes that play back seamlessly across the seam (no double-trigger, no gap at 1×), sharing one blob (prove via reel-store count).
- A moved take syncs its new place to a second tab; the mend appears as its own entry (told-time), and the take's original wind is untouched (append-only proven).
- Sayings and glosses survive refresh, sync, and render in the naive list client via body text (degrade-sanely check against `apps/client`).

## Notes / open questions

-
