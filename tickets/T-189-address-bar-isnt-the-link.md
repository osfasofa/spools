---
id: T-189
title: "The address bar isn't the link — say so where it fails"
status: done
milestone: M15
depends: [T-165, T-177]
---
## Goal

The two clients on either side of a keyless open both say what went wrong
and what to do about it, at the moment it happens.

## Context

Found in live use the hour T-177 shipped, from the owner's own phone. The
owner opened a room on a Mac and sent the URL to an iPhone; the phone opened
**keyless** and the Mac showed `someone in this room isn't on your key — 3
frames ignored.` Confirmed from the relay's http log rather than guessed:
both clients connected to `/yjs/sleepy-drift-013`, and only the Mac ever
requested `/pocket/sleepy-drift-013/<token>` — the pocket token is derived
from the key, so a client that never asks for the pocket has no key.

Neither client was wrong, and neither decision behind this is wrong:

- **T-165 (option C)** drops `k=` from the address bar once the stash holds
  the link, because browsers sync address bars to their makers.
- **T-177 (option 2)** drops `relay=` when it is the default.

Together they made the bar read `chat.spools.lol/#spool=sleepy-drift-013` —
which is exactly the shape of the link the room hands out, minus the one
parameter that matters. Before T-177 the bar carried a URL-encoded
`relay=wss%3A%2F%2F…` and read as plumbing; now it reads as the pretty link.
"The bar is not the link" was a safe premise when the bar looked like
machinery. It is not safe now, and this is the first live use that says so.

The fix is not to revert either decision — it is to close the gap with words
at the two moments it actually shows up, both of which the room already
detects and already draws a line for.

## Tasks

- [x] The keyed side: the `undecryptable > 0` line names the likely cause
      (an address-bar copy) and offers the real link — reusing `invite()`,
      so the T-176 clipboard fallbacks come free.
- [x] The keyless side: the `bareOpen` line says which link to ask for.
- [x] Smoke scenario: a keyless peer joins a keyed room; both lines appear,
      and the keyed side's button copies a link carrying `k=`.

## Acceptance criteria

- With a keyless peer in the room, the keyed side's notice offers a copy that
  yields a link with the key, and the keyless side's notice names the address
  bar as the wrong source.

## Notes

**Shipped 7 Sep 2026, the hour it was found.** One sentence, shared by both
sides — `ADDRESS_BAR_ISNT_THE_LINK`, *"a link copied from the address bar
doesn't carry the key."* — and, on the side that can act, the fix in reach.

- **The keyed side** (`undecryptable > 0`) keeps its honest count and gains
  the cause plus a `copy the link with the key` button wired to `invite()`.
  Reusing `invite()` rather than writing a second copy path means T-176's
  whole ladder comes free: the synchronous-inside-the-tap clipboard write,
  the `execCommand` fallback, the shown-and-selected link when neither
  works, and the T-165 sentence on the confirmation.
- **The keyless side** (`bareOpen`) adds the same sentence and says what to
  ask for: *"ask them for the one the room's copy button gives."*
- **Smoke scenario 27** reproduces the exact mistake — a keyed holder, then
  a second device opening `#spool=<code>&relay=…` with **no key**, which is
  precisely what the address bar hands you — and asserts both lines, that
  the button copies a link carrying `k=`, the confirmation line, no page
  errors on the keyed side, and (at 375×667, where this will be read) no
  sideways scroll and a 40 px tap target.
- **A lesson the harness taught, again:** the first cut of the scenario
  failed its own "did this prove anything" guard — the keyless peer never
  met a sealed frame. The holder had written *before* the stranger
  connected, and the holder never answers the stranger's sync request (it
  arrives unsealed and is dropped), so nothing sealed ever crossed. Only a
  write made *while* the keyless peer is connected reaches it. Scenario 25
  knew this; scenario 27 had to learn it.
- **The layout assertion earned its place immediately:** it failed on the
  first run at 36 px — `.copyBtn`'s height everywhere in the room, under the
  40–44 px the room's other primary actions use. This instance is now 44 px
  (it is read on a phone at the moment something is broken); the wider
  outlier is filed in T-125, which owns the a11y sweep.
- **Neither decision moved.** T-165 still drops `k=` once the stash
  confirms; T-177 still drops the default `relay=`. What changed is that the
  room now says what happened at both ends of the mistake, which is the
  cheaper fix and the one that survives someone pasting a URL anywhere.

## Acceptance criteria — met

- With a keyless peer in the room, the keyed side's notice offers a copy that
  yields a link with the key (asserted on `k=` in the copied string), and the
  keyless side's notice names the address bar as the wrong source.

