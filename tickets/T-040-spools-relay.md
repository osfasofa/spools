---
id: T-040
title: "spools-relay: dumb broadcaster + signaling"
status: done
milestone: M4
depends: [T-003]
---

## Goal

The real relay: y-webrtc signaling + per-room opaque-byte broadcast in one small plain-JS server. So dumb that running one is trivial and trusting one is unnecessary.

## Context

- **Design is whatever T-003 concluded** — read its Notes first. Baseline shape: fosho `server/server.js` (211 lines) keeps its signaling half (`:50–173`, the y-webrtc topic pub/sub with 30s ping/pong) verbatim; its `/yjs` half (`setupWSConnection`, the doc-parsing part) is **replaced** by the T-003 broadcaster.
- Routing (mirror fosho): single `http.createServer`, `upgrade` handler by path — `/` → signaling, `/yjs/{room}` → broadcast room. Health GET returns JSON counts (rooms, connections) — counts only, never content (it can't see content anyway; keep it that way).
- Deps stay minimal: `ws` (+ `lib0` if the signaling copy needs it). **No `yjs`, no `y-websocket` on the server** — their absence is the proof of dumbness.
- Room lifecycle: create on first join, GC when empty. No persistence (parked for v2, DESIGN_DOC §6).

## Tasks

- [x] Broadcast half per T-003 verdict (rooms map, join/leave, fan-out excluding sender, binary frames passed untouched).
- [x] Signaling half lifted from fosho `server.js:50–173`.
- [x] Upgrade routing + health endpoint; `PORT`/`HOST` env (defaults 4444 / 0.0.0.0, matching fosho).
- [x] SDK integration: point the SDK's default-relay constant (T-011 note) at a locally running spools-relay; full T-021 torture checklist passes against it — including re-testing **cold late join** (dumb relay = needs a peer online; confirm the client experience is calm, and the README says so honestly).
- [x] Basic hygiene: max frame size, max connections per room (crude constants, documented) — not hardening, just not-obviously-abusable.

## Acceptance criteria

- Reference client passes the T-021 checklist against local spools-relay (cold-late-join row updated with the dumb-relay behavior).
- `grep` proves no `yjs`/`y-websocket` import in the server.
- Server source stays in fosho's weight class (~250 lines) and readable top to bottom.

## Notes / open questions

- **Shipped: 207 lines**, three imports (`node:http`, `ws`, `lib0/map`) — no `yjs`, no `y-websocket`, per the acceptance grep. Broadcast half is ~35 lines; the T-003 verdict ("dumb relay works as-is") held with zero protocol surprises.
- **The one-URL convention, defined here (lifts T-011's ws-only custom-relay limitation):** a relay URL whose path is `/yjs` implies y-webrtc signaling at the same host's root. Implemented SDK-side as `deriveSignaling()` (exported, unit-tested). Bonus: fosho's deployed relay matches the shape, so the `DEFAULT_RELAY === relay` special case in `spool.ts` dissolved entirely.
- **Deviations from the fosho copy, all deliberate:** (1) logs carry counts only, never room/topic names — the relay can't see content and shouldn't chat about rendezvous names either; (2) fixed fosho's leaked ping interval (never cleared on close); (3) strict upgrade routing — exactly `/` and `/yjs/{room}`, anything else destroyed, where fosho routed unknown paths to signaling; (4) shared `keepAlive()` for both halves.
- **Hygiene constants:** 8 MiB `maxPayload` (ws enforces, closes 1009), 64 connections/room (closes 1013 "room full"). Crude on purpose; real hardening is not this ticket.
- **Torture checklist: 6/6, twice, fully against local spools-relay** — no fosho anywhere in the test loop anymore. S6 got *stronger*: instead of patching `WebSocket` to fake an outage, the harness now SIGKILLs the relay process (sync + signaling die together) and the established WebRTC mesh carries the entry across sub-second.
- **New ground rule discovered (recorded in TESTING.md):** once local relays have signaling, the offline scenarios (1–5) must run with WebRTC disabled — an established mesh syncs straight through a relay kill and fakes a pass. The harness deletes `RTCPeerConnection` pre-load for those tabs. Related unexposed-knob friction (T-020 #3, T-021 vocabulary note) now has a third member: engine has `webrtc`/`disableBc` options that `newSpool`/`openSpool` don't surface.
- **Cold late join, retested per the ticket:** with a peer online, a fresh device converges instantly (the peer answers SyncStep1 through the pipe); with nobody home, calm empty state, zero errors, converges on peer arrival. README says it honestly ("The honest part").
- Harness maintenance: T-030's view refactor removed the static `#list` element the S2 UI probe used — probes now count `[data-id]` nodes (view-agnostic); scenarios now restore their own relay state so one failure can't cascade.
- **`DEFAULT_RELAY` still points at fosho** — flipping it requires our deployed relay, which is T-041 (needs the user for hosting/auth).
