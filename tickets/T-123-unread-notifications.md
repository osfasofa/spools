---
id: T-123
title: "Unread + in-tab notifications"
status: done
milestone: M11
depends: [T-119]
---

## Goal

You can tell what you haven't read, and an open-but-backgrounded tab can get
your attention — plus the honest sentence about the hard limit: **a closed tab
hears nothing.** No push, no service worker, no server that knows you exist.
Saying that plainly is the §1-correct feature.

## Context

Unread derives from the read cursor if T-121 shipped it, else from a
local-only last-seen timestamp (works regardless of the D4 outcome). The
achievable surface is exactly: in-tab title/favicon badge, opt-in
`Notification` while the tab lives, and a per-room mute (localStorage).

## Tasks

- [x] Unread divider ("— new —") + jump-to-first-unread on open.
- [x] Title/favicon unread count while backgrounded; clears on focus+read.
- [x] Opt-in `Notification` for messages while backgrounded (never request
      permission unprompted — a button, not an ambush); respects mute.
- [x] Per-room mute toggle, per-device.
- [x] The honest sentence in the room info panel: this room can only reach you
      while it's open somewhere — there is no server to call you back.

## Acceptance criteria

- Background the tab, receive messages, see the badge; focus lands at the
  divider. Notifications appear only after explicit opt-in and never when
  muted. The honest sentence exists.

## Notes / open questions

- Unread derives from a **local-only** durable last-seen
  (`localStorage room-seen:<code>`, a timestamp) — the shared read cursor is
  ephemeral by decision (D4/T-121) and can't survive a reload, so both exist
  and both are fed by the same `<MessageList>` `onSeen` signal (furthest
  message rendered pinned + visible). Captured once at open for the divider,
  so "— new —" never chases you while you read; opening lands at the divider
  (window widened if needed) instead of the bottom when one exists.
- Badge: title `(n) <room name>` + a canvas-drawn accent-square favicon with
  the count (`badge.ts`), counting non-mine messages that arrive while
  `document.hidden`; clears on visibilitychange-to-visible. The opening
  backlog belongs to the divider, not the badge.
- Notifications: strictly a settings button ("a button, not an ambush" —
  the smoke asserts `Notification.permission === 'default'` after a full
  session of use); `tag`-collapsed to one per room; suppressed by the
  per-device mute (`room-muted`). Actual OS-notification display can't be
  observed headlessly — the permission gate, mute persistence, and copy are
  what's asserted; the dispatch path is three lines that T-126's real-device
  pass will see fire.
- The honest sentence ships in the notifications section: "this room can
  only reach you while it's open somewhere — there is no server to call you
  back."
- Verified (smoke 15): hidden A badges `(2)` + data-URI favicon while B
  sends; focus clears; a fresh open on the same device lands the divider
  before the first message A truly never saw (the ones seen at badge-clear
  focus correctly counted as read); opt-in button + mute persistence + the
  sentence all present; zero page errors.
