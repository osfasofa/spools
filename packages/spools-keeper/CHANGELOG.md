# spools-keeper changelog

## 0.1.0 — 2026-08-16

- First publish: `npx spools-keeper '<link>'` runs a headless always-on peer — restores from its export file on start, exports debounced-on-idle while running, saves and leaves cleanly on SIGINT/SIGTERM.
- Requires Node ≥ 22 (rides Node's native `WebSocket`; no transport dependency).
