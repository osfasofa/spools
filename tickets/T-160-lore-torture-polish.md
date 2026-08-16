---
id: T-160
title: "torture + polish — TESTING.md, honesty in the UI, smoke pass, deploy note"
status: done
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
- The scripted pass is green end-to-end: reel/record/playback/feel/cut/words/bake/pack/telling/memory on the fake mic, plus the campfire rows — two isolated contexts on a local `spools-relay`, both `connected`, A→B live (ghost-honest), B→A gloss back in ~2 s, and `apps/client` degrading sanely over the same reel. TESTING.md holds the full table; hardware rows (phones, real mic, live tab capture, VoiceOver) stay with the owner, marked.
- Fixed en route: `.rewindBar`'s author display beat the `hidden` attribute — the memory strip showed on live reels ( caught by device-B's screenshot; `[hidden]{display:none}`).
- Environment archaeology recorded in TESTING.md: this container's proxy refuses ws CONNECT (even localhost — Chromium needs `--no-proxy-server` here), and a link's relay URL carries its **path** (`…/yjs`) — rewriting to a bare host lands on the signaling endpoint and sits at `connecting` forever. The second one is a plausible real-world footgun worth a future SDK sentence (evidence, not a request).
- The accidental pocket proof: with websockets eaten, device B still received the whole reel via HTTP deposits alone — the midnight machinery working incognito.
