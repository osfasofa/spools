---
id: T-179
title: "stash.remember — a vessel is mirroring the stash's private storage format — sign-off"
status: done
milestone: M16
depends: []
---

## Goal

Decide whether the stash registry's write becomes public surface, now that a
vessel has copied it by hand.

## Context

syrup's `src/spool/links.ts` rewrites the `spools:stash` localStorage key
itself — same key, same row shape — because the SDK's `touch()` isn't
exported and syrup opens its satchel and peeks with `persist: false`, which
skips the registry. Any change to the registry's shape now breaks a vessel
silently. The parked-with-evidence rule asks for a second client; the
evidence here is arguably worse than a second client — a coupling to a
private format — and the fix is one additive function. Recorded in
`docs/SDK-API.md`'s parked list.

## Options

- **A. Export `stash.remember(code, link)`** — `touch` made public. Additive,
  a patch release.
- **B. A `remember` option on `openSpool`/`newSpool`** — register the link
  even when `persist: false`. Also additive; couples two concerns.
- **C. Leave it parked.** syrup keeps its mirror and the registry shape
  becomes a de facto contract anyway.

Recommendation: A.

## Tasks

- [x] Owner picks; SDK-API's stash section documents it; CHANGELOG; release
      with whatever else is pending. *(Option A, 7 Sep 2026; ships in
      `spools@0.3.0`, still unreleased.)*
- [ ] syrup deletes `rememberLink` once published. *(syrup's own repo, after
      the release — the note rides with the next release ticket.)*

## Acceptance criteria

- A vessel can register a link without touching localStorage itself.

## Notes

**Option A, shipped 7 Sep 2026.** `stash.remember(code, link)` — the
registry stamp made public. It writes exactly the row an open writes (the
link, `lastOpened` stamped now) and does nothing else: no database, no
connection, no spool.

- **Validation, which `touch()` never had:** `SpoolLinkError` on a code that
  isn't a spool code, a link that isn't a spool link, or a link naming a
  *different* spool. The last one matters because `list()` filters registry
  keys through `isValidCode` — a bad code would otherwise be written and
  then silently never listed. The redundancy of passing both (the code is in
  the link) is the signed-off signature; the mismatch check is what makes it
  safe.
- Where there is no localStorage at all (Node, SSR) it validates and does
  nothing, exactly as an open does. Where localStorage refuses the write (a
  private window with storage off) it throws, exactly as `label()` and
  `archive()` do — documented, not swallowed.
- **The evidence, confirmed in syrup's source:** `src/spool/links.ts`'s
  `rememberLink` rewrites `spools:stash` by hand with
  `{...reg[code], lastOpened: Date.now(), link}` — byte-identical to
  `touch()` — and its own comment reads *"the SDK's `touch` does exactly this
  but is not exported, so this mirrors its write … worth an upstream ask:
  stash.remember"*. A test asserts the row `remember()` writes has the same
  shape as the row an open writes, so the format syrup mirrored can't drift
  out from under it before syrup deletes its copy.
- Four tests in `stash.test.ts` (137/137 in the SDK suite); SDK-API's stash
  section documents it and its parked entry is struck through; CHANGELOG
  under `0.3.0 — unreleased`; `apps/client/vendor/spools.js` regenerated.
- **Not fixed here, worth a ticket if it ever bites:** `writeRegistry` calls
  `localStorage.setItem` unguarded, and `touch()` runs inside `connect()` —
  so in a Safari private window, where `setItem` throws QuotaExceededError,
  `newSpool()`/`openSpool()` would throw rather than degrade. T-165's guard
  already assumes the opposite ("a device whose storage swallowed the
  write"), and Chrome's blocked-storage behaviour — which scenario 25 stands
  in for — does swallow. Left alone deliberately: a blanket try/catch in
  `writeRegistry` would also make `forget()` — the one hard delete — report
  success while leaving the row, and its key, behind.

## Acceptance criteria — met

- A vessel can register a link without touching localStorage itself:
  `stash.remember(code, link)`, additive, patch-release-shaped.
