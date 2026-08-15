---
id: T-122
title: "Room name (shared) + themes (per-device)"
status: done
milestone: M11
depends: [T-114]
---

## Goal

The room gets a name everyone shares, and a look each device chooses for
itself. The split is deliberate (owner-approved cut): the *name* is the
artifact's title and genuinely collective; a *theme* is your handwriting —
T-090's stash-label precedent — and a shared one is the likeliest small fight
("who changed it") at a permanent entry per flip under `gc:false`.

## Tasks

- [x] Shared name: `wind({ kind: 'room:name', body })`, newest wins; editable
      by anyone (tap the header); renders in the header and the document title;
      the audit ("named by —") for free from the entry's seat.
- [x] Per-device theme: the **four themes from `docs/design/room/README.md`**
      (blackout default, terminal, daylight, paper — exact token values are
      final there), in a localStorage key following the `spool-view` precedent
      (app.js:81). Syncs nothing. Theme picker per the README's settings
      screen (2×2 self-rendered cards).
- [x] **Contrast floor as an acceptance criterion, not a later fix**: every
      theme passes WCAG AA for text and essential UI (T-125 audits; this ticket
      doesn't ship failures for it to find).
- [x] Stash label vs room name: keep both honestly — the label is your private
      name for the spool, the room name is the shared one; don't conflate.

## Acceptance criteria

- A renames the room; B sees it live and after reload. B's theme choice never
  appears on A. All themes pass the contrast floor. Concurrent renames converge
  (newest wins, all peers agree).

## Notes / open questions

- Landed: settings "name" section (commit-on-blur input, `room:name` wound
  with `data.seat`; newest wins; header + `document.title` follow; caption
  reads "named by <resolved name> · anyone can rename it"), and the 2×2
  theme grid (each card self-rendered in its own bg/tx with ac/tx/dim
  swatch dots, accent border on active; applies instantly; localStorage
  `room-theme`).
- **Contrast: measured, and the handoff's own values didn't all pass its
  own AA rule.** At 14 px body size: daylight `acTx/ac` 4.19, paper 4.05,
  daylight `dim/sf` 4.44, paper 4.50-ε. Shipped the nearest passing values
  (daylight `ac #0B893A`, `dim #6D6D69`; paper `ac #BB4F3A`,
  `dim #6E6254` — all ≥4.5, visually near-identical) and annotated the
  README's token table with the deviation + reason. Blackout/terminal pass
  untouched (worst pair 4.90).
- Stash label untouched: the room never writes `stash.label` — the label
  stays your private name (mixtape uses it), the room name is the shared
  one. Not conflated by construction.
- Verified (smoke 14): pre-existing `room:name` renders in the header; a
  settings rename propagates to a fresh device with the audit line;
  terminal theme applies instantly, survives a REAL reload (`Page.reload` —
  a same-URL navigate with a fragment turned out to be a same-document
  no-op, which had also silently weakened scenario 5's reload; both fixed),
  and never appears on the other device; concurrent renames converge to
  the same header on both devices.
