---
id: T-155
title: "transport feel — varispeed knob, audible scrub, rewind/FF with sound"
status: done
milestone: M14
depends: [T-154]
---

## Goal

The reason it feels like tape: one speed knob with physics (one-pole slew, pitch locked to speed), scrubbing you can hear in both directions, spooling rewind/FF — the tape-vibes lessons, generalized.

## Tasks

- [ ] Speed knob (0.5×–2×, detent at 1×): target chased by exponential one-pole; sources glide via `playbackRate.setTargetAtTime` (τ ≈ 80 ms); playhead integrates the same one-pole analytically (hear/see cannot drift). Rotary control usable by touch (Pointer Events, vertical drag, capture).
- [ ] Stop = same mechanism, target 0, longer τ — the tape-stop sag.
- [ ] Scrub: dragging the tape plays ~40–60 ms grains from under the head at drag velocity, both directions (reverse grains via lazily-reversed buffers, cache capped).
- [ ] Rewind/FF: held buttons drive the same grain primitive at ±8×, audibly.
- [ ] Reduced-motion respected on any decorative animation.

## Acceptance criteria

- Turning the knob glides pitch/speed with no zipper or click; releasing at detent returns exactly to 1×.
- Scrubbing across a take is audible forward and backward; rewind sounds like spooling; stop sags rather than cuts.
- Playhead position after any gesture matches what plays (seek/scrub/varispeed leave no drift audible at take boundaries).

## Notes / open questions

- tape-vibes' worklet held the tape; here the buffers stay on the main thread and no worklet exists — the slew lives on AudioParams (its one-pole, relocated).
- Verified headless: ramp to 1.8× gains 1.733 tape-sec over 1.0 wall-sec (the one-pole's closed form, on the nose), no source restarts on speed moves; scrub fired grains both directions (0→6→10 across a fwd+back drag); rew held rate at exactly −8.00, pos clamped at 0, release decayed −0.29→0 with 14 more grains along the way; knob: 5×ArrowUp → 1.32, Home → 1.00, drag detent snaps within ±0.05.
- The knob locks while recording (engine guard is the contract); the tape trick uses the knob's parked value at punch-in.
