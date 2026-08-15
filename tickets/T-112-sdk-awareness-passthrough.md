---
id: T-112
title: "SDK: awareness passthrough"
status: todo
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

- [ ] `get awareness(): Awareness | null` on `Spool`, delegating to the engine.
- [ ] Export the `Awareness` type from `index.ts`.
- [ ] A doc row in `docs/SDK-API.md` stating the contract: app-defined payload,
      best-effort, ephemeral by design — never persist awareness state.
- [ ] Test: presence field set on one spool instance is observed by a second
      client on the same room (extend an existing transport test).

## Acceptance criteria

- `spool.awareness` reaches the same instance both transports share; type
  exported; test passing; SDK-API row present. No other public-surface change.

## Notes / open questions

-
