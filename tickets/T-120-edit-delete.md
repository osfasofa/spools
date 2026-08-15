---
id: T-120
title: "Edit, delete, and the honest write contract"
status: todo
milestone: M11
depends: [T-113, T-114]
---

## Goal

Messages can be edited and deleted — and the app says out loud what the protocol
already makes true: anyone with the link can edit or delete *anything*. The
affordance is edit-own/delete-own; the honesty is the deliverable.

## Context

Mechanics are free: soft delete (`entry.delete()` / `restore()`, tombstones via
`spool.deleted`), bodies mutable. DESIGN_DOC §6: the link grants full write
access to everything — the honest v1 contract; no permissions (parked ladder),
so social visibility replaces enforcement. `entry.body`'s setter rewrites
wholesale (entry.ts:91-98) — fine for editing your own message, lossy if two
edit one; and wholesale rewrites cost ~90 B each forever under `gc:false`.

## Tasks

- [ ] Edit-own: inline edit for messages with your seat; an "edited" marker.
- [ ] Delete-own: soft delete rendered as a tombstone row ("message deleted"),
      never a silent vanish; restore reachable (long-press/menu on tombstone).
- [ ] The honest sentence, once, where members will see it (room info panel):
      anyone with the link can edit or delete anyone's messages — this room
      runs on trust, not permissions.
- [ ] Cross-writer reality check in Notes: what does it look like when another
      seat edits/deletes your message? Don't build UI to prevent it (can't);
      make sure the rendering stays coherent and attributable where possible.

## Acceptance criteria

- Edit and delete round-trip across devices; tombstones render everywhere;
  restore works; the "edited" marker appears on the other device.
- The honest sentence exists in the UI, verbatim-ish, findable.

## Notes / open questions

-
