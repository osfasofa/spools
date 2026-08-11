---
id: T-050
title: Lift encryption primitives + encrypted IndexedDB
status: todo
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

- [ ] Lift + trim `encryption.ts` into `packages/spools/src/crypto.ts`; unit-test vectors (round-trip, tamper detection, wrong-key failure).
- [ ] Lift + trim `EncryptedIndexeddbPersistence`; engine (T-010) uses it whenever the spool has a key, plain `IndexeddbPersistence` otherwise.
- [ ] `newSpool` generates the key by default; `newSpool({ encrypted: false })` opts out (decide the default's name/shape, record in SDK-API).
- [ ] Test: IDB contents for an encrypted spool are ciphertext (open raw IDB in test, assert magic prefix / no plaintext substrings).
- [ ] Fingerprint helper (`getKeyFingerprint` pattern) exposed for future "verify we're on the same key" UX — cheap now, useful later.

## Acceptance criteria

- Encrypted spool: refresh-survival still passes; raw IDB shows no plaintext.
- Wrong-key open fails loud and comprehensible (defined error, not silent garbage).
- `tweetnacl` is the only new dependency.

## Notes / open questions

- Key rotation is explicitly out of scope forever-ish (a new key = a new spool; that's the model). Confirm we're at peace with that here.
