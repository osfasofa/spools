---
id: T-159
title: "the telling — told-time log + rewind you can listen to"
status: done
milestone: M14
depends: [T-154, T-156]
---

## Goal

The second timeline and the memory under it: the reel's own story in told-time (every punch, mend, cut, bake, gloss, in order), and the SDK's rewind scrubber rendering — and *playing* — the tape as it was.

## Tasks

- [ ] The telling view: entries by `createdAt` (tombstones included, marked) rendered as a log — punch stamps as mono in/out lines, mends as "moved/trimmed", cuts via `origin`, bakes as tellings, glosses threaded; seat-colored tellers.
- [ ] Rewind mode: scrubber over `spool.history` moments; tape re-rendered from `EntrySnapshot`s (mends resolved as-of-then), read-only chrome (the client's sepia precedent, in lore's register: "memory — the reel as it was"); every way of writing hidden.
- [ ] Playback in memory: snapshots' pointers resolved against the reel store — blobs the device holds play; the rest ghost. Listening to the tape before the cut is the demo.
- [ ] Back-to-live is one obvious gesture.

## Acceptance criteria

- The log shows a faithful told-time account of a session (record → move → cut → bake) with correct stamps and authors.
- Rewinding to before a cut shows — and plays — the uncut take; returning to live restores the present tape untouched.
- No write path exists while rewinding (buttons hidden/disabled; wind attempts impossible).

## Notes / open questions

-
- Verified headless: the log narrates told-time faithfully — tombstoned original struck and marked "unwound" with its caption quoted, cut children labeled "born of a cut" with their durations, day dividers, kind chips, seat-colored tellers. Memory: entering at moment 1/2 (before the cut) renders the take whole — no seam — the transport hides, the LCD says memory, the scrubber resolves moments, and the past PLAYS (playhead advanced through the snapshot reel); wind() refuses with a sentence. Back to now: 2 takes + 1 tombstone, untouched.
- Moments debounce as the SDK ships (2 s idle, ≥10 s apart) — the test waited them out; nothing app-side touches history.
