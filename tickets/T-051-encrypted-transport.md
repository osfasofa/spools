---
id: T-051
title: Encrypted transport over the dumb relay
status: done
milestone: M5
depends: [T-050, T-040]
---

## Goal

The full privacy claim, end to end: relay carries only ciphertext, and encrypted spools sync over **both** transports. Also: settle and document the two-transport crypto story fosho never resolved.

## Context

- **Websocket path**: fosho `src/lib/encrypted-sync.ts` (200 ln) — a `WebSocket` subclass passed as `WebSocketPolyfill` to `WebsocketProvider`, encrypting every binary frame (magic `0xE2 0xE1`) and decrypting inbound. Against fosho's parsing server this never worked (frames dropped); against our dumb relay (T-040) it works by construction — the relay forwards bytes it can't read. Lift, trim the `unauthorized_peer` machinery to a simple "undecryptable frame" counter/event.
- **WebRTC path**: y-webrtc has its own `password` option (PBKDF2 → AES) — a *second* crypto scheme. The inherited fosho pattern: `password: base64(key)` (`sync.ts:1035`). Decide:
  - **(a) Keep both schemes** — secretbox on ws frames, y-webrtc password on rtc. Two implementations, but each is stock/proven, and rtc encryption stays y-webrtc's problem. Likely v1 answer.
  - **(b) Unify on secretbox** — wrap webrtc data channels ourselves. One scheme, more invention, fights y-webrtc's internals.
  - Record the decision + reasoning in DESIGN_DOC §5 (this is a spec-visible fact: what exactly does a compliant encrypted peer implement?).
- Mixed rooms: an encrypted peer and a plaintext peer on the same room code must not corrupt each other — undecryptable frames get dropped + counted, docs say "same link = same key, that's the contract."

## Tasks

- [x] Lift `createEncryptedWebSocketClass`; engine passes it as polyfill when the spool has a key.
- [x] WebRTC decision (a)/(b) implemented + logged in DESIGN_DOC §5.
- [x] End-to-end test: two clients, encrypted spool, dumb relay in the middle — converge over ws-only (rtc disabled), rtc-only (ws disabled), and both.
- [x] Relay-blindness proof: capture relay-side traffic in the test (instrument the broadcaster), assert Yjs sync-message opcodes are absent / frames carry the magic prefix.
- [x] Undecryptable-frame handling: dropped, counted, surfaced as an SDK event (`spool.on('status')` extension or similar — record shape in SDK-API).

## Acceptance criteria

- T-021 torture checklist passes for an *encrypted* spool over the dumb relay.
- The relay-blindness assertion is an automated test, not a claim.
- DESIGN_DOC §5 has the two-transport decision row; SDK-API documents what `k=` guarantees per transport.

## Notes / open questions

- This closes the contradiction found in the fosho audit — after this ticket, "relay never sees content" is tested, not asserted.
- **Two-transport decision: (a), user-approved (2026-08-11)** — secretbox on ws frames, y-webrtc's stock `password` on rtc. Deciding argument: (b) has no sanctioned hook (no `WebSocketPolyfill` equivalent for data channels), so it means a maintained monkey-patch of y-webrtc internals in the layer where bugs are silent corruption, and it loses y-webrtc's free signaling-payload encryption. Eyes-open cost recorded in §5: two crypto schemes in the spec, y-webrtc's PBKDF2→AES inherited sight-unseen, effectively permanent once M7 writes SPEC.md. The rtc `password` is the **literal `k=` string** (URL-safe unpadded base64) — one canonical spec sentence; deviates from fosho, which fed it standard base64.
- **Lift deviations from fosho `encrypted-sync.ts`:** the global `setUnauthorizedPeerHandler` became a per-instance `onUndecryptable` callback (engine counts + re-emits; `spool.on('undecryptable')`, running total). fosho's three-way frame triage (encrypted / looks-like-Yjs / pass-through) collapsed to one rule: every message on an encrypted socket must be `0xE2E1‖nonce‖ciphertext` or it's dropped + counted — the pass-through path was a plaintext hole. Outbound non-binary `send()` now throws instead of passing through, so no plaintext frame can ever leave an encrypted socket.
- **Relay-blindness is automated with a leak-detecting control** (`src/encrypted-transport.test.ts`): the inlined dumb relay records every frame it forwards. Sealed room: all frames magic-prefixed, a distinctive plaintext marker appears in no frame. Keyless control room: the marker appears verbatim — proving the instrument would catch a leak, so the sealed-room assertion means something.
- **Mixed-room finding:** a *plaintext* y-websocket peer receiving ciphertext throws inside lib0 varint parsing. In a browser that's a logged error and the page carries on; in Node the EventEmitter would crash the process — the test gives the keyless peer browser semantics (a `TolerantWS` wrapper). Either way neither side absorbs the other's data; the encrypted side counts and drops. Docs' contract stands: same link = same key.
- **Torture: 7/7, run twice consecutively (2026-08-11)** — `scratch/torture-t051/torture.mjs`, the full T-021 checklist with `k=` in every link (S1–S5 encrypted ws-only, S6 both transports mid-outage) plus S7 encrypted rtc-only: the `/yjs` sync socket rerouted to a dead port pre-load, signaling alive, entry crosses the y-webrtc password channel sub-second after the 10 s mesh wait. S1 also asserts `keyFingerprint` is live in the real client.
- Client work needed: none — `openSpool(location.href)` already carries `k=`; the vendor bundle was rebuilt so the shipped client seals transport automatically.
