---
id: T-121
title: "Read receipts: ephemeral awareness-only"
status: todo
milestone: M11
depends: [T-110, T-111, T-112, T-114]
---

## Goal

**Decided (T-110 Notes, owner, Aug 2026): ephemeral awareness-only.** D3 is
amended — "seen" does not survive the tab; nothing about reading is ever
wound into the doc. The §5 M11 mutable-state row records the decision and the
quadratic measurement that killed the body-rewrite cursor. "Seen" rides the
sealed awareness payload (beside T-119's `{ seat, typing }` field), resolved
to display via T-114's profile table.

## Context

T-110 measured the signed-off body-rewrite cursor as quadratic (~2.7·n² B
cumulative — delete-set ranges never merge under the interleaved history log,
and every later moment re-encodes the whole ds); the flat append-only
alternative was offered and the owner chose zero permanent cost instead. If
persisted receipts ever return, the revisit starts from append-only
`room:read` entries — **never** body-rewrite. The awareness path is free:
sealed by construction, expired by awareness's own 30 s timeout, and adds no
doc bytes and no deposit traffic.

## Tasks

- [ ] Extend the awareness payload with a last-read marker (e.g.
      `{ seat, read: <entry id> }` beside T-119's fields), throttled on
      blur/idle — never on scroll ticks (awareness spam is still traffic).
- [ ] "Seen by" row on the last message read (avatars/suffix-chips via the
      profile resolver), per-seat, merged per T-114's multi-device choice;
      markers vanish honestly when the peer's awareness expires.
- [ ] Verify the amended-D3 behavior explicitly: close the tab → your marker
      disappears for others; reopen → it returns at your new position. Record
      in Notes that zero doc growth was observed with receipts active.

## Acceptance criteria

- "Seen by" tracks reading across 3 devices live; a closed tab's marker
  expires within the awareness timeout; doc byte count is unchanged by any
  amount of reading (the amended D3, verified).
- The honest sentence ships: "seen" is live-only — nobody learns what you
  read while they were away.

## Notes / open questions

-
