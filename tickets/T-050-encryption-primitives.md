---
id: T-050
title: Lift encryption primitives + encrypted IndexedDB
status: done
milestone: M5
depends: [T-012]
---

## Goal

Encryption at rest: the `k=` in links becomes cryptographically live for local storage. Key generated on `newSpool`, carried in the fragment, used to encrypt every update written to IndexedDB.

## Context

Three fosho files, designed to be lifted nearly verbatim (all self-contained):

- **`fosho.io/src/lib/encryption.ts`** (224 ln): tweetnacl `secretbox` (XSalsa20-Poly1305), 32-byte key, 24-byte nonce, wire format `nonce||ciphertext`. URL-safe unpadded base64 helpers (`:36–56`, already used by T-011). **No KDF — the 32 random bytes are the key**; that's a v1-acceptable, documented property (key strength lives entirely in the RNG).
- **`fosho.io/src/lib/encrypted-indexeddb.ts`** (415 ln): `EncryptedIndexeddbPersistence(name, doc, key)` — y-indexeddb-compatible API (`synced`, `whenSynced`, `destroy`, `clearData`), per-update encryption with magic prefix `0xE2 0xE2`, compaction at 500 updates. Drop the fosho migration shims (unencrypted-row passthrough) — Spool has no legacy data.
- Strip fosho's session-key URL side-effects (`getSessionKey` reads `location` directly) — in Spool the key flows through the instance, period. No module-global key state.

Scope check: transport encryption is **T-051** (needs the dumb relay). This ticket is primitives + at-rest only; the ws provider keeps sending plaintext until T-051.

## Tasks

- [x] Lift + trim `encryption.ts` into `packages/spools/src/crypto.ts`; unit-test vectors (round-trip, tamper detection, wrong-key failure).
- [x] Lift + trim `EncryptedIndexeddbPersistence`; engine (T-010) uses it whenever the spool has a key, plain `IndexeddbPersistence` otherwise.
- [x] `newSpool` generates the key by default; `newSpool({ encrypted: false })` opts out (decide the default's name/shape, record in SDK-API).
- [x] Test: IDB contents for an encrypted spool are ciphertext (open raw IDB in test, assert magic prefix / no plaintext substrings).
- [x] Fingerprint helper (`getKeyFingerprint` pattern) exposed for future "verify we're on the same key" UX — cheap now, useful later.

## Acceptance criteria

- Encrypted spool: refresh-survival still passes; raw IDB shows no plaintext.
- Wrong-key open fails loud and comprehensible (defined error, not silent garbage).
- `tweetnacl` is the only new dependency.

## Notes / open questions

- Key rotation is explicitly out of scope forever-ish (a new key = a new spool; that's the model). Confirm we're at peace with that here. → Recorded as part of the §5 at-rest-crypto row; flagged to the user at ticket close for a final "at peace" confirmation.
- **Shipped:** `src/crypto.ts` (~50 lines: encrypt/decrypt/`keyFingerprint`/`SpoolKeyError`) + `src/encrypted-idb.ts` (~170 lines). `tweetnacl` is the only new runtime dependency (acceptance ✓); `fake-indexeddb` added as a devDep so the storage path is testable in Node (`import 'fake-indexeddb/auto'` before the engine module evaluates its `inBrowser` check).
- **Trims from fosho, per ticket:** URL side-effects gone (key flows through the instance), migration/unencrypted-passthrough gone, `setSessionKey` mutation gone, custom KV store and event emitter gone (`synced` + `whenSynced` are all the engine needs — engine now consumes `whenSynced` uniformly for both persistence classes).
- **Deviation worth keeping (fosho bug):** fosho's loader *writes* a state row before validating it can decrypt existing rows — an open with the wrong key pollutes the good database with an undecryptable row. Ours validates first, writes nothing on failure, detaches, and rejects `whenSynced` with `SpoolKeyError`. Test pins the row count across a failed wrong-key open and confirms the right key still works after.
- **Wrong-key failure is loud end to end:** `EncryptedIndexeddbPersistence.whenSynced` → `engine.whenReady` → `openSpool` throws `SpoolKeyError` with a human message. Detection rule: stored rows exist and none decrypt. Partial failures (some rows decrypt) are treated as row corruption — skipped, dropped for good at next compaction.
- **Opt-out shape decided:** `newSpool({ encrypted: false })` (default true). `openSpool` has no such option — the link decides (k= present or not). Recorded in SDK-API.md.
- Browser verification (headless CDP, real client + vendor bundle): fresh default spool `sepia-crow-636` — every raw IDB row prefixed `0xE2E2`, no plaintext substring of the wound entry anywhere, refresh restored the entry from sealed rows, `spool.keyFingerprint` exposed (8 chars). 69 unit tests green.
- Transport note, unchanged from ticket scope: the ws provider still sends plaintext frames until T-051 — at-rest only here.
