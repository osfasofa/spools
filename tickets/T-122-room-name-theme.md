---
id: T-122
title: "Room name (shared) + themes (per-device)"
status: todo
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

- [ ] Shared name: `wind({ kind: 'room:name', body })`, newest wins; editable
      by anyone (tap the header); renders in the header and the document title;
      the audit ("named by —") for free from the entry's seat.
- [ ] Per-device theme: 2–3 themes including a dark one, in a localStorage key
      following the `spool-view` precedent (app.js:81). Syncs nothing.
- [ ] **Contrast floor as an acceptance criterion, not a later fix**: every
      theme passes WCAG AA for text and essential UI (T-125 audits; this ticket
      doesn't ship failures for it to find).
- [ ] Stash label vs room name: keep both honestly — the label is your private
      name for the spool, the room name is the shared one; don't conflate.

## Acceptance criteria

- A renames the room; B sees it live and after reload. B's theme choice never
  appears on A. All themes pass the contrast floor. Concurrent renames converge
  (newest wins, all peers agree).

## Notes / open questions

-
