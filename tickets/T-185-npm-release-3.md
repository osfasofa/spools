---
id: T-185
title: "npm release: SDK 0.2.1, keeper 0.2.0 — owner at keyboard"
status: doing
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

- [x] Prep (any session): date the two CHANGELOG headings, `pnpm pack`
      dry-run ×2 eyeballed (the keeper tarball's dependency reads
      `"spools": "^0.2.1"`), fresh-dir tarball smoke — `npx spools-keeper
      --links <file>` from the tarball holds two spools and logs
      timestamped lines under Node 24.
- [x] **Publish ×2, owner at keyboard.** *(5 Sep 2026, 02:22 and 02:23 UTC on the 6th.)*
- [x] `npm view` sanity ×2; tags pushed one per call; this ticket and
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

- **Prep, 5 Sep 2026 (headless):** both CHANGELOG headings dated
  2026-09-05 (T-184's line rides under `0.2.1`, per the owner's call).
  `pnpm pack` ×2 eyeballed — the SDK tarball ships `dist/` (index.js +
  d.ts) + LICENSE + README + package.json, 30 KiB; the keeper ships
  `keeper.js` + LICENSE + README + package.json, 7 KiB, and its dependency
  reads `"spools": "^0.2.1"` (pnpm rewrote `workspace:^`). `dist/` was
  newer than the last `src/` change, and the tarball's `index.js` carries
  `pagehide` and the 10 s clock refresh; `pnpm publish` rebuilds anyway.
  Fresh-dir smoke under Node 24.19: `npm i` of both tarballs into an empty
  project resolved the keeper's `^0.2.1` from the local SDK tarball; a
  local relay, two spools minted from the installed SDK (one keyless, one
  keyed, 3 and 5 entries), `npx spools-keeper --links pegboard` from
  `node_modules` — every line ISO-stamped, `relay: connected`, `3 entries
  held` / `5 entries held`, the keyed one's `pocket: applied (1 deposit)`,
  no link or key in the log; the writers left, and a cold open of each
  link converged with only the keeper in the room (the keyless spool has
  no pocket, so that one is the keeper's doing, not the relay's). SIGTERM
  saved both export files with the right counts. Script:
  `scratch/`-style, kept out of the repo (session scratchpad).
- Lab note from the smoke, not a T-185 item: my first two runs gave the
  SDK `ws://127.0.0.1:4597` with no `/yjs` path. The relay refuses the
  upgrade, and the SDK sits in `connecting` for good — no error, no
  event, while the pocket (plain HTTP on the same origin) works fine, so
  the keyed spool *looked* alive (deposits applied) and the keyless one
  never connected. Links carry their own `relay=` so a person never types
  this, but a vessel author passing `relay:` to `newSpool` could, and the
  only symptom is silence. Filed here for the owner to decide whether a
  one-line check (relay URL must end in `/yjs`) or a doc sentence in
  SDK-API earns a ticket.
- Drafted 5 Sep 2026 at the sync-up. Three places said this needed its own
  ticket and none had filed it (T-182 Notes ×2, T-182 follow-on 3, T-178's
  last line), and T-178 was sitting in `doing` behind it with nothing left
  for a session to pick up.
- If T-184 (the lone-peer socket) is signed off and lands before the owner
  gets to the keyboard, it rides along as `spools@0.2.2`-or-`0.2.1` at the
  owner's call — fold its CHANGELOG line under whichever heading ships.
- **Shipped, 5 Sep 2026 (evening, US; 02:22–02:23 UTC on the 6th), owner at
  keyboard:** `spools@0.2.1` then `spools-keeper@0.2.0`, in that order.
  The one wall was T-130's again — `npm whoami` returned 401 before the
  run, so `npm login` went first. The keeper's publish took about half a
  minute longer than the SDK's to show on `npm view` (its `prepublishOnly`
  runs the three relay-spawning tests, ~15 s), so the first check after
  the second command still read `0.1.1`; the next read `0.2.0` with
  `dependencies = { spools: '^0.2.1' }` — the publish order held.
  Verified from a fresh empty project under Node 24.19: `npm i spools@0.2.1`
  (dist carries `pagehide` and the `relay.spools.lol/yjs` default), then
  `npm i spools-keeper` resolving `spools@0.2.1` and the prep smoke rerun
  against the registry install — two spools held, timestamped lines,
  cold-open converged with only the keeper in the room. Tags
  `spools@0.2.1` and `spools-keeper@0.2.0` pushed one per call at `f7c57f6`
  (the handoff commit; the same tree as the prep commit plus docs), checked
  with `git ls-remote --tags`.
- **The note, not yet sent (5 Sep 2026):** the session's write into
  `../syrup/HANDOFF.md` and `../manyhands/FINDINGS.md` was refused by the
  tool's permission gate (writes outside this repo), after the commit
  above had already said it landed — corrected here in the next commit.
  The two notes are ready as files in the session scratchpad (`syrup-note.md`,
  `manyhands-note.md`): syrup's goes at the top of HANDOFF §1 Open Threads
  with the §5 Durability landmine marked closed upstream; manyhands' is a
  dated section for the end of FINDINGS.md. Owner pastes them in, or a
  session run inside those repos does. This ticket stays `doing` on that
  one line; the publish half is complete.
