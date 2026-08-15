---
id: T-110
title: "Spike: the chat-hour budget"
status: done
milestone: M11
depends: []
---

## Goal

Numbers, not opinions, for the three questions the M11 brief left open: how fast
a chat document grows, what a read-cursor rewrite really costs, and what the
pocket ring does at group cardinality. **This spike gates T-121 (read receipts)
and informs T-124 (relay knobs); its findings decide the open D4 question**
(brief §3) — throttle-hard vs ephemeral-only — which goes back to the owner with
the measurements attached.

## Context

Brief §5 holds the risk inventory: `gc:false` (+34% measured), in-doc history
(~0.5 KB/moment, no pruning path), whole-doc deposits (pocket.ts:314), the 8 MiB
cap on both frames and deposits, the permanent 413 latch (pocket.ts:312), and
the K=4 ring sized for two-person spools. The D4 pricing problem is verified in
code (history.ts:174-184 schedules a moment on any local content transaction —
a cursor body-rewrite included) but not yet measured.

## Tasks

- [x] Node script (`scratch/spike-room/budget.mjs`): wind N messages at a
      realistic cadence into a memory-mode spool with stock history tuning;
      print `Y.encodeStateAsUpdate(doc).byteLength` and `history.length` at
      100 / 500 / 2 000 / 10 000 messages. Derive the 8 MiB crossing point in
      messages and in active hours.
- [x] Same script: 100 throttled cursor body-rewrites with no other activity;
      diff doc bytes + moment count before/after. Price one cursor advance in
      real permanent bytes (the D4 number).
- [x] Ring test: extend `scratch/torture-t104/midnight.mjs` to five concurrent
      seats depositing against a local relay with stock knobs; cold-open a
      sixth origin and diff its entry set against the union written. Does K=4
      lose a worldview? (Note the brief's mitigation claim — the first merger
      re-deposits the union — and check whether it actually saves the cold
      joiner here.)
- [x] Write the verdicts in Notes; take the D4 call to the owner with numbers.

## Acceptance criteria

- A table of doc bytes / history count / deposit size at the four message
  counts, plus the measured per-cursor cost and the ring verdict, recorded in
  Notes.
- The D4 decision (throttle-hard vs ephemeral-only) made by the owner on that
  evidence and recorded here + in DESIGN_DOC §5's M11 mutable-state row.

## Notes / open questions

Everything measured against the real SDK (dist build) and the real
`spools-relay` with stock knobs, in two pure-Node harnesses:
`scratch/spike-room/budget.mjs` and `scratch/spike-room/ring.mjs`.
**Deviation from the task list:** the ring test is a Node harness, not a
midnight.mjs extension — seats run the real `Spool`/`PocketClient` path with a
dead WebSocket polyfill (pocket reachable over HTTP, live sync never happens),
which is exactly the partition shape that produces disjoint worldviews, and it
makes eviction order deterministic. Same relay code, same client code path.
Timing uses the test-only tuning knobs; all *ratios* (one moment per 10 s
min-gap, one deposit per 60 s min-gap) are stock.

### 1. Doc growth — messages are the budget, moments are nearly free

Realistic mix (80% message ~55-char body + `data.seat`, 10% reply, 10% emoji
reaction), one history moment per 5 messages (the 30 msg/min shape):

| messages | doc bytes | moments | history overhead | per moment in-doc |
|---|---|---|---|---|
| 100 | 31.3 KB | 20 | 1.3 KB | 68 B |
| 500 | 157.1 KB | 100 | 6.8 KB | 69 B |
| 2 000 | 635.3 KB | 400 | 28.2 KB | 72 B |
| 10 000 | 3 185.9 KB | 2 000 | 142.2 KB | 73 B |

- **~317 B per message**, flat — message cost dominates everything.
- **The brief's ~0.5 KB/moment figure does not apply to an append-only chat.**
  A snapshot is sv + delete-set; with no deletes it is ~10 B raw, ~73 B stored
  (b64 + item overhead). The 0.5 KB came from spike-rewind's delete-heavy
  shape. Corollary: §5's "~180 KB per active hour" estimate is ~25× too high
  *for history* — but see the cursor finding, where deletes bring it roaring
  back.
- **8 MiB crossing: ~26 500 messages**; at 240 msg/hr that is ~91 active
  hours, at 600 msg/hr ~39. A one-summer heavy group chat can get there.
  Growth/active-hour: 22.6 KB @ 60 msg/hr, 90.2 KB @ 240, 208.4 KB @ 600.
- **Deposit traffic**: every deposit is the whole doc — 3.1 MiB at 10 k
  messages, up to 60 PUTs/hr per active device (pocket min-gap 60 s). Worst
  case ~186 MB/hr upload on an active phone at the 10 k-message mark. Delta
  deposits stay parked (M10), but the number is now on record for T-124/T-127.

### 2. The D4 number — the signed-off design is QUADRATIC, not ~90 B or ~590 B

100 throttled body-rewrites of one `room:read` entry (base: 300 entries):
36 B/advance for the text alone; **299 B/advance** with the moment each
advance schedules (history.ts:174-184, confirmed live). But the cost is not
flat — 1 000 advances measured:

| advances | marginal B/advance | snapshot size |
|---|---|---|
| 250 | 669 | 921 B |
| 500 | 1 981 | 1 921 B |
| 750 | 3 314 | 2 921 B |
| 1 000 | 4 647 | 3 921 B |

**Mechanism**: each rewrite tombstones the old body (~36 B, gc:false) and adds
a delete-set range that never merges (the history log's own moment items
interleave with the cursor tombstones in the same client's clock sequence, so
adjacent deleted ranges stay separate — ds grows exactly 4 B/advance, measured
linear over 1 000). Every subsequent moment re-encodes the entire ds. Cost of
advance *n* ≈ 140 + 5.3 n B; cumulative ≈ **2.7 n² B**. 1 000 advances =
2.6 MB; ~2 000 advances blow the entire 8 MiB cap on cursors alone. A lurker
at the 10 s throttle floor produces 360 advances/hr — the cap dies in ~5½
scrolling-hours of room lifetime. **Option (a) as signed off (hold D4 with a
hard throttle) is untenable at any sustained rate.**

### 3. The un-priced third option — append-only cursors are flat

Same 1 000 advances as *fresh* `room:read` entries (newest-wins per seat, the
D2 idiom `room:name` already uses; never delete the old ones — deleting would
reintroduce the ds): **359 B/advance, marginal cost flat, snapshot pinned at
10 B**. Crossover vs body-rewrite is ~40 advances of *room lifetime* — append
wins everywhere real. Still needs a throttle (it spends the same 8 MiB budget
messages use: 29 k advances/yr ≈ 10 MB), so advance on session-end/blur, not
on scroll. At intimate scale (3 seats × ~3 advances/day) ≈ 1.2 MB/yr.
Trade-off: entry count grows by one per advance (render filter + the
entries-getter sort — T-116's windowing already owns that cost).

### 4. Ring at group cardinality (real relay, stock POCKET_K=4)

- **R1 — partitioned**: 5 seats deposit 5 msgs each (disjoint) → relay holds
  4 deposits; the stalest tag (seat 1) is evicted. A cold 6th origin merges
  cleanly, `phase=applied`, and sees **20/25 entries — silent incompleteness**,
  exactly the failure M10 rejected the frame-log for. The joiner does not
  re-deposit (nothing local beyond the pocket → not "ahead").
- **R2 — the brief's mitigation claim is FALSE for survivors**: a surviving
  seat re-opens, merges, holds 20/25 — and does *not* re-deposit, because its
  own state is already covered by the pocket (`#isAheadOf` says no). s1 stays
  lost. "The first merger re-deposits the union" only holds when the merger
  *is* the evicted writer.
- **R3 — only the evicted writer heals the ring**: seat 1 returns with its
  local keepsake, merges to 25/25, deposit-if-ahead fires, and the next cold
  joiner sees 25/25.
- **R4 — converged seats are safe**: after live-style convergence every
  deposit is the union; K=4 eviction loses nothing, cold joiner 25/25.
- Verdict for T-124: **K=4 loses a worldview whenever a 5th+ seat deposits
  before merging**, and no one except the evicted writer can repair it. K must
  exceed plausible concurrent-seat count with headroom; the T-124 sign-off
  should also weigh the two incidental findings below.

### 5. Incidental findings (for T-124 / T-127)

- **The ring tag is per-instance, not per-device** (pocket.ts:154 — random 4
  bytes at PocketClient construction, never persisted). Every reload consumes
  a fresh ring slot: one flappy device can churn K=4 by itself. Cheap fix if
  T-124 wants it: persist the tag beside `spool-author`.
- **12 PUTs/min/IP arithmetic**: 8 seats behind one NAT sustain ≤8 PUTs/min
  (deposit min-gap 60 s each) — fits, but with little headroom for
  flush-on-blur bursts or a second room in the same household.
- The brief's §5 line "~0.5 KB/moment, ~180 KB per active hour" should be
  corrected by T-127: moments are ds-dominated, ~73 B in append-only rooms,
  and arbitrarily large in delete-heavy ones (T-120's edit/delete will feel
  this too — every edit-as-rewrite grows every future moment).

### D4 decision — **ephemeral, awareness-only** (owner, Aug 2026)

Three options went to the owner with the numbers: (a) hold the signed-off
body-rewrite + hard throttle — untenable, quadratic (~2.7·n² B; ~2 000
advances spend the whole 8 MiB cap); (c) append-only `room:read` entries,
newest-wins — flat 359 B/advance, keeps persistence; (b) ephemeral
awareness-only — zero permanent bytes, "seen" dies with the tab.

**The owner chose (b).** D3 is amended: read receipts do not persist; nothing
about reading is ever wound into the doc. D4's mechanism is rejected outright.
Consequences: T-121 becomes an awareness-payload feature (rides T-111/T-112
machinery, still wants T-114's seats for display); T-123's unread divider can
key on a *local* (per-device) last-seen, which needs no shared state at all;
if persisted receipts ever return, the revisit starts from the append-only
idiom, never body-rewrite. Recorded in DESIGN_DOC §5 (M11 mutable-state row,
rewritten) and §6 (chat-scale growth bullet, updated with the measured
numbers).
