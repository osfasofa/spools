---
id: T-001
title: Monorepo scaffold
status: todo
milestone: M0
depends: []
---

## Goal

A pnpm-workspaces monorepo with the three named deliverables stubbed, TypeScript strict, tests runnable. No product code — just the skeleton every later ticket lands in.

## Context

Decision logged in DESIGN_DOC §5 (repo shape). fosho has **no** library packaging or test setup to inherit (it's a Vite app with `noEmit`), so this is greenfield tooling. Keep it boring: plain workspaces, no turbo/nx.

## Tasks

- [ ] Root: `package.json` (private), `pnpm-workspace.yaml` (`packages/*`, `apps/*`), `.gitignore`, `tsconfig.base.json` (strict, ES2020+, `moduleResolution: bundler` — mirror fosho's `tsconfig` strictness flags).
- [ ] `packages/spools` — the SDK. `tsup` build (ESM, `dts: true`), `vitest`, deps: `yjs ^13.6`, `y-websocket ^2.1`, `y-webrtc ^10.3`, `y-indexeddb ^9.0` (versions proven in fosho). One placeholder export + one passing placeholder test.
- [ ] `packages/spools-relay` — plain ESM JS (no build step, matching fosho `server/server.js`), deps `ws` + `lib0` only for now. Placeholder `server.js` that starts and answers a health GET.
- [ ] `apps/client` — static files, **no build step** (DESIGN_DOC Layer 4: "drop the folder on a USB stick"). Placeholder `index.html`. Decide and note how the client consumes the SDK without a bundler (likely: SDK's ESM bundle copied/symlinked in, or a tiny esbuild script *for the client only* — record choice in Notes).
- [ ] Root `README.md` stub: one-paragraph pitch + link map (DESIGN_DOC, docs/SDK-API.md, tickets/INDEX.md).

## Acceptance criteria

- `pnpm install && pnpm -r test && pnpm -r build` all pass from a clean clone.
- `node packages/spools-relay/server.js` starts and serves the health endpoint.
- Opening `apps/client/index.html` from disk shows the placeholder.

## Notes / open questions

- Client-consumes-SDK mechanism: record the choice here once made.
