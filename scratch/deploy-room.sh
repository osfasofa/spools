#!/usr/bin/env bash
# T-115: one-command redeploy of apps/room to GitHub Pages.
#
#   scratch/deploy-room.sh
#
# Builds fresh (T-105's lesson: a stale committed dist shipped once), then:
#  1. copies apps/room/dist into gh-pages/room/ of THIS repo via a throwaway
#     worktree (the mixtape at the branch root is never touched), and
#  2. hands the finished dist to Vercel (project spools-chat, linked via
#     apps/room/.vercel) behind chat.spools.lol — prebuilt static, no remote
#     build, so the pnpm workspace never matters to the host.
#
# Live at: https://osfasofa.github.io/spools/room/  and  https://chat.spools.lol/
set -euo pipefail
cd "$(dirname "$0")/.."

CHAT_DOMAIN="${CHAT_DOMAIN:-chat.spools.lol}"

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

# ---- the pretty domain (chat.spools.lol → Vercel, prebuilt static) ----
# The project link lives in apps/room/.vercel (untracked); Vercel never
# builds anything — we hand it the finished dist, so the pnpm workspace
# stays our problem, not theirs.
if [ -f apps/room/.vercel/project.json ]; then
  TD="$(mktemp -d)"
  cp -R apps/room/dist/. "$TD/"
  cp -R apps/room/.vercel "$TD/.vercel"
  mise x -- vercel deploy --cwd "$TD" --prod --yes >/dev/null 2>&1 \
    && echo "deployed: https://$CHAT_DOMAIN/ (vercel: spools-chat)" \
    || echo "WARN: vercel deploy failed — run: mise x -- vercel deploy --cwd apps/room/dist --prod"
  rm -rf "$TD"
else
  echo "note: apps/room/.vercel/project.json missing — vercel deploy skipped (run vercel link)"
fi
