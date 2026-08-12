---
id: T-070
title: Write SPEC.md from the working system
status: done
milestone: M7
depends: [T-041, T-051]
---

## Goal

The constitution, written after the country exists: `SPEC.md` describing exactly what demonstrably works, so a stranger can build a compliant client or relay without reading our code.

## Context

- DESIGN_DOC Layer 1 defines the four sections: **spool identity & links**, **document shape (Entry model)**, **wire protocol**, **encryption**. Brutally small — every sentence is implementation work for every future client author.
- Inputs: DESIGN_DOC §5 (all decisions + reasons), docs/SDK-API.md (behavioral contracts), T-003/T-040 Notes (what "relay" precisely means), T-051 Notes (what a compliant encrypted peer implements).
- The spec describes the **protocol**, not the SDK: `wind()` is not spec; "an entry is a map with these fields at this key" is. A compliant client could be written in Python.
- Include the forward-compat rule (ignore unknown kinds *and fields*) and the honesty clause. Include the banked sentence about `author`/`sig`.

## Tasks

- [x] Draft the four sections from the working system; every claim cross-checked against running code/tests (cite the test where one exists).
- [x] Conformance checklist: "you are a compliant client if…" / "…a compliant relay if…" — short, testable statements.
- [x] Versioning stance: spec is `v1`, what compatibility promise (if any) it makes. Keep humble — one paragraph.
- [x] Adversarial read: have a session play stranger-implementing-from-scratch and log every ambiguity found; fix them.
- [x] Update DESIGN_DOC to point at SPEC.md as the protocol source of truth (DESIGN_DOC stays the *why*, spec becomes the *what*).

## Acceptance criteria

- A reader with Yjs docs and SPEC.md alone could interop — validated by the adversarial-read exercise producing zero blocking ambiguities on its second pass.
- Word-count discipline held: if it can't be said in a few pages, something upstream is too complicated (that's a finding, not a formatting problem).

## Notes / open questions

- **Adversarial-read protocol**: three independent clean-room agents (each knowing Yjs/y-websocket/y-webrtc/tweetnacl, none allowed to read anything but SPEC.md) mentally implemented a client + relay and logged ambiguities. Pass 1: 4 blocking, 13 minor. Pass 2 (after fixes): 1 blocking, 13 minor. Pass 3 (after fixes): **0 blocking**, 6 half-sentence minors — acceptance met; all minors fixed too.
- **Blocking ambiguities found and fixed** (each was a real spec bug):
  1. Conformance rule 7 as drafted outlawed plaintext spools entirely ("never transmit plaintext content to any server") — scoped to keyed spools; honesty clause now states plainly that a plaintext spool's frames are readable by a relay that chooses to look.
  2. Relay rooming was only defined for `/yjs/` paths while links may name any broadcast URL — non-`/yjs` endpoints are now explicitly outside relay conformance, and clients always connect to `<relay>/<code>`.
  3. The moment `snap` said just "base64" — two clients could write history the other can't decode. Pinned: standard base64 with padding (RFC 4648 §4), matching the reference's `btoa`.
  4. "Percent-encoded relay URL" invited double-encoding — clarified: one encoding layer, the form-urlencoding itself.
  5. The §4 sealing MUST, read literally, covered the y-webrtc *signaling* socket, whose JSON envelope must stay parseable — a conformance-minded keyed client would never form a mesh. Scoped to the broadcast connection.
  6. The spec never said clients must *answer* SyncStep1 — on a dumb relay peers are each other's server, and an ask-only client would never sync. Now normative (client conformance rule 4).
- **The read audited the reference too, and won twice**: (a) the draft said the rtc password is "the literal `k=` string" but the engine actually re-encodes the key *bytes* canonically (`encodeKey(key)`) — the spec now specifies bytes-derived canonical encoding, which is what makes lenient link parsing safe; (b) the draft's moment-dedupe description ("skipping if equal to the newest snapshot") described dead code — the reference's real loop-guard is that history writes never count as content changes, and the spec now says exactly that.
- **Library-reality checks all came back clean** across three agents (peers answering SyncStep1, `resyncInterval`, `WebSocketPolyfill`, y-webrtc PBKDF2-salted-by-room, gc'ing peers gutting others' pasts, magic-byte non-collision with Yjs varint message types). Two stock-provider footguns are now non-normative warnings in §3: `messageReconnectTimeout` cycles connections in empty rooms, and `synced` never fires while alone.
- **Word count: ~3,100** — call it six printed pages, two of which are conformance lists and restated y-webrtc signaling shapes so the document stands alone. Nothing upstream demanded simplification, which was the point of the discipline check.
- The spec has one deliberate scope hole, inherited from §5: relay persistence is "MUST NOT persist **(v1)**" — the v2 sealed-envelope option stays parked in DESIGN_DOC §6.
