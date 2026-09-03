---
id: T-166
title: "Self-host the font — zero third-party requests from the room"
status: done
milestone: M15
depends: []
---
## Goal

A room page load contacts nothing but its own origin and the link's relay.

## Context

`apps/room/index.html` loads JetBrains Mono from `fonts.googleapis.com` with
preconnects to `fonts.gstatic.com`: every load sends the visitor's IP to
Google. ECOSYSTEM's constitution #6 says nothing phones home, and a Munich
court (2022) held that remote Google Fonts without consent violates GDPR.
Review finding F9. T-171's CSP wants `font-src 'self'`.

## Tasks

- [x] Vendor JetBrains Mono woff2 (400/500/700; OFL — include the licence
      file) into `apps/room/public/fonts/`; `@font-face` in `styles.css`;
      remove the `<link>` and preconnect tags.
- [x] Check the mixtape and reference client for the same pattern; fix if
      present.
- [x] Build and grep `dist/` for `googleapis|gstatic` → none.

## Acceptance criteria

- DevTools network panel on a fresh room load shows only the page origin and
  the relay (plus T-175's STUN question, tracked there).

## Notes / open questions

- **Source:** `JetBrainsMono-2.304.zip` from the official release
  (github.com/JetBrains/JetBrainsMono, tag v2.304, the current "latest"
  on 3 Sep 2026); `fonts/webfonts/JetBrainsMono-{Regular,Medium,Bold}.woff2`
  (92 164 / 93 824 / 94 588 bytes) and `OFL.txt` copied verbatim into
  `apps/room/public/fonts/`. ~280 KB added to the room's static payload,
  loaded lazily by weight with `font-display: swap`.
- **Relative base holds.** `styles.css` references `url('/fonts/…')`; with
  `base: './'` Vite rewrites that in the built CSS to `../fonts/…` relative
  to `assets/`, so the gh-pages subdirectory, chat.spools.lol at root, and a
  USB stick all resolve it. Verified in `dist/assets/*.css`.
- **The mixtape and the reference client never had the pattern** — no
  `googleapis`/`gstatic` anywhere under `apps/mixtape` or `apps/client`; the
  mixtape's mono stack is `ui-monospace, 'SF Mono', Menlo, …`. Nothing to fix.
- **Acceptance, made repeatable instead of a DevTools screenshot:** smoke
  scenario 18 opens a fresh room with CDP `Network` capture on and asserts
  every request is the page origin or the relay (http for the pocket, ws for
  sync), that the woff2 faces load from `./fonts/`, and that nothing names
  googleapis/gstatic. STUN is UDP and never a request — T-175's question,
  untouched here. `grep -r "googleapis\|gstatic" apps/room/dist
  apps/mixtape/dist` finds nothing after a build.
- T-171's `font-src 'self'` is now true of the room.
