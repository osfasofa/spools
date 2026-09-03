---
id: T-167
title: "Static hosting: leave Vercel, fix the gh-pages 404 — sign-off, owner at keyboard"
status: todo
milestone: M15
depends: [T-160]
---
## Goal

The room and mixtape are hosted somewhere free, and every URL the docs cite
returns 200.

## Context

`chat.spools.lol` is a CNAME to Vercel; the team is on the **Pro** plan; the
deploy is prebuilt static (`scratch/deploy-room.sh`) and needs nothing Vercel
sells. The `gh-pages` branch still holds the mixtape at root and the room
under `/room/`, but both URLs 404 today — Pages was most likely disabled
around the "take lore off the public site" commit. README, WHITEPAPER, and the
M11 brief all cite those URLs as live (review finding F10). The
`osfasofa/spools-chat` repo the deploy script once named was never created;
the Vercel project `spools-chat` is, oddly, linked to the `lore` repo (harmless
— deploys are CLI-prebuilt).

The relay is **not** part of this ticket: it needs an always-on process with a
disk, which Vercel doesn't sell (its June 2026 WebSocket beta pins
connections to a function instance for at most 5–30 minutes and doesn't route
a room's members to the same instance; the relay's rooms are in-memory
fan-out). Railway stays; see docs/M15-ship-review.md §hosting.

## Options (owner decides)

- **A. GitHub Pages + custom domain.** Free. The deploy script already pushes
  `gh-pages`; add a `CNAME` file; DNS `chat → osfasofa.github.io`. Costs: no
  response headers (T-171's CSP becomes a `<meta>` tag with no
  `frame-ancestors`); the room lives at `/room/` unless the branch is
  restructured (room at root, mixtape under `/mixtape/`).
- **B. Cloudflare Pages.** Free; a `_headers` file gives T-171 real headers.
  One more provider on the bill of accounts, if not the bill of money.
- **C. Stay on Vercel, downgrade to Hobby.** Free if nothing on the team is
  commercial (Hobby's terms). Keeps `vercel.json` headers. The deciding
  question is whether any *other* project on the team needs Pro.

Recommendation: A or C. The relay hostname (T-160) lands first so this
ticket never touches links.

## Tasks

- [ ] Owner picks; record the call here.
- [ ] Re-enable Pages (A), or move (B), or downgrade (C); DNS as needed.
- [ ] `deploy-room.sh`: keep the target that survives, delete the other half.
- [ ] Fix or drop the three doc citations of `osfasofa.github.io/spools/…`.
- [ ] If leaving Vercel: delete the `spools-chat` project.

## Acceptance criteria

- `chat.spools.lol` serves the current build from the chosen host.
- Every URL in README, WHITEPAPER, and docs/M11-room-brief.md returns 200.
