---
id: T-176
title: "Off-grid readiness: the secure-context landmines"
status: doing
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
- [x] Clients: clipboard fallback (select-the-text + `execCommand('copy')`,
      or show the link with a long-press hint when the API is absent).
      — room + mixtape done (see Notes); `apps/client` is not this lane's.
- [ ] LAN smoke row in `apps/client/TESTING.md`: `npx spools-relay` on one
      laptop, `python3 -m http.server` for `apps/client` on the same laptop, a
      phone on the same Wi-Fi opens `http://<ip>:8000/#spool=…&relay=ws://<ip>:4444/yjs&k=…`.
- [ ] Fold the findings into docs/vessels/off-grid.md §2/§3 (the "plain ws://
      is fine" sentence gets its asterisk).

## Acceptance criteria

- Two devices on one Wi-Fi with no internet converge through the laptop relay;
  copy-link works on both.

## Notes / open questions

- **Clipboard half shipped (room + mixtape); the ticket stays `doing`** for
  the SDK's UUID fallback (another lane), the LAN smoke row in
  `apps/client/TESTING.md` and the off-grid brief's asterisk (owner / docs),
  and the real two-device Wi-Fi acceptance (owner at keyboard).
- `copyText(text): Promise<boolean>` — `apps/room/src/clipboard.ts` and the
  same file in `apps/mixtape/src` (apps copy prose, they don't import each
  other). Order: `navigator.clipboard.writeText`, called synchronously
  inside the gesture (Safari refuses a clipboard write after an `await`);
  on absence or rejection, a readonly off-screen 16 px textarea +
  `document.execCommand('copy')` (no iOS keyboard, no auto-zoom; focus is
  handed back so a copy never steals the composer); else `false`. Every
  copy site uses it: the room's invite button, the Settings copy button,
  T-164's start-a-new-room, the mixtape's "hand this tape to someone".
- When both paths fail the link is shown in place — wrapping, `user-select:
  all`, pre-selected via a Range in Settings — under "copy didn't work here
  — long-press or select the link to copy it." (the room's feed notice also
  carries T-165's sentence). Nothing throws; nothing silently no-ops.
- **What headless proved and what it can't:** `http://localhost` is a secure
  context, so Chrome exposes the API there. Smoke scenario 20 therefore
  stands in for the LAN: it deletes `navigator.clipboard` before the app
  loads and drives `execCommand` to true then false, asserting the
  "copied ✓" path, that `execCommand('copy')` was the path taken, focus
  restoration, and the shown-and-selected link. The mixtape is
  build-verified (tsc + vite) with identical helper code; it has no headless
  suite in this repo. The real `http://192.168.x.x` phone check is the
  owner's acceptance row.
- Also true, for the brief: `crypto.getRandomValues` (the seat, T-164's key)
  works on http; only `randomUUID` (the SDK half) and the clipboard were the
  landmines in these clients.
- Clipboard half landed in commit `fa7a02d` (room + mixtape). Open: the SDK
  UUID fallback (SDK lane), the `apps/client` LAN row + off-grid brief
  asterisk, and the two-device Wi-Fi acceptance (owner) — the ticket stays
  `doing` for those.
