---
id: T-118
title: "Reactions (any emoji, toggle) + inline replies"
status: done
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

- [x] Reaction UI on every message: recents row + text input accepting the OS
      emoji keyboard; touch-friendly affordance (no hover-only — T-113's
      constraint).
- [x] Toggle + dedupe by (seat, normalized emoji); show *who* reacted on
      press/hover via the profile resolver.
- [x] **Normalize before grouping**: 👍 vs 👍🏽 and ZWJ variants must not
      fragment counts. Record the chosen normalization in Notes.
- [x] Replies: composer reply-mode sets `parent`; message rows render a quoted
      preview of the parent (resolved live, tombstone-aware) + tap-to-jump.
- [x] Orphan handling: parent deleted or not-yet-synced renders a graceful stub,
      structurally (never rely on timestamp order — T-116's rule).

## Acceptance criteria

- React/un-react round-trips across two devices; double-tap of the same emoji
  by the same seat never shows 2. Replies quote correctly, jump correctly, and
  degrade gracefully when the parent is deleted or missing.
- Skin-tone variants of one emoji group into one count (or the deliberate
  contrary choice is recorded in Notes).

## Notes / open questions

- Landed: `ActionSheet.tsx` (design §4 — tap a bubble: dim preview,
  quick-react tiles seeded from a localStorage recents row, an input that
  accepts the OS emoji keyboard, ↩ reply; Edit/Remove rows join in T-120),
  reaction chips + reply quotes inside the `<MessageList>` boundary,
  `emoji.ts`, composer reply banner with ✕.
- **Normalization (recorded)**: strip skin-tone modifiers (U+1F3FB–1F3FF)
  and variation selectors (U+FE0F); **keep ZWJ sequences intact** — 👍🏽
  groups with 👍 but 👨‍👩‍👧 stays a family instead of shattering into
  people. Raw emoji is wound (writer's intent survives for naive clients);
  grouping/toggling compare normalized.
- **Toggle semantics**: my existing reaction is found by **seat** (never
  `author`) + normalized emoji → `.delete()` (soft). Corollary: reacting
  👍🏽 when your 👍 exists *un-reacts* — same normalized identity. Duplicate
  entries from one seat (offline dupes, multi-tab) collapse in display via
  the (seat, emoji) Set. "Who reacted" rides the chip's `title` through the
  profile resolver.
- Reply quotes resolve **structurally by id** (parent map over entries +
  the deleted list — never positional, per T-116): live → "name: snippet…",
  soft-deleted → "removed", never-synced → "not synced yet". Tap-to-jump
  widens the T-116 window if the parent is outside it, then centers.
- Growth note (T-110's lens): un-react is a metadata `deletedAt` set — a
  small permanent delete-set contribution per toggle. Fine at social scale;
  a reaction-toggle war is the same shape as the cursor problem and T-127
  should mention it in the growth story.
- Verified (smoke 9–10, three devices): 👍 toggle on/off round-trips; 👍🏽
  groups into 👍 with count 2 across seats; duplicate 💀 winds collapse to
  one chip; reply quote renders the resolved name retroactively; deleted
  parent degrades to "removed", bogus parent to "not synced yet"; zero page
  errors.
