---
id: T-090
title: Mixtape client — the nice one (Vite + React)
status: done
milestone: M9
depends: [T-080]
---

## Goal

A dedicated, genuinely nice mixtape app on the published SDK: the thing you'd
actually hand someone. `apps/client` stays the deliberately-plain reference;
this is the vessel with taste. First real proof that a polished client is
"a skin over the SDK," not a rebuild.

## Context

- DESIGN_DOC §3 Layer 4: mixtape trading is the first vessel — "I made you a
  spool" needs no onboarding. The reference client proved mechanics (three
  views, torture-tested); this ticket spends its budget entirely on feel.
- Stack decision (user, 2026-08-12): Vite + React, in `apps/mixtape`,
  consuming `spools` as a workspace dependency. Static build output — the
  hosting story stays "copy the folder to any URL."

## Tasks

- [x] Scaffold `apps/mixtape` (Vite + React + TS, `base: './'` so the build
  serves from any path).
- [x] `useSpool` hook: open-from-hash / new, entries via `on('entry')`,
  status, undecryptable warning.
- [x] The design: cassette aesthetic done tastefully — warm paper, ink, an
  actual cassette (SVG, reels animate while connected), tracks as the
  tape's spine, liner notes, reactions, add-track form.
- [x] Share flow: link in the URL bar + copy button ("hand them the tape").
- [x] Rewind: scrubber over `spool.history`, memory mode visually distinct,
  same track renderer over frozen snapshots (skins over data, again).
- [x] Smoke: production build served statically, two browser origins
  converge through a local relay (CDP, like prior scratch checks).

## Acceptance criteria

- `pnpm build` in `apps/mixtape` emits a static `dist/` that works served
  from a plain file server over the deployed relay.
- Two devices converge on a tape; add-track, reactions, rewind, and share
  all work in the polished UI.
- It looks like something you'd be pleased to text to one person.

## Notes / open questions

- **The SDK held up as "the product"**: the entire app is one `useSpool` hook (~50 lines: open-from-hash/new, rerender-from-getter on `on('entry')` — the naive-client path that can never drift) plus components. No SDK changes were needed or wanted.
- **Design**: warm paper + ink, one SVG cassette — reels animate only while `status === 'connected'` (the sync state made physical), status LED in the label, the tape's *name* is the stash label written directly on the cassette (persists per device, syncs nothing — a label is your handwriting, not the tape's content). Track list as the spine; add-track form styled as the inlay card; reactions fade in on hover.
- **Rewind** reuses the exact same `TrackList` over frozen `EntrySnapshot`s via a structural `Rec` interface — live `Entry` handles and snapshots satisfy it identically, so views-are-skins held for the third time, now in React. Memory mode: amber scrubber bar, sepia contents, `onReact`/add-track simply not passed.
- **Two React integration bugs found by the smoke check, both classics**: (1) reading `ev.currentTarget.value` *inside* a `setState` updater — `currentTarget` is nulled after dispatch, so the second keystroke crashed the tree; read the value before updating. (2) moments accrue ~2 s after writes with no entry event, so a render-time `spool.history` read goes stale — the rewind button reads history fresh at click time instead (the vanilla reference client never hit this because it always read imperatively; declarative UIs surface the SDK's non-evented surfaces. If a second client hits this, `on('moment')` becomes SDK-API-worthy — parked until then).
- **Smoke** (`scratch/mixtape-t090/check.mjs`): production `dist/` served statically from two origins as two devices, local `spools-relay` between them — fresh tape, wind through the real form (native-setter typing so React sees it), convergence, cross-device reaction, LED state, rewind in/out, zero page errors. 8/8. Screenshots reviewed for the design call.
- Hosting story confirmed by construction: `vite build` with `base: './'` → `dist/` is three static files; copy to any URL.
