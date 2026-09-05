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
5. **`leave()` before the open-time check settles** *(added 4 Sep 2026,
   from T-182's wall)*. The deposit scheduler arms only when the pocket's
   GET has answered; a wind before that set nothing dirty, and `flush()`
   returned early when unarmed. A client that opens, winds, and leaves
   inside the GET's round trip deposits nothing — silently.

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
- [x] Browser demonstration of the unload case (`scratch/repro-t178/unload.html`
      + `read.mjs`) — and the `pagehide` hook it turned out to need.
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

### Mechanism 5 — found by the wall (4 Sep 2026, SDK lane)

T-182's first real run minted a keyed spool from a script: `newSpool`,
`wind`, wait for `status === 'connected'`, `share()`, `leave()`. The entry
never reached the pocket; the keeper that opened the spool a minute later
saw nothing, and a laptop client the next morning saw `before=0`. Yet
T-183's first stamped line from the same spool read
`pocket: applied (8 deposits)` — the pocket was working. S1 said "leave()
inside the debounce is OK". The difference: S1 awaited `settled()` first;
the mint script left as soon as the *socket* said connected, which on the
canonical relay is faster than the pocket's GET.

Reading `pocket.ts`: `#armed` is set only at the end of `start()`;
`#onTransaction` returned early when unarmed, so `#dirty` never went true;
`#flushNow` returned early on `!this.#armed`. Three lines, one silent loss.

| scenario | wound | pocket | verdict (before) | verdict (after) |
|---|---|---|---|---|
| S5 leave() before the pocket check settles | 1 | 0 → 1 | **SILENT LOSS** — `leave()` 2 ms, phase `checking` | **OK** |

**The fix (this commit):** winds are remembered (`#dirty`) even before the
scheduler is armed; a flush that finds the check unsettled waits for it —
`Promise.race([started, bounded(settleWaitMs)])`, default 3 s — so the
deposit carries the pocket's state too; past the bound it deposits what it
has (a partial deposit beats none; the ring risk of a thin deposit evicting
a fuller one is why the wait comes first). At settle, the state-vector
check decides `#dirty`, not the flag — another device may already have
deposited those winds. If the check settled to `unavailable`, no blind PUT.
A check aborted by teardown no longer reports `unavailable` after the fact.

Two tests: the real relay (settles on its own; `leave()` < 2 s; one
deposit) and a stub whose GET never answers (`settleWaitMs: 100`;
`leave()` ≈ 100 ms; one PUT; phase honestly still `checking`). All 118 SDK
tests green; the repro's other seven scenarios unchanged.

Why the vessels didn't name this one: syrup's builders and manyhands'
swarm both open-wind-leave fast against the canonical relay, whose GET
round trip is tens to hundreds of ms — exactly the window. Some of the
"0–4 of 80" was probably this, not the 429.

Not done here, noted: the deposit PUT carries no abort signal, so a relay
that black-holes TCP could hold `leave()` open past the bound. Pre-existing;
the GET has one. A follow-on if it ever bites.

### The browser demonstration — and what it found (4 Sep 2026)

`scratch/repro-t178/unload.html`, served from `scratch/` with
`python3 -m http.server`, importing the smoke bundle; a local relay on
127.0.0.1:15900; Chrome driven from this session; `read.mjs` opens the link
cold afterwards and counts. `#auto=1&link=…` is the deterministic variant:
the page opens a pre-minted keyed link, waits for the pocket check to
settle (mechanism 5 out of the picture), winds once, and navigates away
**in the same tick** — nothing but an unload flush riding `keepalive` can
carry that wind.

| run | bundle | what happened | deposit |
|---|---|---|---|
| A: wind, close by hand ~7 s later | before | landed — but the relay showed the deposit *before* the close: the terminal covering Chrome's window had made the tab `hidden`, and that `visibilitychange` flushed it | landed, not by unload |
| B: same-tick navigate away | before | **lost.** connections 1 → 0, deposits unchanged, cold read 0 | **lost** |
| C: same-tick navigate away | after | **landed.** deposits 3 → 4, cold read 1: "wound in a tab, closed inside the debounce" | landed |

The page reported `document.visibilityState === 'hidden'` from its first
line — Chrome's automation tab group lives in an unfocused window. So in run
B no `visibilitychange` could ever fire, and `visibilitychange` was the
SDK's *only* unload hook. `pagehide` is the unload signal proper: every
navigation away, every close, whether or not the tab was ever visible.
The SDK now listens for both (`pageTarget()` resolves the window; a test
stands one in on `globalThis`). One new unit test: a hidden-from-birth
document, a wind, a dispatched `pagehide`, one PUT.

Honest sizing of the gap: a person can't wind in a tab they can't see, so
the realistic hit is dirty state left over from a failed hidden-flush (a
429 that re-armed, a network blip) and then a close with no second
`visibilitychange`. Narrow — but the demo hit it on the first try, and the
fix is two listeners.

`keepalive` itself is now shown, not argued: run C's fetch was issued
during `pagehide` of a page that was gone before the response.

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
- One thing to watch: of eleven root-level `pnpm -r test` runs this session
  (the three packages test concurrently), exactly one showed a single SDK
  test failing, and the name was not captured; the same tree then passed
  ten root runs and three package-level runs in a row. Treated as a load
  flake in one of the real-relay tests (the relay-restart one is the usual
  suspect), not a regression — but if it recurs, capture the name.
- Landed in commit `824431d` (filled in by the wrap-up commit).
- Mechanism 5 landed 4 Sep 2026 (the commit after this line was written);
  SDK version → 0.2.1, **unreleased**. The `pagehide` hook and the browser
  demonstration landed the same afternoon, one commit later.

### Remaining

- ~~Browser demonstration of mechanism 2~~ — done (runs A–C above); the
  acceptance criterion's "under context close" half is shown.
- ~~Sign-off on the surface~~ — **decided 5 Sep 2026: the state field
  alone.** `leave()` stays `Promise<void>`; read `spool.pocket.depositError`
  after `await leave()`. A `leave()` value would only ever describe the
  leave-time flush and would layer on top, not replace — it waits for a
  vessel to ask.
- Tell syrup and manyhands (owner) — and pass on the ring point:
  verify-and-retry cannot beat `POCKET_K`.

### Note for syrup and manyhands (draft, 4 Sep 2026 — owner to send)

> `spools@0.2.1` (when it's on the registry) closes the pocket losses you
> each worked around. Three things changed, all in the SDK, nothing in your
> code needed except deleting the workaround:
>
> 1. **A 429 on the way out is retried and then named.** `leave()` tries
>    three times inside ~5 s; if the relay still refuses, `spool.pocket`
>    reads `depositError: 'rate-limited'` after `await leave()`. It never
>    goes quiet. (syrup's "solar moons vanished twice"; some of manyhands'
>    0–4 of 80.)
> 2. **Winding right after open and leaving at once no longer loses the
>    wind.** The scheduler used to arm only after the pocket's GET answered;
>    a fast open-wind-leave deposited nothing. Now the flush waits for that
>    check (≤ 3 s) and deposits regardless. (Probably the rest of the
>    0–4 of 80, and any builder that leaves inside the GET's round trip.)
> 3. **Unload flushes ride `pagehide` as well as `visibilitychange`**, with
>    `keepalive` on deposits ≤ 64 KiB — a tab or headless context that was
>    never visible still deposits on close.
>
> Still true, and not a bug: a process that exits without `await leave()`
> deposits nothing — `persist: false` has nothing to heal from. And
> manyhands: verify-and-retry can't beat the ring. `POCKET_K` is 8 per
> spool; 80 isolated writers will always lose ~72 deposits' worth to
> eviction, by design. Fewer isolated writers, or let them meet in the room,
> is the only fix.
>
> Drop the fresh-context-per-room and verify-and-retry workarounds once
> you're on 0.2.1; if anything still vanishes, the ticket is T-178 in
> `osfasofa/spools` and I want the repro.

The ticket stays `doing` until the note is sent (after 0.2.1 is on the registry).
