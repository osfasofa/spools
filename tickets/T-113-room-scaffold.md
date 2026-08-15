---
id: T-113
title: "apps/room: scaffold + message feed"
status: todo
milestone: M11
depends: []
---

## Goal

The chat app exists: `apps/room` (Vite + React, `base: './'`), forked from the
mixtape's `useSpool` pattern, rendering `kind: 'message'` entries as a
conversation with a composer that never loses focus.

## Context

Reuse the mixtape's bones (`apps/mixtape/src/useSpool.ts` — including its two
paid-for bug fixes) and the house patterns: no event replay on load (render from
`spool.entries`, then subscribe); `hashchange → reload`; open-from-hash or
`newSpool` + `history.replaceState(share())`. Reserved `room:*` kinds are
filtered from the feed from day one (T-114 defines them; the filter exists now).
Unknown kinds still render via the labeled-fallback rule.

## Tasks

- [ ] Scaffold `apps/room` (workspace picks `apps/*` up automatically); a
      `useRoom` hook forked from `useSpool`.
- [ ] Message feed behind a **`<MessageList>` boundary** — T-116 rewires its
      internals; nothing outside the boundary may assume repaint-the-world.
- [ ] Composer: built once, never rebuilt (T-030's focus lesson); Enter sends;
      `wind({ kind: 'message', body, data: { seat } })` (seat from T-114; a
      local placeholder module until then, shaped so nothing has to unlearn it).
- [ ] Self-vs-other alignment + consecutive-author grouping (by seat).
- [ ] Message length cap in the composer (the 8 MiB frame ceiling makes a
      pasted novel a room-level DoS); `http(s):`-only link rendering (T-030).
- [ ] Surface `on('pocket')`: the checking beat, and **the `depositError`
      warning** — the 413 latch is silent otherwise.
- [ ] Stick-to-bottom on new messages *only when already at bottom* (full
      behavior lands in T-116; the naive version must not yank readers).

## Acceptance criteria

- Two origins on a local relay converge on a conversation; composer keeps focus
  through peer traffic; reserved/unknown kinds don't break the feed.
- **Mobile constraints hold now, not in T-125**: usable at 375×667 with the
  virtual keyboard open; no interaction is hover-only; `100dvh` + safe-area.
- The feed renders through `<MessageList>` and nothing else.

## Notes / open questions

-
