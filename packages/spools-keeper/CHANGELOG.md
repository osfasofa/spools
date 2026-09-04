# spools-keeper changelog

## 0.2.0 — unreleased

- `--links <file>`: one keeper holds every spool on a list (one link per line, `# ` comments), one export file per spool beside the list (`--dir <path>` to choose). A bad line is skipped by number; the rest stay kept. Edit the list and restart to change it (T-182).
- The single-link form is unchanged.
- README: the key ring sentence — a keeper holding a list holds every key on it — and the keeper's animal.

## 0.1.1 — 2026-09-03

- README: the memory-only gap — a final deposit refused at shutdown stays out of the pocket until a peer syncs or the keeper restarts from its file (T-178).
- Depends on `spools ^0.2.0` (the SDK's default relay is now `relay.spools.lol`; the keeper honors the link's `relay=` first, as before).

## 0.1.0 — 2026-08-16

- First publish: `npx spools-keeper '<link>'` runs a headless always-on peer — restores from its export file on start, exports debounced-on-idle while running, saves and leaves cleanly on SIGINT/SIGTERM.
- Requires Node ≥ 22 (rides Node's native `WebSocket`; no transport dependency).
