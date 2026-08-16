#!/usr/bin/env bash
# T-115: one-command redeploy of apps/room to GitHub Pages.
#
#   scratch/deploy-room.sh
#
# Builds fresh (T-105's lesson: a stale committed dist shipped once), then:
#  1. copies apps/room/dist into gh-pages/room/ of THIS repo via a throwaway
#     worktree (the mixtape at the branch root is never touched), and
#  2. force-pushes dist + CNAME to the dedicated public artifact repo behind
#     chat.spools.lol (CHAT_REPO overrides the default; skipped gracefully
#     until that repo exists). Artifact history is worthless — force is fine.
#
# Live at: https://osfasofa.github.io/spools/room/  and  https://chat.spools.lol/
set -euo pipefail
cd "$(dirname "$0")/.."

CHAT_REPO="${CHAT_REPO:-https://github.com/osfasofa/chat.git}"
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

# ---- the pretty-domain artifact repo (room at ROOT, CNAME shipped) ----
if git ls-remote "$CHAT_REPO" >/dev/null 2>&1; then
  TD="$(mktemp -d)"
  cp -R apps/room/dist/. "$TD/"
  printf '%s\n' "$CHAT_DOMAIN" > "$TD/CNAME"   # must ship every deploy or Pages forgets the domain
  touch "$TD/.nojekyll"
  git -C "$TD" init -q -b gh-pages
  git -C "$TD" add -A
  git -C "$TD" -c user.name="$(git config user.name)" -c user.email="$(git config user.email)" \
    commit -qm "room client deploy $(date +%Y-%m-%d)"
  git -C "$TD" push -qf "$CHAT_REPO" gh-pages
  rm -rf "$TD"
  echo "deployed: https://$CHAT_DOMAIN/"
else
  echo "note: $CHAT_REPO not reachable yet — chat.spools.lol deploy skipped (create the repo, then re-run)"
fi
