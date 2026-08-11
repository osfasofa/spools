---
id: T-051
title: Encrypted transport over the dumb relay
status: todo
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

- [ ] Lift `createEncryptedWebSocketClass`; engine passes it as polyfill when the spool has a key.
- [ ] WebRTC decision (a)/(b) implemented + logged in DESIGN_DOC §5.
- [ ] End-to-end test: two clients, encrypted spool, dumb relay in the middle — converge over ws-only (rtc disabled), rtc-only (ws disabled), and both.
- [ ] Relay-blindness proof: capture relay-side traffic in the test (instrument the broadcaster), assert Yjs sync-message opcodes are absent / frames carry the magic prefix.
- [ ] Undecryptable-frame handling: dropped, counted, surfaced as an SDK event (`spool.on('status')` extension or similar — record shape in SDK-API).

## Acceptance criteria

- T-021 torture checklist passes for an *encrypted* spool over the dumb relay.
- The relay-blindness assertion is an automated test, not a claim.
- DESIGN_DOC §5 has the two-transport decision row; SDK-API documents what `k=` guarantees per transport.

## Notes / open questions

- This closes the contradiction found in the fosho audit — after this ticket, "relay never sees content" is tested, not asserted.
