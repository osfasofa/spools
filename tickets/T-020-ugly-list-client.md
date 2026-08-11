---
id: T-020
title: Ugliest possible list client
status: done
milestone: M2
depends: [T-012]
---

## Goal

The ugliest working client: static HTML/JS in `apps/client`, open-or-create a spool, wind text entries, watch them appear in another tab. Zero styling budget — this ticket proves the SDK, not the design.

## Context

DESIGN_DOC Layer 4: pure static files, no build server, no backend. Build-order step 2's success criterion: *two browser tabs winding entries onto the same spool, surviving refresh and offline/reconnect* (the surviving half is T-021's job to torture-test).

Client consumes the SDK via the mechanism chosen in T-001 (see its Notes).

## Tasks

- [x] `index.html` + one JS file: on load, parse `location.hash` — spool link present → `openSpool`, absent → `newSpool` + write the share link into the hash and show it ("send this to a friend").
- [x] Render `spool.entries` as a list (author, body, timestamp). Naive path on purpose: any `entry` event → rerender from `spool.entries`. (The diff payload gets exercised in T-030.)
- [x] Input box → `wind({ kind: 'note', body })`. Author from a bare prompt/localStorage.
- [x] Delete button per entry → `entry.delete()` (with a "show deleted" toggle to prove restore).
- [x] Connection status indicator (`spool.status`).

## Acceptance criteria

- Two tabs, same link: entries wound in either appear in both within ~a second (via fosho's relay).
- Works served from `file://` or any static host — no build step, no server of ours.
- Total client code small enough to read in one sitting (it's demo-as-documentation).

## Notes / open questions

- First real-consumer friction with the SDK API gets recorded here — this ticket is the API's first user test.
- **Vendor mechanism, amended from T-001's note:** the bundle is a classic-script **IIFE** (`window.spools` global), not a `<script type="module">` import — module scripts don't load over `file://` (null-origin CORS), and this ticket's acceptance explicitly includes `file://`. Built by `packages/spools/tsup.client.config.ts` → `apps/client/vendor/spools.js`, one self-contained 538 KB file (esbuild inlines the dynamic y-webrtc import when it can't code-split — no chunks, single copy of Yjs). Root script `client:vendor` runs the build; per the dev-environment note it must be invoked as `mise x -- corepack pnpm exec tsup --config tsup.client.config.ts` from `packages/spools` in shells where bare `pnpm` isn't on PATH.
- **SDK friction #1 (the big one): soft-deleted entries are unreachable through the public API.** `spool.entries` excludes them (correct default) but there's no way to list them or get an `Entry` handle for one, so the ticket's own "show deleted" toggle had to go through the `spool.doc` escape hatch: iterate the raw `entries` Y.Map for `deletedAt != null`, restore via `meta.delete('deletedAt')`. The very first consumer needed this on day one. Candidate surface (needs user sign-off, it's API-shaping): a `spool.entries({ deleted: true })` option or a `spool.deleted` getter returning normal handles (whose `restore()` already exists). → **Landed post-ticket with user sign-off as `spool.deleted`** (DESIGN_DOC §5); the client switched off the escape hatch.
- **SDK friction #2: `author` is fixed at construction** — no way to change it on a live spool, and `WindInput` has no per-entry override. The client's "set name" therefore reloads the page (which doubled as a free refresh/IDB-reload test). Fine for v1; a settings UI in a real client would want author mutable.
- **SDK friction #3: `disableBc` exists on `SpoolEngine` but isn't exposed through `newSpool`/`openSpool`.** Matters for honest testing: two same-origin tabs short-circuit through BroadcastChannel + shared IndexedDB and would "converge" with the network unplugged. The smoke below used **two origins** (`:8765`/`:8766` — separate IDB, no BC) so convergence had to be real network sync. T-021 will want this knob public.
- Browser smoke (Chrome-automated, spool `pearl-parlor-029`, fosho's deployed relay): fresh tab → `newSpool`, share link written into URL; second tab on a *different origin* opened via the full link and received both entries in ≤5 s; entries wound through the UI in each tab appeared in the other within the 2 s polling granularity; soft delete propagated cross-origin; "show deleted" showed the struck row; restore propagated back to both; reload re-rendered everything (IndexedDB before network, per T-010). Author separation fell out of the two origins: separate localStorage → `ada` vs `anonymous`. Note for future smokes: localStorage author is per-origin, so two *same-origin* tabs share a name.
- `file://` verified in headless Chrome over CDP (extension refuses `file://` URLs; `--dump-dom --virtual-time-budget` also useless — virtual time starves IndexedDB, so `whenReady` never resolves and the page looks hung when it isn't): page loads, creates a spool, connects to the relay, winds and renders. Wrinkle: `share()` from `file://` builds a `file:///...`-based link — fragment still parseable, host meaningless; same "no canonical host yet" honesty as T-011's base-default note.
- Client size: 108 lines total (`app.js` 80 + `index.html` 28) — one-sitting readable, as required.
- Author input uses localStorage + an inline field, not `prompt()`: a modal on load blocks both the page and browser automation (the ticket offered either).
