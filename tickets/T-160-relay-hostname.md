---
id: T-160
title: "Own the relay hostname — owner at keyboard"
status: todo
milestone: M15
depends: []
---
## Goal

Every new link carries a relay hostname we control (`relay.spools.lol`), and
the Railway-generated hostname keeps serving forever as a legacy alias for the
links already in the wild.

## Context

`DEFAULT_RELAY` is `wss://spools-relay-production.up.railway.app/yjs`
(`packages/spools/src/spool.ts`), baked into the room and mixtape bundles and
`apps/client/vendor/spools.js`. Links carry `relay=` (SPEC §1: the link, not
the client, decides where a spool lives), so **every link minted so far pins a
hostname Railway owns**. If that service is renamed, moved, or lost, every
existing link is dead and there is no fallback path. `relay.spools.lol` has no
DNS record today; `spools.lol` is served by GoDaddy DNS (`domaincontrol.com`).
The pocket lives on the relay URL's origin (SPEC §6), so it moves with the
hostname for free.

This is the review's F1 and it goes first: after it, changing providers is a
DNS change; before it, changing providers strands every link.

## Tasks

- [ ] Railway → relay service → Networking → add custom domain
      `relay.spools.lol`; note the CNAME target it hands back (owner at keyboard).
- [ ] GoDaddy DNS: `CNAME relay → <target>`. Verify `curl https://relay.spools.lol/`
      returns the health JSON and a `wss://relay.spools.lol/yjs/<room>` upgrade
      works (the T-003 spike script or `apps/client` against it).
- [ ] SDK: `DEFAULT_RELAY` → `wss://relay.spools.lol/yjs`; update the tests that
      pin the old value (`spool.test.ts`); CHANGELOG entry; publish (version:
      see Notes).
- [ ] Clients: rebuild room + mixtape, regenerate the vendor bundle
      (`pnpm client:vendor`), redeploy (`scratch/deploy-room.sh`).
- [ ] Keep the `*.up.railway.app` hostname enabled on the service indefinitely
      and write that promise into the relay README's "What the canonical relay
      promises" block: old links must keep working.
- [ ] Docs: relay README "Point your links at it" example, WHITEPAPER §1's
      example link, T-002's name log gets a row.

## Acceptance criteria

- A fresh room at chat.spools.lol mints a link whose `relay=` names
  `relay.spools.lol`.
- An old link (Railway hostname) and a new link for the same code sync with
  each other — both hostnames reach the same process, so it's the same room.
- `npm view spools` shows the release that carries the new default.

## Notes / open questions

- **Version (sign-off):** RELEASING.md's rule says "behavior defaults changed →
  minor", which makes this `spools@0.2.0`. The owner may reasonably call a
  default-relay swap a fix (`0.1.1`). Either way the CHANGELOG's first bullet
  says which hostname new links carry.
- Related but separate: T-177 option 2 (omit `relay=` when it equals the
  client's default) would make *future* links pin no hostname at all.
