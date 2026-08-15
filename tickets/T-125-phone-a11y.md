---
id: T-125
title: "Phone + accessibility polish"
status: doing
milestone: M11
depends: [T-116, T-117, T-118, T-119]
---

## Goal

The polish pass — and *only* a polish pass, because the load-bearing mobile
constraints were acceptance criteria in T-113/T-118/T-122 and must not be
getting rescued here.

## Context

A group chat is used one-handed on a phone; the owner's own testing happens
there. Known list from the brief: virtual keyboard + `100dvh` + safe-area
insets + pinned composer (T-113 baseline — verify, don't rebuild); touch
affordances instead of hover (T-118 baseline); `prefers-reduced-motion` (this
codebase animates); scoped `aria-live` on the feed — polite and batched, or a
screen reader narrates every peer keystroke; contrast floors (T-122 baseline).

## Tasks

- [ ] Audit pass on real hardware (iOS Safari + Android Chrome): keyboard,
      rotation, safe areas, tap targets ≥ 44px, momentum scroll vs the T-116
      contract — **owner at keyboard** (checklist in Notes; deployed client
      is current).
- [x] `aria-live="polite"` region announcing new messages batched (sender +
      count), not per-keystroke; labels on all icon buttons; focus order sane
      in reply-mode and edit-mode.
- [x] `prefers-reduced-motion` honored on every animation added this milestone.
- [ ] Fix what the audit finds; anything architectural discovered here gets
      filed against the owning ticket instead of patched sideways — *open
      until the hardware pass reports.*

## Acceptance criteria

- The audit checklist in Notes, all items pass on both platforms; VoiceOver or
  TalkBack can follow a conversation and send a message.

## Notes / open questions

### Landed (the automatable half, verified headlessly)

- **`aria-live`**: a visually-hidden polite+atomic region in the shell;
  arrivals batch over 1.5 s into one line ("N new messages — latest,
  <name>: <snippet>") — never a per-keystroke narration. Peer body edits
  don't announce (deliberate: `updated` events stay silent).
- **Focus**: picking reply/edit from the sheet lands focus in the composer
  input (the sheet's close would otherwise drop focus on `<body>`); the
  banner ✕ → input → send tab order is natural; the input element is never
  remounted across modes (T-030 held).
- **Labels**: automated sweep found **zero unnamed buttons** and all inputs
  labeled. Decorative seat tiles/typing dots are `aria-hidden`; reaction
  chips carry full labels ("👍 — zora, zig (tap to react too)"); seen
  squares are `role="img"` with "seen by —".
- **`prefers-reduced-motion: reduce`** disables every animation this
  milestone added (arrival lines + cursor, typing dots, sheet fade/slide,
  drawer slide) — verified present in the built CSS.
- **Target sizes**: automated sweep — nothing interactive under 24 px
  (WCAG 2.2 AA minimum). Reaction chips are 24 px by design; the 46 px sheet
  tiles are the primary path for the same action. Core controls are ≥ 40 px,
  header/composer/rows ≥ 44 px.
- Contrast floors were closed in T-122 (all four themes ≥ 4.5 on every
  text pair, measured).

### Remaining — the owner's hardware pass (iOS Safari + Android Chrome)

Against <https://osfasofa.github.io/spools/room/> (deployed current):
1. Virtual keyboard: composer stays visible while typing; feed doesn't hide
   the last message behind the keyboard; `100dvh` behaves on scroll.
2. Rotation: no layout break, feed position sane after rotate.
3. Safe areas: notch/home-bar insets respected (composer + arrival overlay).
4. Momentum scroll vs the T-116 contract: no yank at the top/bottom bounce;
   the pill appears when scrolled up during arrivals.
5. VoiceOver/TalkBack: follow a conversation (batched announcements), open
   the sheet, react, reply, send.
6. Tap-target feel at real finger sizes (chips especially).
Anything architectural found → file against the owning ticket, not here.
