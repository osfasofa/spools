---
id: T-080
title: export() portable file + stash
status: done
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

- [x] Export format decision + implementation; version field in the file for future-proofing.
- [x] Import path; round-trip test: export → wipe IDB → import → identical entries (and, if format (a)/(c), still syncs with a live peer).
- [x] Local spool registry in the SDK (`listSpools()` or similar — add to SDK-API). *(shipped as the `stash` namespace)*
- [x] Client stash UI: list, open, export, archive, delete-with-ceremony.
- [x] SDK-API + DESIGN_DOC updates (export format row in §5; stash moves from reserved word to shipped).

## Acceptance criteria

- Round-trip test green, including the offline-forever case (import with no relay reachable).
- A non-technical person could find their exported file meaningful (open the JSON half — readable entries).
- Deleting a spool from stash provably removes its IDB database.

## Notes / open questions

- **Format: (c), user-approved (2026-08-11)** — one JSON file, both halves. (a) alone fails "a non-technical person finds it meaningful" (that's an acceptance criterion, and §1's power-to-the-person); (b) alone exports the *view*, not the *spool* — no re-sync, no rewind after import. ~2× the size of (a); trivial at intimate scale. `format`/`version` fields future-proof it; readers reject newer versions loudly. §5 row added; SPEC.md gained a short optional-surface section (it's a file format outsiders may parse).
- **`export()` is synchronous and returns the JSON string** — not the sketched `Promise<Blob>`: it's all local (the `wind()` precedent), and a string is universal where Blob is browser-flavored. The client wraps it in a Blob only to trigger the download.
- **Import is `Y.applyUpdate` — a CRDT merge.** Restoring into an empty browser and reunifying with existing local state are literally the same operation; no clobber path exists (tested: file imported "over" a spool that moved on after export → union). No relay contacted unless passed — the round-trip test asserts `status === 'offline'` (the relay-long-gone case), and a separate test proves an import handed a relay still syncs with a fresh peer.
- **The key is never in the file; the stash registry is where it lives.** The localStorage registry stores the full link (`k=` included) — deliberately: same device, same trust boundary as the browser history/bookmarks that already carry the link, and without it a sealed spool in the stash could never be reopened or exported. A link is only recorded when it carries relay/key, so a bare import never downgrades a stored sealed link.
- **Stash = IndexedDB ∪ registry.** `indexedDB.databases()` enumerates kept spools by code-shaped names (no bookkeeping can drift from the truth — the databases ARE the list); the registry adds what IDB can't hold (label, archived, lastOpened, link) and is expendable — a corrupt registry loses labels, never spools (tested). `forget()` is the system's one hard delete: rejects while the spool is open (`onblocked`), and the client gives it the confirm-twice ceremony (armed button, 4 s disarm).
- **Known edge, documented not fixed**: importing an encrypted spool's export into a browser that still holds the *sealed* IDB for that code, without the key, fails loudly at open (plain persistence meets sealed rows) — the client alerts and suggests opening via the link first. Rare (requires having the sealed data but importing instead of opening), and loud, per the T-050 principle.
- **`NotImplementedError` retired** — export() was the last stub; the class left the public surface with it.
- **Client check**: `scratch/stash-t080/check.mjs` (headless CDP, real client + relay) — stash lists the keepsake with sealed link, labeling persists, forget arms-then-executes and `indexedDB.databases()` proves the database gone, then the full keepsake story: the exported file re-imported restores all entries with the original spool forgotten and no relay involved. 7/7 on first run. Vitest: 9 new tests (5 export, 4 stash), 90/90 suite-wide.
