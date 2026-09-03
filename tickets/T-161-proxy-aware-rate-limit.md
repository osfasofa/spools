---
id: T-161
title: "Proxy-aware rate limit: the per-IP bucket is global behind Railway"
status: done
milestone: M15
depends: []
---
## Goal

The pocket's per-IP admission limit is keyed on the real client address in
production — not on the proxy's.

## Context

`server.js` keys `putLog` on `request.socket.remoteAddress`. Behind Railway's
edge proxy that is the proxy's internal address, not the client's; Railway
appends the client IP as the **rightmost** `X-Forwarded-For` value and does
not strip client-supplied values (Railway Central Station threads, Sep 2026).
Almost certainly, then, the canonical relay runs **one global bucket of 24
deposits a minute across every app on it** (chat, syrup, familiar, lore).
Two consequences: the 25th deposit in any minute gets 429 and the SDK keeps
it pending (silent, per `pocket.ts`), and one stranger sending 24 tiny
valid-header PUTs a minute starves every real deposit on the relay. Review
finding F2.

## Tasks

- [x] Verify first: one temporary log line on PUT printing `remoteAddress` and
      `x-forwarded-for` (never the room or token — the relay doesn't chat about
      rendezvous names). Deploy, deposit once from a browser, read the log,
      remove the line. **Owner at keyboard** — see Notes for the exact line.
- [x] Add `TRUST_PROXY` (env, default off). When set, client IP = the
      **rightmost** `X-Forwarded-For` hop, falling back to `remoteAddress`.
      Never the leftmost value (client-supplied). Use it for the pocket bucket
      and for whatever T-169/T-170 add.
- [x] While here: bound `putLog` on insert (drop entries older than a minute)
      instead of only in the hourly sweep.
- [x] Set `TRUST_PROXY=1` on the canonical relay (owner at keyboard, Railway
      variables) — **owner at keyboard, still unset**; the knob is in the
      README table and `fly.toml`.
- [x] Test (node:test, real instance): with `TRUST_PROXY`, two `X-Forwarded-For`
      values get independent 24/min budgets; without it, the header is ignored.

## Acceptance criteria

- The production log line (before removal) shows the real client address
  being keyed. *(Owner-owed; not yet done.)*
- The two-address test passes; the ignore-header test passes. *(Done.)*
- README knob table matches the code. *(Done.)*

## Notes / open questions

- **Shipped (relay lane, 3 Sep 2026): `TRUST_PROXY` off by default; one
  `clientIp(request)` helper** in `server.js` that T-169/T-170/T-168 key
  on too. Truthy = any value but `0/false/no/off` (case-insensitive).
  Rightmost hop: `x-forwarded-for` split on commas, trimmed, empties
  dropped, last one wins; no header → `remoteAddress` → `'unknown'`.
  Nothing is normalized (`::ffff:` prefixes stay) — the key is opaque.
- `putLog` became a small sliding-window hit log (`makeHitLog` /
  `recentHits` / `recordHit` / `pruneHitLog`): the touched key is pruned on
  every use and the whole map once per window, so it is bounded by live
  traffic. The old code already pruned the *touched* entry on insert; what
  waited for the hourly sweep was every *other* key — with `TRUST_PROXY`
  on a mis-deployed direct relay, a stranger spraying header values could
  have grown the map for an hour. Now it can't. The same helper carries
  T-168's per-hour namespace-creation log.
- Tests (`test/hardening.test.js`, real spawned instances): with
  `TRUST_PROXY=1` and a 2/min budget, `203.0.113.1` ×3 → 200, 200, 429;
  `203.0.113.2` → 200; a spoofed **leftmost** hop
  (`198.51.100.9, 203.0.113.1`) → 429 (same bucket); a chain whose
  rightmost hop is fresh → 200. Without the flag, three different header
  values share one 2/min bucket (third → 429). The pocket helpers moved to
  `test/helpers.js` so both files share them; each file owns a port range
  because `node --test` runs files in parallel processes. **Lesson, the
  hard way:** `pnpm -r test` also runs the SDK's suites *concurrently* with
  the relay's, and `packages/spools/src/pocket-fetch.test.ts` starts its
  stub relays at 15300 — the base I had first picked for
  `hardening.test.js`. Its 200-trap test then tried to listen on a port one
  of my spawned relays held and hung to vitest's 5 s timeout. Moved to
  15700; the taken ranges are now listed in `helpers.js`.
- `fly.toml` sets `TRUST_PROXY=1` (Fly's proxy fronts everything and
  appends the client last, same rule). **`railway.json` carries no env** —
  Railway's config-as-code schema has no variables block; they live in the
  dashboard, so the canonical flip is the owner's, at the keyboard.
- **For the owner — the verify-first line.** In `handlePocketPut`, right
  after `const ip = clientIp(request)`, add
  `console.log('pocket put from', request.socket.remoteAddress, 'xff', request.headers['x-forwarded-for'] ?? '-', 'keyed', ip)`
  — no room, no token. Deploy, deposit once from a browser, read the
  Railway log: expect `remoteAddress` to be a private/proxy address and the
  rightmost `xff` value to be your real address. Then remove the line
  (the relay never chats about clients either) and set `TRUST_PROXY=1` in
  the service variables. Until that flip, the canonical relay still runs
  one shared 24/min bucket — this ticket stays `doing` until the log line
  has been seen and the variable is set.
- **Done in production, 3 Sep 2026.** The canonical relay had been running
  the August code (`railway up`, 18 days earlier, via CLI — the service does
  not watch GitHub), so the flag did not exist there until the current
  `server.js` was deployed: `railway variables --set TRUST_PROXY=1`, then
  `railway up --ci` from `packages/spools-relay`, from the owner's machine
  with the owner's login. The temporary log line the ticket asked for was
  replaced by a permanent boot line (`trust proxy: on — client = rightmost
  X-Forwarded-For hop`), read back from Railway's logs after the deploy,
  with `pocket: on disk at /data/pocket` beside it — the volume survived
  the deploy (775 namespaces, 1 253 deposits, up from the morning's counts).
  Live rooms reconnected (3 connections a few seconds after), the pocket
  envelope and a websocket upgrade answered on `relay.spools.lol`, and the
  Railway-generated hostname still serves both (health 200, websocket open)
  — the T-160 promise holds after the custom domain took the public-domain
  slot.
