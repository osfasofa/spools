---
id: T-125
title: "Phone + accessibility polish"
status: todo
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
      contract.
- [ ] `aria-live="polite"` region announcing new messages batched (sender +
      count), not per-keystroke; labels on all icon buttons; focus order sane
      in reply-mode and edit-mode.
- [ ] `prefers-reduced-motion` honored on every animation added this milestone.
- [ ] Fix what the audit finds; anything architectural discovered here gets
      filed against the owning ticket instead of patched sideways.

## Acceptance criteria

- The audit checklist in Notes, all items pass on both platforms; VoiceOver or
  TalkBack can follow a conversation and send a message.

## Notes / open questions

-
