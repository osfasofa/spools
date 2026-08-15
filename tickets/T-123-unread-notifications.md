---
id: T-123
title: "Unread + in-tab notifications"
status: todo
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

- [ ] Unread divider ("— new —") + jump-to-first-unread on open.
- [ ] Title/favicon unread count while backgrounded; clears on focus+read.
- [ ] Opt-in `Notification` for messages while backgrounded (never request
      permission unprompted — a button, not an ambush); respects mute.
- [ ] Per-room mute toggle, per-device.
- [ ] The honest sentence in the room info panel: this room can only reach you
      while it's open somewhere — there is no server to call you back.

## Acceptance criteria

- Background the tab, receive messages, see the badge; focus lands at the
  divider. Notifications appear only after explicit opt-in and never when
  muted. The honest sentence exists.

## Notes / open questions

-
