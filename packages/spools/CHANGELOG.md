# spools changelog

## 0.3.0 — unreleased

- `spool.splice(records)`: write complete entry records — `id`, `author`, `kind`, `createdAt`, `parent?`, `data?`, `deletedAt?`, `body` (the `EntrySnapshot` shape `rewind()` hands out) — into a spool exactly as given, in one transaction. Idempotent: an id already present is skipped, so a re-run changes no byte. Refuses the whole batch before any write when a record's `parent` is neither in the batch nor in the spool (`SpoolSpliceError`, with `.id` and `.rule`) — a dangling parent in a fresh spool would render as "not synced yet", a lie. Policy-free: what crosses, what's flattened, and the new key are the caller's. The one primitive under the cut (a new reel from here on), the fork, and the rejoin, which are recipes in SDK-API. `wind()` is untouched (T-186; the gate review is T-180, the brief `docs/M16-splice-brief.md`).
- `entry.snapshot()`: the entry as a plain frozen `EntrySnapshot` — `keep.map((e) => e.snapshot())` is the whole selection step of a cut. `export()` is built on it now; its output is unchanged.

## 0.2.1 — 2026-09-05

- A wind made before the pocket's open-time check settles is no longer lost when `leave()` comes first: the flush waits for the check (up to ~3 s, `settleWaitMs` for tests) so the deposit carries the pocket's state too, and past the bound deposits what it has. Found by the keeper's first real run; the fifth T-178 mechanism.
- A pocket check aborted by `leave()` no longer reports `unavailable` after teardown; `checking` stays the last word.
- The unload flush also listens for `pagehide`: a tab that was never visible (opened in a background window) gets no `visibilitychange`, and its last winds were lost on close. Demonstrated in a real browser against a local relay; the deposit lands now (T-178).
- A peer alone in a room keeps its websocket. y-websocket closes any socket that has received no message in 30 s, and a dumb relay never answers a lone peer's resync — so a solo client (a keeper on a wall, a tab left open on a quiet spool) reconnected every ~33 s, all night (T-183 counted 5,326). The SDK now refreshes the provider's last-message clock every 10 s while the socket is open. A dead relay is still noticed from the other end: its ping/pong terminate closes the socket and the client reconnects as before. No change to anything a caller sees except the `status` flicker stopping (T-184).

## 0.2.0 — 2026-09-03

- `DEFAULT_RELAY` is now `wss://relay.spools.lol/yjs` — a hostname the project owns (T-160). Links minted against the old default (`spools-relay-production.up.railway.app`) keep working: that hostname stays enabled on the same service indefinitely. Migration: none; links carry their own `relay=`.

- `wind()` mints ids without `crypto.randomUUID`: a page served over plain http (a LAN relay, the off-grid kit) has only `getRandomValues`, and ids stay RFC 4122 v4 either way (T-176).
- `leave()` retries a rate-limited (429) final deposit three times inside ~5 s and, failing that, says so: `PocketState.depositError` gains `'rate-limited'`, which clears on the next accepted deposit. A scheduled deposit that meets a 429 re-arms after the min-gap on its own (T-178).
- Deposits sealing to ≤ 64 KiB go out with `keepalive: true`, so a flush started by `visibilitychange` outlives its tab (T-178).
- Docs name the `persist: false` gap: memory-only clients have no deposit-if-ahead heal, so `await leave()` and read `depositError` (T-178).
- A relay closing with 1013 ("room full") no longer spins: the SDK stands back ~30 s between attempts, `spool.roomFull` says why, `on('full', reason)` fires on each refusal, and `status` reads `offline` meanwhile (T-169).

## 0.1.0 — 2026-08-16

- The real SDK, matching SPEC v1.1 and SDK-API.md: links/codes, `wind`/entries/events, encryption at rest and over both transports, `rewind`, `export`/stash, the pocket client, `get awareness()`. (0.0.1 was the T-011-era core: links and codes only.)
- Breaking: `yjs` and `y-protocols` are now peer dependencies so your app and the SDK share one Yjs instance. Migration: npm ≥ 7 and pnpm install them automatically; on older tooling, `npm i yjs y-protocols` alongside.
- The surface documented in SDK-API.md is the contract; everything else exported is scaffolding and may move in any 0.x.
