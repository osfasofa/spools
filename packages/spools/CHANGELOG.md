# spools changelog

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
