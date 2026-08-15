---
id: T-119
title: "Presence: online dots (+ typing)"
status: todo
milestone: M11
depends: [T-111, T-112, T-114]
---

## Goal

The room feels inhabited: online dots per seat, and — only if T-111's numbers
said it's affordable — a debounced typing indicator. All of it ephemeral, all of
it sealed, zero document bytes.

## Context

`spool.awareness` (T-112) or a held `SpoolEngine` if T-112 hasn't landed.
Payload: `setLocalStateField('room', { seat, typing })` — app-defined, per SPEC
§3. Liveness comes from awareness's own 15 s heartbeat / 30 s prune; key
everything to awareness states, never to `synced` (empty-room trap). Ghost
presence is a named refusal — nothing from awareness is ever written to the doc.
Typing is gated on T-111's go/no-go and uses its debounce number; presence dots
deliver most of the aliveness at none of the traffic.

## Tasks

- [ ] Participant strip: dots for seats present in awareness, names via the
      profile resolver, merged per T-114's multi-device choice.
- [ ] Own-state lifecycle: set on open, clear on `leave()`/pagehide so clean
      exits drop instantly rather than waiting out the timeout.
- [ ] Typing (if go): debounced per T-111, cleared on send/blur/idle; "X is
      typing" renders through the resolver.
- [ ] Ghost check in the app: kill a tab; the dot drops within the awareness
      timeout on the surviving devices.

## Acceptance criteria

- A sees B appear on open and drop on tab close (fast) and on kill (≤ timeout).
- Nothing presence-related persists: reload with everyone gone shows an empty
  participant strip and an unchanged doc byte size.

## Notes / open questions

-
