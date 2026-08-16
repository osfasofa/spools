# spools changelog

## 0.1.0 — 2026-08-16

- The real SDK, matching SPEC v1.1 and SDK-API.md: links/codes, `wind`/entries/events, encryption at rest and over both transports, `rewind`, `export`/stash, the pocket client, `get awareness()`. (0.0.1 was the T-011-era core: links and codes only.)
- Breaking: `yjs` and `y-protocols` are now peer dependencies so your app and the SDK share one Yjs instance. Migration: npm ≥ 7 and pnpm install them automatically; on older tooling, `npm i yjs y-protocols` alongside.
- The surface documented in SDK-API.md is the contract; everything else exported is scaffolding and may move in any 0.x.
