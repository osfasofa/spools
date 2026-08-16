---
id: T-152
title: "the reel store — IndexedDB blobs by sha-256, pointer resolution, peaks"
status: done
milestone: M14
depends: [T-151]
---

## Goal

The storage system under the pointers: content-addressed blobs on the device, resolution order (store → url-verify → ghost), decode + peaks caching — DESIGN §5 made real.

## Tasks

- [ ] `lore-blobs` IndexedDB database: `blobs` store keyed by sha256 (`{ bytes, mime, size, dur, addedAt }`), `peaks` store keyed by sha256 (bucketed min/max Float32Arrays + meta).
- [ ] `put(blob)` → hashes via `crypto.subtle.digest`, dedups, returns the pointer block `{ sha256, size, mime, dur }` (dur filled after decode).
- [ ] `resolve(pointer)` → local hit, else `url` fetch + hash-verify + adopt, else `null` (caller renders the ghost).
- [ ] Decode cache (sha256 → AudioBuffer, in-memory) + peaks computation off the audio path (chunked on main thread is fine at voice scale).
- [ ] `navigator.storage.persist()` asked once; usage surfaced (the ~15 MB/hour sentence lives in UI copy later).

## Acceptance criteria

- Round trip: put a blob → same sha256 on re-put (dedup), get returns identical bytes, peaks cached and reloaded without re-decode.
- A pointer with a wrong-hash `url` is rejected (never adopted, counted as ghost) — a URL is a courier, not an authority.

## Notes / open questions

-
- Verified in Chromium via scripted page: dedup by content hash, byte-identical round trip, wrong-hash `url` refused *and* not adopted, peaks (200 buckets on a 0.5 s tone, max 0.61) computed once and served from idb across reload, usage counting. Decode LRU capped at 16 buffers; reversed-buffer cache capped at 6 (T-155's customer).
