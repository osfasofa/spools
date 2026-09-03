---
id: T-178
title: "Pocket deposits can be lost at leave — evidence from syrup and manyhands"
status: doing
milestone: M16
depends: [T-161]
---

## Goal

A deposit never fails silently. Where loss is physics, the SDK says so;
where it is a race or a swallowed error, it stops happening.

## Context

Two vessels found it independently and neither filed it (ECOSYSTEM's rule 7
says friction flows back as evidence — this ticket is that filing):

- **syrup**, `HANDOFF.md` §5 (Sep 2026): *"a spool lives in the pocket only
  after `leave()` flushes … Headless builders that close without leave()
  produce rooms that come back EMPTY. Worse: a profile revisiting a room it
  created can fail to deposit NEW winds (solar moons vanished twice)."* Its
  workaround: furnish rooms from fresh browser contexts, one room per
  context.
- **familiar / manyhands**, evidence #8 (Aug 2026): across N=80 swarm runs,
  *"deposit loss, not settle timing"* — 0–4 of 80 lost per run; fixed
  downstream by verifying deposits landed and retrying.

Reading `pocket.ts` and `server.js`, four candidate mechanisms — the repro
should tell them apart:

1. **429 on leave, swallowed.** A rate-limited PUT sets `dirty` and waits
   for the min-gap, but `leave()` destroys the client right after
   `flush()`, so the final deposit is lost with no `depositError` (429
   isn't one). The canonical relay's per-IP bucket is effectively global
   behind Railway (T-161), so swarms and test suites are exactly the
   high-rate case that trips it.
2. **Unload without keepalive.** The `visibilitychange` flush is a plain
   `fetch`; a tab or headless context closing mid-PUT cancels it.
   `keepalive: true` survives unload for bodies ≤ 64 KiB, which covers most
   intimate spools.
3. **`persist: false` has no heal path.** Deposit-if-ahead on the next open
   repairs a lost deposit for persisted spools (IndexedDB still holds the
   winds) — never for memory-only clients: syrup's satchel and peeks,
   headless builders, the keeper before its first export.
4. **The ring, by design.** More than `POCKET_K` isolated writers outrun the
   ring (documented in the relay README). N=80 may be partly this; the
   repro must separate it from 1–3.

## Tasks

- [x] Repro harness (`scratch/`): persist:false writer winds and leaves
      within the debounce; same under a forced 429 (a relay with
      `POCKET_PUTS_PER_MIN=1`); same with the context closed mid-PUT
      (the headless analog — the browser half is owed, see Notes).
- [x] On `leave()`, retry a 429'd final deposit with backoff inside a
      bounded wait (proposal: 3 tries within ~5 s), and surface the outcome
      — `depositError: 'rate-limited'` on the pocket state, or a value
      resolved by `leave()`; **sign-off** on which (the status union stays
      closed; this is additive either way). *Shipped the state field; the
      sign-off on the alternative is still the owner's — see Notes.*
- [x] `keepalive: true` on the flush PUT when the sealed blob is ≤ 64 KiB.
- [x] Docs: SDK-API pocket section and the keeper README name the
      persist:false gap plainly.
- [ ] Tell syrup and manyhands to drop their workarounds once shipped.

## Acceptance criteria

- The harness shows zero loss under 429 and under context close for small
  spools, and a named error where loss remains.

## Notes / open questions

### Repro — `scratch/repro-t178/repro.mjs` (3 Sep 2026, SDK lane)

Plain Node, no dependencies beyond the SDK's own `dist/`; spawns the
workspace relay on 127.0.0.1 (never the canonical one), runs one scenario
per candidate mechanism with `persist: false` writers, then opens the link
cold in a fresh Spool and counts what the pocket gives back. `--slow` adds
S2b (about 65 s more: it waits for the relay's 60 s rate window to nearly
roll over so the retry can cross it).

**Before the fix** (`dist/` built at 03bf0ec):

| scenario | wound | pocket | verdict |
|---|---|---|---|
| S1 leave() inside the debounce | 1 | 1 | OK — the T-103 flush works |
| S2 429 at leave (`POCKET_PUTS_PER_MIN=1`) | 2 | 1 | **SILENT LOSS** — `leave()` returned in 4 ms, no `depositError` |
| S2b same, but the window frees 3 s later | 2 | 1 | **SILENT LOSS** — 8 ms; nothing waited |
| S3a child process awaits leave() (control) | 1 | 1 | OK |
| S3b child exits without leave() | 1 | 0 | PHYSICS |
| S3c child exits as the flush PUT starts | 1 | 0 | PHYSICS |
| S3d child exits 20 ms into the flush PUT | 1 | 1 | OK — the body was out; the relay stores on request end |
| S4 three isolated writers, `POCKET_K=2` | 3 | 2 | BY DESIGN — the ring |

**After** (this commit): S2 → **NAMED** (`depositError: 'rate-limited'`;
`leave()` took 3018 ms — tries at +0, +1 s, +3 s); S2b → **OK, zero loss**
(`leave()` 3015 ms; the third try crossed the 60 s line and was admitted).
Everything else unchanged, as it should be.

Mechanism verdicts:

1. **429 at leave, swallowed — reproduced, fixed.** This is syrup's "solar
   moons vanished twice" and manyhands' 0–4 of 80: with the per-IP bucket
   effectively global behind Railway (T-161), a swarm's leave-time PUTs are
   exactly the burst that trips it, and the old `flush()` returned on the
   first 429 with nothing said.
2. **Unload without keepalive — browser-only; not reproducible headlessly.**
   Node has no page lifecycle: a process that dies takes its sockets with
   it whether or not `keepalive` is set (S3c), and one whose bytes already
   left lands regardless (S3d). What `keepalive` buys is browser-specific —
   browsers cancel in-flight fetches at unload even after the body went
   out, unless the request is keepalive. The SDK now sets it for sealed
   blobs ≤ 64 KiB (unit-tested: present for a small deposit, absent for a
   > 64 KiB one, because browsers *reject* the option above that). A real
   browser demonstration is still owed: a page on the smoke bundle that
   opens a keyed spool against a local relay, winds once, and is closed
   inside the 10 s debounce; then `repro.mjs`'s cold reader (or
   `scratch/verify-t105/verify.mjs read`) counts. Not run this session.
3. **`persist: false` has no heal — confirmed by construction (S3b, S3c).**
   Named in SDK-API and the keeper README. One nuance found while writing
   the keeper sentence: a keeper restarting from its export file *does*
   heal — `importSpool` applies the file before the pocket fetch settles,
   so deposit-if-ahead re-deposits it.
4. **The ring — reproduced and separated (S4).** Three writers that never
   meet (engines without a websocket, pocket only) put three tags into a
   ring of two; the cold reader sees two. Not an SDK error and not
   detectable client-side; the relay README already says so. manyhands'
   N=80 is at least partly this — 80 headless seats is 10× `POCKET_K` — and
   their verify-and-retry workaround masks the ring as much as the 429.

### What shipped (SDK)

- `flush()` — `leave()`'s and the hidden tab's — retries a 429 with
  backoff: default 2 retries, waits of 1 s then 2 s, so three tries inside
  ~3 s plus RTTs (the ticket's "3 tries within ~5 s"). Knobs
  `flushRetries` / `flushBackoffMs` on `PocketTuning` (tests only). Then
  `depositError: 'rate-limited'`, delivered through the normal `pocket`
  event before teardown and readable from `spool.pocket` after
  `await leave()`.
- **Surface choice — the owner's sign-off is still open.** Shipped the
  additive state field, not a value resolved by `leave()`: `leave():
  Promise<void>` stays as documented, the same field covers the hidden-tab
  flush (which has no caller to resolve to), and every client already
  renders `depositError`. The owner may prefer `leave()` resolving
  something like `{ deposited: boolean }` — that would be additive too and
  can layer on top; the field would stay either way.
- `'rate-limited'` is the first *transient* `depositError`: unlike
  `'too-big'` / `'budget'` it does not stop the scheduler, and the next
  accepted deposit clears it (tested through the hidden-tab flush).
- A scheduled deposit that meets a 429 now re-arms itself after the min-gap
  (60 s — the same width as the relay's budget window) instead of waiting
  for the next local change. Small, deliberate behavior change: a quiet
  spool used to stay undeposited until the user typed again or left.
- Concurrent flushes coalesce: a hidden-tab flush mid-retry and a `leave()`
  share one retry loop rather than doubling the PUTs.
- `keepalive: true` on every deposit PUT whose sealed blob is ≤ 64 KiB
  (`KEEPALIVE_MAX_BYTES`), not only the flush — a scheduled PUT that
  outlives a closing tab is strictly better. Node's fetch (undici) accepts
  the option at any size (probed: 10 KiB, 64 KiB, 100 KiB all 200), so the
  test environment tolerates it.
- Not retried, on purpose: network errors (an unreachable relay will not be
  back in 3 s, and an offline `leave()` should stay fast) and 5xx.
- `leave()` may now take ~3 s under a persistent rate limit. Apps that
  `await leave()` on a user gesture should expect that; apps that call it
  at unload were never getting the wait anyway.
- Tests (pocket-deposit.test.ts, +4): 429-429-200 lands with backoff
  (≥ 60 ms with the 20 ms knob); 429 forever → three tries, then named,
  `leave()` resolves; the hidden-tab flush names then heals on the
  scheduler's own re-arm; keepalive present for a small deposit and absent
  for a > 64 KiB one against the real relay.
- The ticket depends on T-161 (relay lane); nothing here needed it — the
  SDK's behavior is the same whether the bucket is per-IP or global, only
  how often it trips changes.
- Landed in commit `TBD-T178` (filled in by the wrap-up commit).

### Remaining

- Browser demonstration of mechanism 2 (above) — then the acceptance
  criterion's "under context close" half is shown, not argued.
- Sign-off on the surface (state field vs. a `leave()` value).
- Tell syrup and manyhands (owner) — and pass on the ring point:
  verify-and-retry cannot beat `POCKET_K`.

The ticket stays `doing` until those report.
