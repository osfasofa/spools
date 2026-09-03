---
id: T-172
title: ""renamed by" resolves to a person"
status: done
milestone: M15
depends: []
---
## Goal

The rename audit trail the M11 brief promised actually shows a name.

## Context

The room never writes `spool-author`, so every entry's `author` is
"anonymous", and `room:profile` winds stamp only the *target* seat
(`data.seat`). `PersonRow` shows `renamed by {profile.renamedBy}` =
`rec.author` = "anonymous", always. Room names get this right by stamping the
namer's seat. Review finding F12.

## Tasks

- [x] Wind `room:profile` with `data: { seat: target, by: SEAT }`.
- [x] `profiles.ts`: carry `by` into the table; `PersonRow` resolves it through
      `nameFor`, falling back to `author` for old entries.
- [x] Smoke scenario: A renames B; C sees "renamed by A".

## Acceptance criteria

- The People list shows the renamer's current display name.

## Notes / open questions

- App convention only: `data.by` is one more write-once machine field on
  the existing `room:profile` kind, ignored by anything that doesn't know it
  (the forward-compatibility rule). No protocol change; the profile table's
  newest-wins resolution is untouched.
- `renamedByFor(table, profile)` lives beside `nameFor` in `profiles.ts`:
  `by` resolved through the same table (so the credit follows the renamer's
  own renames, retroactively, like every other name in the room), else the
  entry's `author`. Old entries therefore keep reading "renamed by
  anonymous" — that is what they carry, and the room never writes
  `spool-author`. An unnamed renamer reads as their seat suffix (`#k7f2`),
  the same way an unnamed seat reads everywhere else.
- Smoke: scenario 5 now asserts C's people list credits A's rename to B's
  suffix (B unnamed); scenario 6 asserts the raw pre-T-172 winds fall back
  to "renamed by anonymous", then A (named "zora") renames B through the
  UI and C reads "renamed by zora", with `data.by` equal to A's seat.
  Build green; headless smoke 18/18.
