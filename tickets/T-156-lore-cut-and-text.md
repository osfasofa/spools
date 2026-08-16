---
id: T-156
title: "cut + words on the tape — mends, sayings, glosses"
status: done
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
- Verified headless, driven through the real UI: cut at head 2.0 on a 0.5–4.5 take → left {at 0.5, dur 1.5, off 0} + right {at 2.0, dur 2.5, off 1.5}, one blob in the store (shared), original tombstoned with caption carried to the left child; hold-450ms lift-drag moved the right half to track 4 @3.5 s as exactly one `mend` with the original wind untouched (woundAt 2.0/track 0 still legible — the telling can show drift); saying pinned via the composer; gloss threaded via the sheet. Doc kinds now: take/mend/saying/gloss.
- Restore-after-cut leaves the children standing beside the restored original (both play) — recorded as the honest asymmetry; the telling + unwind covers it, no reaper logic.
- Cross-app degrade-sanely check against apps/client moved to T-160 (same-origin serve of both apps).
