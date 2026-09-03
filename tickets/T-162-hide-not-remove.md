---
id: T-162
title: "Hide, not remove — the delete affordance says what it does"
status: todo
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

- [ ] Relabel: "✕ hide for everyone"; tombstone: "hidden · anyone can restore";
      keep "↺ restore".
- [ ] One-time line under the first hide on this device (localStorage
      `room-hide-explained`): *"this hides it everywhere, but every copy keeps
      it and rewind still shows it."*
- [ ] Settings fine print keeps "rewind never forgets"; design README
      (`docs/design/room/README.md`) gets the wording note.
- [ ] Rename the smoke scenarios that say remove/tombstone accordingly.

## Acceptance criteria

- `grep -ri "remove" apps/room/src` finds no user-facing string.
- Smoke suite green (`scratch/spike-room/room-smoke.mjs`).
