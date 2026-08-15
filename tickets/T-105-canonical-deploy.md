---
id: T-105
title: "Canonical relay: pocket deploy"
status: doing
milestone: M10
depends: [T-101]
---

## Goal

The default-link story actually gets fixed: the canonical Railway relay runs the pocket volume-backed, TTL ~60 days, per the signed-off posture. **Needs the owner at the keyboard** (Railway/Fly auth — T-002/T-041 precedent; prompt, don't attempt headless).

## Context

`DEFAULT_RELAY` is the Railway deployment (spool.ts:15). fly.toml's "stateless: scale-to-zero is safe" comment stops being true with a pocket and must be revised alongside the mounts variant. Decision 3: TTL documented as a courtesy window, not an archive.

## Tasks

- [x] Railway: volume mounted, `POCKET_DIR` + knobs set, deploy, verify health `pocket` block from production.
- [x] fly.toml variant: `[mounts]` + revise the stateless comment (scale-to-zero now trades pocket latency, not correctness — deposits persist on the volume; note whatever Fly wake behavior is observed).
- [x] README deploy button docs updated for both paths, including running *without* the pocket (env-less = today's relay).
- [ ] Cross-device midnight test against production (milestone criterion 1's real-world half): phone writes + goes offline, laptop cold-opens the link.
- [x] Record the promised TTL + budget knob values in the README honesty section.

## Acceptance criteria

- Production health JSON advertises the pocket; the cross-device midnight test passes against `DEFAULT_RELAY`.
- A relay restart on the platform does not lose deposits (volume verified).

## Notes / open questions

**Prepped headless (Aug 2026) — the parts that don't need auth:** fly.toml now mounts `pocket_data` at `/data` with `POCKET_DIR=/data/pocket` and its "stateless: scale-to-zero is safe" comment is rewritten honestly (deposits *are* somebody waiting; with the volume, scale-to-zero trades latency, not correctness). The relay README's deploy section covers the volume steps for both platforms and the honest no-volume mode.

**Deployed and volume-verified (15 Aug 2026).** The owner attached
`spools-relay-volume` at `/data` and set `POCKET_DIR=/data/pocket`; `railway
variables` shows no other pocket overrides, so production runs the stock knobs.
Production health advertises the pocket:

```
{"pocket":{"rooms":2,"deposits":2,"ttlDays":60,"maxBytes":8388608}}
```

**Criterion 2 (restart doesn't lose deposits) — passed.** Deployment
`fbabfedc` succeeded 07:04:42 -07:00; deploy logs read `Starting Container` →
`Mounting volume on: …` → `spools-relay listening`. Health at 07:06:58 still
reported 2 rooms / 2 deposits, unchanged from the pre-restart baseline. A fresh
container is a fresh process with an empty `namespaces` map, so those counts can
only come from the startup rescan of `POCKET_DIR` (server.js:213); relay
connections were 0 in every sample, so nothing re-deposited them. The volume is
real.

Worth noting for anyone re-running this: the health JSON reports identical
counts whether the pocket is on disk or in memory (server.js:398 — counts and
advertised limits only, never a directory), so the endpoint alone can't prove
persistence. The restart is the only test that does.

Promised TTL recorded in the relay README ("What the canonical relay
promises"): 60 days as a courtesy window, not an archive; K=4, 8 MiB per
deposit, 1 GiB relay-wide.

**A test client is deployed.** Neither client had a host — T-090's
"cross-device" was two origins on one laptop — so the mixtape `dist/` now ships
to GitHub Pages from an orphan `gh-pages` branch:
**https://osfasofa.github.io/spools/**. Rebuilt first: the committed `dist/`
predated T-104 and had no pocket beat in it. `base: './'` means the subpath
works untouched. Two notes for whoever redeploys: the crypto is pure-JS
tweetnacl (`nacl.hash` for the token, secretbox for sealing), *not* WebCrypto,
so there is no secure-context requirement and a plain-http LAN host would also
have worked; and the `gh` CLI here is authed as `jdomonell`, which has only
read access to `osfasofa/spools`, so the Pages REST API 404s — pushing the
branch auto-enabled Pages anyway, and git push uses different credentials.

**Production round trip, browser-proven (15 Aug 2026).** Against
`DEFAULT_RELAY`, from the deployed client, with 0 rooms and 0 connections on
the relay at open time:

1. Fresh keyed spool `ivory-river-033` auto-created on load (newSpool keys by
   default), one track wound → production pocket went 2 → 3 rooms/deposits.
2. Writer tab closed; the origin's IndexedDB deleted outright (`ivory-river-033`
   removed, nothing remaining) — a genuine cold device, no local copy.
3. Cold open of the same link with nobody online: the beat rendered
   **"⤵ 1 sealed copy from the pocket"** and the track came back. 0 console
   errors.

That closes the loop the automated harness could only prove locally: the
production pocket both accepts deposits and serves them to a cold reader.

**Remaining, owner at keyboard:** the genuinely-two-devices version — phone
writes a keyed spool and goes offline (airplane mode, ideally on cellular so
it isn't LAN-local), laptop cold-opens the share link from a fresh profile.
The single-machine half above is proven; what's left is the physical-device,
separate-network confirmation of milestone criterion 1.
