# spools-relay changelog

## 0.2.0 — 2026-08-16

- Behavior defaults changed (T-124, group scale): `POCKET_K` 4 → 8 tags per spool, `POCKET_PUTS_PER_MIN` 12 → 24 per IP. Migration: set the env knobs to the old values if you want them back.
- README now carries the group-scale honesty section (tag-ring eviction beyond 8 isolated writers, the 64-connections-per-room guard) and the canonical relay's promises.
