# Releasing — what versions mean and how npm stays true

*Standing policy, drafted August 2026 (M13). [T-130](../tickets/T-130-npm-release.md) is the first execution of it; this doc is what outlives that ticket. Decisions marked **sign-off** are the owner's, made at publish time — recorded here with trade-offs so the release stays a checklist, not a design session.*

## The one rule

**Release when npm would otherwise lie.** There is no cadence, no train, no calendar. The trigger is drift: when the registry's story (README, defaults, versions) no longer matches the repo's truth, that's a release owed. T-130 exists because all three packages currently fail this test — `spools@0.0.1` predates encryption, rewind, export, and the pocket; `spools-relay@0.1.0` ships pre-T-124 defaults and a now-wrong honesty table; `spools-keeper` is documented everywhere and published nowhere.

Corollary: **docs may not advertise unpublished packages** as if they were live. The keeper's `npx spools-keeper` sentence set the anti-pattern; T-130 retires it.

## What a version is (and is not)

Three different things version independently. Conflating them is how protocols rot:

| Thing | Versioned by | Current | Moves when |
|---|---|---|---|
| **The protocol** | SPEC.md version (v1.1) | v1.1 | Only from working code, additively where possible. **This is the stable thing.** |
| **The wire/at-rest formats** | Magic + version bytes in the envelopes (`E2E1/E2E2/E2E3`, export `version`, pocket `version`) | all v1 | A reader that sees a higher version refuses politely. Compatibility lives here, not in package.json. |
| **The packages** | npm semver, per package, independently | see below | Whenever their own surface or behavior changes. |

Package versions are **not** protocol claims. An SDK 0.3.0 and an SDK 0.9.0 that both speak SPEC v1.1 interoperate completely; the package version prices *API churn for developers*, nothing else.

**0.x semantics, stated plainly (and printed in each README):** pre-1.0, **minor = may break surface** (`0.1 → 0.2` is the breaking lane), **patch = fixes and docs only**. Consumers pin caret-on-minor (`^0.1.0`) plus a lockfile and upgrade deliberately.

**When 1.0:** not a birthday. Proposed criterion (**sign-off**, whenever it's near): the SDK goes 1.0 after **at least one external vessel has shipped against a published 0.x and a full milestone has passed with zero breaking surface changes** — i.e., 1.0 records that the API *calcified in practice*, it doesn't promise that it will.

## The packages

| Package | On npm today | Repo truth | Next publish (T-130) |
|---|---|---|---|
| `spools` | 0.0.1 (T-011-era: no crypto, no rewind, no export, no pocket, no awareness) | the real SDK | **0.1.0** |
| `spools-relay` | 0.1.0 (K=4, 12 PUTs/min; stale honesty table) | T-124 defaults (K=8, 24 PUTs/min) + group-scale honesty docs | **0.2.0** (behavior defaults changed → minor) |
| `spools-keeper` | — | complete, tested, documented | **0.1.0** (first) |

Apps (`apps/*`) are `private: true` and never publish. Version numbers there are decorative.

**Second execution, 3 Sep 2026 (T-181):** `spools` 0.1.0 → **0.2.0** (default relay now `relay.spools.lol`; `roomFull` + `on('full')`; `depositError: 'rate-limited'`; uuid fallback — a default changed, so the minor lane), `spools-relay` 0.2.0 → **0.3.0** (broadcast guards on by default, `TRUST_PROXY`, eviction order — behavior, so minor), `spools-keeper` 0.1.0 → **0.1.1** (docs + the dependency range). Same liturgy below, same order.

## Publish mechanics (the boring liturgy)

Manual, owner at the keyboard (npm 2FA security key), from a clean checkout. No CI, deliberately: there is one maintainer, one laptop, and a hardware key — automation would add attack surface to remove a step that takes a minute. Revisit only if a second maintainer ever exists.

Per release:

1. `prepublishOnly` guards run themselves (SDK: build + test; relay/keeper: test). No new tooling.
2. `npm pack --dry-run` per package — eyeball the file list (SDK: `dist` only; relay: `server.js` + deploy configs; keeper: `keeper.js`). LICENSE present in **every** package (the keeper is missing its file today — T-130 adds it).
3. Fresh-dir tarball smoke: install the tarballs, `npx spools-relay` serves health, SDK runs `newSpool({ persist:false })` in Node, keeper starts against a link.
4. **Publish order: relay → SDK → keeper.** The keeper's `"spools": "workspace:^"` is rewritten to a registry range at pack time; if the keeper publishes before `spools@0.1.0` exists, `npm i spools-keeper` is broken until it does. (T-130's original relay → keeper → SDK order had this backwards; its "none actually depend on each other" was wrong for the keeper.) The rewrite is pnpm's, not npm's — bare `npm publish` would ship `workspace:^` verbatim and break installs, so publish with `pnpm publish` (all three, one liturgy).
5. `npm view` sanity ×3; git tag per package (`spools@0.1.0`, `spools-relay@0.2.0`, `spools-keeper@0.1.0`) — first tags in the repo; push tags.
6. Three-bullet-max entry in each package's `CHANGELOG.md` (create at first real release; plain, dated, no tooling).
7. Tickets/INDEX record shipped versions (house workflow).

## The consumption contract (what vessels rely on)

- **Install:** `npm i spools` and nothing else — the SDK's dependencies are its own business. The room and the mixtape never import `yjs` directly, and that stays the advertised path: *use `spool.doc` for escape-hatch power; import `yjs` yourself only if you're binding an editor, and then read the peering note below.*
- **Default relay:** `DEFAULT_RELAY` baked into the SDK is a courtesy, not a dependency — links carry their own `relay=`, and the canonical relay's pocket promises (60-day courtesy window, K=8, 8 MiB) are the relay README's to make, not the SDK's.
- **Breaking changes** arrive only on minor bumps, listed at the top of the CHANGELOG entry with the one-line migration.

## Decisions to settle at T-130 (each: trade-offs + recommendation, **sign-off**)

*All four settled with the owner, 2026-08-16, as recommended: (1) `yjs` + `y-protocols` moved to peers at 0.1.0; (2) exports kept, line drawn in prose (README + SDK-API.md); (3) divergence kept and documented — it's load-bearing: the SDK falls back to the global `WebSocket` when no polyfill is passed (`engine.ts`), the keeper passes none, and Node's native WebSocket is only stable from 22, while the relay's `ws`-based `>=18` is genuine; (4) no `publishConfig`, packages stay unscoped.*

1. **`yjs`/`y-protocols` → `peerDependencies`?** Today all deps are regular. Risk: a vessel that imports `yjs` itself (the quiet pad will) can end up with two Yjs instances — subtle breakage (`instanceof` failures, "already imported" warnings) that punishes exactly the escape-hatch users we advertise. Peering guarantees one instance; on npm ≥7/pnpm it auto-installs, so `npm i spools` friction stays near zero. Cost: slightly odder install on old tooling; a second line in the README. **Recommend: move `yjs` + `y-protocols` to peers at 0.1.0** (keep y-websocket/y-webrtc/y-indexeddb/tweetnacl regular — implementation details no vessel touches), *before* any external repo exists — this is the cheapest this change will ever be.
2. **Where the public-surface line sits.** `index.ts` exports more than SDK-API.md documents (`SpoolEngine`, `EncryptedIndexeddbPersistence`, `createEncryptedWebSocketClass`, the magic constants…). Options: trim exports (cleanest, but deletes real escape hatches) or draw the line in prose. **Recommend: keep the exports, add one sentence to SDK-API/README** — "the documented surface is the contract; everything else is scaffolding and may move in any 0.x" — zero code change, honest, revisit at 1.0.
3. **Engines divergence.** Keeper says `node >=22`, relay `>=18`. Confirm it's load-bearing (keeper uses newer APIs?) or harmonize — either is fine, but it should be a choice, not an accident.
4. **`publishConfig`:** none needed while packages are unscoped and public. Note recorded so scoping (`@spools/*`) is recognized as a decision if it ever comes up, not a default.

## Rejected alternatives (for the record)

- **Changesets / semantic-release:** version-bump ceremony and generated changelogs solve a many-contributor coordination problem this repo does not have. Three hand-written bullets beat a bot's compare-link.
- **CI auto-publish / npm provenance:** requires long-lived tokens or trusted publishing config — new attack surface, removes the human with the hardware key, and contradicts the standing "owner at the keyboard" posture that T-002 and T-130 both encode. Revisit with a second maintainer, not before.
- **A cadence:** releases-by-calendar manufacture drift in both directions (shipping nothing, or sitting on truth). The one rule above replaces it.
