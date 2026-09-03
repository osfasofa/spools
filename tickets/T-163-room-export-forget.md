---
id: T-163
title: "Export and forget in the room"
status: done
milestone: M15
depends: []
---
## Goal

The flagship client honors DESIGN_DOC §1: *export, archive, and delete are
first-class.* Today it has neither export nor a local delete.

## Context

Settings has name, theme, people, notifications, link, fine print. The SDK
already has `spool.export()` and `stash.forget()` (rejects while the database
is open — `leave()` first). The stash docstring says the one hard delete is
owed confirm-twice ceremony. Review finding F8.

## Tasks

- [x] Settings → "keepsake" section. **"export this room"** downloads
      `<code>.spool.json` (Blob + anchor download; note iOS Safari's share
      sheet behavior in Notes when tested).
- [x] **"forget this room on this device"**: confirm twice (second step types
      the room code), then `leave()` → `stash.forget(code)` → clear the
      room-local keys (`room-seen:<code>`; never `spool-seat`) → navigate to
      the bare URL. Copy: *"gone from this device only — everyone else keeps
      their copy, and the relay's pocket keeps sealed copies for up to 60 days."*
- [x] Fine print gains the permanence sentence: *"what you put here is kept by
      everyone in the room, for as long as they keep it."*
- [x] Smoke: export round-trips through `importSpool`; forget removes the
      IndexedDB database and the stash row.

## Acceptance criteria

- Both buttons work on desktop and on the owner's phone (add a row to
  `apps/room/TESTING.md` H-list).
- The exported file passes `parseExport` and reopens with all entries.

## Notes / open questions

- **Desktop half done, headless-verified; the phone half is the owner's**
  (`apps/room/TESTING.md` H6). iOS Safari's handling of a blob `download`
  (share sheet vs. preview tab) is untested here — note it on H6 when run.
- **Lifetime check, as asked.** `useRoom` owns the spool, but a page
  navigation never unmounts React, so its cleanup `leave()` never runs on the
  forget path; and `Spool.leave()` is idempotent end to end anyway — the
  engine has a `#left` guard, and the history/pocket/store `flush`/`destroy`
  calls above it are re-entrant (timers nulled, `doc.off` twice is harmless,
  the pocket flush is `.catch(() => {})`). App calls `spool.leave()` itself,
  then forgets, then navigates; a second `leave()` anywhere would be a no-op.
- **`deleteDatabase` can report `blocked` for a beat after `close()`** — the
  closing connection hasn't fully gone when the delete request arrives, and
  the stash rejects on `blocked` rather than waiting. The app retries
  `stash.forget` up to six times, 250 ms apart, before calling it what it
  otherwise means: the room is open in another tab on this device. That case
  gets its own sentence ("still open in another tab … close it and try again")
  and a "reopen the room" button; nothing was deleted. In the headless run
  the first attempt succeeded.
- **The bare URL keeps the relay when it isn't the default** (`useRoom`
  now honors `#relay=…` with no `spool=`): forgetting a room on a
  self-hosted relay lands you in a fresh room on *that* relay, not the
  canonical one — the canonical relay is the default, never a redirect. Two
  wins: a self-hoster is never quietly moved, and the smoke suite's forget
  path never touches production (its rooms live on a local relay; the
  scenario asserts the fresh room's link still names it). T-164 uses the
  same convention.
- **Export verification runs in plain Node**: the smoke imports the built
  SDK and calls `importSpool(text, { persist: false })` on the captured file
  — which is the ticket's real promise (the file opens where no browser and
  no relay exist) — and checks entry + deleted counts and the message bodies
  match the live room, the filename is `<code>.spool.json`, and the key is
  absent from the file. `parseExport` is what `importSpool` runs first, so
  the AC's "passes parseExport" is covered by the round trip without
  exposing an internal on `window`.
- The export caption says the key is never in the file (SDK-API: "say so in
  UI"). Room-local keys cleared: only `room-seen:<code>`; `room-theme`,
  `room-muted`, `room-hide-explained`, recents and the name-prompt flag are
  device-level and stay; `spool-seat` is never touched (asserted).
- Verified: build green; headless Chrome smoke 16/16 with the new scenario
  (export → Node import → forget → fresh room on the local relay → old link
  reopens from B / the pocket).
