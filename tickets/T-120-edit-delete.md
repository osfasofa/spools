---
id: T-120
title: "Edit, delete, and the honest write contract"
status: done
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

- [x] Edit-own: inline edit for messages with your seat; an "edited" marker.
- [x] Delete-own: soft delete rendered as a tombstone row ("message deleted"),
      never a silent vanish; restore reachable (long-press/menu on tombstone).
- [x] The honest sentence, once, where members will see it (room info panel):
      anyone with the link can edit or delete anyone's messages — this room
      runs on trust, not permissions.
- [x] Cross-writer reality check in Notes: what does it look like when another
      seat edits/deletes your message? Don't build UI to prevent it (can't);
      make sure the rendering stays coherent and attributable where possible.

## Acceptance criteria

- Edit and delete round-trip across devices; tombstones render everywhere;
  restore works; the "edited" marker appears on the other device.
- The honest sentence exists in the UI, verbatim-ish, findable.

## Notes / open questions

- Landed: sheet gains ✎ edit / ✕ remove on your own messages (ActionSheet
  refactored to a caller-supplied action list); edit prefills the composer
  (same input element — focus survives the mode switch), rewrites the entry
  **body**, and winds a **`room:edit` marker** (`parent` = the message,
  `data.seat` = the editor); tombstones render in-slot ("removed", dashed,
  never a silent vanish) with ↺ restore in their sheet; the honest sentence
  has lived in settings' fine print since T-113 and is now asserted.
- **The "· edited" marker needed a new reserved kind.** Nothing in the model
  records that a body changed (bodies are mutable, metadata write-once, and
  `data` mutations don't sync), so `room:edit` is the sanctioned D2 answer:
  append-only (no delete-set growth), rewind-visible, and its seat is the
  free audit trail — the marker's title reads "edited by <resolved name>".
  ~180 B per edit, plus ~90 B of body tombstone per rewrite (T-060's number);
  T-127 folds both into the growth story.
- **Restore is offered to anyone** (not just the deleter) — deliberately: the
  tombstone's sheet shows ↺ restore, matching the protocol's actual contract
  instead of pantomiming a permission the system can't enforce.
- **Cross-writer reality (checked in vivo)**: A rewrote B's message directly
  through the SDK — B's device renders the new body with the edited marker
  attributed to A ("edited by zora") because the marker carries the editor's
  seat. *Deletions* are NOT attributable: `deletedAt` is a bare metadata set
  with no author — a tombstone says "removed", never by whom. Recorded as the
  v1 truth (a `room:delete` marker could fix it the same way if a real room
  ever asks).
- Verified (smoke 12): edit prefilled + marker round-trips; remove →
  tombstone on the other device → restore round-trips back; cross-writer
  edit coherent + attributed; honest sentence findable. Zero page errors.
