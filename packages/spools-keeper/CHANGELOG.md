# spools-keeper changelog

## 0.1.1 — 2026-09-03

- README: the memory-only gap — a final deposit refused at shutdown stays out of the pocket until a peer syncs or the keeper restarts from its file (T-178).
- Depends on `spools ^0.2.0` (the SDK's default relay is now `relay.spools.lol`; the keeper honors the link's `relay=` first, as before).

## 0.1.0 — 2026-08-16

- First publish: `npx spools-keeper '<link>'` runs a headless always-on peer — restores from its export file on start, exports debounced-on-idle while running, saves and leaves cleanly on SIGINT/SIGTERM.
- Requires Node ≥ 22 (rides Node's native `WebSocket`; no transport dependency).
