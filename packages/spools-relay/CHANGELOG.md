# spools-relay changelog

## 0.3.0 — 2026-09-03

- `TRUST_PROXY` (default off): behind an edge proxy, per-IP limits key on the rightmost `X-Forwarded-For` hop instead of the proxy's own address (T-161). Migration: set `TRUST_PROXY=1` on Railway/Fly deployments, or the pocket's per-IP budget stays one bucket for everyone.
- The pocket's rate log is pruned on every use, not just at the hourly sweep (T-161).
- `fly.toml` now sets `TRUST_PROXY=1`.
- Backpressure on the broadcast path (T-170): a member with more than `RELAY_MAX_BUFFERED_BYTES` (64 MiB) queued for it is skipped and closed with 1008 "slow consumer" instead of buffering without bound.
- Per-connection frame budget (T-170): over `RELAY_MAX_FRAMES_PER_SEC` (300) or `RELAY_MAX_BYTES_PER_MIN` (128 MiB) → closed with 1008 "frame budget exceeded"; the room keeps going for everyone else. 0 disables any of the three.
- `RELAY_CONNS_PER_IP_PER_ROOM` (default 0 = off; enable with `TRUST_PROXY`): per-address cap inside a room, over it → 1013 "too many connections from this address" (T-169, relay half).
- Pocket eviction order (T-168): under `POCKET_MAX_TOTAL_BYTES`, namespaces nobody ever collected go first, then the stalest. Disk mode keeps the read count in a `.reads` sidecar beside the deposits, restored at boot — touch-on-read now survives a restart too.
- `POCKET_NEW_NAMESPACES_PER_HOUR` (default 0 = off; per address, enable with `TRUST_PROXY`) and `POCKET_FIRST_MAX_BYTES` (default = `POCKET_MAX_BYTES`, i.e. no change; canonical value pending sign-off) (T-168).

## 0.2.0 — 2026-08-16

- Behavior defaults changed (T-124, group scale): `POCKET_K` 4 → 8 tags per spool, `POCKET_PUTS_PER_MIN` 12 → 24 per IP. Migration: set the env knobs to the old values if you want them back.
- README now carries the group-scale honesty section (tag-ring eviction beyond 8 isolated writers, the 64-connections-per-room guard) and the canonical relay's promises.
