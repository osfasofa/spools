---
id: T-166
title: "Self-host the font — zero third-party requests from the room"
status: todo
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

- [ ] Vendor JetBrains Mono woff2 (400/500/700; OFL — include the licence
      file) into `apps/room/public/fonts/`; `@font-face` in `styles.css`;
      remove the `<link>` and preconnect tags.
- [ ] Check the mixtape and reference client for the same pattern; fix if
      present.
- [ ] Build and grep `dist/` for `googleapis|gstatic` → none.

## Acceptance criteria

- DevTools network panel on a fresh room load shows only the page origin and
  the relay (plus T-175's STUN question, tracked there).
