# room

The M11 group-chat client — a Messenger-class room over the `spools` SDK,
built to the design handoff in [`docs/design/room/`](../../docs/design/room/README.md)
(token-driven skin system, four themes, mobile-first). The mechanics follow
[`docs/M11-room-brief.md`](../../docs/M11-room-brief.md): seats + a shared
profile table, reserved `room:*` kinds resolved newest-wins at render, sealed
awareness for presence — all app convention, zero protocol change.

## Run it

```sh
pnpm install        # repo root
cd apps/room
pnpm dev            # local dev server
pnpm build          # tsc + vite → dist/
```

Open with no hash to start a fresh room (the link lands in the URL bar —
that link *is* the room; hand it to people you trust). Open someone's link to
join theirs.

## Deploy

Live at **<https://osfasofa.github.io/spools/room/>** beside the mixtape,
from the orphan `gh-pages` branch. One command from the repo root:

```sh
scratch/deploy-room.sh
```

It rebuilds first (never ship a stale dist), copies `dist/` to
`gh-pages/room/` in a throwaway worktree, and pushes — the push is the
deploy; the mixtape at the branch root is untouched.

## Testing

`scratch/spike-room/room-smoke.mjs` (repo root, after a build) drives the
built app in headless Chrome: three origins on a local relay, real composer
keystrokes, mobile viewport. The T-126 room-torture checklist extends it.
