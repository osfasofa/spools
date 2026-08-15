---
id: T-105
title: "Canonical relay: pocket deploy"
status: todo
milestone: M10
depends: [T-101]
---

## Goal

The default-link story actually gets fixed: the canonical Railway relay runs the pocket volume-backed, TTL ~60 days, per the signed-off posture. **Needs the owner at the keyboard** (Railway/Fly auth — T-002/T-041 precedent; prompt, don't attempt headless).

## Context

`DEFAULT_RELAY` is the Railway deployment (spool.ts:15). fly.toml's "stateless: scale-to-zero is safe" comment stops being true with a pocket and must be revised alongside the mounts variant. Decision 3: TTL documented as a courtesy window, not an archive.

## Tasks

- [ ] Railway: volume mounted, `POCKET_DIR` + knobs set, deploy, verify health `pocket` block from production.
- [ ] fly.toml variant: `[mounts]` + revise the stateless comment (scale-to-zero now trades pocket latency, not correctness — deposits persist on the volume; note whatever Fly wake behavior is observed).
- [ ] README deploy button docs updated for both paths, including running *without* the pocket (env-less = today's relay).
- [ ] Cross-device midnight test against production (milestone criterion 1's real-world half): phone writes + goes offline, laptop cold-opens the link.
- [ ] Record the promised TTL + budget knob values in the README honesty section.

## Acceptance criteria

- Production health JSON advertises the pocket; the cross-device midnight test passes against `DEFAULT_RELAY`.
- A relay restart on the platform does not lose deposits (volume verified).

## Notes / open questions

**Prepped headless (Aug 2026) — the parts that don't need auth:** fly.toml now mounts `pocket_data` at `/data` with `POCKET_DIR=/data/pocket` and its "stateless: scale-to-zero is safe" comment is rewritten honestly (deposits *are* somebody waiting; with the volume, scale-to-zero trades latency, not correctness). The relay README's deploy section covers the volume steps for both platforms and the honest no-volume mode.

**Remaining, owner at keyboard:** (1) Railway dashboard — attach a volume to the production service, mount `/data`, set `POCKET_DIR=/data/pocket` (+ any knob overrides), redeploy from this branch; (2) verify `curl https://spools-relay-production.up.railway.app/` shows the `pocket` block, and again after a restart with a deposit in place; (3) the cross-device midnight test against `DEFAULT_RELAY` (milestone criterion 1's real-world half — phone writes and goes offline, laptop cold-opens); (4) record the promised TTL in this ticket and flip it done.
