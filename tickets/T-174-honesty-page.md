---
id: T-174
title: "The honesty page and an abuse contact — the legal page is the honest page"
status: todo
milestone: M15
depends: [T-143]
---
## Goal

spools.lol says what the relay sees, what it keeps and for how long, and who
to write to. That page is the privacy notice, the acceptable-use statement,
and the takedown response in one.

## Context

The relay README already has "What the operator can and cannot see." Nothing
on the web says it, there is no abuse contact, and the review's legal section
names that as the whole exposure: hosting strangers' ciphertext with no way to
act on a request except deleting a namespace if handed the link. Two sentences
the honesty clause is missing: *the relay's host may log request paths and
addresses* (Railway's platform logs can retain `/pocket/<room>/<token>` paths
and client IPs — the token is not the key, but it is the capability to fetch
ciphertext), and, for the day the room reaches strangers, *names and "renamed
by" are what someone typed, not proof* (review F14).

## Tasks

- [ ] Page content, static, no tracking (T-143's venue — the whitepaper
      homepage — or beside it): what the relay sees, the pocket's 60-day
      window, the two missing sentences above, what the operator can and
      cannot do on request, an `abuse@spools.lol` address.
- [ ] Mail: forward `abuse@spools.lol` somewhere read (GoDaddy forwarding or
      whatever exists) — owner at keyboard.
- [ ] Relay README honesty section gains the host-logs sentence; SPEC §4's
      honesty clause is the owner's call (**sign-off** if amended).
- [ ] Room fine print links the page.

## Acceptance criteria

- Page live; a test mail to the abuse address arrives; README sentence merged.
