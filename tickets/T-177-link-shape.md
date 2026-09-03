---
id: T-177
title: "Link shape: shorter and prettier without lying — sign-off"
status: todo
milestone: M15
depends: [T-160]
---
## Goal

Decide what a link handed out from chat.spools.lol looks like.

## Context

Today a room link is ~150 characters, most of it the URL-encoded Railway
relay parameter. The owner asked for prettier links and floated "our own
spools namer." SPEC §1: `relay` is optional and SHOULD be carried (the cost of
omission is stated: two clients with different defaults won't meet); the base
URL before `#` is not protocol-meaningful; unknown parameters are ignored;
clients MUST reject links failing the grammar — but an app may translate its
own URL shape into a canonical link before the SDK sees it. Review F19.

## Options, with the link each produces

1. **After T-160 only:** `https://chat.spools.lol/#spool=amber-cassette-042&relay=wss%3A%2F%2Frelay.spools.lol%2Fyjs&k=…` (~120 chars).
2. **Omit `relay=` when it equals the client's default:**
   `https://chat.spools.lol/#spool=amber-cassette-042&k=…` (~95). Also makes
   future links pin no hostname — a provider move becomes a client redeploy,
   not a stranded link. Moves the relay decision from the link to the host
   page; for the canonical client and relay that's the same authority.
   Vessels on other relays keep carrying `relay=`.
3. **App-level path form:** `https://chat.spools.lol/amber-cassette-042#k=…`
   (~90). A room convention: the host serves `index.html` for any path (a
   rewrite on Vercel/Cloudflare, `404.html` on Pages) and the app builds the
   canonical link before `openSpool`. The SDK never changes.
4. **Pick your own two words.** The grammar already allows any
   `word-word-NNN`; a chooser in the client keeps the random suffix. Two
   groups picking the same code share a relay room harmlessly (different keys
   → "someone isn't on your key"; different pocket namespaces).

**Refused, written down so it isn't relitigated:** any server-side namer or
short-link service — it would hold keys, or the mapping to them, and a
directory is a feed in a trenchcoat (ECOSYSTEM); the relay must never see a
key (SPEC §4). Also refused: a shorter key (§5's no-KDF decision).

Recommendation: T-160, then 2, optionally 3.

## Tasks

- [ ] Owner picks; §5 row (link-minting convention) and, if wanted, a
      non-normative SPEC §1 note (**sign-off**).
- [ ] Room + mixtape mint the chosen form; `openSpool` accepts both forms;
      tests; the vendor bundle regenerated.

## Acceptance criteria

- Decision recorded; new links open in an old client build (they're still
  grammar-valid), old links open in the new one.
