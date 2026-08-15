---
id: T-115
title: "Deploy early"
status: done
milestone: M11
depends: [T-113]
---

## Goal

`apps/room` is live on GitHub Pages the moment the scaffold works — because a
phone can't run `pnpm dev` against your laptop, and deploying early converts
every later ticket into a real multi-device test for free. (T-105 learned this
by needing to invent a deploy at the very end; M11 front-loads it.)

## Context

The mixtape ships from the orphan `gh-pages` branch at
<https://osfasofa.github.io/spools/>. Add the room beside it (subdirectory on
the same branch — `base: './'` already tolerates any path). T-105 Notes hold
the platform gotchas: rebuild before deploying (a stale committed dist shipped
once), and the `gh` CLI here is read-only on this repo (push the branch; don't
rely on the Pages API).

## Tasks

- [x] Build and publish `apps/room/dist` to `gh-pages/room/`; mixtape stays at
      the root, untouched.
- [ ] Verify from a phone on cellular against `DEFAULT_RELAY` — **owner at
      keyboard** (see Notes; everything automatable is verified).
- [x] A `scratch/` redeploy script (build → copy → push) so later tickets
      redeploy in one command; note it in the app README.

## Acceptance criteria

- The room loads on a phone at its public URL, converges with a laptop on the
  same link, and the mixtape's URL still works exactly as before.

## Notes / open questions

- Live: **<https://osfasofa.github.io/spools/room/>** (gh-pages commit
  `ccf0437`, fresh build). The mixtape root still answers 200 and its files
  are untouched — the deploy only adds `room/`.
- Redeploy is one command from the repo root: **`scratch/deploy-room.sh`**
  (rebuild → throwaway worktree on origin/gh-pages → copy dist → push; noted
  in `apps/room/README.md`). The push is the deploy — `gh` is read-only on
  this repo (T-105), so no Pages API.
- Verified headlessly against production: two SEPARATE Chrome profiles (two
  user-data-dirs — same-origin tabs would fake convergence over
  BroadcastChannel, brief §4) on the public URL, fresh room
  `minor-river-807` on `DEFAULT_RELAY`, messages converge both ways with
  `status === 'connected'`.
- **Remaining for the owner**: open the URL on a phone on cellular, join a
  laptop's link, see it converge — the automated check above proves the
  deployment and relay path, not the cellular network path. Every ticket
  from here on is a real multi-device test for free.
