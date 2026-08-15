---
id: T-114
title: "Seats + the profile table"
status: done
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

- [x] Seat module: generate once (crypto-random, base64url), persist in
      localStorage beside `spool-author`; stamp into `data.seat` on every wind.
- [x] Profile entries: `wind({ kind: 'room:profile', body: <name>, data:
      { seat: <target> } })`; resolver = newest wins per target seat, computed
      from `spool.entries`, memoized behind the same feed subscription.
- [x] Rename UI: tap a name to edit — yours or anyone's. Show the audit for
      free: a profile entry's `author`/seat is the renamer ("renamed by —"),
      social pressure in place of the permissions the system can't have.
- [x] Collision legibility: derive a stable color + 2–3 char suffix from the
      seat id, always rendered. Two "sam"s stay distinguishable; an unnamed
      seat is presentable before its first profile entry exists.
- [x] Multi-device honesty: seats sharing a display name either merge in the
      participant list or the duplication is visibly explained. Pick one,
      record it in Notes.

## Acceptance criteria

- A renames B on device A; device C sees the change applied to B's *old*
  messages (the retroactive property). Rename survives reload and cold open.
- No name string is ever stored in a `message` entry.
- Renames while a peer is offline converge on reconnect (newest-wins verified
  under concurrent renames of the same seat).

## Notes / open questions

- Landed: `seat.ts` (crypto-random base64url, localStorage `spool-seat`;
  existing ids keep working — the id is opaque by rule), `profiles.ts` (the
  table: newest `room:profile` per target seat, computed by iterating the
  entries getter's already-deterministic order so "last wins" IS newest-wins
  identically on every peer), `resolveName` threaded through the
  `<MessageList>` boundary as a prop, settings "people" section with
  commit-on-blur rename rows and the `renamed by <author>` audit line.
- **Rename inputs look live but wind on COMMIT (blur/Enter), not per
  keystroke** — every rename is permanent under gc:false; a
  keystroke-per-entry rename would spend dozens of entries on one name. D2's
  "handful of times" cost stays a handful. (Also: T-110's lesson — the input
  never rewrites a body, each rename is a fresh entry; delete-set stays
  empty.)
- **Multi-device decision: no merging.** Seats sharing a display name stay
  separate rows/tiles; the always-rendered `#k7f2` suffix + stable palette
  color explain the duplication. Merging several seats into one person is the
  parked §6 identity-ladder work; the table's shape (seat → name) loses
  nothing by waiting.
- Sender lines render `name #suffix time`; unnamed seats show the suffix as
  their name. Entries with no `data.seat` (naive clients) group under an
  `author:<name>` pseudo-seat and stay legible.
- **Acceptance run** (room-smoke.mjs, now three origins): B renames A through
  the real settings UI → cold-opened C shows A's *old* messages under the new
  name (retroactive property held); message entries carry exactly
  `data: { seat }` and nothing else; the rename survives B's reload from its
  own IndexedDB; near-concurrent renames of one seat from two devices
  converge to the same winner on all three devices with the DOM agreeing.
  True offline-rename convergence (close, rename, reopen) rides the same LWW
  path and is exercised properly in T-126's torture checklist.
