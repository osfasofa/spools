---
id: T-021
title: Sync torture checklist (refresh, offline, reconnect)
status: todo
milestone: M2
depends: [T-020]
---

## Goal

A written, repeatable manual test script for the local-first promises — run it, fix what fails, keep the script for every future release. Closes milestone M2 (build-order step 2's full success criteria).

## Context

The promises under test (DESIGN_DOC §1): copies sync live when online together, reconcile automatically on reconnect, persist locally forever. IndexedDB persistence from T-010; this ticket proves it under abuse.

## Tasks

Write `apps/client/TESTING.md` with numbered scenarios; execute all; fix failures (fixes may land in SDK or client):

- [ ] **Refresh**: wind 5 entries → hard refresh → all present before network connects (kill network to prove it's IDB, not sync).
- [ ] **Offline wind**: DevTools offline → wind 3 entries (UI stays responsive, entries render) → online → other tab converges.
- [ ] **Both sides diverge offline**: both tabs offline, each winds + edits the *same* entry body → both online → converge, no lost characters.
- [ ] **Cold late join**: tab A winds 20 entries, stays online; fresh browser profile opens the link → converges. (Through fosho's y-websocket relay this works via the server doc; note that the dumb relay changes this to "needs a peer online" — the T-003 finding, retested in M4.)
- [ ] **Nobody home**: open link in fresh profile while no peer is online → clean empty state, no error spiral; converges when a peer arrives.
- [ ] **Relay down**: block the relay host → two tabs on same LAN still converge via WebRTC (the redundant-paths claim); document result honestly if flaky.
- [ ] Record every failure + fix in the Notes.

## Acceptance criteria

- `TESTING.md` exists; every scenario has a dated pass ✔ against the current code.
- Milestone M2 checked off in DESIGN_DOC §4 / tickets/INDEX.md.

## Notes / open questions

- (failures, fixes, and honest asterisks land here)
