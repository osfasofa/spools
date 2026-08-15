---
id: T-111
title: "Spike: awareness at group scale"
status: todo
milestone: M11
depends: []
---

## Goal

Prove presence for 5–8 seats is sealed, cheap, and ghost-free — headlessly,
before any UI exists. The sealing half is already answered in code
(encrypted-ws.ts:80-91 substitutes the WebSocket class below the y-protocols
layer); this spike's real job is the **group** half.

## Context

Brief §2: awareness exists on every relay-connected spool, shared across both
transports (engine.ts:117-134), OPTIONAL/app-defined per SPEC §3. Known traps:
`synced` never fires in an empty room (key UX to peers); awareness self-
heartbeats at 15 s and prunes at 30 s; a killed tab leaves ghost state until the
timeout; the resyncInterval re-sends SyncStep1 only, not awareness. fosho leaked
awareness plaintext — we must *prove* we don't.

## Tasks

- [ ] Headless harness: 6–8 seats on one keyed spool via a local relay, each
      setting an app-defined presence field; verify all seats see all others.
- [ ] **Sealing proof**: capture frames at the relay (log raw bytes in a test
      relay instance); assert every frame starts with a sealed-transport magic
      and no presence string is grep-able. This is milestone acceptance #6 —
      prove it here first, cheaply.
- [ ] Ghost test: kill a tab mid-typing-state; measure how long the ghost
      persists on the others (expect ≤ ~30 s); confirm a clean `leave()` clears
      instantly.
- [ ] Traffic: count awareness frames/minute for a seat toggling typing at
      keystroke rate vs debounced; produce the debounce recommendation for
      T-119, and the verdict on whether typing indicators are affordable at all
      (the brief gates them on this number).
- [ ] Poke the 64-conn ceiling: what does seat #65 actually see? Record it.

## Acceptance criteria

- All findings (sealing assertion, ghost duration, frames/min, conn-ceiling
  behavior) recorded in Notes with the harness committed under `scratch/`.
- A go/no-go on typing indicators, with the debounce number T-119 should use.

## Notes / open questions

-
