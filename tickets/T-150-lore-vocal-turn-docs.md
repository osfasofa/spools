---
id: T-150
title: "lore: the vocal turn — brief amendment, vessel design doc, M14 laid out"
status: done
milestone: M14
depends: []
---

## Goal

The owner's audio redirect ("let's make folklore a vocal tradition — a mixtape that actually has audio: multitrack, punch in/out history, bakeable, rewindable, spliceable, pointers to storage") captured as a real design before it cools, and the build order for the vessel laid out as tickets.

## Context

Owner direction, Aug 2026: build lore now, in this workspace, on a branch — a deployable, mobile-first, spools-branded tape app. The ecosystem gate (vessel repos wait for T-130) is honored by prototyping in the loom, room-precedent, with the graduation recorded. The owner's tape-vibes repo (OP-1-inspired 4-track experiment) was read end-to-end as prior art; its lessons (one-pole speed slew, tape-honest mic constraints, WAV writer, peak bucketing — and its traps: flat tape-in-worklet, audio-thread peaks, desktop-only input, export≠monitoring) are folded into the design.

## Tasks

- [x] `apps/lore/DESIGN.md` — the vessel design doc: the vocal turn, the reel, kinds/schema (`take`/`mend`/`saying`/`gloss`/`telling`/`lore:*`), the two timelines, pointers + the reel store, the engine, ceremonies, no-build shape, the look, the gate, refusals, open threads.
- [x] `docs/vessels/lore.md` §6.5 — the vocal turn recorded as owner-directed redirect, pointing at the vessel doc.
- [x] Tickets T-150…T-160 + M14 section in `tickets/INDEX.md`.

## Acceptance criteria

- The design doc stands alone: the build can proceed from it without this session's context, and everything in it runs on SPEC v1.1 as-is (zero protocol pressure).
- The asset rule (§6, banked) is obeyed on paper before any code exists: pointers in the doc, bytes in the device store, sound travels by being handed.
- The append-only `mend` idiom is the recorded answer to placement edits (never body-rewrite — T-110's measurement respected).

## Notes / open questions

- `splice` stays reserved to the loom; the app's cutting verb is **cut**.
- The tape trick (record at speed S → placed at `rate = 1/S`) is physics falling out of the schema, recorded in DESIGN §6.
- Deliberately parked: peer blob hand-off, bucket courier, reverse playback, tape-color effects. All additive on the pointer scheme.
