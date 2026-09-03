---
id: T-164
title: "Start a new room — the way out when someone turns bad"
status: done
milestone: M15
depends: []
---
## Goal

A one-tap gesture for the only remedy the design offers against a bad actor:
a new spool, handed only to the people you want.

## Context

No block, ban, or removal, by decision (DESIGN_DOC §6 permissions ladder).
ETHOS rule 10 carves out the actually dangerous person and the software has no
mechanism for the exception; today the remedy requires knowing to open the
bare URL. Review finding F16.

## Tasks

- [x] Settings → "start a new room": `newSpool()`, navigate to its link, copy
      the link. The old room stays in the stash (export or forget it in its
      own settings — T-163).
- [x] Fine print sentence: *"there is no way to remove someone. make a new
      room and hand the new link only to the people you want."*
- [x] Notice on arrival in the new room: "your old room is still on this
      device."

## Acceptance criteria

- From any room, one tap lands in a fresh keyed room with its link copied;
  the old room still opens from its old link.

## Notes / open questions

- Carrying history across is `splice` — parked (DESIGN_DOC §2, INDEX Parked).
  Not this ticket.
- **Deviation, deliberate: the link is minted in the tap, not by `newSpool()`
  in this page.** `generateCode()` + 32 bytes from `getRandomValues` +
  `buildSpoolLink` (same relay as the room you're leaving; `DEFAULT_RELAY`
  only when that is what the room already used), then the clipboard write
  happens *synchronously inside the tap* — Safari refuses a clipboard write
  after an `await`, and `newSpool()` awaits persistence. The new page's
  ordinary `openSpool(link)` is what creates the room (a link with a fresh
  code is a room; that's how the smoke suite has always minted rooms), so
  no second `Spool` ever lives in this page and `useRoom`'s one-spool
  lifetime holds. Same relay, not the canonical one: a self-hoster's "new
  room" stays on their relay (the T-163 convention).
- The copy's outcome rides a one-shot `sessionStorage` flag
  (`room-came-from`, consumed on read) into the new page, which shows one
  dismissible notice: "your old room is still on this device." plus either
  "the new link is copied — hand it only to the people you want." or, when
  the clipboard wasn't there (plain-http LAN, until T-176's fallback), where
  to copy it from. The navigation is a fragment change, so `main.tsx`'s
  hashchange reload is the whole mechanism.
- **The fine-print sentence contains "remove"** — a person, not a message —
  and ships verbatim as this ticket specifies. It is the one user-facing
  "remove" T-162's grep now finds; recorded in T-162's notes too. It is not
  a delete that doesn't delete: it says there is no delete.
- Smoke scenario 17: B taps "start a new room" → a fresh keyed room on the
  local relay, the string handed to the clipboard equals the new room's
  `share()`, the arrival notice shows and dismisses, the flag is consumed,
  and the old room reopens from its old link on the same origin. Build
  green; headless smoke 17/17.
