---
id: T-102
title: "SDK: pocket fetch-on-open"
status: done
milestone: M10
depends: [T-100]
---

## Goal

Opening a keyed spool checks the pocket: derive the namespace token, probe capability, fetch, verify, decrypt, merge — so the midnight open renders the full mixtape with no client code changes anywhere.

## Context

Brief §6 fetch side. The merge is `importSpool` semantics (`Y.applyUpdate` after `whenReady` — which stays strictly local, engine.ts:82). Mirror the drop-and-count discipline of `on('undecryptable')` (engine.ts:151-154) for deposits that fail authentication. `SpoolStatus` stays closed; pocket activity is an additive `on('pocket')` event (`checking` / `applied` / `empty` / `unavailable`), joining the overload list at spool.ts:124-127.

## Tasks

- [ ] Token derivation from the key (T-100's settled construction), domain-separated; no key → the pocket code path doesn't exist for this spool.
- [ ] Capability probe via health JSON `pocket` block, cached per relay origin; HTTP origin derived from the ws relay URL.
- [ ] GET + envelope verification: version-gated, and the 200-trap rule — a 200 without `format: "spool-pocket"` is `unavailable`, never `empty`.
- [ ] Decrypt each deposit; drop-and-count failures (surfaced alongside the undecryptable counter); `Y.applyUpdate` survivors after `whenReady`, distinct transaction origin (so T-103's `tr.local` gate ignores them by construction).
- [ ] `on('pocket')` event + a `spool.pocket` snapshot getter if the event alone proves awkward for clients (decide with T-104's needs in view; record the call in Notes).
- [ ] Failure surfaces: network/HTTP errors → `unavailable` + degrade to live-only; never block `whenReady` or `open()` on the pocket.
- [ ] Tests: vitest against an in-process T-101 relay + the old-relay control (real `server.js`), including the trap, wrong-key deposits, and cold open via `fake-indexeddb`.

## Acceptance criteria

- Midnight fetch works headless in vitest: cold client + populated pocket → full entries, `pocket` event sequence `checking → applied`.
- Old relay → exactly v1 behavior + `unavailable`; nothing thrown, nothing lost.
- A plaintext spool never touches pocket code (keyed-only is structural).

## Notes / open questions

- Landed as `src/pocket.ts` (`PocketClient`, fetch side) + wiring in `spool.ts`. Everything reuses what exists: `deriveToken` is `encodeKey(nacl.hash(domain‖key)[0..12))`, seal/open wrap `crypto.ts`'s `encrypt`/`decrypt`, applied updates use transaction origin `'spool-pocket'` (remote-origin, so T-103's `tr.local` gate can't self-feed by construction).
- **Refinement over the brief:** the pocket GET is *self-probing* — the envelope rule alone distinguishes old relays, so the separate health-JSON probe request is dropped (one request per open instead of two). The health block stays for humans and ops. Old-relay origins are remembered per session (`_resetPocketCache` for tests) so a stash of spools doesn't re-poke a relay known to be old.
- **Deviation, reasoned:** dropped deposits get their own `dropped` count in the pocket event payload instead of incrementing `undecryptableFrames` — that counter's contract is "ws frames from a wrong-key peer *in the room*", and muddying it would break its UX sentence. Same pattern, separate ledger.
- Ticket's open call resolved: yes to the `spool.pocket` getter alongside `on('pocket')` — clients render current state without replaying events (T-104 confirmed trivial on top of it).
- Tests (`pocket-fetch.test.ts`, 9) spawn the **real workspace relay** as a child process — cross-package integration, not a stub — plus stub relays for the 200-trap and a version-99 future relay. The midnight loop, empty pocket, dead relay (non-blocking open), garbage drop-and-count, keyless structural skip, sealed-at-rest persistence via fake-indexeddb, and the divergent-worldviews union all pass. Full suite: 99/99; `tsup` + `tsc -p tsconfig.build.json` green.
- Test-authoring gotcha inherited from SPEC §2: same-millisecond winds tie on `createdAt` and order by id — assert set-equality, not insertion order.
