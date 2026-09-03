---
id: T-176
title: "Off-grid readiness: the secure-context landmines"
status: todo
milestone: M15
depends: []
---
## Goal

A client served over plain http on a LAN can wind, share, and sync — the
off-grid brief's promise, made true in the shipped code.

## Context

`entry.ts` uses `crypto.randomUUID()`, which browsers expose only in secure
contexts (https or localhost). Served from `http://192.168.x.x`, `wind()`
throws on the first message. `navigator.clipboard.writeText` (the copy-link
buttons in the room and mixtape) is secure-context only too; `Notification`
degrades honestly already. `getRandomValues`, IndexedDB, `RTCPeerConnection`,
and `ws://` sockets all work on http. docs/vessels/off-grid.md assumes plain
`ws://` on a LAN is fine — true for the wire, not yet for these two APIs. One
more truth for that brief: an https page (chat.spools.lol) can never open a
`ws://` LAN relay (mixed content), so the off-grid client must be served over
http, as the brief already plans. Review finding F18.

## Tasks

- [ ] SDK: UUID v4 fallback from `getRandomValues` when `randomUUID` is
      missing (tested; the id stays a UUID).
- [ ] Clients: clipboard fallback (select-the-text + `execCommand('copy')`,
      or show the link with a long-press hint when the API is absent).
- [ ] LAN smoke row in `apps/client/TESTING.md`: `npx spools-relay` on one
      laptop, `python3 -m http.server` for `apps/client` on the same laptop, a
      phone on the same Wi-Fi opens `http://<ip>:8000/#spool=…&relay=ws://<ip>:4444/yjs&k=…`.
- [ ] Fold the findings into docs/vessels/off-grid.md §2/§3 (the "plain ws://
      is fine" sentence gets its asterisk).

## Acceptance criteria

- Two devices on one Wi-Fi with no internet converge through the laptop relay;
  copy-link works on both.
