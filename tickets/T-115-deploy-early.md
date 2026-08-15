---
id: T-115
title: "Deploy early"
status: todo
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

- [ ] Build and publish `apps/room/dist` to `gh-pages/room/`; mixtape stays at
      the root, untouched.
- [ ] Verify from a phone on cellular against `DEFAULT_RELAY`.
- [ ] A `scratch/` redeploy script (build → copy → push) so later tickets
      redeploy in one command; note it in the app README.

## Acceptance criteria

- The room loads on a phone at its public URL, converges with a laptop on the
  same link, and the mixtape's URL still works exactly as before.

## Notes / open questions

-
