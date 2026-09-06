---
id: T-180
title: "splice() — the gate review — sign-off"
status: doing
milestone: M16
depends: []
---

## Goal

Decide whether the `splice` family earns SDK surface, from evidence, and if
so which operators.

## Context

`splice` has been a reserved word since DESIGN_DOC §2 and parked since v1.
The gate rule (SDK-API "parked with evidence") asks for a second client to
independently want it. There are now four sources:

1. **The spools-of-spools spike** (`docs/spools-of-spools.md`, Aug 2026):
   fork = a new spool with the whole corpus crossing, lineage intact (the
   fork can rewind to before it was born); reunion = one exchange of updates
   by a human holding both keys; subsetting (the *retelling*) is the other
   operator. Measured, not guessed.
2. **syrup** (Sep 2026): shipped `/branch` as pure convention (`newSpool`
   from the parent's relay, a sealed `home` wind in the child, `offshoot` at
   the origin) and wants `/splice` + `/rejoin`; its HANDOFF calls the
   Tapestry "the standing argument" for it. Escape hatch it uses today:
   `spool.doc` + `Y.applyUpdate`.
3. **lore's brief** expects "the first real splice evidence — through the
   gate, not promised."
4. **The owner's forgetting riff** (3 Sep 2026): a spool has a length;
   forgetting is cutting a new reel from what you keep, under a new key.
   That is a retelling with rotation — and it is also the room's only
   honest answer to "start over without them" (T-164).
5. **The tape-deck riff** (`docs/riffs/tape-deck.md`, Sep 2026): a second
   independent wanter for identity across a retelling (idempotent
   operators need a stable dedup key; `wind()` can't set `id`). Measured
   in `scratch/riff-tape-deck/spike.mjs`: branch-from-a-moment works
   through the escape hatch (`Y.createDocFromSnapshot` off a rewind
   moment), carries no record of the moment it was cut from, and reunion
   with the origin resurrects the origin's whole present, soft-deletes
   included — the retelling is the only subset that stays a subset. Also
   on the record for whoever designs undo: a raw `Y.UndoManager` over the
   entries map undoes a wind as a hard removal (gone from both getters,
   body orphaned), so a spool-flavored undo builds on soft delete.

## What the gate has to decide

- **Which operators:** fork (whole corpus, lineage intact), retelling
  (subset, a new document), rejoin (apply the other's update under both
  keys). Names to pass the sentence test.
- **Identity across a retelling:** `wind()` can't write `id`/`createdAt`, so
  a retelling that preserves entry identity needs a lower-level write; the
  doc shape is unchanged (SPEC §2's write-once rule still holds per
  document), so this is SDK surface, not protocol.
- **What it bakes in:** easy splicing widens blast radius easily
  (spools-of-spools: transitive closure). The honesty sentence travels with
  the verb.
- **Sequencing:** the forgetting riff decides which operator the room needs
  first; write that riff, then the brief, then sign-off, then tickets.

## Tasks

- [x] Owner answers the forgetting questions (who "hosts" a spool; the reel
      reading) → `docs/riffs`-style riff in the loom. *(Answered 4–5 Sep;
      the riff is [docs/riffs/the-reel.md](../docs/riffs/the-reel.md).)*
- [x] Brief: `docs/M16-splice-brief.md` from the riff + the spike. *(5 Sep 2026.)*
- [ ] **Sign-off**; DESIGN_DOC §5 row; tickets for the chosen operators.

## Notes / open questions

- **Brief written, 5 Sep 2026** ([docs/M16-splice-brief.md](../docs/M16-splice-brief.md)).
  What the evidence decided on its own before the owner has to: the
  "splice family" is two operators with opposite physics, and only one of
  them lacks surface. The **fork** (whole document, lineage intact) is two
  lines through `spool.doc` and has two wanters and no shipper — it stays a
  recipe. The **retelling** has three shippers (lore's v1, syrup's
  `/branch`, the room's T-164) and two measured wanters for identity (the
  tape-deck feedback guard, the reel's cut), and the reason all three
  reached under the SDK is one fact from `entry.ts`: `wind()` stamps `id`
  *and* `createdAt`, so a retelling built from `wind()` loses identity and
  **order** (a thousand entries wound in one loop land in the same
  millisecond and sort by random id). The brief prices four options and
  recommends **one primitive** — `splice(records)`, writing complete
  `EntrySnapshot`-shaped records with identity intact, idempotent, and
  **refusing a dangling parent** (the "not synced yet" lie) — with the cut,
  the fork, and the rejoin as recipes on top. Zero protocol change.
- Five decisions for sign-off in the brief's §5: adopt the primitive;
  fork/rejoin stay recipes until a vessel ships reunion; names (`splice`
  for the primitive, *reel* and *cut* into §2, `retell`/`fork`/`rejoin`
  unreserved recipe names); flatten as the room's thread rule; the
  reel-length kind + tape counter as one room ticket. Proposed tickets
  T-186 (SDK), T-187 (room), T-188 (docs, last).
- Numbers the brief leans on, all previously measured: 760 KiB preserved
  ids vs 965 KiB with a `from` stamp vs 1 594 KiB for the old reel
  half-hidden (reel spike, 5 000 messages); reunion resurrects (tape-deck
  §5.6); fork carries the history array (spools-of-spools §4). Nothing new
  was run for the brief; the ticket after sign-off runs the spike's
  numbers as its fixture.
- The ticket stays `doing` until the owner signs off; then §5 row and
  tickets, and this closes.

## Acceptance criteria

- A decision recorded with its trade-offs, whichever way it goes.

6. **The reel riff** (`docs/riffs/the-reel.md`, Sep 2026): the owner's
   forgetting answers, and the cut measured for the first time
   (`scratch/riff-reel/spike.mjs`, 5 000 messages): a retelling of the
   live half is 741 KiB with fresh ids and no provenance, 965 KiB with a
   `from` stamp (91 B an entry), 760 KiB with ids preserved through the
   escape hatch — identity is the cheaper provenance. Three operator
   decisions surfaced: what happens to a reply whose parent didn't make the
   cut (the spike flattens it), preserved or fresh ids, and cutting by
   entry rather than by time (createdAt ties make a time cut fuzzy). The
   new reel carries no rewind moments from before the cut — the point, and
   the sentence for the button.
