---
id: T-157
title: "bake — offline mixdown to WAV, wound back as a telling; pack the reel"
status: todo
milestone: M14
depends: [T-154]
---

## Goal

The keepsakes: bake the tape to one fixed track (a `telling`), and pack the whole reel — spool + sound — into one file that opens in 2040.

## Tasks

- [ ] Bake: the **same** scheduling code against an `OfflineAudioContext` at unity speed (mixdown ≡ monitoring by construction — the tape-vibes export bug inverted into a rule); render → 16-bit stereo WAV (writer adapted from tape-vibes `app.ts:299-336`).
- [ ] WAV offered as a visible download **and** stored in the reel store + wound as `telling` with `{ audio, baked: { at, dur, takes } }`, optional liner-note body.
- [ ] Pack the reel: `{ format: 'lore-reel', version: 1, spool: <spool.export() parsed>, blobs: { sha256: { mime, b64 } } }` → download, size stated before writing.
- [ ] Unpack: file input → validate → `importSpool` + adopt blobs → the reel plays on a device that had nothing.
- [ ] `URL.revokeObjectURL` deferred past the click (the tape-vibes race, not copied).

## Acceptance criteria

- A baked WAV of a two-track reel plays in a stock player and matches what monitoring played (same takes, same gains, same placements).
- The bake appears on the reel as a `telling` entry (and in the telling log), pointer-only in the doc.
- Pack → wipe site data → unpack: the reel returns whole — takes, words, history moments, and sound.

## Notes / open questions

- Bake at unity is the recorded default (the knob is a listening/performance control); a baked-at-speed variant is a parked riff.
