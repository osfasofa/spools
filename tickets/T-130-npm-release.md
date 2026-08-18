---
id: T-130
title: "npm release: the real SDK + current relay + first keeper"
status: done
milestone: M12
depends: []
---

## Goal

What's on npm matches what's true. Today it doesn't: `spools@0.0.1` is the
T-011-era SDK (no encryption, no pocket, no rewind, no awareness),
`spools-relay@0.1.0` predates the T-124 group knobs, and `spools-keeper` was
never published despite the docs saying `npx spools-keeper <link>`. The spec
is written, three clients run on the SDK, and M11 proved the surface — this
is release mechanics, not design.

**Owner at the keyboard for `npm publish` (auth), same as T-002.** Everything
up to the publish command is preppable headless.

## Context

T-002 claimed the names (notes there record the org/domain findings);
SPEC.md is v1.1; `docs/SDK-API.md` documents the shipped surface.
Version proposal — sign-off at publish time, not protocol-shaping:

- `spools` **0.0.1 → 0.1.0** — the real SDK: links/codes, wind/entries/events,
  encryption at rest + both transports, rewind, export/stash, the pocket
  client, `get awareness()`. 0.x semantics stated plainly in the README
  (pre-1.0, surface may move; the SPEC is the stable thing).
- `spools-relay` **0.1.0 → 0.2.0** — the T-124 defaults (`POCKET_K=8`,
  24 PUTs/min) and the group-scale honesty docs. Minor bump: behavior
  defaults changed.
- `spools-keeper` **→ 0.1.0** — first publish, so the documented
  `npx spools-keeper` sentence stops being aspirational.

## Tasks

- [x] Preflight each package: `npm pack --dry-run` contents review (dist
      only for the SDK, no scratch/tests), `files`/`exports`/`types` fields,
      `repository` URLs, LICENSE present, README accurate against what
      ships (the SDK README should say the one-paragraph story + point at
      SPEC.md and SDK-API.md; the relay README already carries the honesty
      sections — verify the knob table matches the code).
- [x] `prepublishOnly` scripts: SDK = build + test; relay = test; keeper =
      test (keep them boring — no new tooling).
- [x] Fresh-machine smoke: `npm pack` tarballs installed into a scratch dir;
      `npx spools-relay` starts and serves health; the SDK imports and
      `newSpool({ persist: false })` works in Node; keeper starts against a
      link.
- [x] `packages/spools-keeper`: add the LICENSE file (the preflight above
      requires it; today it's a package.json field only — the other two
      packages ship the file).
- [x] SDK README: rewrite the `Status: 0.0.x` line for 0.1.0, same honest
      register; 0.x semantics per docs/RELEASING.md (minor = breaking
      lane, the SPEC is the stable thing).
- [x] Settle with the owner at publish (trade-offs in docs/RELEASING.md,
      **sign-off**): `yjs`/`y-protocols` → `peerDependencies`, and where
      the documented-vs-advanced export line sits (SDK-API's surface vs
      `index.ts`'s wider one). Cheapest before any external vessel repo
      exists. Keeper `engines >=22` vs relay `>=18` confirmed intended or
      harmonized in the same pass.
- [x] Publish, owner at keyboard: `npm publish` ×3 in dependency-safe order
      (**relay, SDK, keeper** — the keeper's `"spools": "workspace:^"` is
      rewritten to `^0.1.0` at pack time, so `spools@0.1.0` must exist on
      the registry before the keeper lands or `npm i spools-keeper` breaks
      in the gap; relay first still keeps the SDK README's default-relay
      story honest — the original "none actually depend on each other" was
      wrong for the keeper, see docs/RELEASING.md).
- [x] Post-publish: `npm view` sanity ×3; a git tag per package
      (`spools@0.1.0` etc.); INDEX + this ticket's Notes record the shipped
      versions.

## Acceptance criteria

- `npm view spools version` → `0.1.0`, `spools-relay` → `0.2.0`,
  `spools-keeper` → `0.1.0`; a clean `npm i spools` in an empty project can
  run the SDK-API quickstart against the canonical relay; `npx spools-relay`
  and `npx spools-keeper` both work as the docs promise.
- Tags pushed; versions recorded in Notes.

## Notes / open questions

- **2026-08-16, prep session (headless):** everything up to the publish
  command is done and verified; only the hardware-key steps remain.
  - Sign-offs collected from the owner, all as RELEASING.md recommended
    (settlement recorded there): peers at 0.1.0 (`yjs`/`y-protocols`, kept
    as devDeps so the workspace builds); export line drawn in prose (one
    sentence in the SDK README + SDK-API.md); engines divergence kept and
    documented — it **is** load-bearing: `engine.ts` falls back to the
    global `WebSocket` when no polyfill is passed, the keeper passes none,
    and Node's native WebSocket is only stable from 22, while the relay's
    `ws`-based `>=18` is genuine. Versions confirmed 0.1.0 / 0.2.0 / 0.1.0.
  - **Surprise, publish-mechanics:** bare `npm publish` cannot ship the
    keeper — npm doesn't understand `workspace:^` and would publish it
    verbatim (broken). `pnpm pack` rewrites it to `^0.1.0` (verified in the
    tarball). Publish all three with `pnpm publish` for one liturgy.
  - Fresh-dir smoke (tarballs npm-installed, Node 22): relay serves health;
    SDK `newSpool({ persist: false })` wound an entry and shared a link;
    keeper joined by that link, converged ("1 entries held"), and SIGTERM
    produced a valid `spool-export` v1 file. npm ≥7 auto-installed the
    yjs/y-protocols peers — the peering story holds on a clean machine.
  - Relay README knob table verified against `server.js` (K=8, 24 PUTs/min,
    60 d, 8 MiB, 1 GiB) — already true, no edit needed. CHANGELOG.md ×3
    written (repo-side; not added to `files`).
- **2026-08-18, record correction (headless): SHIPPED 2026-08-16, ~07:38–07:40 UTC.**
  Registry-verified this session: `npm view` → `spools@0.1.0`
  (time.modified 07:39:09Z), `spools-relay@0.2.0` (07:38:16Z — the
  dependency-safe order was followed: relay first), `spools-keeper@0.1.0`
  (07:39:56Z). Tags `spools@0.1.0` / `spools-relay@0.2.0` /
  `spools-keeper@0.1.0` were already pushed, all at f4db17e (the prep-merge
  tree the tarballs were packed from). Every AC is met; the only unticked
  box was this one — "record the shipped versions" — because the publish
  was owner-at-keyboard and no session ran afterward to flip the record.
  Two days of drift cost one downstream doc a wrong gate claim (the agents
  riff called the fork "gated on T-130"), caught at merge. Lesson for the
  lab notebook: **for "did it ship," the registry outranks INDEX** — a
  future session seeing an owner-at-keyboard ticket in `doing` should
  `npm view` before repeating the claim. M12 closed; the ECOSYSTEM
  vessel/fork gate is open (lore and familiar are unblocked).
- T-002's deprioritization note stands in spirit: none of this is urgent —
  it's here so the release is a checklist, not a design session, whenever
  the mood strikes.
- M13 (T-142, Aug 2026) wrote the standing policy this ticket executes:
  [docs/RELEASING.md](../docs/RELEASING.md) — the "npm matches what's true"
  trigger, version semantics, the publish liturgy with the corrected
  order, and the sign-off decisions above. One new pressure since the
  drafting: the ecosystem plan (docs/ECOSYSTEM.md) hard-gates every vessel
  repo on this ticket shipping, so "whenever the mood strikes" now has a
  queue behind it.
