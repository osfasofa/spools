---
id: T-002
title: Claim the name (npm, GitHub, domains)
status: done
milestone: M0
depends: []
---

## Goal

`spools` is ours everywhere it needs to be, before anything ships. The one ticket with a clock ticking on it (squatting risk).

## Context

DESIGN_DOC §2: `spools` verified available on npm as of Aug 2026; bare `spool` is a dead squat. §4 lists this as an immediate errand.

## Tasks

- [x] Publish `spools@0.0.1` stub to npm: README pointing at the repo, `"private": false`, no real API. Also consider `spools-relay` — check availability and claim if free. *(both claimed; `spools` shipped as the real SDK, not a stub — see Notes)*
- [x] Check/claim GitHub org (candidates: `spools`, `spoolsdev`, or keep under personal — record the call).
- [x] Domain check: `spools.dev`, `spool.link` or similar for the hosted reference client. Record findings + any purchase decision; buying is optional, knowing isn't.

## Acceptance criteria

- `npm view spools` shows our stub.
- Notes below record the GitHub-org and domain decisions with what was available.

## Notes / open questions

- Running **in parallel** with T-011 (user at the keyboard; prep by Claude, Aug 2026). Availability checked:
  - npm: `spools` **free**, `spools-relay` **free** (both 404 on the registry) — claim both.
  - Domains (RDAP): `spools.dev` **taken**, `spools.app` **taken**, `spool.link` **available**, `spools.io` unknown (.io has no public RDAP — check at a registrar).
- Both packages prepped for publish at 0.0.1: claim READMEs, `license: MIT` *(flagged for user confirmation before publish)*, repository fields pointing at `github.com/osfasofa/spools` (update if an org is claimed).
- **Deprioritized by user (Aug 2026):** "underground, obfuscated thing anyway" — claiming would be nice but is explicitly not urgent; don't treat the squatting clock as pressure. Publish prep stays committed and ready whenever the mood strikes. Back to `todo`, unblocking nothing.
- **`spools-relay` published (2026-08-11, via T-041):** `spools-relay@0.1.0` live on npm under the user's account (2FA security key enabled in the process — npm now requires it to publish). The `spools` SDK name remains unclaimed/unpublished; GitHub-org and domain decisions still open.
- **Domain decision (2026-08-11, user):** no dedicated domain — the user has existing URLs to host the reference client on, and the link format is host-agnostic by design (any base URL; the client is static files), so a branded domain buys nothing the protocol needs. Availability recorded for the record: `spool.link` available, `spools.dev` taken, `spools.io` likely available (RDAP 404, registrar-confirm if ever wanted). Task closed as "knowing, not buying."
- **Availability re-check (2026-08-11):** npm `spools` still free; GitHub orgs `spools` and `spoolsdev` both 404 (likely claimable). `github.com/osfasofa/spools` 404s publicly — private or never pushed; resolve when the GitHub call is made.
- **`spools` published (2026-08-12, user at the keyboard):** `spools@0.0.1` live, maintainer `osfasofa`, verified via `npm view`. Because the whole build order had landed by publish time, the "stub" became the real SDK — README rewritten from name-claim language to an honest 0.0.x quick-start, and MIT LICENSE files added (repo root + both packages; copyright holder is the `osfasofa` handle, not a legal name, matching the project's public identity). Both npm names now claimed; the ticket's squatting clock is stopped.
- **GitHub decision (2026-08-12, user):** stay under the personal `osfasofa` account — no org. Both org names were available; the call was simplicity over branding for an underground project. `github.com/osfasofa/spools` is pushed and public (verified 200); the packages' `repository` fields already point there.
- **Domain update (Aug 2026, post-M11):** `spools.lol` was acquired after this ticket closed — `chat.spools.lol` now serves the room (Vercel project `spools-chat`, prebuilt static; `scratch/deploy-room.sh`). The "no dedicated domain" call above is superseded by events; the protocol stays host-agnostic and the domain is a convenience, not a dependency. Recorded here so these notes stay the true log of the name story.
- **`relay.spools.lol` (3 Sep 2026, T-160):** the canonical relay's hostname is now ours — a CNAME to the Railway service (`rlyytybq.up.railway.app`), Let's Encrypt via Railway, `DEFAULT_RELAY` pointed at it in `spools@0.2.0`. The Railway-generated hostname (`spools-relay-production.up.railway.app`) stays enabled on the same service indefinitely so every link minted before 3 Sep keeps working (the relay README's promise block says so). Changing providers is now a DNS change, not a stranded-links event.
