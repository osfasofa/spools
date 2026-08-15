---
id: T-116
title: "Scroll, windowing, ordering"
status: done
milestone: M11
depends: [T-113]
---

## Goal

The feed stays fast and sane at a few thousand messages. This is architecture,
not polish: both existing clients repaint everything per event, and
`spool.entries` sorts the whole map on every read (entry.ts:160-166) —
O(n log n) per event, felt for the first time here because nothing on this SDK
has ever had a large n.

## Context

Events fire on every peer keystroke batch, every reaction, and (if T-121 ships
cursors) every read advance by every participant. All work happens inside
T-113's `<MessageList>` boundary. Clock skew is real: `createdAt` is the
writer's wall clock with an id tie-break, so a fast phone pins itself to the
bottom and a reply can sort before its parent.

## Tasks

- [x] Incremental rendering: keyed rows, append-fast-path for the common case,
      windowing/virtualization if the numbers demand it — measure first with a
      synthetic 5 000-message spool (reuse T-110's generator).
- [x] Consider caching the sorted list and applying `EntryChange` diffs instead
      of re-reading the getter per event; if the naive path is actually fine at
      target scale, record that as the (happy) verdict instead.
- [x] Scroll contract: stick-to-bottom when at bottom; **never yank** a reader
      scrolled up — show a "new messages ↓" affordance instead; preserve
      position across prepends and reloads.
- [x] Clock skew: render reply relationships structurally (never trust time for
      parent/child); annotate messages with a future `createdAt`; document the
      honest limit (total order is the writer's clock — the v1 contract).

## Acceptance criteria

- 5 000 messages: open, scroll, and per-event render stay usable (numbers in
  Notes); no yank while reading history; a skewed-clock peer (+3 min) neither
  pins the feed nor orphans replies visually.

## Notes / open questions

Harness: `scratch/spike-room/room-scale.mjs` (5 000 seeded messages, two
origins, headless Chrome, 375×667).

### Measured verdicts

- **The entries getter is NOT the bottleneck — happy verdict, no diff-cache.**
  Full sort at 5 000 entries: **3.7 ms/read**. The DOM was the whole problem:
  5 000 rendered rows cost **~101 ms per event**; with the window it's **150
  rows and ~14 ms** — 7× better, and flat as history grows.
- **Windowing design: anchored by START index, not a sliding tail.** At
  bottom: newest 150, re-trimmed via a render-phase adjustment (the first
  5 000-entry sync never paints big). Scrolled up: the start FREEZES, so
  arrivals only append below and nothing above the viewport is removed — a
  sliding window shifts the reader one row per arrival, which is a slow yank.
  "show earlier · N more" expands by 300 with scrollTop compensation
  (measured: anchor bubble kept in place, 150→450 rows).
- **Scroll contract held under test**: scrolled-up reader, new remote
  message → **0 px moved** + "new messages ↓" pill; pinned reader follows;
  reloads open pinned to newest (design rule). at-bottom-ness is tracked by a
  native scroll listener AND re-derived from geometry after every paint —
  events alone proved losable.
- **Clock skew**: a +3 min writer (Date.now patched around a wind) renders
  in place, annotated "this device's clock runs ahead" (threshold 90 s);
  present-time traffic continues sanely around it. The honest limit stands:
  total order is the writer's clock + id tie-break, so a fast clock sits
  below slower peers' new messages until real time passes it — annotated,
  never reordered. Replies must always resolve `parent` by id at render
  (T-118); a reply CAN sort before its parent.

### Harness lessons (paid for here, so T-126 doesn't pay again)

- Two headless-Chrome quirks produced phantom "bugs": idle frames never
  dispatch scroll events for programmatic `scrollTop` writes, and
  `Input.dispatchMouseEvent` (mouseWheel) **never acks** — an awaited CDP
  call on it hangs forever. Scroll tests: set scrollTop + dispatch a scroll
  `Event` explicitly (exercises the exact listener+geometry contract); give
  every CDP call a timeout.
- Never pipe a harness through `head` with children inheriting stderr: the
  relay child holds the pipe open and a crashed harness's last words sit in
  head's buffer forever, looking exactly like a hang.
- `window.__renders` (render counter) stays in MessageList for the
  harnesses — a runaway render loop is measurable instead of a mystery.
