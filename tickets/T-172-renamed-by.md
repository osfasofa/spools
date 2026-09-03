---
id: T-172
title: ""renamed by" resolves to a person"
status: todo
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

- [ ] Wind `room:profile` with `data: { seat: target, by: SEAT }`.
- [ ] `profiles.ts`: carry `by` into the table; `PersonRow` resolves it through
      `nameFor`, falling back to `author` for old entries.
- [ ] Smoke scenario: A renames B; C sees "renamed by A".

## Acceptance criteria

- The People list shows the renamer's current display name.
