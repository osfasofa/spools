---
id: T-181
title: "npm release: SDK 0.2.0, relay 0.3.0, keeper 0.1.1 — owner at keyboard"
status: done
milestone: M15
depends: [T-160]
---

## Goal

What's on npm matches what's true again. Today it doesn't: `spools@0.1.0`
on the registry still defaults to the Railway hostname and lacks the room-full
event, the rate-limited deposit error, and the uuid fallback; `spools-relay@0.2.0`
predates `TRUST_PROXY`, the broadcast guards, and the eviction order that its
README on npm will describe; the keeper README on npm lacks the T-178 sentence.
RELEASING.md's one rule — release when npm would otherwise lie — is met.

## Context

Everything up to the publish command is prepped on `main` (versions bumped,
CHANGELOG headings dated, the SDK README's status line, RELEASING.md's
second-execution note). **Owner at the keyboard for `pnpm publish` ×3** —
npm 2FA with the hardware key (T-002/T-130 precedent). Version calls
recorded here per RELEASING.md's rule (default/behavior changes → the minor
lane); the owner may lower the SDK to 0.1.1 by editing one line before
publishing.

## The liturgy (T-130's, with its lessons applied)

From a clean checkout of `main` at the prep commit:

```sh
cd ~/Dev/OSFA/spools && git pull --ff-only && git status --short   # clean
mise x -- corepack pnpm install
cd packages/spools-relay && mise x -- corepack pnpm publish         # 1. relay
cd ../spools           && mise x -- corepack pnpm publish         # 2. SDK (builds + tests first)
cd ../spools-keeper    && mise x -- corepack pnpm publish         # 3. keeper (workspace:^ → ^0.2.0 at pack time)
```

- `pnpm publish`, never bare `npm publish` — npm would ship the keeper's
  `workspace:^` verbatim (T-130 surprise).
- A `404 Not Found - PUT` from the registry means *not logged in*: run
  `npm login` (security key) and retry (T-130 wall #2).
- If a guard fails with `pnpm: command not found`, the guards already call
  `npm run build` / `npm test`; a one-time `corepack enable` also fixes it.
- Order matters: relay → SDK → keeper; the keeper's dependency range needs
  `spools@0.2.0` on the registry before it lands.

Then:

```sh
npm view spools version && npm view spools-relay version && npm view spools-keeper version
git tag spools@0.2.0 spools-relay@0.3.0 spools-keeper@0.1.1 && git push --tags
```

## Tasks

- [x] Versions, CHANGELOG headings, README status line, RELEASING note (prep, 3 Sep 2026).
- [x] `pnpm pack` dry-run ×3 eyeballed; keeper tarball's dependency rewritten to `^0.2.0` (see Notes).
- [x] Fresh-dir tarball smoke: the SDK from its tarball mints a `relay.spools.lol` link in Node 24 (see Notes).
- [x] **Publish ×3, owner at keyboard.**
- [x] `npm view` sanity ×3; tags pushed; this ticket and INDEX record the shipped versions.

## Acceptance criteria

- `npm view spools version` → `0.2.0`, `spools-relay` → `0.3.0`, `spools-keeper` → `0.1.1`; a clean `npm i spools` mints links naming `relay.spools.lol`.

## Notes / open questions

- **Prep, 3 Sep 2026 (headless):** `pnpm pack` ×3 eyeballed — SDK ships
  `dist/` + LICENSE + README only; relay ships `server.js`, `railway.json`,
  `fly.toml`, LICENSE, README; the keeper tarball's dependency reads
  `"spools": "^0.2.0"` (pnpm's rewrite of `workspace:^`, so the keeper must
  publish after the SDK). Fresh-dir smoke under Node 24: `npm i` of the SDK
  tarball into an empty project (peers auto-installed), `newSpool({ persist:
  false })` minted `…&relay=wss%3A%2F%2Frelay.spools.lol%2Fyjs&k=…`. Only the
  publish itself remains — hardware key.
- **Shipped, 3 Sep 2026, owner at keyboard:** `spools-relay@0.3.0`
  (11:42 UTC), `spools@0.2.0`, `spools-keeper@0.1.1`, in that order; all
  three verified on the registry from a second machine. The registry's
  `spools@0.2.0` tarball defaults to `wss://relay.spools.lol/yjs` (checked by
  reading `dist/index.js` out of the downloaded tarball), and a fresh
  `npm i spools-keeper@0.1.1` into an empty project resolved `spools@0.2.0`
  — the publish order held. Tags `spools@0.2.0`, `spools-relay@0.3.0`,
  `spools-keeper@0.1.1` pushed at the prep commit. The one wall was T-130's
  second one again: an expired npm session shows as `404 Not Found - PUT`;
  `npm login` fixed it, and the browser-QR step ran once per package.
- Lab note, for honesty: the tags landed a few minutes *after* the "done"
  commit above, not with it — one `git tag` call given three names creates
  nothing ("too many arguments"), and the script's `set -e` didn't stop on
  it. Re-done one tag per command at the prep commit `d44d2ce` and verified
  with `git ls-remote --tags`. The keeper install check also ran once before
  the registry had propagated 0.1.1 (about fifteen seconds); the re-run,
  exit code checked, resolved `spools@0.2.0` via `spools-keeper@0.1.1`.
