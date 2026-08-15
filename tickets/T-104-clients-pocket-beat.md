---
id: T-104
title: "Clients: the pocket beat"
status: todo
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

(filled during work)
