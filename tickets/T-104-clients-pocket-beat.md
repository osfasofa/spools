---
id: T-104
title: "Clients: the pocket beat"
status: done
milestone: M10
depends: [T-102]
---

## Goal

Prove the "zero client changes" claim, then spend the one small change worth making: a "checking the pocket…" beat so the midnight open *feels* like arrival, not absence.

## Context

Fetched deposits fire ordinary `entry` diff events, so both clients (`apps/client`, the T-090 mixtape client) should render midnight state with no changes — verify that first, unmodified. Then wire `on('pocket')` into a transient status beat (`checking` → gone on `applied`/`empty`; a quiet "relay doesn't hold copies" note on `unavailable`). Torture checklist lives in `apps/client/TESTING.md` (T-021).

## Tasks

- [ ] Unmodified-client check: midnight-fetched entries render in both clients with zero diffs (record it — this is the §5 event-contract decision paying rent).
- [ ] The beat, in both clients, static-files constraint intact (no build step in `apps/client`).
- [ ] TESTING.md gains the midnight torture row: writer deposits + goes offline → fresh profile/device opens → full spool, beat visible, then live sync still works when the writer returns.

## Acceptance criteria

- TESTING.md midnight row passes by hand in both clients against a local T-101 relay.
- `apps/client` still works from a USB stick.

## Notes / open questions

- **The zero-change claim held exactly.** Neither client's renderers changed a line — midnight-fetched entries arrive through the ordinary `entry` diff events (§5 event-contract decision paying rent, as predicted). The only additions are narration: a `#pocket` span + `showPocket` in the static client, a `pocket` field in `useSpool` + three conditional lines in the mixtape App.
- Beat behavior in both clients: `checking` shows while the fetch is in flight; `applied` flashes "N sealed copies from the pocket" (+ dropped count) and fades after 4 s; `empty`/`unavailable` stay silent — a v1 relay must *feel* like v1; `depositError` is the one persistent line ("too big"/"relay full" → live-only, said out loud).
- Vendor bundle rebuilt (`pnpm run client:vendor`, 654 KB, pocket included); mixtape `tsc --noEmit && vite build` green.
- **The torture row is automated in a real browser**: `scratch/torture-t104/midnight.mjs`, same zero-dep CDP idiom as the T-021/T-051 harnesses (Tab class copied). 3/3: midnight cold-open from deposits alone (fresh origin, empty room, `leave()`-flushed deposit), old relay in vivo (silent `unavailable`, winding fine), empty pocket (silent). Results table added to TESTING.md.
- Harness gotcha for containerized runs: Chromium as root needs `--no-sandbox --disable-dev-shm-usage`; the harness defaults `CHROME_BIN` to the Playwright chromium path with env override.
- `visibilitychange` flush remains manual-only (headless CDP can't fake it faithfully) — it's in scenario 7's manual steps for a human pass.
