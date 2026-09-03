---
id: T-163
title: "Export and forget in the room"
status: todo
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

- [ ] Settings → "keepsake" section. **"export this room"** downloads
      `<code>.spool.json` (Blob + anchor download; note iOS Safari's share
      sheet behavior in Notes when tested).
- [ ] **"forget this room on this device"**: confirm twice (second step types
      the room code), then `leave()` → `stash.forget(code)` → clear the
      room-local keys (`room-seen:<code>`; never `spool-seat`) → navigate to
      the bare URL. Copy: *"gone from this device only — everyone else keeps
      their copy, and the relay's pocket keeps sealed copies for up to 60 days."*
- [ ] Fine print gains the permanence sentence: *"what you put here is kept by
      everyone in the room, for as long as they keep it."*
- [ ] Smoke: export round-trips through `importSpool`; forget removes the
      IndexedDB database and the stash row.

## Acceptance criteria

- Both buttons work on desktop and on the owner's phone (add a row to
  `apps/room/TESTING.md` H-list).
- The exported file passes `parseExport` and reopens with all entries.
