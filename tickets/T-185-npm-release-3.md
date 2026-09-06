---
id: T-185
title: "npm release: SDK 0.2.1, keeper 0.2.0 — owner at keyboard"
status: todo
milestone: M18
depends: [T-178, T-182, T-183]
---

## Goal

What's on npm matches what's true again. Today it doesn't:
`spools-keeper@0.1.1` on the registry has a README and a CLI with no
`--links`, no timestamps, no pocket line, no heartbeat — everything M17
built and ran for two nights; `spools@0.2.0` can still lose a wind made
before the pocket's open-time check settles when `leave()` comes first,
and never flushes a background-window tab on close (T-178's mechanism 5
and the `pagehide` fix, both unreleased). RELEASING.md's one rule —
release when npm would otherwise lie — is met, and T-178 is waiting on
this to send its note.

## Context

Everything up to the publish command is on `main` already:
`packages/spools` is `0.2.1` with the CHANGELOG heading
`## 0.2.1 — unreleased`; `packages/spools-keeper` is `0.2.0` with
`## 0.2.0 — unreleased`. The relay stays at `0.3.0` — nothing changed
there since T-181. **Owner at the keyboard for `pnpm publish` ×2** — npm
2FA with the hardware key (T-002/T-130/T-181 precedent).

Version calls, per RELEASING.md's lanes: the SDK's three fixes change no
default and no visible surface (a wind that used to be lost now lands;
`checking` stays the last pocket word after an aborted check) → **patch,
0.2.1**. The keeper gains a CLI form (`--links`, `--dir`) and its log
changes shape (timestamps on every line) → **minor, 0.2.0**. Both are
already set; the owner may disagree by editing one line before publishing.

## The liturgy (T-181's, verbatim where it applies)

From a clean checkout of `main` at the prep commit:

```sh
cd ~/Dev/OSFA/spools && git pull --ff-only && git status --short   # clean
mise x -- corepack pnpm install
cd packages/spools        && mise x -- corepack pnpm publish        # 1. SDK (builds + tests first)
cd ../spools-keeper       && mise x -- corepack pnpm publish        # 2. keeper (workspace:^ → ^0.2.1 at pack time)
```

- `pnpm publish`, never bare `npm publish` — npm would ship the keeper's
  `workspace:^` verbatim (T-130 surprise).
- A `404 Not Found - PUT` from the registry means *not logged in*: run
  `npm login` (security key) and retry (T-130 wall #2, T-181 wall #1).
- Order matters: SDK → keeper; the keeper's dependency range will read
  `^0.2.1` and needs it on the registry first.
- No relay publish this time.

Then:

```sh
npm view spools version && npm view spools-keeper version
git tag spools@0.2.1 && git tag spools-keeper@0.2.0 && git push --tags
```

One tag per `git tag` call — three names in one call creates nothing
(T-181's lab note).

## Tasks

- [ ] Prep (any session): date the two CHANGELOG headings, `pnpm pack`
      dry-run ×2 eyeballed (the keeper tarball's dependency reads
      `"spools": "^0.2.1"`), fresh-dir tarball smoke — `npx spools-keeper
      --links <file>` from the tarball holds two spools and logs
      timestamped lines under Node 24.
- [ ] **Publish ×2, owner at keyboard.**
- [ ] `npm view` sanity ×2; tags pushed one per call; this ticket and
      INDEX record the shipped versions.
- [ ] **Tell syrup and manyhands** to drop their workarounds — the note is
      drafted verbatim in `tickets/T-178-pocket-deposit-loss.md` ("Note for
      syrup and manyhands"); send it once `spools@0.2.1` is on the
      registry. (Moved here from T-178 at the 5 Sep sync-up so that ticket
      could close on its own acceptance criterion.)

## Acceptance criteria

- `npm view spools version` → `0.2.1`, `spools-keeper` → `0.2.0`; a
  fresh `npm i spools-keeper` resolves `spools@0.2.1`.
- The note to syrup and manyhands is sent.

## Notes / open questions

- Drafted 5 Sep 2026 at the sync-up. Three places said this needed its own
  ticket and none had filed it (T-182 Notes ×2, T-182 follow-on 3, T-178's
  last line), and T-178 was sitting in `doing` behind it with nothing left
  for a session to pick up.
- If T-184 (the lone-peer socket) is signed off and lands before the owner
  gets to the keyboard, it rides along as `spools@0.2.2`-or-`0.2.1` at the
  owner's call — fold its CHANGELOG line under whichever heading ships.
