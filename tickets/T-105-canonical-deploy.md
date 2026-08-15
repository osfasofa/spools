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
