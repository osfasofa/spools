---
id: T-153
title: "record — mic capture, punch in/out, takes wound as pointers"
status: todo
milestone: M14
depends: [T-151, T-152]
---

## Goal

The core gesture: arm a track, punch in at the playhead, talk, punch out — a `take` entry lands in the spool carrying the pointer, the placement, and the punch stamps, while the other tracks keep playing underneath.

## Tasks

- [ ] `getUserMedia` with `echoCancellation: false, noiseSuppression: false, autoGainControl: false` (tape character — adopted from tape-vibes verbatim); permission denial handled with a human sentence, not a hang.
- [ ] `MediaRecorder` capture (opus where available, AAC on Safari), assembled at stop, into the reel store.
- [ ] Punch-in stamps playhead position + wall-clock; punch-out winds `take` with `{ audio, tape: { track, at, offset: 0, dur, rate: 1/S }, punch: { in, out, speed: S }, source: { type: 'mic' } }` — the tape trick per DESIGN §6; speed knob locked while armed.
- [ ] Monitoring: playback of other tracks continues during recording (that is what makes it multitrack); REC LED blinks; input level meter.
- [ ] Track arming UI (one armed track at a time, v1).

## Acceptance criteria

- Record two takes on two different tracks; both wound with correct pointers and placements; blobs in the reel store; refresh → both reload and play together.
- The doc contains pointers only — no audio bytes (inspect the export to prove it).
- Punch stamps appear in entry data with wall-clock in/out.

## Notes / open questions

- Capture-start latency lands in placement (v1 asterisk, DESIGN §6); a `mend` nudge is the escape hatch.
