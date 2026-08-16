---
id: T-151
title: "apps/lore scaffold — static shell, vendored SDK, reel plumbing"
status: todo
milestone: M14
depends: [T-150]
---

## Goal

The vessel's bones: a no-build static app that opens or creates a reel spool, shows the machine chrome (header, transport bar, four empty tracks), and hands out the link — the `apps/client` pattern wearing the room's token system.

## Tasks

- [ ] `apps/lore/index.html` + `style.css` + classic scripts (`app.js` first; more split out as tickets land) + `vendor/spools.js` (same IIFE artifact as `apps/client/vendor` — one Yjs instance, one file).
- [ ] Token system verbatim from the room (8 properties + radius), with the lore-native **field** skin as default (near-black, TE-orange `#FF6A2B` accent) and blackout/terminal/daylight/paper as alternates.
- [ ] Spool plumbing: hash link → `openSpool`, none → `newSpool` (encrypted, default relay), `share()` into the URL bar + copy control, status dot, pocket beat line (the T-104 sentence).
- [ ] Seat identity (`spool-seat`, the room's convention copied as prose), author from `spool-author`.
- [ ] Mobile shell: `100dvh`, safe-area insets, ≥44 px targets, Pointer Events only.

## Acceptance criteria

- Served with `python3 -m http.server`: opening the page creates a reel, the URL becomes the share link, refresh reopens the same reel, a second tab on the link syncs status/entries.
- No build step: the folder deploys as-is (Vercel/Pages/USB stick).

## Notes / open questions

-
