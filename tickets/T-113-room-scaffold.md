---
id: T-113
title: "apps/room: scaffold + message feed"
status: done
milestone: M11
depends: []
---

## Goal

The chat app exists: `apps/room` (Vite + React, `base: './'`), forked from the
mixtape's `useSpool` pattern, rendering `kind: 'message'` entries as a
conversation with a composer that never loses focus.

## Context

**The visual design is settled and high-fidelity: implement per
`docs/design/room/README.md`** — token system (8 custom properties + a radius
scalar, four themes), typography, and per-component measurements are final;
recreate the `.dc.html` prototypes in React, don't ship them. The README's
screen inventory is the app's surface: room feed, **stash (spool list — reuses
`stash.list()`)**, settings, message action sheet, arrival overlay. Later
tickets own their screens' behavior; this ticket lands the token system, the
shell/routing, and the feed.

Reuse the mixtape's bones (`apps/mixtape/src/useSpool.ts` — including its two
paid-for bug fixes) and the house patterns: no event replay on load (render from
`spool.entries`, then subscribe); `hashchange → reload`; open-from-hash or
`newSpool` + `history.replaceState(share())`. Reserved `room:*` kinds are
filtered from the feed from day one (T-114 defines them; the filter exists now).
Unknown kinds still render via the labeled-fallback rule.

## Tasks

- [x] Scaffold `apps/room` (workspace picks `apps/*` up automatically); a
      `useRoom` hook forked from `useSpool`.
- [x] Message feed behind a **`<MessageList>` boundary** — T-116 rewires its
      internals; nothing outside the boundary may assume repaint-the-world.
- [x] Composer: built once, never rebuilt (T-030's focus lesson); Enter sends;
      `wind({ kind: 'message', body, data: { seat } })` (seat from T-114; a
      local placeholder module until then, shaped so nothing has to unlearn it).
- [x] Self-vs-other alignment + consecutive-author grouping (by seat).
- [x] Message length cap in the composer (the 8 MiB frame ceiling makes a
      pasted novel a room-level DoS); `http(s):`-only link rendering (T-030).
- [x] Surface `on('pocket')`: the checking beat, and **the `depositError`
      warning** — the 413 latch is silent otherwise.
- [x] Stick-to-bottom on new messages *only when already at bottom* (full
      behavior lands in T-116; the naive version must not yank readers).

## Acceptance criteria

- Two origins on a local relay converge on a conversation; composer keeps focus
  through peer traffic; reserved/unknown kinds don't break the feed.
- **Mobile constraints hold now, not in T-125**: usable at 375×667 with the
  virtual keyboard open; no interaction is hover-only; `100dvh` + safe-area.
- The feed renders through `<MessageList>` and nothing else.

## Notes / open questions

- Landed: `apps/room` (Vite + React, `base: './'`), `useRoom` forked verbatim
  from the mixtape's `useSpool` (both paid-for lessons intact), `theme.ts`
  (all four token sets from the design README; picker is T-122's — blackout
  applies by default and nothing below it hard-codes a color/font/radius),
  `seat.ts` (the T-114-shaped placeholder: opaque variable-length id in
  localStorage `spool-seat`, palette hash, `#k7f2` suffix, `displayName()`
  whose internals T-114 swaps for the profile table), `MessageList.tsx` (THE
  boundary), `Composer.tsx`, shell + settings stub (link/copy + the fine-print
  card; people/name/theme sections belong to T-114/T-122).
- Feed rules live entirely inside `<MessageList>`: `room:*` filtered from day
  one, `reaction` hidden (T-118 renders chips), unknown kinds → labeled
  fallback line, http(s)-only linkification, day dividers, consecutive-seat
  grouping with the 6px/1px tail-corner scheme, stick-to-bottom only when
  already at bottom. Entries without `data.seat` group under an
  `author:<name>` pseudo-seat so naive-client entries still render sanely.
- Composer cap: 4 000 chars (~4 KB ≈ 1/2000 of the T-110-measured 8 MiB
  lifetime budget).
- `window.spool` is exposed by `useRoom` — the T-104/T-126 harness idiom.
- **Acceptance run** (`scratch/spike-room/room-smoke.mjs`, headless Chrome ×
  two origins × local relay, 375×667 mobile emulation): converge both ways
  through real composer keystrokes (~10 ms hop); focus AND half-typed draft
  survive 3 peer messages; `room:name` invisible while an alien
  `mixtape-track` kind renders as labeled fallback; own-right/peer-left
  alignment, seat tile present, zero horizontal overflow, composer on-screen,
  zero page errors. Visual check against the design: blackout feed screenshot
  matches (grouping, tails, tiles, sender line, day divider, composer).
- Harness gotcha for future CDP work: `Input.dispatchKeyEvent` needs
  `text: '\r'` on the Enter keyDown or Chrome treats it as rawKeyDown and
  implicit form submission never fires.
