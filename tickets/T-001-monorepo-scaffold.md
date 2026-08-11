---
id: T-001
title: Monorepo scaffold
status: done
milestone: M0
depends: []
---

## Goal

A pnpm-workspaces monorepo with the three named deliverables stubbed, TypeScript strict, tests runnable. No product code — just the skeleton every later ticket lands in.

## Context

Decision logged in DESIGN_DOC §5 (repo shape). fosho has **no** library packaging or test setup to inherit (it's a Vite app with `noEmit`), so this is greenfield tooling. Keep it boring: plain workspaces, no turbo/nx.

## Tasks

- [x] Root: `package.json` (private), `pnpm-workspace.yaml` (`packages/*`, `apps/*`), `.gitignore`, `tsconfig.base.json` (strict, ES2020+, `moduleResolution: bundler` — mirror fosho's `tsconfig` strictness flags).
- [x] `packages/spools` — the SDK. `tsup` build (ESM, `dts: true`), `vitest`, deps: `yjs ^13.6`, `y-websocket ^2.1`, `y-webrtc ^10.3`, `y-indexeddb ^9.0` (versions proven in fosho). One placeholder export + one passing placeholder test.
- [x] `packages/spools-relay` — plain ESM JS (no build step, matching fosho `server/server.js`), deps `ws` + `lib0` only for now. Placeholder `server.js` that starts and answers a health GET.
- [x] `apps/client` — static files, **no build step** (DESIGN_DOC Layer 4: "drop the folder on a USB stick"). Placeholder `index.html`. Decide and note how the client consumes the SDK without a bundler (likely: SDK's ESM bundle copied/symlinked in, or a tiny esbuild script *for the client only* — record choice in Notes).
- [x] Root `README.md` stub: one-paragraph pitch + link map (DESIGN_DOC, docs/SDK-API.md, tickets/INDEX.md).

## Acceptance criteria

- `pnpm install && pnpm -r test && pnpm -r build` all pass from a clean clone.
- `node packages/spools-relay/server.js` starts and serves the health endpoint.
- Opening `apps/client/index.html` from disk shows the placeholder.

## Notes / open questions

- **Client-consumes-SDK mechanism (decided):** copy the SDK's built ESM file into `apps/client/vendor/spools.js` and import it with a relative `<script type="module">` import. No symlinks (breaks USB-stick portability — a copied folder must be self-contained) and no client-side bundler (would violate the no-build-step rule). Implementation detail deferred to T-020: tsup currently externalizes `yjs`/providers, so the client copy will need a second self-contained tsup target (`noExternal`) that inlines dependencies. That's safe here because the client gets Yjs *only* through the SDK bundle, so the single-Yjs-instance invariant holds. Root convenience script for the copy step lands with T-020, when there's something real to copy.
- **Toolchain surprise:** this machine runs Node 20, and current pnpm (11.x) requires Node 22 — activated pnpm 10.15.0 via corepack instead and pinned it in root `package.json` (`packageManager`), so corepack picks the working version everywhere. fosho pins nothing; this repo now does.
- pnpm 10 blocks dependency postinstall scripts by default (`esbuild`, `leveldown` flagged). Everything works without them — esbuild resolves its binary via platform-specific optional deps — so no `approve-builds` needed. `leveldown` is a transitive dep of y-websocket's server half (`y-leveldb`); we never touch it.
- Verified from a clean state: `pnpm install && pnpm -r test && pnpm -r build` pass; relay answers `GET /health` → 200 `ok` (404 elsewhere); `apps/client/index.html` is plain static HTML that renders from `file://`.
