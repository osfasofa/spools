---
id: T-041
title: npx spools-relay + deploy button + honesty clause
status: todo
milestone: M4
depends: [T-040]
---

## Goal

**If spinning up a relay takes longer than making coffee, the self-hosting promise has failed** (DESIGN_DOC Layer 3). This ticket is that promise: `npx spools-relay` and a one-click deploy.

## Context

- fosho's `server/railway.json` (NIXPACKS, `startCommand`, healthcheck `/`) is the deploy config template.
- The README honesty clause is pre-written in DESIGN_DOC Layer 3 — adapt, don't re-argue: pure zero-server P2P discovery doesn't exist on the modern internet; "no central server" means precisely *"no server that ever sees your content."*

## Tasks

- [ ] Package `spools-relay` for npx: `bin` entry, `engines.node >= 18`, no build step, starts on `npx spools-relay` with sane defaults + `--port`.
- [ ] Railway deploy button (template repo or config) and/or Fly `fly.toml` — at least one one-click path, tested end-to-end from a clean account.
- [ ] Deploy the canonical relay; flip the SDK's default-relay constant off fosho's (T-011 note) — fosho dependency ends here.
- [ ] Relay README: what it is (two jobs, no third), the honesty clause, resource expectations (tiny), how to point links at your relay (`&relay=`), what the operator can and cannot see (room codes + traffic volume; never content, never keys).
- [ ] Publish `spools-relay` to npm (name claimed in T-002).

## Acceptance criteria

- Stopwatch test: clean machine → `npx spools-relay` → reference client syncing through it, under coffee-brewing time (~4 min).
- One-click deploy produces a working public relay; a spool link naming it syncs two devices on different networks.
- SDK default relay is ours; nothing points at fosho anymore.

## Notes / open questions

- Canonical relay hosting/domain choice (ties to T-002 domain findings).
