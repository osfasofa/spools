# M16 — the splice gate: the cut, the fork, and what the SDK should say

**Status: draft for sign-off — 5 Sep 2026.** This is T-180's brief. It decides nothing; it prices. The owner decides in §5, and the decision goes to DESIGN_DOC §5 with its trade-offs whichever way it falls. Six evidence sources are on the table (§1); the physics is measured, not guessed (`scratch/riff-spools-of-spools/spike.mjs`, `scratch/riff-tape-deck/spike.mjs`, `scratch/riff-reel/spike.mjs`). It sits beside [docs/M10-async-brief.md](M10-async-brief.md) and follows its shape.

**TL;DR.** `splice` has been a reserved verb since DESIGN_DOC §2 with no design, and the gate rule says a second client has to want it independently before it earns surface. Two clients now do, and the owner's own forgetting riff turned out to be the same ask from a third direction. But the evidence splits the "splice family" into two things with opposite physics: the **fork** (whole spool, lineage intact, reunion possible, and reunion *resurrects everything*) and the **retelling** (a subset, a new document, a clean break — the only subset that stays a subset). The fork already has all the surface it needs: two lines through `spool.doc`. The retelling does not: `wind()` stamps its own `id` and `createdAt`, so a retelling built from `wind()` loses identity *and order*, and every client that wants one has to reach under the SDK. The recommendation is **one boring primitive** — write an entry into a spool with its identity intact, refusing to write a lie — and the cut, the fork, and the rejoin as documented recipes on top of it, promoted to verbs only when a vessel ships them in anger. Zero protocol change; the document shape does not move.

---

## 1. The evidence, and what each source actually wants

| # | source | what it built or measured | what it wants |
|---|---|---|---|
| 1 | **spools-of-spools spike** (Aug 2026, `docs/spools-of-spools.md` §4) | fork = `newSpool()` + `Y.applyUpdate(fork.doc, encodeStateAsUpdate(orig.doc))`: the whole corpus crosses, *including the history array* — the fork can `rewind()` to before it was born. Reunion after divergence (new entries both sides, concurrent character edits to one pre-fork body) converged in one exchange. **Fork is all-or-nothing**: subsetting a Yjs doc breaks item identity, and a filtered doc that later reunites resurrects everything anyway. | nothing yet — feasibility. Names the two operators: **splice** (whole-spool fork) and **retelling** (subset). |
| 2 | **syrup** (Sep 2026, HANDOFF §1) | shipped `/branch` as pure convention: `newSpool` on the parent's relay, a sealed `home` wind in the child, an `offshoot` wind at the origin. Uses `spool.doc` + `Y.applyUpdate` as its escape hatch. | `/splice` + `/rejoin` — "physics explained to owner, never built, owner enthusiastic. The Tapestry is the standing argument." Files the ask as "a splice() surface." |
| 3 | **lore's brief** (`docs/vessels/lore.md`) | v1 is retelling: break a tale off a campfire by winding a `telling` of it into a fresh spool with a `gloss` crediting where it came from — "provenance as lore, not as cryptography." | the reunion case — a retold tale's spool wanting to rejoin the campfire — named as "the first real-world demand the reserved verb has ever had," expected through the gate, promised nowhere. |
| 4 | **the owner's forgetting answers** (4–5 Sep, in the reel riff §6) | forgetting should be really gone and logged nowhere; a spool that gets too big should obey physics; rewind and take things off the front, or splice things out; capacity set in the handoff or by whoever hosts. | a spool with a **length**, and forgetting as **cutting a new reel** from what you keep, under a new key. (And, unasked: the owner minted *reel two* to shed a finished list before the riff existed.) |
| 5 | **the tape-deck riff** (`docs/riffs/tape-deck.md` §3, §5) | a writing interpreter that derives spool B from spool A must be **idempotent** or the two docs feed each other forever (`gc:false`); `wind()` can't set `id`, so a re-derived entry duplicates. Branch-from-a-moment works (`Y.createDocFromSnapshot` off a rewind moment) but is born with no record of the instant it was cut from, and **reunion with the origin resurrects the origin's whole present, soft deletes included**. A raw `Y.UndoManager` hard-removes — undo is off this table. | a **stable identity across a retelling** — the second independent wanter for exactly the question this brief is about. |
| 6 | **the reel riff** (`docs/riffs/the-reel.md` §3) | the cut, measured at 5 000 messages (keep the live half): the old reel half-hidden **grows** to 1 594 KiB; a retelling with fresh ids and no provenance is 741 KiB; with a `from` stamp 965 KiB (**91 B an entry**); with ids and timestamps preserved through the escape hatch **760 KiB** — "identity is the cheaper provenance." Three operator decisions surfaced: threads, identity, the seam. The new reel carries no rewind moments from before the cut — the point, and the sentence for the button. | the retelling operator at this gate: preserved or fresh ids, the thread rule, provenance optional, cut by entry not by time. Plus client work that needs no SDK: the tape counter, "full is a cut, not a wall." |

Read across the rows: **retelling** has three shippers (lore's v1, syrup's `/branch`, the room's T-164 whole-cut) and two measured wanters for identity (5, 6). **Fork/rejoin** has two wanters (2, 3) and zero shippers — syrup explains the physics and stops; lore expects evidence and promises nothing. The gate rule is met for the retelling outright; for the fork it is met on wanting, not on shipping.

## 2. The physics, restated once so the options can lean on it

Everything below is already true of the shipped system; nothing here is a proposal.

1. **A spool is one Yjs document; entry identity is item identity.** Sync merges items by their internal ids; the `entries` map is keyed by the entry's own `id` (SPEC §2: equals its key, unique in the spool, SHOULD be a UUID). Two documents that share item history can always reunite (fork); two that don't cannot be made to (retelling) — each side sees the other's entries as *new* and merge is a union.
2. **Forgetting inside a spool costs rewind for everyone** (reel riff §2, measured). `gc:false` is what makes `rewind()` work and exactly what makes nothing leave. Soft deletes grow the doc. This is a trade the design made on purpose for a keepsake; the cut exists so a chat doesn't have to un-make it.
3. **Reunion resurrects.** A fork that meets its origin again learns everything the origin did since, soft deletes and all (tape-deck §5.6). A fork cannot un-know. **The retelling is the only subset that stays a subset** — the sentence every option below has to keep true.
4. **`wind()` stamps identity and time.** `id = uuid()`, `createdAt = Date.now()`, `author` fixed at open (`entry.ts`, `EntryStore.wind`). Display order is `createdAt` then `id` (SPEC §2). So a retelling built from `wind()` alone gets fresh ids *and* fresh timestamps — a thousand entries wound in one loop land within a few milliseconds and sort by random id. **Order does not survive `wind()`**; the reel spike's fresh-id rows carried `at` in `data` to keep it, which is the 91 B tax by another name.
5. **Identity is the cheaper provenance** (reel riff): preserving `id` and `createdAt` costs nothing per entry, keeps order, and makes a re-run idempotent (an id already present is a no-op). A `from: {spool, id, at}` stamp costs 91 B per entry, a quarter of a message.
6. **Bodies are `Y.Text`; only the current text crosses a retelling.** Character-level history stays in the old reel (that *is* "the new reel has no past"). A fork carries the body's whole item history because the document crosses whole.
7. **The write-once rule is per document** (SPEC §2, normative). An entry created once in the new spool with its original `id`, `createdAt`, and `author` is a first write in that document. No SPEC sentence moves. (One *non-normative* sentence may want adding later — "an entry's `id`/`createdAt` may have been carried from another spool" — written last, from working code, per the constitution.)
8. **Keys.** A cut under a new key is rotation, and rotation is the protocol's only eviction (spools-of-spools §1, T-164). Reunion of a fork needs one client holding both links, pumping updates locally — never through either relay. A human act, never fire-and-forget.
9. **Provenance is already a convention**, priced: `kind:'spool'` + `data.link` with `role:'home'` in the child (sealed by default — proves where it came from without handing the key), `role:'offshoot'`/`'next'` at the origin. Zero SDK.

## 3. The design space

Four options for what the SDK says. Each with what it costs, what it bakes in, what stays loose.

### A — nothing: recipes only (the escape hatch is the surface)

Document the three recipes in SDK-API — fork (two lines), retelling (write the `entries` map by hand: ~12 lines of Yjs), rejoin (apply both ways) — as prose to copy, per ECOSYSTEM's copying-keeps-it-honest rule. Vessels prove them; a verb is promoted when two have copied the same twelve lines.

- **Costs:** every vessel that wants a cut reaches under the SDK and writes the map by hand — the exact thing the store exists to keep uniform (the `deletedAt` shape, the `entry:<id>` body key, the shadow/visibility bookkeeping, the change events). Three copies of twelve lines is three places for the "not synced yet" lie (§4.1) to be written. syrup already did this once for `stash.remember` (T-179) and it is the reason T-179 exists.
- **Bakes in:** nothing. Genuinely.
- **Stays loose:** everything.
- **Verdict:** the honest floor, and the right answer for fork/rejoin today (§3.C). Not the right answer for the retelling: it has already been copied three times (lore, syrup, the room), which is the gate's own promotion signal.

### B — one primitive: write an entry with its identity intact (recommended)

A single method on `Spool` that writes a *complete* entry record — `id`, `author`, `kind`, `createdAt`, `parent?`, `data?`, `deletedAt?`, `body?` — into this spool, exactly as given, in one transaction. The same plain shape `rewind()` already hands out (`EntrySnapshot`), so the cut is literally *rewind-shaped data going the other way*. Rules, all of them boring:

- **Idempotent:** an `id` already present is a no-op (returns the existing handle). A re-run of any operator over the same input winds nothing. This is what makes derived spools safe under `gc:false` (tape-deck §3's feedback hazard) and what makes a cut re-runnable after a crash.
- **Refuses to write a lie:** a record whose `parent` is neither in the same batch nor already in the target is **rejected** (the batch fails whole, before any write). A dangling parent in a fresh spool is indistinguishable from "not synced yet" and the room would render it as exactly that lie. Flattening is the *caller's* explicit act (`{ ...rec, parent: undefined }`), never something the SDK does behind the caller's back.
- **Policy-free otherwise:** it does not decide which entries cross, whether soft-deleted ones do, whether to stamp provenance, or what the new spool's key is. Those are the cut's decisions (§4), and the cut is a recipe on top.
- **Batch, one transaction:** so a cold peer never observes a half-built reel (SPEC §2's atomic-creation note extends to the batch).
- **`wind()` is untouched.** It keeps stamping identity; it stays the one verb a naive client ever needs.

The cut, then, is three lines in any client:

```js
const reel = await newSpool({ relay: relayOf(old.share()) })          // new code, new key, new pocket
reel.splice(keep.map(e => e.snapshot()))                              // identity, order, bodies cross; history doesn't
reel.wind({ kind: 'spool', body: 'reel one', data: { link: sealed(old.share()), role: 'home' } })  // optional, sealed
```

- **Costs:** one method, one interface (the record shape already exists as `EntrySnapshot`), a page in SDK-API, ~40 lines in `entry.ts`, tests. The one honest asterisk: `author` on a spliced entry is whatever the record says — but `author` is already self-declared trust, not proof (§5 row), and the splicing seat is not recorded per entry; the reel's `home` reference is the provenance.
- **Bakes in:** that an entry `id` can now be meaningfully *the same entry* in two spools. That is the feature (idempotence, order, cheap provenance), and it costs nothing in the document — but any future client that assumed ids were spool-local (a cross-spool index, a deep link) has to know. It also bakes in the record shape as public surface: `EntrySnapshot` becomes an input type, not only an output.
- **Stays loose:** the verb names for the recipes (§5.3), fork/rejoin surface (§3.C), per-entry provenance (opt-in by the caller stamping `data` before the call — the SDK never adds fields), branch-from-a-moment, the counter and the button (client work).
- **Verdict:** the smallest surface that removes the reason three clients reached under the SDK, and the only option that can refuse the lie.

### C — the family as verbs: `fork()`, `retell()`, `rejoin()` on `Spool`

Name all three. `fork()` = `newSpool` + apply the whole state (optionally from a moment); `retell(select)` = B's primitive plus the selection and the flatten rule; `rejoin(other)` = apply both ways, requiring both spools open in one client.

- **Costs:** three verbs into the metaphor budget at once, each carrying its own honesty sentence ("a fork remembers who it was; reunion resurrects everything; a retelling has no past"); `rejoin` needs a *pair* of open spools as its calling shape, which nothing else in the SDK has; and `fork` is two lines today with no client that has shipped it — promoting it now is promising, which the gate forbids.
- **Bakes in:** the calling shapes of three operators before any of them has a second shipper. Event contracts calcify hardest (§5 row); verbs with two spools in hand calcify faster.
- **Stays loose:** less. A `retell()` with a built-in flatten rule bakes the thread decision (§4.1) into the SDK for everyone.
- **Verdict:** premature for fork/rejoin — keep them as recipes (A) until a vessel ships reunion for real (lore's campfire is the named candidate). `retell()` as a *helper over B* is a fair later promotion once two clients have copied the three lines above; not now.

### D — widen `wind()`: optional `id`, `createdAt`, `author` on `WindInput`

The smallest diff on paper: three optional fields.

- **Costs:** every `wind()` call site everywhere now carries the possibility of forging time and identity, and the honest shape — a *complete* record, refused when it lies — is lost in a partial-fields API (what does `wind({ id })` without `createdAt` mean? a half-transplant). Idempotence would have to be bolted onto the one verb whose contract is "always creates."
- **Bakes in:** a wider `wind()` for the whole ecosystem to serve one operator.
- **Verdict:** no. `wind()` is the naive client's whole world; keep it boring.

### The comparison, compactly

| | A recipes | **B primitive** | C verbs | D widen wind |
|---|---|---|---|---|
| removes the reach-under for the retelling | no | **yes** | yes | yes |
| can refuse the dangling-parent lie | no (each copy decides) | **yes, at the seam** | yes | awkwardly |
| idempotent re-runs | per copy | **by contract** | by contract | bolted on |
| order survives | per copy | **yes** | yes | yes |
| new surface | 0 | **1 method, 1 input type** | 3 verbs, pair-calling shape | 3 optional fields on the one verb |
| promises fork/rejoin | no | no | yes, unshipped | no |
| protocol change | none | **none** | none | none |
| honesty sentence lives | in three copies | **in one place** | in three verbs | in `wind()`'s docs |

## 4. The cut's three decisions (the reel riff's findings, priced)

These belong to the *recipe*, not the primitive — but the primitive's refusal rule (B) forces each to be taken explicitly.

1. **Threads.** A reply whose parent didn't make the cut: (i) **flatten** — drop `parent`, the reply becomes a top-level entry, the thread went with the parent; (ii) carry the parent as an empty tombstone — honest that something was there, but the room renders "hidden · anyone can restore" and restore reveals nothing, a small lie of its own; (iii) refuse the cut. *Lean: (i), stated on the button ("replies to what you cut become plain entries"); (ii) available to a client that carries its own tombstone convention; (iii) never — a cut that refuses is a wall.* The primitive makes (i) an explicit map before the call and rejects the accidental (iv): a dangling `parent`.
2. **Identity.** Preserved `id` + `createdAt` + `author` by default — cheaper (760 vs 965 KiB), order-keeping, idempotent, and what both wanters asked for. Fresh ids are not an option of the primitive at all: a client wanting them already has `wind()`. *Lean: preserved, always; there is no knob.*
3. **The seam.** Cut **by entry**, never by time: `createdAt` ties at the seam pulled six extra entries into the "last fifth" cut. The gesture is "from here," pointing at an entry; the client selects by the same `(createdAt, id)` order the SDK sorts by. *Lean: by entry; the SDK offers no time-cut.*

And the sentence on the button, from the riff, kept: **the new reel has no past.** `rewind()` in the new reel reaches the first moment *after* the cut and no earlier — entries carry their original `createdAt`, but no moment before the cut exists to rebuild, and asking for one throws `SpoolHistoryError` ("history starts at …", `history.ts`). That is the point, and it is loud.

## 5. What sign-off actually decides

1. **Adopt B: one primitive that writes a complete entry record with identity intact, idempotent, refusing a dangling parent.** Costs: one method, one public input type, a page of docs, tests. Bakes in: cross-spool entry identity as a meaningful fact; `EntrySnapshot` as input. Stays loose: everything named in §3.B. *Recommendation: yes.*
2. **Fork and rejoin stay recipes** (A) in SDK-API — two lines and the honesty sentence each ("a fork remembers who it was before it was born; reunion resurrects everything the origin did since; it happens inside one device holding both keys, never through a relay") — promoted to verbs when a vessel ships reunion. Branch-from-a-moment goes in the same recipe with its two physics notes. *Recommendation: yes; lore's campfire is the named next shipper.*
3. **Names.** The primitive takes the reserved verb: **`splice(records)`** — in tape, splicing *is* joining pieces onto a reel, which is exactly what the primitive does at entry grain; the reserved meaning in §2 ("merging/threading spools") is honored, not stretched. The gesture is **the cut** (client language, the owner's word); the result is a **reel** (the owner's word; vocabulary row proposed). Considered: `transplant` (accurate, medical, cold), `graft` (accurate, one more metaphor), `retell` (lore's word for the *recipe*, kept for the recipe). Sentence test: *"Cut the reel here, and splice what you keep onto a new one."* Zero glossary. *Recommendation: `splice` for the primitive; `reel` and `cut` into DESIGN_DOC §2; `retell`/`fork`/`rejoin` stay recipe names, unreserved.*
4. **The thread rule for the room's cut: flatten** (§4.1), said on the button. *Recommendation: yes.*
5. **A reserved reel-length kind** (advisory, newest-wins, like the room name — the maker's soft length inside the relay's hard cap; reel riff §4) and the **tape counter + "full is a cut, not a wall"** as a room ticket. Convention and client work, no SDK. *Recommendation: yes to both, as one room ticket after 1; the counter reads `pocket.maxBytes` from the link's relay, never a constant.*

Not decided here, on purpose: whether `splice()` should ever accept a *partial* record (no — a complete record or nothing; partial is D wearing a hat); whether the room's cut should hand the old reel a `next` pointer (the first real cut decides; sealed by default if so); whether a `peekSpool()` sits beside all this (its own gate, spools-of-spools §6).

## 6. Design sketch (draft until the ticket says otherwise)

- **Shape.** `spool.splice(records: EntryRecord[]): Entry[]` where `EntryRecord` is `EntrySnapshot` minus nothing: `{ id, author, kind, createdAt, parent?, data?, deletedAt?, body? }`. Returns the live handles in input order (existing handles for ids already present). Synchronous, like `wind()`; local-first means there is nothing to await.
- **Validation before any write:** every record has a non-empty `kind`, a string `id`, a finite `createdAt`; every `parent` resolves inside the batch or in the target's `entries` map (soft-deleted parents count — a reply to a hidden entry is a real shape today). One bad record rejects the batch with a named error (`SpoolSpliceError`, cause = the record's id and which rule).
- **Write:** one `doc.transact` — for each new id: the meta map with the given fields (`data` structured-cloned, `deletedAt` carried verbatim), `entriesMap.set(id, meta)`, and `getText(bodyKey(id)).insert(0, body)` when a body is given. The store's existing shadow/visibility bookkeeping and `entry` diff events fire as for any transaction — clients rerender from the getter as always.
- **Idempotence:** ids already in `entriesMap` are skipped entirely — no meta write, no body write, no event. A second `splice()` of the same input is a no-op at the byte level (nothing in the doc changes).
- **`EntrySnapshot` already carries everything needed** (`history.ts`: `id`, `author`, `kind`, `parent?`, `createdAt`, `deletedAt?`, `data?`, `body`), so `EntryRecord` *is* `EntrySnapshot` — no new type, one name. `Entry` gains `snapshot()` so `keep.map(e => e.snapshot())` is the whole selection step. Additive.
- **The cut recipe (SDK-API prose, copied by clients):** select by entry (from an anchor, by the SDK's own sort), flatten parents not in the selection, `newSpool` on the old link's relay, `splice`, optionally wind the sealed `home` link and the old reel's `next`. Twelve lines, stated once.
- **The fork and rejoin recipes (SDK-API prose):** `Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(orig.doc))`; `createDocFromSnapshot` for a moment; both-ways apply for reunion inside one client — each with its physics sentence.
- **Tests (SDK):** a 5 000-entry cut lands with identical order and bodies (the reel spike's numbers as the fixture); re-running is byte-identical; a dangling parent rejects before writing; a parent-in-batch and a parent-in-target both accept; soft-deleted records cross with `deletedAt`; `rewind()` in the new reel starts at its first moment; a cold peer opens the reel from the pocket whole (T-104's idiom); the fork/rejoin recipe converges and *does* resurrect (asserted, so the sentence stays true).

## 7. Guardrails — what does *not* change

- SPEC.md: no normative sentence. The document shape, the `entries` map, the body key, write-once-per-document, the display order — untouched. One non-normative sentence about carried identity may follow, written last.
- `wind()`: untouched. Still the naive client's only verb.
- The link grammar, the relay, the pocket, the keeper: untouched. A reel is a spool; a new spool is a new spool.
- `gc:false` and `rewind()`: untouched. Forgetting is still not done *to* a spool.
- No addressing returns: `splice()` takes records, not links; a deep link into a spool (`&entry=`) remains the separately gated item from spools-of-spools §10.
- No automatic anything: no auto-cut at the cap (the client *offers*), no auto-rejoin, no traversal.
- Philosophy §1: the cut is a person's gesture over their own reel; the old reel stays whole on every device that keeps it, until each holder forgets it.

## 8. Proposed tickets (land in INDEX.md only after sign-off)

| Ticket | Title | Depends | Gates |
|---|---|---|---|
| T-186 | SDK: `splice(records)` — the identity-preserving write; `Entry.snapshot()`; `SpoolSpliceError`; the reel-spike fixture as tests; SDK-API page with the cut, fork, and rejoin recipes; CHANGELOG (minor lane: new surface) | sign-off | T-187 |
| T-187 | Room: the cut ("start a new reel from here"), the tape counter (bytes and entries against the link's relay's advertised cap), "full is a cut, not a wall," the reserved reel-length kind (advisory), the `home`/`next` pointers sealed by default — smoke scenarios for each | T-186 | |
| T-188 | DESIGN_DOC: §2 rows for *reel* and *cut*; §5 row for this decision; SPEC's one non-normative sentence if the ticket finds it wanted — **last, from working code** | T-186, T-187 | |

Parked by this brief, on purpose: `fork()`/`rejoin()` as verbs (until a vessel ships reunion); `retell()` as a helper (until two clients copy the recipe); per-entry provenance helpers (the caller stamps `data`; 91 B is the caller's to spend); branch-from-a-moment as surface (the recipe carries it); `peekSpool()` (its own gate); a pocket DELETE (grief physics, M10); undo (tape-deck §5's verdict stands).

## 9. Milestone acceptance

1. In the room, a person points at an entry and cuts: a new keyed reel opens on the same relay with everything from there on, in order, replies-to-the-cut flattened and said so; the old reel is untouched and still opens; the new reel's `rewind()` starts at the cut. A second device cold-opens the new link from the pocket and sees the same reel.
2. Running the cut twice from the same anchor produces a byte-identical second reel (idempotence), and splicing the kept entries back into the old reel is a no-op (they're already there).
3. A record with a dangling parent is refused before a single write, with an error naming the record.
4. The fork and rejoin recipes, run from SDK-API's prose in a test, converge — and the test asserts the resurrection, so the honesty sentence is checked, not claimed.
5. `pnpm -r test` green; the relay's no-yjs proof untouched; SPEC.md's diff is empty or one non-normative sentence.

---

*Companion reading: DESIGN_DOC §5 (entry bodies, deletes, history/gc, structured data — every row this leans on), §6 (chat-scale growth, the parked splice line); SPEC §2; T-060 (rewind and the snapshot shape this reuses), T-080 (import as CRDT merge — the fork's physics), T-164 (the whole cut the room already ships); the three riffs. Spec last: T-188 is the only ticket allowed near SPEC.md, and it goes last.*
