#!/usr/bin/env bash
# T-115: one-command redeploy of apps/room to GitHub Pages.
#
#   scratch/deploy-room.sh
#
# Builds fresh (T-105's lesson: a stale committed dist shipped once), copies
# apps/room/dist into gh-pages/room/ via a throwaway worktree, pushes. The
# mixtape at the branch root is never touched. Pages redeploys on push — the
# `gh` CLI is read-only on this repo, so the branch push IS the deploy.
#
# Live at: https://osfasofa.github.io/spools/room/
set -euo pipefail
cd "$(dirname "$0")/.."

(cd apps/room && mise x -- corepack pnpm build)

WT="$(mktemp -d)"
cleanup() { git worktree remove --force "$WT" 2>/dev/null || true; }
trap cleanup EXIT

git fetch origin gh-pages
git worktree add --detach "$WT" origin/gh-pages
rm -rf "$WT/room"
cp -R apps/room/dist "$WT/room"
(
  cd "$WT"
  git add -A room
  if git diff --cached --quiet; then
    echo "nothing changed — room/ on gh-pages already matches this build"
  else
    git commit -m "room client deploy $(date +%Y-%m-%d)"
    git push origin HEAD:gh-pages
  fi
)
echo "deployed: https://osfasofa.github.io/spools/room/"
