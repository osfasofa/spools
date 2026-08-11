---
id: T-010
title: Engine extraction from fosho
status: todo
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

- [ ] `SpoolEngine` (internal): constructor takes `{ code, relay, persist }`; wires doc/persistence/providers; exposes `doc`, `whenReady`, `status` + status events, `leave()`.
- [ ] Status derivation from provider events (`offline`/`connecting`/`connected`).
- [ ] `persist: false` path (memory-only; needed by tests and Node).
- [ ] Guard browser-only APIs so the module *imports* cleanly in Node (indexeddb only touched when persisting; ws provider accepts a polyfill for tests — see backup-daemon pattern).
- [ ] Manual smoke: two browser tabs (throwaway HTML), same code, doc converges via fosho's relay.

## Acceptance criteria

- Two tabs converge on a shared `Y.Map` edit through fosho's deployed relay.
- Refresh a tab → doc state reloads from IndexedDB before any network.
- `leave()` tears down cleanly (no dangling ws reconnect loops in console).
- No import of fosho identity/permissions/subdoc concepts anywhere.

## Notes / open questions

- Record actual line count vs the ~150 target — a drift signal, not a rule.
