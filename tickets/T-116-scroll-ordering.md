---
id: T-116
title: "Scroll, windowing, ordering"
status: todo
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

- [ ] Incremental rendering: keyed rows, append-fast-path for the common case,
      windowing/virtualization if the numbers demand it — measure first with a
      synthetic 5 000-message spool (reuse T-110's generator).
- [ ] Consider caching the sorted list and applying `EntryChange` diffs instead
      of re-reading the getter per event; if the naive path is actually fine at
      target scale, record that as the (happy) verdict instead.
- [ ] Scroll contract: stick-to-bottom when at bottom; **never yank** a reader
      scrolled up — show a "new messages ↓" affordance instead; preserve
      position across prepends and reloads.
- [ ] Clock skew: render reply relationships structurally (never trust time for
      parent/child); annotate messages with a future `createdAt`; document the
      honest limit (total order is the writer's clock — the v1 contract).

## Acceptance criteria

- 5 000 messages: open, scroll, and per-event render stay usable (numbers in
  Notes); no yank while reading history; a skewed-clock peer (+3 min) neither
  pins the feed nor orphans replies visually.

## Notes / open questions

-
