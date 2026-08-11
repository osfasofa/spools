---
id: T-040
title: "spools-relay: dumb broadcaster + signaling"
status: todo
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

- [ ] Broadcast half per T-003 verdict (rooms map, join/leave, fan-out excluding sender, binary frames passed untouched).
- [ ] Signaling half lifted from fosho `server.js:50–173`.
- [ ] Upgrade routing + health endpoint; `PORT`/`HOST` env (defaults 4444 / 0.0.0.0, matching fosho).
- [ ] SDK integration: point the SDK's default-relay constant (T-011 note) at a locally running spools-relay; full T-021 torture checklist passes against it — including re-testing **cold late join** (dumb relay = needs a peer online; confirm the client experience is calm, and the README says so honestly).
- [ ] Basic hygiene: max frame size, max connections per room (crude constants, documented) — not hardening, just not-obviously-abusable.

## Acceptance criteria

- Reference client passes the T-021 checklist against local spools-relay (cold-late-join row updated with the dumb-relay behavior).
- `grep` proves no `yjs`/`y-websocket` import in the server.
- Server source stays in fosho's weight class (~250 lines) and readable top to bottom.

## Notes / open questions

- (deviations from the T-003 design land here)
