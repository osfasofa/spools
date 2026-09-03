---
id: T-173
title: "Notification text stays out of the OS"
status: done
milestone: M15
depends: []
---
## Goal

A notification carries the sender's name, not the message, unless the person
opts in.

## Context

`App.tsx` builds the notification body from the message text. macOS and
Android keep notification history, and some of it syncs. The room's own "seen
is live-only" promise is intact; this is a different, smaller leak. Review
finding F13.

## Tasks

- [x] Default body: `"<name> said something"`.
- [x] Settings toggle "show message text in notifications" (per device,
      localStorage), caption: *"notifications go through your OS and may be
      kept in its history."*

## Acceptance criteria

- With the toggle off (default), no message text reaches `new Notification`.

## Notes / open questions

- Per-device key `room-notif-text` (`'1'` = show text), read once at mount
  like `room-muted`; the toggle sits under mute in the notifications
  section with `aria-pressed` and a ✓ prefix when on, the caption directly
  beneath it. The title stays the room name either way — a room name is a
  shared label, not a message.
- Body when off: `"<name> said something"` with the name resolved from the
  profile table at fire time (a rename applies to the next notification);
  when on: the previous `"<name>: <first 80 chars>"`.
- Smoke scenario 19 installs a stand-in `Notification` before the app reads
  `Notification.permission`, hides the reader tab, and asserts the recorded
  body ends in "said something" and contains none of the message's words;
  then opts in through the toggle and asserts the next body carries the
  text. Build green; headless smoke 19/19.
