---
id: T-021
title: Sync torture checklist (refresh, offline, reconnect)
status: done
milestone: M2
depends: [T-020]
---

## Goal

A written, repeatable manual test script for the local-first promises — run it, fix what fails, keep the script for every future release. Closes milestone M2 (build-order step 2's full success criteria).

## Context

The promises under test (DESIGN_DOC §1): copies sync live when online together, reconcile automatically on reconnect, persist locally forever. IndexedDB persistence from T-010; this ticket proves it under abuse.

## Tasks

Write `apps/client/TESTING.md` with numbered scenarios; execute all; fix failures (fixes may land in SDK or client):

- [x] **Refresh**: wind 5 entries → hard refresh → all present before network connects (kill network to prove it's IDB, not sync).
- [x] **Offline wind**: DevTools offline → wind 3 entries (UI stays responsive, entries render) → online → other tab converges.
- [x] **Both sides diverge offline**: both tabs offline, each winds + edits the *same* entry body → both online → converge, no lost characters.
- [x] **Cold late join**: tab A winds 20 entries, stays online; fresh browser profile opens the link → converges. (Through fosho's y-websocket relay this works via the server doc; note that the dumb relay changes this to "needs a peer online" — the T-003 finding, retested in M4.)
- [x] **Nobody home**: open link in fresh profile while no peer is online → clean empty state, no error spiral; converges when a peer arrives.
- [x] **Relay down**: block the relay host → two tabs on same LAN still converge via WebRTC (the redundant-paths claim); document result honestly if flaky.
- [x] Record every failure + fix in the Notes.

## Acceptance criteria

- `TESTING.md` exists; every scenario has a dated pass ✔ against the current code.
- Milestone M2 checked off in DESIGN_DOC §4 / tickets/INDEX.md.

## Notes / open questions

- **How it was executed:** `scratch/torture-t021/torture.mjs` — a CDP harness driving the real client (vendor bundle and all) in headless Chrome, with the T-003 spike relay as a SIGKILL-able child process. Scenarios 1–5 run through that local relay; "offline" = relay killed, because two discoveries made the ticket's naive setup dishonest: (1) DevTools offline does **not** sever established WebSockets, and (2) two same-origin tabs converge via BroadcastChannel + shared IndexedDB with the network unplugged. The harness gives every "device" its own origin (three local ports). Both are written up as ground rules in `apps/client/TESTING.md`. 6/6 pass, run twice consecutively (2026-08-11); the harness stays in scratch for reruns.
- **Failure #1 (client bug, fixed):** navigating a tab to a *different spool link* is a fragment-only navigation — nothing reloads, the page silently stays on the old spool. A human pasting a link into the URL bar of an open client hits exactly this. Fix: `hashchange` → `location.reload()` in `app.js`. Found because the harness's S5 "wind on B" landed on the wrong spool.
- **Failure #2 (harness race, fixed):** after a fragment navigation the old page's `window.spool` briefly survives, so "client ready" checks must wait for `spool.code === <expected>`, not just `!!window.spool`.
- **S6 (relay outage → WebRTC) needed one flake retry, then passed 3× (debug + 2 full runs).** Verified via y-webrtc debug logs (`localStorage.log`): mesh forms in ~1 s after signaling, and after severing relay + signaling sockets the entry crosses the data channel in <0.5 s with status still `connected`. The honest boundary, recorded in TESTING.md: the default host serves sync *and* signaling, so an outage also kills rendezvous — WebRTC redundancy only covers peers that met before the outage. Mesh-formation wait in the harness is 10 s; below ~8 s it can race.
- **Vocabulary finding:** `status: 'connected'` means "relay reachable", not "peer present" — scenario 5 sits at `connected` with nobody home. Candidate future surface: peer presence via awareness (engine has it; `Spool` doesn't expose it). Parked until a client demands it — likely T-030's renderer or later.
- **Timing observations:** reconnect catch-up lands just inside one resync interval (19 s measured vs the 20 s setting — §5 decision working as designed); live winds and cold late joins converge sub-second through the dumb relay with a peer online.
- Scenario 3 used character-level `entry.text` inserts (the concurrent-edit-safe path the SDK docs prescribe); wholesale `entry.body` rewrites on both sides would interleave by design — that's the documented trade-off, not a bug.
