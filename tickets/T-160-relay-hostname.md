---
id: T-160
title: "Own the relay hostname — owner at keyboard"
status: done
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

- [x] Railway → relay service → Networking → add custom domain
      `relay.spools.lol`; note the CNAME target it hands back (owner at keyboard).
- [x] GoDaddy DNS: `CNAME relay → <target>`. Verify `curl https://relay.spools.lol/`
      returns the health JSON and a `wss://relay.spools.lol/yjs/<room>` upgrade
      works (the T-003 spike script or `apps/client` against it).
- [x] SDK: `DEFAULT_RELAY` → `wss://relay.spools.lol/yjs`; update the tests that
      pin the old value (`spool.test.ts`); CHANGELOG entry; publish (version:
      see Notes).
- [x] Clients: rebuild room + mixtape, regenerate the vendor bundle
      (`pnpm client:vendor`), redeploy (`scratch/deploy-room.sh`). *(Room and
      vendor bundle 3 Sep; the mixtape at the gh-pages root 5 Sep — see Notes.)*
- [x] Keep the `*.up.railway.app` hostname enabled on the service indefinitely
      and write that promise into the relay README's "What the canonical relay
      promises" block: old links must keep working.
- [x] Docs: relay README "Point your links at it" example, WHITEPAPER §1's
      example link, T-002's name log gets a row. *(The two examples were
      already host-agnostic — `your-relay.example` and an elided host — so
      nothing to change; the T-002 row landed 5 Sep.)*

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

- **3 Sep 2026, DNS half done by the owner; SDK half landed (this branch).**
  `relay.spools.lol` is a CNAME to `rlyytybq.up.railway.app`; Railway issued
  the Let's Encrypt certificate at 09:14 UTC (the owner saw Safari's
  "not private" page inside that window — a reload clears it). Verified
  through the new name from a second machine: health JSON, a pocket
  envelope, a websocket upgrade to `/yjs/<room>`, and a strict TLS check
  (chain validates). `DEFAULT_RELAY`, its test, the CHANGELOG, the relay
  README's promise about the old hostname, and the vendored no-build client
  are updated here.
- **Still the owner's, in order:** (1) the publish — `spools` with the new
  default; RELEASING.md's rule says a default change is the minor lane
  (`0.2.0`), the owner may call a hostname swap a fix (`0.1.1`) — sign-off;
  (2) redeploy the room and mixtape (`scratch/deploy-room.sh`) so links
  minted at chat.spools.lol carry the new name — until then the deployed
  room still mints Railway-hostname links, which keep working; (3) never
  remove the Railway hostname from the service.
- **Closed 5 Sep 2026 (sync-up).** Every acceptance criterion had been met
  by other tickets without this one noticing: (1) the publish was T-181 —
  `spools@0.2.0` on the registry, its tarball read back to confirm the
  default (so `npm view spools` shows the release); (2) T-161's production
  check hit health 200 and a websocket upgrade on *both* hostnames against
  the same process, so old and new links share a room; (3) the room was
  rebuilt and redeployed on 3 Sep (gh-pages `f86c7d6`, and chat.spools.lol
  through the same script), so the "deployed room still mints
  Railway-hostname links" sentence above stopped being true that day. The
  one client still pinning Railway was the **mixtape** at the gh-pages
  root — its bundle dated from T-105's midnight test (15 Aug). Rebuilt
  today from `main` (SDK 0.2.1 workspace build: `relay.spools.lol`, and
  T-176's clipboard fallback rides along) and pushed to the gh-pages root;
  verified by fetching the live bundle. T-002's name log has its
  `relay.spools.lol` row. (3) stands as a promise in the relay README.
