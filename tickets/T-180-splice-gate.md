---
id: T-180
title: "splice() — the gate review — sign-off"
status: todo
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

- [ ] Owner answers the forgetting questions (who "hosts" a spool; the reel
      reading) → `docs/riffs`-style riff in the loom.
- [ ] Brief: `docs/M16-splice-brief.md` from the riff + the spike.
- [ ] **Sign-off**; DESIGN_DOC §5 row; tickets for the chosen operators.

## Acceptance criteria

- A decision recorded with its trade-offs, whichever way it goes.
