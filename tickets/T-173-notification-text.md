---
id: T-173
title: "Notification text stays out of the OS"
status: todo
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

- [ ] Default body: `"<name> said something"`.
- [ ] Settings toggle "show message text in notifications" (per device,
      localStorage), caption: *"notifications go through your OS and may be
      kept in its history."*

## Acceptance criteria

- With the toggle off (default), no message text reaches `new Notification`.
