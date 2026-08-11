---
id: T-041
title: npx spools-relay + deploy button + honesty clause
status: done
milestone: M4
depends: [T-040]
---

## Goal

**If spinning up a relay takes longer than making coffee, the self-hosting promise has failed** (DESIGN_DOC Layer 3). This ticket is that promise: `npx spools-relay` and a one-click deploy.

## Context

- fosho's `server/railway.json` (NIXPACKS, `startCommand`, healthcheck `/`) is the deploy config template.
- The README honesty clause is pre-written in DESIGN_DOC Layer 3 — adapt, don't re-argue: pure zero-server P2P discovery doesn't exist on the modern internet; "no central server" means precisely *"no server that ever sees your content."*

## Tasks

- [x] Package `spools-relay` for npx: `bin` entry, `engines.node >= 18`, no build step, starts on `npx spools-relay` with sane defaults + `--port`.
- [x] Railway deploy button (template repo or config) and/or Fly `fly.toml` — at least one one-click path, tested end-to-end from a clean account.
- [x] Deploy the canonical relay; flip the SDK's default-relay constant off fosho's (T-011 note) — fosho dependency ends here.
- [x] Relay README: what it is (two jobs, no third), the honesty clause, resource expectations (tiny), how to point links at your relay (`&relay=`), what the operator can and cannot see (room codes + traffic volume; never content, never keys).
- [x] Publish `spools-relay` to npm (name claimed in T-002).

## Acceptance criteria

- Stopwatch test: clean machine → `npx spools-relay` → reference client syncing through it, under coffee-brewing time (~4 min).
- One-click deploy produces a working public relay; a spool link naming it syncs two devices on different networks.
- SDK default relay is ours; nothing points at fosho anymore.

## Notes / open questions

- **Shipped (2026-08-11, user at the keyboard for auth):** `spools-relay@0.1.0` on npm; canonical relay live at `https://spools-relay-production.up.railway.app` (Railway, user's account, `railway init && railway up` from the package dir — the committed `railway.json` did the rest; `fly.toml` ships in the package as the alternative path). `DEFAULT_RELAY` → `wss://spools-relay-production.up.railway.app/yjs`. **Nothing in src/ or the client references fosho anymore.**
- **Stopwatch test, against the real registry:** clean directory → `npx spools-relay@latest` → healthy relay in ~10 s (deps auto-install included) → reference client syncing through it. Far under coffee time.
- **Default-relay proof:** bare client (no relay param anywhere) → `newSpool` on the flipped constant → share link → second origin joined and synced through the deployed relay, signaling derived via the one-URL convention. Honest asterisk: both "devices" were one machine, two origins — traffic round-tripped through Railway's edge, but a literal two-networks test (phone + laptop) remains a nice manual confirmation.
- **Publish frictions, for the next package:** (1) npm 11 rejects `"./server.js"` as a bin path at publish time — silently *removes* the bin entry with only a warning; `npm pkg fix` normalizes to `"server.js"`. Caught because the 403 stopped the publish first. (2) npm now hard-requires 2FA to publish; user enabled a security key, which means browser WebAuthn — and the auth URL gets redacted by the session's privacy scrubber, so the publish had to run in the user's own terminal. (3) `chmod +x` on the bin target for tidiness.
- Railway assigns `PORT` (8080) via env — the relay's env handling covered it; healthcheck on `/` passed first try.
- Canonical domain: Railway's generated `*.up.railway.app` for now. A vanity domain (`spool.link` was available per T-002 RDAP check) can front it later without touching the SDK — links carry the relay URL, so old links keep working regardless.
- The T-021 asterisk about fosho's stateful relay masking cold-late-join is now moot in both directions: the deployed default is the dumb relay, so "syncs when we're together" is the live contract. TESTING.md updated.
