---
id: T-162
title: "Hide, not remove — the delete affordance says what it does"
status: done
milestone: M15
depends: []
---
## Goal

No shipped string in the room claims a delete that doesn't delete.

## Context

The action sheet says "✕ remove" and the tombstone says "removed"
(`ActionSheet.tsx` caller in `App.tsx`, `MessageList.tsx`). The mechanism is a
soft delete anyone can restore from the same sheet, present in `rewind()` and
in every peer's copy forever (SPEC §2). MANIFESTO §2: *no delete that doesn't
delete.* Today the truth lives only in the Settings fine print, three taps
away from the button. Review finding F7.

## Tasks

- [x] Relabel: "✕ hide for everyone"; tombstone: "hidden · anyone can restore";
      keep "↺ restore".
- [x] One-time line under the first hide on this device (localStorage
      `room-hide-explained`): *"this hides it everywhere, but every copy keeps
      it and rewind still shows it."*
- [x] Settings fine print keeps "rewind never forgets"; design README
      (`docs/design/room/README.md`) gets the wording note.
- [x] Rename the smoke scenarios that say remove/tombstone accordingly.

## Acceptance criteria

- `grep -ri "remove" apps/room/src` finds no user-facing string.
- Smoke suite green (`scratch/spike-room/room-smoke.mjs`).

## Notes / open questions

- **Strings changed** (`App.tsx`, `MessageList.tsx`): the sheet row "✕ remove"
  → "✕ hide for everyone"; the tombstone "removed" → "hidden · anyone can
  restore"; the sheet preview and the reply-quote stub for a hidden parent
  say "hidden"; "↺ restore" unchanged. One more user-facing "remove" hid in
  the reaction chip's screen-reader label ("tap to remove yours") — now "tap
  to take yours back".
- The internal identifiers (`ParentRef` kind `'removed'`, `Item.removed`) are
  renamed `hidden` too, so the acceptance grep reads clean at a glance: the
  only hits left are `removeEventListener` calls, which nobody sees.
- **The one-time line** renders as a dismissible notice row under the feed
  (above the composer) on the device that did the hiding, the first time only
  — `room-hide-explained=1` is written the moment it shows, so a reload never
  repeats it. It is not rendered under the tombstone itself: that would push
  an honesty sentence through the feed boundary for one-shot copy, and the
  notice row is where the room already puts one-line truths ("link copied").
- Settings fine print already carries "rewind never forgets"; untouched here
  (T-163 adds the permanence sentence beside it).
- **Smoke:** scenario 12 renamed "edit-own, hide for everyone, restore,
  cross-writer honesty" and extended — it now asserts no sheet row matches
  /remove/i, the tombstone's exact text, the explainer line + the localStorage
  flag on the hiding device, and that ✕ dismisses it; scenario 10's orphan
  stub expects "hidden". `apps/room/TESTING.md`'s smoke row and the design
  README's Removed/Remove wording carry T-162 notes.
- Verified: build green (tsc + vite); headless Chrome smoke 15/15 (see the
  commit for the run).
- *Addendum (T-164):* the grep now finds one user-facing "remove" — the
  fine-print sentence T-164 specifies verbatim, "there is no way to remove
  someone." That is a person, not a message, and it says there is no delete;
  it is not the lie this ticket closes. Smoke scenario 12 keeps asserting
  the action sheet itself never says remove.
