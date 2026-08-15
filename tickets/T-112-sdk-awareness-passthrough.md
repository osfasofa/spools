---
id: T-112
title: "SDK: awareness passthrough"
status: done
milestone: M11
depends: []
---

## Goal

The one SDK change M11 is allowed (brief D5): a `get awareness()` passthrough on
`Spool`, so clients reach the existing engine awareness without constructing
their own `SpoolEngine`. Nothing else — no presence API, no new events.

## Context

`SpoolEngine.awareness` already exists (engine.ts:132-134) but `Spool`'s
`#engine` is hard-private. `SpoolEngine` is exported, so the app *can* work
without this — treat it as a convenience that must not block T-119. Returns
`Awareness | null` (null when relayless); re-export the `Awareness` type.

## Tasks

- [x] `get awareness(): Awareness | null` on `Spool`, delegating to the engine.
- [x] Export the `Awareness` type from `index.ts`.
- [x] A doc row in `docs/SDK-API.md` stating the contract: app-defined payload,
      best-effort, ephemeral by design — never persist awareness state.
- [x] Test: presence field set on one spool instance is observed by a second
      client on the same room (extend an existing transport test).

## Acceptance criteria

- `spool.awareness` reaches the same instance both transports share; type
  exported; test passing; SDK-API row present. No other public-surface change.

## Notes / open questions

- Landed exactly as scoped: `get awareness()` on `Spool` (spool.ts), the
  `Awareness` type re-exported from y-protocols in index.ts, a Spool-handle
  row in SDK-API.md, and two tests in encrypted-transport.test.ts — the
  passthrough is identity-equal to the engine's instance, presence propagates
  between two `Spool`s with every frame sealed and the presence marker not
  grep-able at the relay, and a relayless spool returns null. No other
  surface change.
- Incidental: fixed a pre-existing coin-flip flake in history.test.ts —
  phase 1 wound two entries in the same millisecond, so the createdAt sort
  fell to the random-uuid tie-break and the expected order flipped ~50% of
  runs. Two winds are now a beat apart. (The tie-break itself is correct and
  §5-deterministic across peers; only the test's order assumption was wrong.
  T-116 should remember: same-ms messages from one device render in uuid
  order, not wind order.)
