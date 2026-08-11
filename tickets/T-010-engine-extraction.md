---
id: T-010
title: Engine extraction from fosho
status: done
milestone: M1
depends: [T-001]
---

## Goal

The ~150-line engine: an **instance-based** core that opens a Y.Doc by spool code, persists it to IndexedDB, and syncs it over websocket + webrtc. No encryption yet, no entry model yet — just a doc that syncs and survives.

## Context

Source material: fosho `src/lib/sync.ts:950–1092` (`connectToNote`) and `:1100–1143` (`disconnectFromNote`). The distillate:

1. `new Y.Doc()`
2. `IndexeddbPersistence(spoolCode, doc)` (plain, not encrypted — M5 swaps in the encrypted variant); await its `synced` before resolving `whenReady`.
3. `WebsocketProvider(relayUrl, spoolCode, doc)`
4. `WebrtcProvider(spoolCode, doc, { signaling: [...], awareness: websocketProvider.awareness })` — **share the ws provider's awareness** (fosho `sync.ts:1032`).
5. Teardown in `leave()`: webrtc → websocket → idb → `doc.destroy()` (order from `disconnectFromNote`). Local IDB data retained.

**Strip, don't inherit** (DESIGN_DOC §3): identity (`loadCurrentIdentity` is hard-called in fosho's connect — omit entirely), permissions observers, subdocs/addressing, hardcoded root names (`content`, `portals`), the module-singleton + proxy exports (`sync.ts:886–927`). Spool = a class/factory; many instances coexist.

Relay for this milestone: fosho's deployed one — `wss://foshoio-production.up.railway.app/yjs` (websocket) and `wss://foshoio-production.up.railway.app/` (signaling), from `sync.ts:133–139`. Zero new infrastructure between here and a working demo.

A minimal-shape reference: fosho `src/lib/ecs/components/note-stage.ts:63–110` (doc + provider + `Promise.race` sync timeout, nothing else).

## Tasks

- [x] `SpoolEngine` (internal): constructor takes `{ code, relay, persist }`; wires doc/persistence/providers; exposes `doc`, `whenReady`, `status` + status events, `leave()`.
- [x] Status derivation from provider events (`offline`/`connecting`/`connected`).
- [x] `persist: false` path (memory-only; needed by tests and Node).
- [x] Guard browser-only APIs so the module *imports* cleanly in Node (indexeddb only touched when persisting; ws provider accepts a polyfill for tests — see backup-daemon pattern).
- [x] Manual smoke: two browser tabs (throwaway HTML), same code, doc converges via fosho's relay.

## Acceptance criteria

- Two tabs converge on a shared `Y.Map` edit through fosho's deployed relay.
- Refresh a tab → doc state reloads from IndexedDB before any network.
- `leave()` tears down cleanly (no dangling ws reconnect loops in console).
- No import of fosho identity/permissions/subdoc concepts anywhere.

## Notes / open questions

- Record actual line count vs the ~150 target — a drift signal, not a rule. → **146 lines** (`src/engine.ts`), extraction held.
- Deviations from the ticket sketch, all deliberate:
  - `relay` and `signaling` are separate options: a single link `relay=` param can't generically derive both endpoints (fosho maps `/yjs` vs `/` by convention); T-011's link layer owns that mapping.
  - `relay` optional → local-only spools (and tests) need no network config at all.
  - y-webrtc is dynamically imported only when WebRTC exists/asked for — it's what breaks plain Node imports. y-websocket + y-indexeddb import cleanly at top level.
  - `resyncIntervalMs` default **20 s** wired per the §5 client-resync decision (T-003).
  - `status` is derived from both transports: `connected` = ws connected **or** rtc connected.
- y-websocket **3.1** (major bump over fosho's 2.x): constructor/options/events used by the engine are unchanged from 2.x; v3 adds `shouldReconnect` + a `closed` event we don't yet use. No migration pain.
- Verified against fosho's deployed relay from Node (two engines, `smoke-t010-node-*` room): connect, converge both directions, clean leave. Note the deployed relay is a *y-websocket server* (parses frames, server-side doc) — acceptable for M1 per DESIGN_DOC §3; our dumb relay replaces it in T-040.
- Awareness exposed on the engine (`engine.awareness`, shared ws↔rtc per fosho sync.ts:1032); pulled `y-protocols` in as a direct dep since its `Awareness` type is part of the public surface.
- **Browser smoke (all acceptance criteria met, driven via Chrome automation):** two tabs on `scratch/smoke-t010/` (BroadcastChannel disabled, webrtc off — isolating the ws-relay path) converged `{"tape":"deck-A"}` through fosho's deployed relay. Refresh check: at `whenReady` the map already held the data while `engine.status` was still `offline` — IndexedDB delivered before any network. `leave()`: status → left, 8 s of console silence, no reconnect loop.
- Smoke-page gotcha worth remembering for T-020: an element with `id="status"` is shadowed by `window.status` (the status-bar string) — assignments silently no-op. Renamed to `st`.
