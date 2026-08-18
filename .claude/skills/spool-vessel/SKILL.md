---
name: spool-vessel
description: Bootstrap a new "vessel" — a small standalone app built on the Spool SDK (spools/spools-relay) for an intimate group of people. Use this whenever the owner wants to spin up a niche, private, or family-scoped app on top of Spool (a baby book, a chess-by-mail client, a care-circle notebook, an off-grid kit, or any new idea from the ECOSYSTEM.md portfolio or beyond) — especially early in a session in a fresh vessel repo that doesn't have the loom's full context loaded. Also use to review a vessel-in-progress against the constitution before it ships. Do not use this for changes to the loom itself (packages/spools, packages/spools-relay, packages/spools-keeper, apps/client, apps/mixtape, apps/room) — the loom has its own CLAUDE.md and DESIGN_DOC.md, and this skill explicitly does not cover protocol changes.
---

# Spool Vessel

This skill packages what let "the room" (a Messenger-class group chat) get
built as an app convention with **zero protocol change** — small SDK
vocabulary + a written constitution + a few real examples. It exists so a
fresh agentic session, in a fresh vessel repo, can move at that same speed
without re-deriving the conventions or re-reading the whole loom.

**This is knowledge, not code.** Nothing here is imported by a vessel.
Copy what's useful into the new repo as prose (a README section, a
TESTING.md) the way the loom's own ECOSYSTEM.md prescribes — "copying a
convention keeps it honest; importing a helper calcifies it." If this file
itself is useful to a vessel's own `.claude/skills/`, copy it there too.

## Before anything: is this actually a vessel?

A vessel is people sharing something living — chat, a list, a mixtape, a
game by mail, a shared notebook. If the idea is a person + a long-running
software agent, or anything else outside the human-intimacy lane, it's a
**fork of purpose** instead (own name, own repo, not spool-branded — see
`docs/ECOSYSTEM.md` "Forks of purpose", and the `spool-fork` skill, which is
this file's counterpart for that case). This skill assumes a vessel.

## Step 1 — find the kind vocabulary

The whole design job is: what's the human story, and what's the smallest
set of `kind`s that renders it? Don't start with UI or schema — start here.
A few worked examples from the loom, for calibration:

| Vessel | Story | Kinds | Shape |
|---|---|---|---|
| mixtape | a gift, wound over weeks | `track`, `reaction` | `data` carries url/title/artist (write-once); body mostly unused |
| the room | a group chat | `message`, `room:profile`, reactions via `parent` | body carries text; presence rides `awareness`, never entries |
| chess (planned) | a correspondence game | `move` | **all-`data`**, no bodies at all — SAN + FEN, `rewind` = replay |
| lore (planned) | a group's mythology | tales/tellings/glosses via deep `parent` threading | mixed-kind views are the point; `parent` chains do variants |

Questions to answer before writing code:
- What's the human story in one sentence? (This becomes the honesty
  sentence and the README's first line.)
- What's each `kind`, and is it a **body** thing (human text, wants
  concurrent editing → bind `entry.text`), a **`data`** thing (machine
  fields, write-once, e.g. a URL or a chess move), or **ephemeral**
  (presence/typing/read — never an entry, always `spool.awareness`)?
- Does anything need threading? `parent` is the one mechanism — reactions,
  replies, and deep variant-chains (lore) are all the same recursive move.
- Is this a spool that's supposed to **end**? (memorial, trip handoff,
  off-grid session) — if so, design the finish → `export()` → keep arc
  as a real UI moment, not an afterthought.

Reserved kinds get documented in the vessel's own README the way the
room's docs state `room:*` — any other client rendering the same spool
must degrade sanely on kinds it doesn't know (the unknown-kind fallback is
a protocol right, not a vessel courtesy).

## Step 2 — the SDK surface (condensed; full detail in the loom's `docs/SDK-API.md`)

```ts
import { newSpool, openSpool } from 'spools'

const spool = await newSpool({ author: 'you' })   // fresh; encrypted by default
// or
const spool = await openSpool(link)               // someone handed you this

await spool.whenReady            // local persistence loaded — opens instantly offline
spool.on('entry', () => render(spool.entries))     // diffs delivered; spool.entries is always live truth
spool.on('status', s => …)       // 'offline' | 'connecting' | 'connected'
spool.on('pocket', state => …)   // async-delivery status (M10) — see below

const entry = spool.wind({ kind: 'message', body: 'hey' })  // synchronous, returns the live handle
entry.body = 'edited'            // getter/setter; or bind entry.text (Y.Text) for concurrent-safe editing
entry.delete()                   // soft — deletedAt is set, nothing is ever hard-deleted
entry.children                   // entries whose parent === entry.id

const link = spool.share()       // the shareable link — handing it over IS the key exchange
spool.rewind(ts)                 // frozen EntrySnapshot[] as of the latest moment <= ts
spool.export()                   // the portable file — one JSON, human half + full CRDT, yours forever

spool.awareness                  // ephemeral shared state — presence/typing/read. NEVER persist this.
                                  // expires ~30s after the writer goes quiet by design (ghost presence is a named refusal)

await spool.leave()              // final history moment -> final pocket deposit -> teardown
```

Don't reach for `spool.doc` (raw `Y.Doc`) unless binding a third-party Yjs
editor (ProseMirror, CodeMirror, tldraw) — that's the documented escape
hatch, not the everyday path.

**No replay on load.** Render from `spool.entries` after `whenReady`;
`on('entry')` only describes changes *after* that point. A vessel that
naively re-renders the whole list on every event can never drift.

## Step 3 — scaffold and deploy shape

Copy, don't template-engine, from the closest existing reference:

- **No-build, static-only** (off-grid kit, anything that must run from a
  USB stick): copy `apps/client`'s structure. No bundler.
- **Vite + React** (anything with real UI): copy `apps/room`'s
  `vite.config` and project layout — it's already the rehearsed shape for
  a vessel deploy.
- Consume `spools` (and `spools-relay` if self-hosting a relay) **from npm
  only** — `"spools": "^0.x"`, a lockfile, no workspace links, no forks.
  This is non-negotiable (constitution point 1); it's also the whole
  reason vessels prove anything about the published package.
- Deploy as a static `dist`, no server of your own, at a subdomain of
  `spools.lol` (`chat.` is taken; check `docs/ECOSYSTEM.md` for what's
  claimed). `scratch/deploy-room.sh` in the loom is the template — gh-pages
  or Vercel, pushed prebuilt.
- Repo lives under the personal `osfasofa` account, named for the vessel
  (`lore`, `quiet-pad`, …) — never for the protocol.

## Step 4 — the constitution (check every one before calling it done)

From `docs/ECOSYSTEM.md`, restated as a checklist:

1. **npm-only consumption** — no git deps, no forks of the SDK.
2. **Reserved kinds documented** in the README.
3. **Honesty sentences ship in the UI**, not buried in docs. At minimum:
   the link is total, irrevocable capability (anyone holding it reads
   everything and can edit anything, including the past); what the relay
   can and can't see; the closed-tab truth ("this can only reach you while
   it's open somewhere — there's no server to call you back"); and
   whatever the vessel's own limits are (a care-circle notebook is not a
   medical device and has no alarms — say so).
4. **A TESTING.md torture checklist** — see Step 5.
5. **Export is visible, not buried.** Every vessel ends in a file; make
   the file the point, not a hidden settings-menu action.
6. **Nothing that phones home.** No analytics, no accounts, no server code
   beyond static hosting. Needing a backend means you've left the lane —
   that's fine, it's just a fork of purpose now, not a vessel.
7. **Friction flows back as evidence.** If the SDK is missing something,
   file it against the loom with a real reproduction — don't quietly
   work around it in the vessel. This is the whole promotion mechanism
   (SDK grows surface only when a *second* vessel independently wants
   the same thing — "parked with evidence").

## Step 5 — TESTING.md starting point

Every vessel earns a torture checklist; the house tradition (from the
room's `TESTING.md`) covers at minimum:

- **Multi-device**: two+ real devices, not two tabs on one machine.
- **Offline / reunion**: go offline mid-session, make local changes on
  both sides, reconnect — verify convergence, not just "no crash."
- **Midnight (the pocket)**: one peer deposits, closes everything; a
  second peer opens the link cold, hours later, nobody else online —
  verify they collect and decrypt.
- **Refresh**: reload mid-session; verify no replay-flicker, no dropped
  local state.
- **Wrong key / no key**: open the link with a bad or missing `k=` and
  confirm it fails loud (`SpoolKeyError`), never silent garbage.
- Whatever is unique to this vessel's story (a memorial vessel needs a
  "finish → export → keep" pass; a chess vessel needs an illegal-move
  refusal pass; an off-grid kit needs a true no-internet pass).

## What this skill will not help you do

- Change protocol shape, add identity/permissions/accounts, or touch
  `packages/spools*` — that's the loom's CLAUDE.md and DESIGN_DOC.md, with
  its own sign-off rules. If a vessel *needs* a protocol change to work,
  that need is the evidence to bring back, not a reason to fork the SDK.
- Decide whether an idea is a vessel or a fork of purpose — that's a
  five-minute conversation with the owner, do it before Step 1.
- Skip the constitution because the vessel is "just a weekend thing." The
  constitution is what keeps a weekend vessel from becoming an
  unmaintainable liability; it costs almost nothing to hold to on day one
  and a lot to retrofit later.
