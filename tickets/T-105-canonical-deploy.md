---
id: T-105
title: "Canonical relay: pocket deploy"
status: done
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
- [x] Cross-device midnight test against production (milestone criterion 1's real-world half): phone writes + goes offline, laptop cold-opens the link.
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

**Cross-device run: owner-confirmed, 15 Aug 2026.** The two-physical-device
version was run by the owner against the deployed client and `DEFAULT_RELAY`
and reported working ("tested it pretty well and it seems to work"). Recorded
as owner attestation rather than a measured run — the instrumented evidence in
this ticket is the single-machine round trip above plus the volume restart;
`scratch/torture-t104/midnight.mjs` remains the repeatable automated proof.

**Ticket closed — M10 complete, and with it the v1 roadmap.** Milestone
criterion 1 (a spool opens from the pocket when nobody is online) and
criterion 2 (deposits survive a relay restart) are both met against the
canonical relay.

**Deployed and verified — Aug 15, 2026.** The owner attached the volume (`spools-relay-volume`) and set `POCKET_DIR=/data/pocket` in the Railway dashboard; verification ran from the owner's machine against production.

**The promise now live on `DEFAULT_RELAY`:** deposits held **60 days** from last touch (reads refresh it), **8 MiB** per deposit, 4 session tags per spool, 1 GB relay-wide budget — a courtesy window, not an archive. Devices remain the spool's home.

### Verification results

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Health advertises the capability | ✔ | `pocket:{rooms,deposits,ttlDays:60,maxBytes:8388608}` on the production health JSON |
| 2 | Volume survives a container replacement | ✔ | Deposited, then `railway redeploy` → deployment `d69cb298`, instance RUNNING; logs show `Mounting volume on: …/vol_yffw6pyex1fl1fd0` → `Starting Container` → fresh `spools-relay listening`. Deposit still held after the new container booted — the T-101 boot rescan proven in production |
| 3 | Midnight test, SDK (Node, two processes) | ✔ | Writer wound 3 tracks and `leave()`d; a **separate process** cold-opened after the restart: `applied=1, dropped=0`, all 3 entries + 1 rewind moment, **116 ms** |
| 4 | Midnight test, shipped client (real browser, cross-origin) | ✔ | `apps/client` on :8791 created `midnight-canyon-118` against production, wound 3 tracks, `leave()` flushed; tab closed; the link opened on **:8792** (separate origin ⇒ separate IndexedDB, no shared-storage cheat) rendered all 3 tracks with `pocket.phase='applied'` and the moment carried across |
| 5 | Envelope on the wire is SPEC §6 | ✔ | The browser client's deposit read back from production: 857 bytes, first three bytes `e2 e3 01` (magic + version 1) |

### Notes

- Harness kept at `scratch/verify-t105/verify.mjs` (deposit/check/read phases, drives the local pocket-aware build against `DEFAULT_RELAY`; it re-derives the §6 token independently rather than trusting the SDK). The saved link file is deleted after use — it carries a key.
- `railway redeploy` printed an agent-tooling nudge instead of acting in a non-interactive session; `--json` ran it normally. (`railway setup agent` was deliberately not run — it rewrites editor config.)
- Two test spools (`humble-comet-887`, `midnight-canyon-118`) sit in the production pocket, ~1 KB each. There is no DELETE endpoint by design (it needs standing → the identity ladder), so they age out with the 60-day TTL.
- Fly's `[mounts]` variant is written but unexercised — nobody has deployed the Fly path; the observed-wake-behavior note stays open until someone does.
