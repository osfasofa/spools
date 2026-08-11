---
id: T-002
title: Claim the name (npm, GitHub, domains)
status: doing
milestone: M0
depends: []
---

## Goal

`spools` is ours everywhere it needs to be, before anything ships. The one ticket with a clock ticking on it (squatting risk).

## Context

DESIGN_DOC §2: `spools` verified available on npm as of Aug 2026; bare `spool` is a dead squat. §4 lists this as an immediate errand.

## Tasks

- [ ] Publish `spools@0.0.1` stub to npm: README pointing at the repo, `"private": false`, no real API. Also consider `spools-relay` — check availability and claim if free.
- [ ] Check/claim GitHub org (candidates: `spools`, `spoolsdev`, or keep under personal — record the call).
- [ ] Domain check: `spools.dev`, `spool.link` or similar for the hosted reference client. Record findings + any purchase decision; buying is optional, knowing isn't.

## Acceptance criteria

- `npm view spools` shows our stub.
- Notes below record the GitHub-org and domain decisions with what was available.

## Notes / open questions

- Running **in parallel** with T-011 (user at the keyboard; prep by Claude, Aug 2026). Availability checked:
  - npm: `spools` **free**, `spools-relay` **free** (both 404 on the registry) — claim both.
  - Domains (RDAP): `spools.dev` **taken**, `spools.app` **taken**, `spool.link` **available**, `spools.io` unknown (.io has no public RDAP — check at a registrar).
- Both packages prepped for publish at 0.0.1: claim READMEs, `license: MIT` *(flagged for user confirmation before publish)*, repository fields pointing at `github.com/osfasofa/spools` (update if an org is claimed).
- (record publish outcomes + GitHub-org and domain decisions here)
