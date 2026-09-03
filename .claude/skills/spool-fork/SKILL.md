---
name: spool-fork
description: Bootstrap a "fork of purpose" — a repo built on the published Spool packages (spools/spools-relay/spools-keeper) for something §1's human-intimacy lane deliberately excludes: agent workspaces, machine-to-machine uses, shape-hiding transports, gossip meshes, anything where the second seat isn't a person. Use this when the owner wants to start or review such an exploration (the standing example is `familiar`, the agent-workspace fork), especially in a fresh fork repo that doesn't have the loom's context loaded. For an app where people share something living — a chat, a mixtape, a family notebook — use spool-vessel instead. Do not use this for changes to the loom itself (packages/spools*, apps/*) — that's the loom's CLAUDE.md and DESIGN_DOC.md, with its own sign-off rules.
---

# Spool: forks of purpose

A **vessel** is in the lane: people sharing something living. A **fork of
purpose** is an exploration the protocol's shape invites but §1's lane
excludes — and it gets built *beside* the project, never inside it.

This skill is the fork counterpart to `spool-vessel`. Same premise: it's
knowledge, not code. Copy what's useful into the fork as prose; importing a
helper calcifies it, copying a convention keeps it honest.

The worked example throughout is **`familiar`** (agent workspaces, born
18 Aug 2026 from T-150) — its repo is the reference for everything below.

## Step 0 — is it actually a fork?

Ask one question: **who holds the other end?**

- Another person, or a small group of them → **vessel.** Use `spool-vessel`.
- A process, a schedule, a mesh, a stranger's infrastructure → **fork of
  purpose.** Continue here.

The test isn't "is software involved" — every vessel is software. It's
whether the thing on the other side of the spool is somebody the human knows.
Borderline cases (a keeper for the family constellation; a bot that posts the
weather into a group chat) are decided by the owner in five minutes, not by
this file. Ask before Step 1, not after Step 5.

## Step 1 — the rules that make a fork a fork

From `docs/ECOSYSTEM.md`, non-negotiable:

1. **Own repo, own name, own identity — deliberately not Spool-branded.** The
   brands must never blur, because the white paper's refusals ("this roadmap
   stays people") have to stay exactly true while the fork does something
   else. The loom links to it as a cousin, not a child.
2. **npm-only consumption**, same as a vessel and same T-130 gate:
   `"spools": "^0.x"` from the registry, a lockfile, no workspace links, no
   git deps, no fork of the SDK.
3. **The honesty culture travels even though the lane doesn't.** Every
   refusal about what a relay sees, what a link grants, what "delete" means,
   and what a schedule can't promise still applies, in the fork's own words.
4. **It never merges back.** Learnings reach the loom only as evidence at the
   parked-with-evidence gate, ranked **no higher than any stranger's**. Write
   that sentence in the fork's README so nobody has to be told twice.
5. **§1's lane exemption is the only exemption.** A fork may put a machine in
   the second seat. It may not add accounts, discovery, feeds, directories,
   or anything that phones home — those are refusals, not lane rules.

## Step 2 — the charter, before any code that needs it

This is the step that distinguishes a fork from a vessel, and it is the one
that gets skipped. A vessel inherits its ethics from the lane it lives in. A
fork has left that lane on purpose, so **it writes its own, first.**

Write the charter *before* the capability it governs — not in the same
commit, not after. familiar's CHARTER.md covers: disclosure as a ceremony
owed to other people in the spool; never cosplaying a human; the write
discipline (append-only, digest-don't-log, logs-are-assets, season-your-work);
consent as key material; couriers-never-routers; and the counterfeit sentence
(a cron that keeps a pocket warm counterfeits the attention signal that makes
this design mean anything — so no scheduled touch is ever a default).

Yours will differ. The shape shouldn't: **name the thing your fork can do
that the lane's culture would find alarming, and write down what stops it.**
If nothing stops it but your own good taste, say that too — it's still more
honest than silence, and it dates well.

## Step 3 — the SDK, from a fork's angle

The full surface is the loom's `docs/SDK-API.md`; `spool-vessel` condenses
the browser-shaped path. What a fork typically needs that a vessel doesn't:

```js
import { newSpool, openSpool, importSpool, buildSpoolLink, parseSpoolLink, DEFAULT_RELAY } from 'spools'

// Node: no IndexedDB, so no persistence — durability is the relay's pocket
// plus export files on disk. This is the keeper's shape; copy it.
const spool = await openSpool(link, { author: seat, persist: false })

spool.pocket          // 'checking' → 'applied' | 'empty' | 'unavailable'
await spool.leave()   // final history moment → final pocket deposit → teardown
```

- **A process can be a visitor, not a daemon.** Open, let the pocket hand
  back what you missed, act, `leave()`, exit. The midnight gap the pocket
  closes for sleeping friends is the same gap it closes for cron.
- **There is no "synced" event, by design.** The SDK gives diffs and never
  promises about the network. A script that must read before it writes waits
  out a quiet window (familiar's `settle()`); don't invent a false one.
- **Durability arrives at deposit points, not at wind time.** `kill -9`
  between deposits loses that work. Measure your loss window and write it in
  TESTING.md rather than implying transactions you don't have.
- **`leave()` is load-bearing.** Anything that exits without it lies about
  what it saved.
- **Reference grades are your permission system.** Full link = total power;
  sealed link (`buildSpoolLink({ code, relay })`, no key) = knows it exists,
  can't open it. Hubs hold leaves; leaves hold at most a sealed reference
  home. Blast radius becomes key material, not policy.
- **Write-once `data`, append-only entries.** Rewriting a body reads as one
  line and goes quadratic across history moments. Newest-wins is settled by
  `createdAt` then **id** — at machine cadence same-millisecond ties are the
  normal case, so "newest" means "newest in display order," not "what I meant
  last."
- **Dispatch is a CRDT, not a queue.** Winding a `claim` (`parent` = the
  task, write-once) and taking the first claim in display order gives you a
  deterministic winner on every replica with no coordinator — measured
  100/100, and confirmed live in familiar's round 1.

## Step 4 — repo shape

Copy familiar's, which is deliberately small:

```
README.md      the fork's own voice; the honesty sentences up front; reserved kinds
CHARTER.md     Step 2 — the culture, before the code
NOTES.md       the notebook: one entry per session, and what got filed to the loom
TESTING.md     the torture checklist (Step 5)
docs/          the founding riff/brief, migrated from the loom if it started there
<work>/        the actual thing (familiar: desk/ — the Node scripts)
client/        any human surface; a static page is usually enough
test/          the conventions, offline: no relay, no network, holds on a plane
```

Conventions worth copying verbatim: `mise.toml` pinning Node, tmp+rename for
export files, logs that carry counts and codes and key fingerprints but never
content, never a key, never a full link.

## Step 5 — TESTING.md

Same house tradition (`spool-vessel` Step 5: multi-device, offline/reunion,
midnight, refresh, wrong key), plus the rows only a fork earns:

- **the race** — two processes going for the same work at once;
- **the kill** — `kill -9` mid-work, and the honest loss window it exposes;
- **the cold open** — nobody online, everything from the pocket;
- **offline forever** — the record read from export files with no relay
  contacted (and no quiet fallback to the relay when it's missing);
- **the poisoned worker** — hostile content telling a scoped process to reach
  past its scope; verify it structurally can't;
- **back-pressure** — be rude to the relay on purpose and degrade honestly.

Mark rows ✅ / ⚠️ / ⬜ and be specific about what "passed" meant. A checklist
that hides its unrun rows is worse than no checklist.

## Step 6 — the report back

The fork's *only* channel to the loom is evidence. In NOTES.md, keep a table:
what the friction was, a reproduction, and your own verdict — including "not
a bug, no ask," which is the most common honest answer. Then say it in the
loom's ticket for the kickoff, and stop. No feature requests, no priority
claims, no "the fork needs this." A second independent claimant is what moves
the gate, and you are one claimant.

Two flags the loom already expects from the agent fork (`docs/ECOSYSTEM.md`):
`sig` (its first natural signer) and read-only keys (its first structural
demand). If your fork knocks on either, you're arriving where the gate is
already looking — which is a reason to be *more* rigorous with the
reproduction, not less.

## What this skill will not do

- Decide whether an idea is a vessel, a fork, or out of scope entirely —
  that's an owner conversation (Step 0).
- Authorize protocol or SDK changes. A fork that "needs" one has found
  evidence, not permission. Nothing in `packages/spools*` moves from here.
- Excuse the charter because the fork is "just an experiment." The
  experiments are exactly the things that ship by accident.
