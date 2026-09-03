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

- [x] SDK: UUID v4 fallback from `getRandomValues` when `randomUUID` is
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

## Notes / open questions

### Landed — the SDK half (3 Sep 2026, SDK lane)

- `entry.ts` mints ids through a small `uuid()` helper: the native
  `crypto.randomUUID` when the context has it, otherwise 16 bytes from
  `getRandomValues` with the version (`0x40`) and variant (`0x80`) nibbles
  set — a well-formed RFC 4122 v4 id either way, so nothing downstream
  (sort tie-breaks, `entry:<id>` body keys, exports) can tell the two apart.
  Tested in `entry.test.ts` with the `crypto` global stubbed down to
  `{ getRandomValues }`: 1000 ids, all v4-shaped, all distinct, and `wind()`
  — the call that threw — works; a second test pins that the native path is
  still preferred when it exists.
- Swept the rest of the SDK for other secure-context APIs: none.
  `getRandomValues` (keys, nonces, the pocket tag), IndexedDB,
  `BroadcastChannel`, `ws://`, `RTCPeerConnection`, and `fetch` to an http
  origin all work on a plain-http page; `crypto.subtle` is never used
  (tweetnacl does the sealing). The pocket's `fetch` to `http://<laptop>`
  from an `http://` page is same-scheme, so no mixed-content wall there
  either.
- Outside the SDK lane, for whoever runs the LAN smoke row:
  `apps/client/vendor/spools.js` is a vendored SDK build and still carries
  the bare `crypto.randomUUID()` — run `pnpm client:vendor` (root script) so
  the static client picks the fallback up before it is served over http.
- Landed in commit `TBD-T176` (hash filled in by the session's wrap-up
  commit; it cannot be known from inside the commit itself).

### Remaining — room lane and owner

- Clipboard fallback for the room and mixtape copy-link buttons (room lane).
- The LAN smoke row in `apps/client/TESTING.md` and the two-devices,
  no-internet acceptance run (owner, hardware).
- Folding the asterisk into docs/vessels/off-grid.md §2/§3.

The ticket stays `doing` until those report.
