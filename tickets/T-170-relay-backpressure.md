---
id: T-170
title: "Backpressure and frame budget on the broadcast path"
status: todo
milestone: M15
depends: []
---
## Goal

One slow or hostile connection can't grow relay memory or the egress bill.

## Context

`onBroadcastConnection` calls `peer.send` with no look at `bufferedAmount`,
so one slow consumer in a chatty room buffers without bound. Separately, a
code-holder without the key can push 8 MiB junk frames and the relay fans each
one out to up to 63 peers. SPEC §3 makes both "the relay's own business."
Review finding F5.

## Tasks

- [ ] Skip a peer whose `bufferedAmount` exceeds a threshold (proposal
      16 MiB) and close it with a code the SDK can name (1008 or 1011 — not
      1013, which is "room full").
- [ ] Per-connection frame budget (proposal 60 frames/s, 32 MiB/min); over
      budget → close with the same code family.
- [ ] Tests: slow-consumer memory stays bounded; a flooder is closed and the
      room stays alive for everyone else.
- [ ] README knob table + the honesty section's one sentence.

## Acceptance criteria

- Both tests pass; knobs documented.
