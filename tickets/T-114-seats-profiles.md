---
id: T-114
title: "Seats + the profile table"
status: todo
milestone: M11
depends: [T-113]
---

## Goal

D1 lands: every device has a seat, every message carries it, and nicknames are
a shared table anyone can edit — retroactively, because names resolve at render
time, never at write time.

## Context

Brief §3 D1 and the DESIGN_DOC §5 row are binding: the seat id is an **opaque,
variable-length string** (never parsed — it becomes a public key later); a seat
is a **device, not a person** (the table must stay able to map several seats to
one identity); `author` keeps being written. The anti-pattern is fosho's
chat.ts, which denormalized names into messages so renames never propagated.

## Tasks

- [ ] Seat module: generate once (crypto-random, base64url), persist in
      localStorage beside `spool-author`; stamp into `data.seat` on every wind.
- [ ] Profile entries: `wind({ kind: 'room:profile', body: <name>, data:
      { seat: <target> } })`; resolver = newest wins per target seat, computed
      from `spool.entries`, memoized behind the same feed subscription.
- [ ] Rename UI: tap a name to edit — yours or anyone's. Show the audit for
      free: a profile entry's `author`/seat is the renamer ("renamed by —"),
      social pressure in place of the permissions the system can't have.
- [ ] Collision legibility: derive a stable color + 2–3 char suffix from the
      seat id, always rendered. Two "sam"s stay distinguishable; an unnamed
      seat is presentable before its first profile entry exists.
- [ ] Multi-device honesty: seats sharing a display name either merge in the
      participant list or the duplication is visibly explained. Pick one,
      record it in Notes.

## Acceptance criteria

- A renames B on device A; device C sees the change applied to B's *old*
  messages (the retroactive property). Rename survives reload and cold open.
- No name string is ever stored in a `message` entry.
- Renames while a peer is offline converge on reconnect (newest-wins verified
  under concurrent renames of the same seat).

## Notes / open questions

-
