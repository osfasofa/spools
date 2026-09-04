# The tape deck — streams, interpreters, and direction

*Research riff, September 2026. The founding prompt is the owner's, in two beats: (1) Spool beside a reactive language like RxJS — streams, pipelines, chains of spools, a spool "run through something" that interprets it however it likes, a network of interpreters that can interpret their interpreter; (2) direction — winding forward, then running the same spool backward through the same interpreter for a different effect, packets that carry an in and an out, rollback without cleanup. This document explores both to their edges and prices what it finds. **It decides nothing.** Nothing here amends SPEC, touches §5, or promises surface; every thread that wants to become real queues at the usual gates (owner sign-off for anything protocol-shaping, parked-with-evidence for SDK surface). It sits beside [spools-of-spools.md](../spools-of-spools.md) and cites it rather than repeating it. Numbers below are measured, not guessed: `scratch/riff-tape-deck/spike.mjs`, run offline and memory-only on the workspace build of `spools` 0.2.0 with the test history tuning, through the exported `Spool`/`SpoolEngine` escape hatches.*

---

## 0. The noticing

A spool is not an Observable. It is what an Observable becomes after `scan`. In Rx you would write `updates$.pipe(scan(merge, empty))`; Yjs is exactly that, with a CRDT merge as the reducer — commutative, associative, idempotent, so arrival order doesn't matter, which is the one promise Rx cannot make across two machines. Rx is about time and order. A spool is about state that agrees. `rewind()` is `scan` with a scrubber bolted on.

The SDK already has the reactive *shape* without having chosen it: the §5 event decision (diffs plus a getter, no replay on load) is a state-plus-changes object, and `on()` returning an unsubscribe function is the Observable contract by accident. So the riff isn't proposing interop — that's five lines in userland (§1). It asks what the *vocabulary* buys, and the answer turned out to be two things: a named menu for a question the collections riff left open (§2), and a clean way to say what "backwards" can and cannot mean in a multi-writer document (§4).

## 1. Streams and spools — what maps, what doesn't

| Rx idea | in Spool | status |
|---|---|---|
| `Observable<T>` of changes | `spool.on('entry', cb)` → unsubscribe | already true; adapter below |
| current value (`BehaviorSubject`) | `spool.entries` getter | already true |
| `scan` | the CRDT merge; `rewind()` for the scrubber | physics |
| hot vs cold | always hot: a late subscriber gets *state*, never a replay of events | §5, on purpose |
| `ReplaySubject` | rewind moments — replay is by *moment*, not by event | shipped (M6) |
| scheduler / virtual time | none; time is each writer's wall clock plus an id tie-break | honest limit, see §4 |
| completion | none; a spool never completes (seasons end it socially — collections riff §3) | convention |

The adapter, for the record — after `whenReady`, because the getter is the truth and the stream is the diff:

```js
import { Observable, startWith, map } from 'rxjs'
const changes$ = new Observable((sub) => spool.on('entry', (c) => sub.next(c)))
const entries$ = changes$.pipe(startWith(null), map(() => spool.entries))
```

Nothing to add to the SDK. Framework-agnostic is a principle and RxJS is a dependency; an adapter is a vessel's package or a stranger's, never the loom's.

## 2. Higher-order observables are spools of spools

An `Observable<Observable<T>>` is exactly a shelf: a stream whose items are streams. Rx has a named menu for what to do with one, and that menu is the traversal-policy question the collections riff answered by hand (§6 there: "lazy by default, always"):

| the shelf (a spool of links) | the Rx name | the riff's verdict |
|---|---|---|
| open every child at once | `mergeAll` | the bandwidth bomb; must not exist as an option in a reference client |
| open one, leave the last | `switchAll` | phones can't hold fifty sockets — the default gesture |
| open children in order, stitched | `concatAll` | seasons scrollback (lean there: show the seam) |
| ignore taps while one is opening | `exhaustAll` | debounce the shelf tap |
| split one stream into volumes | `window()` | seasons |

Two shipped things already sit on this table without knowing it: `spools-keeper --links` (T-182) is `mergeAll` on purpose — the one peer that can afford every socket — and the pegboard's move B, the wall you look at, is the `switchAll` interpreter of the same list.

## 3. Interpreters — reading is free, writing is a seat

"Run a spool through something, and whoever reads it interprets it however they want" is views-are-skins, the thesis that shipped in M3 and that the room proved again. Every client is already an interpreter; `kind` is the contract; "ignore kinds you don't understand" is the forward-compatibility story. **Reading interpreters cost nothing and are lane-pure.**

A *writing* interpreter — an operator that reads spool A and winds derived entries into spool B — is a different animal. An Rx operator is pure glue inside one process. A spool operator is a writer with a key: a seat, a device, an author string, a pocket schedule. In the room's vocabulary, a machine seat. So the pipeline idea sorts three ways:

- **On your own device, as your tool.** A client feature. The collections riff already named it: a *retelling* is the subset operator — `filter` plus `map` into `newSpool()`.
- **Unattended, holding keys.** The keeper with hands: familiar's lane, fork territory by charter.
- **A derived spool is a copy with its own key.** Secretly a feature: a retelling is the read-only projection §6 says the protocol can't give you, because writing to the copy never touches the source. It is a snapshot, not a live binding, unless the operator keeps running.

Two hazards, both with Rx names:

- **Order dependence.** `distinctUntilChanged`, `debounceTime`, or a `scan` with a non-commutative reducer, run off the live diff stream on two peers, can disagree — diffs arrive in different orders. Rule: **derive from `spool.entries`, the converged state, never from the sequence, unless the reducer is itself a CRDT.** The §5 line "naive clients can never drift" already says this for views; it's the same rule one level up.
- **Feedback.** In Rx a subject fed back into itself spins the CPU. Here it is worse: every wind is permanent (`gc:false`, soft deletes), so A-reads-B-reads-A grows both docs forever. The guard is idempotence — re-running an operator must wind nothing new — and `wind()` cannot set `id`, so a re-derived entry duplicates. The fix is a provenance field in `data` (source spool code + entry id) as the dedup key: pure convention, and exactly the "identity across a retelling" question [T-180](../../tickets/T-180-splice-gate.md) is sitting on. **This riff is a second independent wanter for it.**

**Interpreters interpreting their interpreters** — the universal-machine move, the interpreter's own definition on a tape — is a *recipe spool*: entries of a rule kind, declarative, co-edited by two people the way they co-edit a mixtape, rewindable so the pipeline's evolution is visible, pointing at other recipes through the existing `kind:'spool'` link convention. It costs zero spec sentences on two conditions. **Rules are data, never code**: a skin you don't understand gets ignored and you fall back to the list view, but you cannot ignore half a program — Turing-complete entries break the one rule the forward-compatibility story rests on, and executable code from a friend turns "lying petnames" into exfiltration. Declarative, CSS-shaped view specs; no scripts. **Advisory, never binding**: the recipe suggests, the client decides — the same posture as `author` being trust, not proof. Both are derivable from §1, not new decisions. And no new noun: client interprets, `kind` is the contract, retelling is the derived spool, skin is the view. "Interpreter" and "pipeline" stay in conversation and out of the vocabulary table.

## 4. Direction — what "backwards" can mean in a multi-writer document

Direction isn't in the spool. It is in the reading: the tape never changes, the head decides which way it runs. Three different things hide under "rollback":

| verb | what it is | status |
|---|---|---|
| **look back** | `rewind(ts)`: read-only, the present untouched | shipped (M6) |
| **undo mine** | Yjs's `UndoManager`: undoes by winding *new* compensating operations, scoped to one origin — your winds, never your friend's | escape hatch today (`spool.doc`); see the §5 verdict before anyone promises surface |
| **put the spool back** | in place: diff a rewind moment against the present and wind compensating changes (delete the newer, restore the older, reset bodies) — a friend's concurrent edit merges with the rollback, because CRDT. Or as a fork: a new spool from a snapshot — branch-from-a-moment, now measured (§5), T-180's family | convention today; the fork form queues at the splice gate |

All three are affordable for one reason: history-always-on. Landauer's principle says physics charges for erasing information; a spool refuses to forget, and that refusal is what makes going backward cheap. ABA is legal and leaves footprints. The owner's "not necessarily clean up" is the right instinct — the state comes back, the tape gets longer, and rewind shows the walk.

**Packets that carry their own reverse.** The owner's in-and-out packet is pure convention and follows §3's rule — the reverse is data, never code. Each entry carries both ends of its change; the interpreter is one fold with a direction knob:

```js
const forward  = (s, e) => ({ ...s, [e.data.field]: e.data.to })
const backward = (s, e) => ({ ...s, [e.data.field]: e.data.from })

let state = spool.entries.reduce(forward, {})                        // play to the end
state = spool.entries.slice(-3).reverse().reduce(backward, state)    // back three steps
```

The migration lesson, restated as a rule: **a packet is reversible only if it carries enough to invert itself.** "Set x to five" is a one-way street; "x from three to five" is a two-way street; a migration's `down` exists because `up` alone threw the old value away. The chess brief already does this three ways in one packet — SAN is the delta, FEN is the checkpoint, ply is the sequence number — and that is the platonic reversible entry: delta for forward, checkpoint for backward without inverting anything, ply for knowing where you are. (The formal name for "one interpreter, both ways" is a lens — a get and a put with laws tying them together, a projector that also works as a camera. Views-are-skins made bidirectional. Noted, not needed.)

**Where the migration model breaks.** Migrations assume one writer and one total order. A spool has neither: `spool.entries` sorts by `createdAt` with an id tie-break, but that is a *view*; underneath, order is total per seat and only partial across seats. Concretely (measured, §5): ana winds x from 1 to 2; ben, concurrently, winds x from 1 to 3. Sorted, ana comes first; forward gives 3 on both peers. Step back once and ben's packet says the previous value was 1, but the sorted history says 2. **The palindrome law fails under concurrency because `from` is the writer's memory, not the room's truth.** Three honest answers:

- **Deltas that commute.** Plus one, minus one. Order doesn't matter, the inverse is free, concurrency is harmless — the owner's "simplest way" is a CRDT counter and it is the best answer, not the naive one. Anything expressible as a commutative delta should be.
- **Checkpoints.** Carry the absolute state in the packet, FEN-style; backward is a read of the previous checkpoint, no inversion. Concurrent checkpoints conflict *visibly* — two packets at one ply — and the chess brief already has the posture: render the rogue move, never hide it.
- **Per-seat reversal only.** Undoing my own winds is always sound because my sequence is total; cross-seat rollback is a negotiation between people. Yjs scopes `UndoManager` by origin for exactly this reason — physics and library agree.

**Direction on the graph** (one line, from the collections riff): links are one-way and the target never knows; in-and-out on a shelf is the existing `next`/`prev` role convention, which only works when you hold both keys. Seasons already do it.

## 5. Measured (`scratch/riff-tape-deck/spike.mjs`, all assertions green)

1. **The fold.** Four delta packets; forward, back one, back two, all the way back, forward again — the palindrome lands on the same state. **Reading in either direction costs zero bytes** (840 B before and after); one delta packet costs **205 B** at rest (field + from + to + metadata, no body).
2. **The from-lie**, reproduced exactly as §4 states it: both peers see one sequence, forward converges (x=3), one step back says 1 while replaying everything-but-the-last says 2. Set-packets depend on order (sorted 3, reversed 1); the commuting tick reads 2 in any order and its inverse walks back to zero.
3. **Checkpoints.** Backward is a read; the concurrent ply-3 conflict is visible on both peers as two packets.
4. **Undo, the verdict.** A raw `Y.UndoManager` over the `entries` map, undoing a wind, **removes the map key: the entry vanishes from `spool.entries` *and* `spool.deleted` — a hard removal at the entry layer, the thing §5's soft-delete decision says must not exist — and leaves the body behind as an orphan root type** (`entry:<id>` still in `doc.share`). Rewind still shows the entry (memory survives), redo brings it back with its body intact, and the doc only grows (514 → 522 → 649 B). Body-text undo scoped to one entry's `Y.Text` behaves: ana's edit is removed, ben's concurrent insert to the same body survives, both converge. So any spool-flavored undo must be built from `delete()`/`restore()` plus body-text undo — never the raw manager over the entries map.
5. **Rollback in place** from a rewind diff (soft-delete the newer, restore the older, reset bodies): the visible spool reads as it did at the moment; the newer entry is soft-deleted, not gone; the tape grew (815 → 858 B); `rewind` at the intermediate moment still shows the entry alive and the later moment shows it soft-deleted — footprints, not erasure; ben's concurrent edit to the rolled-back entry merged under the tombstone ("lake at night" — tombstone hides, edit survives, the T-013 invariant); ben converges.
6. **Branch-from-a-moment** — the collections riff's "needs its own spike" item — **works** through the escape hatch: `Y.createDocFromSnapshot` off a rewind moment's snapshot, applied into a fresh spool, holds exactly the moment (446 B vs the origin's 996 B), with entry identity intact. Two physics notes: a fork from moment *k* carries moments 1…k−1 only — a moment's own record is appended after its snapshot is taken, so the fork is born with no record of the instant it was cut from; and **reunion with the origin resurrects the origin's whole present, soft-deletes included** — a branch-from-a-moment cannot un-know what the origin later did, once they meet. The retelling (fresh entries, new ids) remains the only subset operator that *stays* a subset.

## 6. What this asks of the loom (fit, sorted)

| rung | what | when |
|---|---|---|
| **already true** | the Rx adapter (userland); reversible packets as `data` convention; rollback-in-place from `rewind()` + handles; branch-from-a-moment via `spool.doc`; reading interpreters of any shape | today, zero changes |
| **docs only** | this riff; the traversal-policy table pointer in spools-of-spools §6; the T-180 evidence line | now |
| **SDK sugar (parked-with-evidence gate)** | `undo()`/`redo()` — only ever built on soft delete + body-text undo (§5.4); a provenance-field helper for idempotent operators; `peekSpool` as before | a client wants it |
| **splice family (T-180, sign-off)** | branch-from-a-moment now measured; a second wanter for identity across a retelling; the "reunion resurrects everything" physics as the reason the retelling exists | the gate review |
| **protocol pressure** | **none found.** Direction, reversal, undo, recipes — every one resolves to a convention, an escape hatch, or a client rule | — |
| **fork of purpose** | unattended writing interpreters (familiar); executable recipes, if anyone ever really wants a lisp on a tape | own repos, own names |

## 7. Open questions parked here (with what would decide each)

- **The recipe spool** — a co-edited, rewindable view spec: keepsake, or a config file wearing a trenchcoat? Decider: the owner's debate, then a vessel that winds one.
- **Which packet shape the toy carries first** — deltas, checkpoints, or both on one screen so one breaks and one holds. Lean: both. Decider: `scratch/riff-tape-deck/` grows a two-tab page (transport buttons, a counter, two fields) and whoever runs it in two tabs.
- **Does the toy want undo?** If it does, that is the evidence for a passthrough — shaped by §5.4, never the raw manager. Decider: the toy.
- **Should a fork from a moment carry the moment's own record?** Trivially fixable by appending the snapshot after the cut; whether it *should* is the splice brief's call. Decider: T-180.

---

*The riff's one-sentence residue, if only one survives: the tape never runs backward — the head does, and it can only do so because the tape refused to forget; under two hands, the only reversals that stay honest are the ones that commute, the ones that carry a checkpoint, and the ones that undo your own hand alone.*
