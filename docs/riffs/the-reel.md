# The reel — forgetting, length, and the cut

*Research riff, September 2026. The prompt is the owner's, in two beats a
day apart. First: forgetting should mean really gone — it can live in our
heads, but it shouldn't be logged anywhere; if a spool gets too big it
breaks, or obeys some physics; two people have a spool that's as big as
they want, or they rewind and take things off the front, or splice things
out; the capacity is set in the handoff, or by whoever hosts the spool.
Second: spools should have a set limit, the number is unknown, maybe a
hosted spool's size is what you'd sell, or maybe a spool is unlimited.
This document takes both to their edges and prices what it finds. **It
decides nothing.** Nothing here amends SPEC or touches §5; every thread
that wants to become real queues at the usual gates — owner sign-off for
anything protocol-shaping, [T-180](../../tickets/T-180-splice-gate.md) for
the splice family. It sits beside [spools-of-spools.md](../spools-of-spools.md)
and [tape-deck.md](tape-deck.md) and cites them rather than repeating them.
Numbers are measured, not guessed: `scratch/riff-reel/spike.mjs`, offline
and memory-only on the workspace build of `spools` 0.2.0.*

*What shipped (September 2026): §3's cut and §4's counter — `splice()` in the
SDK (T-186), and in the room the cut from any message, the tape counter
against the link's relay, the reel length as a newest-wins custom in
messages, and "full is a cut, not a wall" (T-187). The decisions are
DESIGN_DOC §5 "The splice family"; §8's open questions are answered in
T-187's Notes (by entry; preserved ids; a fraction with the number beside it;
no `next` on the old reel).*

---

## 0. The noticing

"Forget" is three different requests wearing one word, and the design
already answers two of them well and the third honestly. What it has never
had is a shape for the case the owner actually described: a document that
wants to shed its past on purpose. Chats do. Lists do. Keepsakes don't. The
room is a chat, and the review's own handoff list wanted to shed its done
items within a day — which is how the owner ended up minting a second room
and calling it *reel two*. The name was right before the riff was.

## 1. The three gones

| "forget" means | mechanism | truth |
|---|---|---|
| gone from **this device** | `stash.forget()` — the one hard delete; now a button in the room (T-163) | real. The IndexedDB database and the stash row go; nothing about the spool is logged by the SDK. The address may still sit in the browser's history — T-165's sentence. |
| gone from **the pocket** | the relay's TTL: ~60 days untouched, touch-on-read | real, slowly. A DELETE any token-holder could call is parked (M10); it is consistent with link-is-power, and it is also the way one holder erases a mixtape from under the others. |
| gone from **everyone else** | — | **cannot be made true.** Every holder has a full copy; exports exist. It can only be asked, and a client that says yes is being polite. Signal's "delete for everyone" is the same physics with a nicer label. |

The honest sentence for the room, then, is the one T-163 shipped: *what you
put here is kept by everyone in the room, for as long as they keep it.* The
first two gones are yours to do; the third is theirs to grant.

## 2. One dial, two directions

Inside a spool, "rewind never forgets" and "forget is real" are the same
dial pointed opposite ways. `gc: false` (§5, T-060) is what lets
`rewind()` rebuild any moment, and it is exactly what makes nothing leave:
a soft delete is a tombstone with its content intact, and SPEC §2 forbids
removing an entry's key or clearing another writer's body. Measured: soft
deleting half of a 5 000-message reel **grows** it, 1 521 → 1 594 KiB. The
mechanism for a hard removal does exist — the tape-deck riff found that a raw
`Y.UndoManager` over the entries map undoes a wind as exactly that, and
orphans the body — and it is the thing §5 forbids for a reason: Yjs garbage
collection is per document, so one peer that forgets serves a gutted past
to everyone who syncs from it, and any rewind moment that references the
erased content stops reconstructing. **Forgetting inside a spool costs
rewind for the whole spool, for everyone.** That is not a knob to expose;
it is a trade the design already made, and made right for a keepsake.

## 3. The reel

The shape that keeps both is the one the owner reached for in the first
sentence: a spool has a length. Within a reel everything is remembered and
`rewind` works to the first wind. Forgetting is **the cut**: a new spool
wound from what you keep, under a new key, handed to the people you want;
the old reel stays whole on every device that keeps it until each holder
forgets it, and the pocket lets go of it after the TTL. One gesture does
four jobs the roadmap has been carrying separately:

- **forgetting** — the kept half is all the new reel ever knew;
- **compaction** — the growth ceiling (§4) is met by cutting, not by
  compressing;
- **taking things off the front** — a cut at a time, or by entry;
- **starting over without someone** — T-164's button, with rotation as the
  eviction the protocol otherwise refuses (spools-of-spools §4: revocation
  is rotation).

What the cut is *not*: a fork. The tape-deck riff measured branch-from-a-
moment (§5.6 there): it keeps the whole corpus and lineage, and once it
meets its origin again it resurrects everything the origin later did, soft
deletes included. **The retelling is the only subset that stays a subset.**
Measured, 5 000 messages → keep the live half:

| the cut | bytes | per entry | time | notes |
|---|---|---|---|---|
| the old reel, half hidden | 1 594 KiB | 326 B | — | grows with every hide |
| retelling, fresh ids, no provenance | 741 KiB | 303 B | 36 ms | less than half |
| retelling, fresh ids, with provenance (`from: {spool, id, at}`) | 965 KiB | 395 B | 36 ms | **provenance costs 91 B an entry**, a quarter of a message |
| retelling, same ids and timestamps (escape hatch) | 760 KiB | 311 B | 37 ms | identity and order cross intact; free of the provenance tax because the id *is* the provenance |
| keep the last fifth | 191 KiB | — | — | 6 extra entries from `createdAt` ties at the seam |

Three findings the spike made on its own, each a decision the operator
must take before it can be surface:

1. **Threads.** A reply whose parent didn't make the cut points at nothing
   forever — the room would render "not synced yet", which would be a lie.
   The spike flattens it (the thread goes with the parent); carrying a
   tombstone of the parent or refusing the cut are the other two answers.
2. **Identity.** Preserving ids is cheaper than stamping provenance, and it
   is what makes a re-run idempotent — the tape-deck riff's feedback guard
   and syrup's `/branch` both want it. It needs the lower-level write
   (`wind()` can't set `id`), which is the T-180 question.
3. **The seam.** A cut by time is fuzzy where entries share a millisecond;
   a cut by entry is exact. Clients should cut at an entry the person
   pointed at, not at a clock.

And one cost, said plainly: **the new reel has no past.** It carries no
rewind moments from before the cut. That is the point, and it should be the
sentence on the button.

## 4. Length — physics, not policy

A spool on a device is a file; it is as long as the disk. What is finite is
what a relay will carry: the canonical relay caps a frame and a pocket
deposit at 8 MiB, and because a cold joiner receives the whole document in
one frame and every deposit is the whole document, that cap is the reel
length in practice. At this spike's 311 B per message that is **~25 700
messages**; T-110 measured 317 B and 26 500 in a real room. In human units:

| what's on the reel | how far 8 MiB goes |
|---|---|
| a chat, ~317 B a message | ~26 000 messages |
| a family room | years |
| a big, busy room | one heavy summer |
| a mixtape or lore, pointers not audio | effectively never |

So "unlimited" is a promise the transports can't keep — not until delta
deposits and compaction exist, both parked — and "a set limit" already
exists. What is missing is honesty about it: nothing tells a person how full
the reel is, and the 413 latch that fires when a deposit outgrows the cap
degrades the room to live-only with one notice line. Two things follow:

- **A tape counter.** Entries and bytes against the link's relay. The relay
  already advertises its deposit cap in its health JSON (`pocket.maxBytes`),
  so the counter reads the physics from the relay the link names — never a
  constant baked into a client. `spool.doc` gives the bytes today.
- **Full is a cut, not a wall.** At the line, the client offers the cut
  (§3) with the honest sentence, instead of a warning it cannot act on.

**Who sets it.** The relay operator owns the hard ceiling, because the
relay is the only party that can enforce anything about size, and refusing
to carry a frame is all it can do. A maker may set a shorter reel length as
a convention inside the spool — a reserved kind, newest-wins, like the room
name — and anyone with the link can change it, so it is a custom, not a
lock, and the client says so: *advisory, never binding*, the same posture as
`author`. That is the owner's "person hosting the spool," resolved: the host
of the relay sets the physics; the host of the room sets the custom; nobody
sets unlimited.

## 5. Money, refused on the record

Don't sell spool sizes. A spool costs nobody anything to hold — bytes on a
relay's disk are pennies a gigabyte — so a size tier would be scarcity we
manufactured, and ETHOS names that as a refusal. What actually costs
something is a *running* thing: a relay that is always up, a pocket that
holds sealed copies for sixty days, a keeper that never sleeps, egress when
a room fans out. If money ever enters the sentence, that is the honest
thing to charge for, near cost — a relay of your own, hosted; a keeper you
don't have to run — and the spool stays free and stays the person's. This
paragraph exists so the question isn't relitigated under a deadline.

## 6. What the owner said, kept as evidence

- Forgetting should be really gone and logged nowhere → §1's first two
  gones are real today; the third is honesty, not a feature.
- A spool that gets too big should break, or obey physics → §4: the reel
  length is the relay's cap, made visible, with the cut at the line.
- Rewind and take things off the front, or splice things out → §3, the
  retelling by time or by entry; the identity question goes to T-180.
- Capacity set in the handoff or by whoever hosts → §4: relay operator
  hard, maker soft, said out loud in the client.
- Sell a spool size? Or unlimited? → §5 and §4: neither.
- And, unasked: the owner minted *reel two* to shed a finished list before
  this riff existed. The name is adopted.

## 7. What this asks of the loom (fit, sorted)

| rung | what | when |
|---|---|---|
| **already true** | forget-this-device (T-163), start a new room (T-164), the honest permanence sentence, the pocket TTL, the health JSON's `maxBytes` | today |
| **docs only** | this riff; a pointer from spools-of-spools §4; the T-180 evidence line | now |
| **client work, no SDK** | the tape counter (bytes via `spool.doc`, cap via the relay's health JSON); "full" as an offered cut; the cut-by-entry gesture | a room ticket, when signed off |
| **SDK, at the splice gate (T-180)** | a retelling operator: fresh ids or preserved ids (§3.2), the thread rule (§3.1), provenance optional (91 B an entry), cut by entry not by time (§3.3) | the gate review — this riff is its sixth source and its first with the cut measured |
| **relay** | nothing new; the parked pocket DELETE stays parked (grief physics) | — |
| **convention, sign-off** | a reserved reel-length kind, advisory; the adopted word *reel* in the vocabulary table (§2 of DESIGN_DOC) | owner |
| **protocol pressure** | **none.** The document shape does not move; a new spool is a new spool | — |

## 8. Open questions parked here (with what would decide each)

- **Which cut ships first**: by entry ("from here"), by kind ("just the
  messages"), or whole ("everything live, new key")? Decider: the room's
  next real need; T-164 already ships the whole-cut-without-history.
- **Preserved ids or fresh ids by default?** Preserved is cheaper and
  idempotent; fresh is the only one `wind()` can do today. Decider: T-180.
- **Does the counter show bytes, entries, or a fraction of the reel?**
  Lean: a fraction, with the number on tap — a tape counter, not a fuel
  gauge. Decider: the owner, who is a visual person, on a mockup.
- **Should the old reel's last entry point at the new one?** The
  spools-of-spools `next` role, sealed by default so the pointer doesn't
  hand the key. Decider: the first real cut.

---

*The residue, if one sentence survives: a spool refuses to forget, and that
refusal is what makes it a keepsake; forgetting is not done to a spool but
with one — you cut a new reel from what you keep, the old one stays whole
wherever it is kept, and the length of a reel is whatever the relay you
trust will carry.*
