---
id: T-158
title: "sourcing — file import, drag-drop, line-in (capture what plays)"
status: done
milestone: M14
depends: [T-152, T-154]
---

## Goal

Any way to get sound onto the tape besides the mic: bring files, drop files, and — the honest underground move — record what's playing (tab/system audio), the way tapes always taped.

## Tasks

- [ ] File import: `<input type="file" accept="audio/*">` + drag-drop onto a track lane; decode, store, wind a `take` at the drop position (or playhead) with `source: { type: 'file', name }`.
- [ ] Oversize/undecodable files fail with a human sentence (no unhandled rejections — the tape-vibes gap, closed).
- [ ] Line-in: `getDisplayMedia({ audio })` where the platform allows (Chromium tab audio); captured through the same punch path, `source: { type: 'line' }`; absence on iOS stated, not hidden.
- [ ] No YouTube ripper — the refusal recorded in DESIGN §11 shows up here as UI copy for line-in ("record what's playing").
- [ ] Import of a packed reel routed to T-157's unpack (one file-open surface, two formats).

## Acceptance criteria

- Drop an audio file on track 3 → take appears at the drop point, plays, syncs its pointer; a phone can do the same through the picker.
- Line-in captures a playing tab into a take on Chromium desktop; on platforms without it the control explains itself instead of erroring.

## Notes / open questions

-
- Verified headless: picker import lands at the head on the armed track with `source: {type:'file', name}`; the drop path (same importFiles) places at lane/time (track 3 @ 3.0s); a text file fails with the sentence, not a crash; line-in's punch path ran end-to-end under Chromium's fake display UI (real tab-capture with shared audio is a hardware row in TESTING.md). Multi-file import stacks takes head-to-tail from the drop point.
- A `.lore.json` dropped or picked routes to T-157's unpack — one surface, two formats.
