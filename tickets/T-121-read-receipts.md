---
id: T-121
title: "Read receipts: ephemeral awareness-only"
status: done
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

- [x] Extend the awareness payload with a last-read marker (e.g.
      `{ seat, read: <entry id> }` beside T-119's fields), throttled on
      blur/idle — never on scroll ticks (awareness spam is still traffic).
- [x] "Seen by" row on the last message read (avatars/suffix-chips via the
      profile resolver), per-seat, merged per T-114's multi-device choice;
      markers vanish honestly when the peer's awareness expires.
- [x] Verify the amended-D3 behavior explicitly: close the tab → your marker
      disappears for others; reopen → it returns at your new position. Record
      in Notes that zero doc growth was observed with receipts active.

## Acceptance criteria

- "Seen by" tracks reading across 3 devices live; a closed tab's marker
  expires within the awareness timeout; doc byte count is unchanged by any
  amount of reading (the amended D3, verified).
- The honest sentence ships: "seen" is live-only — nobody learns what you
  read while they were away.

## Notes / open questions

- Landed inside `usePresence` (one payload for the seat: `{ seat, typing?,
  read? }` — typing and read merge through a single fields ref so neither
  clobbers the other). The read cursor's SOURCE is the `<MessageList>`
  boundary: it reports the furthest real message that has been rendered
  while pinned-at-bottom in a visible tab (`onSeen`), plus on
  visibilitychange — never on scroll ticks. Broadcasts dedupe on id and
  throttle to one per 2 s.
- Markers render as the design's 9 px seat-color squares, right-aligned
  under the furthest message each OTHER seat has seen, `title="seen by
  <resolved name>"`. Multi-device seats merge (one marker per seat).
- The amended D3 is stated in the fine print: `"seen" is live-only — nobody
  learns what you read while they were away.`
- Verified (smoke 13): markers land under the newest message both ways
  (headless nuance: only the front tab is `visible`, so the harness
  `Page.bringToFront`s each side); **zero `room:read` entries in the doc and
  the export never mentions the kind** — the structural proof of the D4
  decision; closing a tab removes its marker via the presence removal path
  (~0.3 s, not the 30 s timeout). Scenario 11 already proved awareness
  traffic moves zero doc bytes; read rides the same channel.
- The reopen-returns-at-new-position half is the same broadcast mechanic
  (open → feed pins → onSeen fires); exercised implicitly by every scenario
  that opens a tab onto history. T-126's torture pass covers it explicitly
  across real devices.
