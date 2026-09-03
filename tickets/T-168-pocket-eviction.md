---
id: T-168
title: "Pocket eviction order and namespace creation cap — sign-off"
status: todo
milestone: M15
depends: [T-161]
---
## Goal

A stranger can't cheaply evict real deposits from the canonical pocket.

## Context

`ensureBudget` evicts the stalest namespaces first, and namespaces are free
to create: any room and any token that match the charset. At the stock knobs
one address can fill the relay-wide budget in minutes and evict every real
deposit. Review finding F3. Any default change on the canonical relay follows
T-124's precedent: sign-off, README honesty section updated.

## Tasks

- [ ] Track reads per namespace (a GET count; on disk as a sidecar or
      encoded in the touch file). Evict **never-read** namespaces first, then
      stalest — a deposit nobody ever collected is worth nothing.
- [ ] Per-IP cap on *new* namespaces per hour (needs T-161's real IP).
- [ ] Lower size cap for a namespace's first deposit until it has been read
      once (proposal: 1 MiB; **sign-off** — a canonical default).
- [ ] Tests: a tiny budget, 20 junk namespaces, 1 real namespace that was read
      → the real one survives.
- [ ] README honesty section: *"a determined stranger can still fill the
      pocket; devices remain the spool's home."*

## Acceptance criteria

- The survival test passes; the README knob table matches the code; the
  canonical relay runs the agreed defaults.
