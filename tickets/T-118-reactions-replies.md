---
id: T-118
title: "Reactions (any emoji, toggle) + inline replies"
status: todo
milestone: M11
depends: [T-114]
---

## Goal

The two social gestures, both pure `parent` mechanics: react to any message with
any emoji (and un-react), and reply inline with a quoted preview.

## Context

The established pattern: `wind({ kind: 'reaction', parent, body: emoji })`,
counts grouped by body from `children`. What no client has built: **toggle**
(find your own child by seat — not `author` — and `.delete()` it; `children`
already excludes soft-deleted) and **dedupe** (same seat + same emoji twice
must not double-count). "Any emoji" means the OS keyboard plus a recents row —
**no picker dependency** (owner-approved cut; the popular ones ship MB-scale
datasets against a ~357 KB bundle).

## Tasks

- [ ] Reaction UI on every message: recents row + text input accepting the OS
      emoji keyboard; touch-friendly affordance (no hover-only — T-113's
      constraint).
- [ ] Toggle + dedupe by (seat, normalized emoji); show *who* reacted on
      press/hover via the profile resolver.
- [ ] **Normalize before grouping**: 👍 vs 👍🏽 and ZWJ variants must not
      fragment counts. Record the chosen normalization in Notes.
- [ ] Replies: composer reply-mode sets `parent`; message rows render a quoted
      preview of the parent (resolved live, tombstone-aware) + tap-to-jump.
- [ ] Orphan handling: parent deleted or not-yet-synced renders a graceful stub,
      structurally (never rely on timestamp order — T-116's rule).

## Acceptance criteria

- React/un-react round-trips across two devices; double-tap of the same emoji
  by the same seat never shows 2. Replies quote correctly, jump correctly, and
  degrade gracefully when the parent is deleted or missing.
- Skin-tone variants of one emoji group into one count (or the deliberate
  contrary choice is recorded in Notes).

## Notes / open questions

-
