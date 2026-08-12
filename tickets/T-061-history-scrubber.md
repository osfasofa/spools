---
id: T-061
title: History scrubber in the reference client
status: done
milestone: M6
depends: [T-060]
---

## Goal

The demo that sells the vision: drag a scrubber, watch the mixtape un-grow back to the first track. This is `rewind()` made visceral.

## Context

DESIGN_DOC §4 calls this "the memory feature; the demo that sells the vision." It rides on T-060's API and the T-030 renderers — scrubbing should work in *every* view (list, chat, mixtape), because rewind is a data-layer fact, not a view feature.

## Tasks

- [x] Scrubber UI: timeline from spool's first `createdAt` to now; drag → `rewind(ts)` → render snapshot through the current view's renderer; release/exit → back to live. *(range is [first moment, now] — see Notes)*
- [x] "Rewinding" mode is visually unmistakable (you're in memory, not the present — no winding while rewinding).
- [x] Renderers accept `EntrySnapshot[]` as well as live entries (they're skins over data — prove it again here).
- [x] Snapshot granularity felt-experience check: if T-060's bookkeeping makes scrubbing chunky, note it — polish only if cheap.
- [x] A 30-second happy-path GIF/recording for the eventual README (this is the pitch asset).

## Acceptance criteria

- Scrub back and forth over a spool with 30+ entries incl. edits and deletes; every view renders coherent history; returning to live is instant and safe.
- The recording exists and makes someone say "oh, I get it."

## Notes / open questions

- **Renderers needed zero changes** — the strongest possible proof of views-are-skins. `app.js` wraps `rewind(ts)`'s frozen `EntrySnapshot[]` in a *memory source*: an object with the same read surface views already consume (`entries`, `deleted`, per-entry `children`, no-op `wind`/`delete`/`restore`), and `mount()` just takes whichever source is current. Rewinding remounts the same view over memory; switching views mid-rewind works because memory is data, not a view state.
- **Read-only is enforced twice**: CSS hides every form/button/input inside `#view` while `body.rewinding` (unmistakable, alongside the sepia filter), and the facade's write methods are no-ops as the backstop. Live entry events are ignored during rewind — the present keeps syncing underneath and is repainted the instant you exit.
- **Scrubber range is [first moment, now]**, not first `createdAt` as the task sketch said: `rewind()` throws before the first recorded moment (T-060 decision — not knowing ≠ nothing), so a scrubber that starts earlier would just error. The continuous slider snaps to moments naturally because `rewind(ts)` resolves to the latest moment ≤ ts; the client only remounts when the *resolved* moment changes, so dragging stays smooth.
- **Granularity felt-check**: the 2 s debounce / 10 s min-gap cadence means one moment per activity burst — scrubbing a session-built spool steps in ~10 s strides of the original timeline. Feels chunky-but-legible, like flipping pages rather than smooth tape; each step is a coherent world. Verdict: fine, no polish needed — real spools accumulate moments over days, where the strides vanish.
- **Automated check**: `scratch/scrub-t061/check.mjs` (headless CDP, real cadence, ~40 s) — builds wind/edit+wind/delete moments, enters rewind, asserts the first-moment world (pre-edit body, undeleted track, no later leakage), asserts write UI hidden, switches chat + list views mid-memory, exits to live, zero page errors. 8/8 on first run.
- **Recording**: `scratch/scrub-t061/record.mjs` (builds a 32-entry mixtape — 10 tracks, 6 notes, 16 reactions, one edit, one deleted track — across 12 moments at real cadence) + `gif.py` (Pillow; hold-frames collapse into durations) → `docs/assets/rewind-demo.gif`, 30.0 s, 1.7 MB. Storyline: live tape → ⏪ sepia → un-grows to the first track → chat view of the same memory → forward → back to live in color, one fresh wind to show it's alive.
- No SDK-API changes needed — T-060's surface (`history` + `rewind`) was exactly enough for the scrubber.
