# spools-relay changelog

## Unreleased

- `TRUST_PROXY` (default off): behind an edge proxy, per-IP limits key on the rightmost `X-Forwarded-For` hop instead of the proxy's own address (T-161). Migration: set `TRUST_PROXY=1` on Railway/Fly deployments, or the pocket's per-IP budget stays one bucket for everyone.
- The pocket's rate log is pruned on every use, not just at the hourly sweep (T-161).
- `fly.toml` now sets `TRUST_PROXY=1`.

## 0.2.0 — 2026-08-16

- Behavior defaults changed (T-124, group scale): `POCKET_K` 4 → 8 tags per spool, `POCKET_PUTS_PER_MIN` 12 → 24 per IP. Migration: set the env knobs to the old values if you want them back.
- README now carries the group-scale honesty section (tag-ring eviction beyond 8 isolated writers, the 64-connections-per-room guard) and the canonical relay's promises.
