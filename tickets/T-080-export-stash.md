---
id: T-080
title: export() portable file + stash
status: todo
milestone: M8
depends: [T-013]
---

## Goal

Power to the person, made concrete: `spool.export()` produces a portable file that is yours forever, and stash gives local archive management (list, keep, let go). A spool is a keepsake, not an account.

## Context

- DESIGN_DOC §1: export, archive, delete are first-class. §2 reserves **stash** as the local-archiving noun.
- Export format decision (make it here, log in §5): candidates —
  - **(a) Raw Yjs update blob** (`Y.encodeStateAsUpdate`): lossless (full CRDT history, re-importable, still syncable), opaque to humans.
  - **(b) JSON of entries + bodies**: human-readable, greppable in 2040, loses CRDT history.
  - **(c) Both in one file** (JSON + embedded update blob, or a two-file archive): the honest answer to "memory" — likely winner; decide with the file in hand.
  - Encrypted spools: export decrypted (the holder has the key; a keepsake you can't read is not a keepsake) — but say so in the UI.
- Import is the other half: `openSpool(file)` or a dedicated `importSpool` — reopening an exported spool must work offline-forever (relay long gone).
- Stash (SDK + client): enumerate locally-persisted spools (IndexedDB databases + a registry — see fosho `roomRegistry.ts` localStorage pattern), label them, archive (disconnect-but-keep), and true local delete (the one hard delete in the system — confirm-twice UX).

## Tasks

- [ ] Export format decision + implementation; version field in the file for future-proofing.
- [ ] Import path; round-trip test: export → wipe IDB → import → identical entries (and, if format (a)/(c), still syncs with a live peer).
- [ ] Local spool registry in the SDK (`listSpools()` or similar — add to SDK-API).
- [ ] Client stash UI: list, open, export, archive, delete-with-ceremony.
- [ ] SDK-API + DESIGN_DOC updates (export format row in §5; stash moves from reserved word to shipped).

## Acceptance criteria

- Round-trip test green, including the offline-forever case (import with no relay reachable).
- A non-technical person could find their exported file meaningful (open the JSON half — readable entries).
- Deleting a spool from stash provably removes its IDB database.

## Notes / open questions

- (format decision reasoning lands here)
