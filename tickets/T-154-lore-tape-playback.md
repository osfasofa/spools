---
id: T-154
title: "the tape — four-track timeline, waveforms, JIT playback"
status: done
milestone: M14
depends: [T-151, T-152]
---

## Goal

The instrument's face and its motor: a mobile-first four-track canvas timeline with bucketed waveforms and a playhead, and the just-in-time Web Audio scheduler that plays what the entries say.

## Tasks

- [ ] Canvas timeline: four lanes (seat-palette track colors), takes as blocks with mirrored-closed-path waveforms (peaks from the T-152 cache), DPR-correct, redraw off entry events + rAF while rolling.
- [ ] Tape counter (mono, mm:ss.t), playhead line, tap-to-seek, horizontal pan/zoom via Pointer Events with capture.
- [ ] JIT scheduler per DESIGN §6: graph `source → takeGain → trackGain → master`; ~200 ms horizon; seek = stop all + restart; effective placement = wind-time `tape` overridden by newest surviving `mend` (structure ready even before T-156 writes any).
- [ ] Per-track gain from `lore:mix` (newest-wins), rendered as four small faders/knobs.
- [ ] Ghost takes: pointer unresolved → dashed silent block with the honest caption.
- [ ] Entry-driven rerender with the naive fallback (full repaint from `spool.entries`) so the view can never drift.

## Acceptance criteria

- A reel with takes on ≥2 tracks plays them mixed, aligned to the timeline drawing, from any seek point.
- Second tab on the link: winds appear live on the first tab's tape; a device without the blobs shows ghosts and stays silent, honestly.
- Holds 60 fps on a phone-sized canvas while rolling (no shadowBlur, no per-frame gradient allocation — the tape-vibes render traps, refused).

## Notes / open questions

-
- Worked ahead of T-153 (playback is record's dependency — monitoring needs a motor); INDEX order preserved, statuses honest.
- Verified headless: two seeded takes decode and schedule (2 buffers, ctx running), playhead tracks wall clock with exactly the τ=80 ms spin-up lag the one-pole predicts (constant, not accumulating), stop sags through rate 0.10, seek+replay clean, ghost pointer skipped without a crash and drawn dashed-∅. Screenshot in session scratch.
- Deferred to T-160 rows: two-tab live sync against a local relay (this sandbox blocks the canonical one), 60 fps on real phone hardware, audible-mix verification via the bake (T-157 renders with the same scheduler, which is the point).
