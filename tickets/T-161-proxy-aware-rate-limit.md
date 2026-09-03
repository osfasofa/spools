---
id: T-161
title: "Proxy-aware rate limit: the per-IP bucket is global behind Railway"
status: todo
milestone: M15
depends: []
---
## Goal

The pocket's per-IP admission limit is keyed on the real client address in
production — not on the proxy's.

## Context

`server.js` keys `putLog` on `request.socket.remoteAddress`. Behind Railway's
edge proxy that is the proxy's internal address, not the client's; Railway
appends the client IP as the **rightmost** `X-Forwarded-For` value and does
not strip client-supplied values (Railway Central Station threads, Sep 2026).
Almost certainly, then, the canonical relay runs **one global bucket of 24
deposits a minute across every app on it** (chat, syrup, familiar, lore).
Two consequences: the 25th deposit in any minute gets 429 and the SDK keeps
it pending (silent, per `pocket.ts`), and one stranger sending 24 tiny
valid-header PUTs a minute starves every real deposit on the relay. Review
finding F2.

## Tasks

- [ ] Verify first: one temporary log line on PUT printing `remoteAddress` and
      `x-forwarded-for` (never the room or token — the relay doesn't chat about
      rendezvous names). Deploy, deposit once from a browser, read the log,
      remove the line.
- [ ] Add `TRUST_PROXY` (env, default off). When set, client IP = the
      **rightmost** `X-Forwarded-For` hop, falling back to `remoteAddress`.
      Never the leftmost value (client-supplied). Use it for the pocket bucket
      and for whatever T-169/T-170 add.
- [ ] While here: bound `putLog` on insert (drop entries older than a minute)
      instead of only in the hourly sweep.
- [ ] Set `TRUST_PROXY=1` on the canonical relay (owner at keyboard, Railway
      variables); add the knob to the README table and `fly.toml`.
- [ ] Test (node:test, real instance): with `TRUST_PROXY`, two `X-Forwarded-For`
      values get independent 24/min budgets; without it, the header is ignored.

## Acceptance criteria

- The production log line (before removal) shows the real client address
  being keyed.
- The two-address test passes; the ignore-header test passes.
- README knob table matches the code.
