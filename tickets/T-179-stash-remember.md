---
id: T-179
title: "stash.remember — a vessel is mirroring the stash's private storage format — sign-off"
status: todo
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

- [ ] Owner picks; SDK-API's stash section documents it; CHANGELOG; release
      with whatever else is pending.
- [ ] syrup deletes `rememberLink` once published.

## Acceptance criteria

- A vessel can register a link without touching localStorage itself.
