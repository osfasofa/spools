# Spool — session guide

Spool is a protocol + SDK (`spools`) + relay (`spools-relay`) + static reference client for intimate, local-first, P2P shared documents ("spools") built on Yjs. Extracted from fosho.io, whose source lives at `../fosho.io` — tickets cite exact file/line references there.

## Read first, every session

1. `tickets/INDEX.md` — the working roadmap; pick the top unblocked `todo`.
2. `DESIGN_DOC.md` — philosophy (§1, stable), vocabulary (§2), architecture (§3), **decisions log (§5)**, parked questions (§6).
3. `docs/SDK-API.md` — the SDK surface we're building toward (design note, not spec; the spec is written last, from working code).

## Rules

- **Don't relitigate §5 decisions without new evidence.** If code teaches us something that genuinely contradicts a decision, surface it to the user with the evidence — never silently deviate.
- Any new protocol-shaping decision needs the user's sign-off before it happens, and then a row in DESIGN_DOC §5 (choice + why). The user prefers trade-off depth before deciding: what each option costs, what it bakes in, what stays flexible.
- The philosophy section (§1) is not negotiable in code. When in doubt: smaller, more boring, fewer spec sentences.
- Scope discipline: resist re-adding what was deliberately stripped from fosho (identity, permissions, subdocs, addressing) until a real client demands it.

## Ticket workflow

- One ticket at a time. Set `status: doing` in the ticket's frontmatter **and** in `tickets/INDEX.md` when starting; `done` in both when its acceptance criteria are demonstrably met.
- Record anything learned (surprises, deviations, verdicts) in the ticket's **Notes** section — tickets double as the lab notebook.
- Commit per ticket (or per coherent chunk within one). Conventional, plain messages.
- T-002 (npm publish, org/domain claims) requires the user at the keyboard for auth — prompt them, don't attempt it headless.

## Dev environment

- Node 24 is pinned via `mise.toml`; non-interactive shells may not pick it up — prefix commands with `mise x --` if `node --version` shows the wrong version.
- pnpm 11 is pinned via `packageManager` and runs through corepack. If bare `pnpm` isn't on PATH, use `mise x -- corepack pnpm …` (run package scripts from inside the package dir; `corepack pnpm -r <script>` from the root works, but the root `pnpm run` wrapper scripts don't in that setup).
- Browser smoke tests: build a self-contained bundle with `tsup --config tsup.smoke.config.ts` (in `packages/spools`), serve the `scratch/smoke-*/` dir with `python3 -m http.server`, drive with the Chrome tools. ES modules don't load over `file://`.

## Layout

- `packages/spools` — the SDK (TypeScript strict, tsup, vitest). The actual product.
- `packages/spools-relay` — plain ESM JS, no build step, aggressively boring.
- `apps/client` — pure static files, **no build step** (must work from a USB stick).
- `docs/` — design notes. `tickets/` — the roadmap. `DESIGN_DOC.md` — source of truth until code earns revisions.
- `.claude/skills/` — what a session *outside* this repo needs: `spool-vessel` (an app in the lane), `spool-fork` (a fork of purpose beside it). Prose to copy, never code to import.
