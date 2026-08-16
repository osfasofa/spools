---
id: T-160
title: "torture + polish — TESTING.md, honesty in the UI, smoke pass, deploy note"
status: todo
milestone: M14
depends: [T-153, T-155, T-157, T-158, T-159]
---

## Goal

The house tradition travels: a torture checklist, the honesty sentences shipped where people can read them, an automated smoke pass with a fake mic, and the deploy story written down.

## Tasks

- [ ] `apps/lore/TESTING.md`: multi-device rows (live sync, ghost honesty, mend races), refresh/offline/reunion, midnight (pocket), phone rows (touch targets, dvh, mic on iOS Safari), memory rows (rewind), keepsake rows (bake, pack/unpack round trip).
- [ ] Honesty in the UI: the reel sentence (DESIGN §9), the ghost caption, the pack-size sentence, the line-in provenance note, storage usage line.
- [ ] `apps/lore/README.md`: what it is, the kinds table (constitution rule: reserved kinds documented), deploy-by-dropping-the-folder (Vercel/Pages/USB), the graduation note.
- [ ] Automated smoke: Playwright + Chromium fake-mic flags driving record → take wound → playback state → cut → bake → pack, against `http.server`; script + row results recorded here.
- [ ] A11y basics: labels/roles on transport controls, focus visible, reduced-motion, contrast on the field skin (AA — the room's own rule).

## Acceptance criteria

- Smoke pass green end-to-end on the fake mic; TESTING.md rows either checked or honestly marked "needs real hardware / owner".
- A cold reader can deploy from README alone.

## Notes / open questions

-
