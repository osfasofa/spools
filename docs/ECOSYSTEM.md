# The ecosystem plan — vessels in their own repos

*Planning record, August 2026 (M13). How apps built on Spool get made once the protocol home stops being the only place code lives. Companion to [WHITEPAPER.md](../WHITEPAPER.md) §8 and [RELEASING.md](RELEASING.md). Nothing here is protocol; the one rule this doc leans on — "parked with evidence" — is already recorded in [SDK-API.md](SDK-API.md).*

## The model

**This repo is the loom.** It keeps the spec, the SDK, the relay, the keeper, and the reference clients (the no-build client, the mixtape, the room). It stays scope-disciplined: nothing lands here that isn't protocol, SDK, relay, or a reference proof.

**New apps are vessels, and vessels get their own repos.** Each one:

- consumes `spools` (and friends) **from npm**, exactly like a stranger would — no workspace links, no forks of the SDK;
- has its own name, voice, README, and lifecycle — it can be finished, abandoned, or handed off without destabilizing the loom;
- proves a corner of the design the loom can't prove about itself — most importantly that the published packages are actually sufficient.

The room already rehearsed the deploy shape a vessel will use: static `dist`, no server of its own, pushed prebuilt (gh-pages or Vercel — `scratch/deploy-room.sh` is the template), living at a subdomain (`chat.spools.lol` sets the pattern: one vessel, one subdomain).

**Why separate repos, explicitly:** (1) the first `npm i spools` in anger is itself a milestone — workspace consumption has hidden every packaging bug so far; (2) the loom's ticket/decision culture shouldn't tax app experiments, and app churn shouldn't pollute the loom's history; (3) §1 scope discipline — "resist re-adding what was deliberately stripped" — is easier to hold when app wishes arrive as *evidence from outside* rather than sibling-directory pressure.

**Where the room lives:** it stays in this repo. It is the SDK's lab animal — the milestone that proved conventions-don't-need-protocol — and its torture checklist is part of the loom's test culture. If it ever grows a real product life of its own, extraction is a later, cheap decision.

## The feedback loop (why vessels exist, structurally)

The SDK grows surface **only** when a second client independently wants what a first client built as a convention — the "parked with evidence" rule. Four candidates are already waiting, recorded from the room: profiles/seats, presence payload conventions, ephemeral read markers, pocket ring-tag persistence.

So vessels are not just consumers; **they are the promotion engine**. The loop:

1. A vessel hits friction or reinvents a convention (seats, `room:*` kinds, arrival beats…).
2. It records that in its own README/notes — and, if it's ours, files it against the loom as evidence, not as a feature request.
3. When a *second* vessel wants the same thing, the SDK-API "parked with evidence" entry gets its promotion review: owner sign-off, §5 row, then surface.
4. Until then, conventions are copied between vessels as *prose*, not as code dependencies — copying a convention keeps it honest; importing a helper calcifies it.

## The portfolio

Candidates, with what each one uniquely proves. Costs are order-of-magnitude ("weekend" ≈ a few sessions; "room-class" ≈ an M11-sized milestone).

| Vessel | The human story | What it proves that nothing else does | Size |
|---|---|---|---|
| **lore** — [the brief](vessels/lore.md) | Every close group has a mythology, and today it dies in scrollback. Tales, tellings (variants), glosses, sayings, relics — a group's canon, argued about by the people who were there, traded hand to hand as links, held with intent or honestly lost. | The emotional thesis itself: loss as meaning (touch-on-read + refresh-if-stale literally implement "lore survives by being retold"). Deep `parent` threading (variants), mixed-kind views as the point, the keeper as a named human role, the trade/export ceremony, and the first real `splice` evidence — through the gate, not promised. | room-class over time; a weekend to the first campfire |
| **Baby book** | Parents + far-away grandparents wind milestones, photos-as-links, first words. `rewind` is *watch them grow*; the export is the artifact you hand the kid at eighteen. A child's lore, really — sibling of the vessel above, with its own tone and door. | `rewind` as the emotional centerpiece (the scrubber has never been the hero of an app); long-lived, low-frequency spools; the asset-pointer discipline (URL + hash, never bytes in the doc). | weekend-plus |
| **Off-grid kit** | One laptop runs the relay; everyone else joins over LAN from a USB-stick client. Classrooms, field research, cabins, disaster response. | The most differentiated capability in the repo — collaboration with **no internet at all** — currently true only by accident of discipline. Mostly packaging + a README that treats it as a first-class scenario. | weekend |
| **Correspondence game (chess first)** | Two people, one game, moves over days. `kind: 'move'`, SAN + FEN in `data`, `rewind` = replay. | Views-are-skins proof #3; structured-`data`-only vessels (no bodies at all); turn-taking as *convention without permission* — the client refuses to render an illegal move, and honesty about the fact that nothing stops one being wound. | weekend |
| **Memorial spool** | A family winds memories and stories for someone who died; when it's done, the export is the keepsake. | Spools that **end** — the finish → export → keep ceremony as a designed arc, not an afterthought. The gravest test of tone a client will ever face. | weekend-plus, mostly design |
| **Quiet pad** | Two or three people write in one ProseMirror/CodeMirror surface; the infrastructure structurally cannot read it. | The `spool.doc` escape hatch and the "every Yjs binding already works" claim, in anger. **Deliberately surfaces the yjs peer-dependency question** (first vessel that imports `yjs` itself — see RELEASING.md). | weekend-plus |
| **Care circle** | Siblings coordinate a parent's meds, visits, observations. | List+log hybrid views; E2E as the *point* rather than a feature (health data no one wants on a SaaS). Needs its own honesty sentence: a spool has no alarms and no guarantees — it is a shared notebook, never a medical device. | room-class (deserves real care) |
| **Oral history** | Hand a link to a grandparent; both wind for months; export is the deliverable. *Folds into lore as its interview rhythm (owner call, Aug 2026) — kept as a row because the two-author cadence may still deserve its own quiet door someday.* | The two-author long-interval rhythm; the pocket as the load-bearing transport rather than a bonus. | weekend |
| **Trip / handoff spool** | The pet-sitter briefing; the trip plan that's offline on the plane and reconciles at the hotel. | Natural-lifespan spools at their most casual; the export-as-souvenir habit. | weekend |

## Build order (owner-directed, Aug 2026 — supersedes the first proposal)

1. **lore** — the owner's pick, and the right one: it carries the emotional thesis (loss as meaning), generalizes the baby-book/memorial/oral-history demos instead of competing with them, and exercises the protocol harder than any of them (deep threading, mixed kinds, the trade ceremony). [The brief](vessels/lore.md) is written; the vessel repo starts from it.
2. **Off-grid kit** — cheapest differentiation available; almost pure packaging; makes a second true sentence no competitor can say.
3. **Correspondence chess** — small, joyful, and the third skin proof; also the first all-`data` vessel, which exercises the `T-030` verdict downstream.

(The first proposal led with the baby book; the owner redirected to lore, which absorbs its thesis — a baby book is a child's lore — while baby book and memorial stay in the portfolio as sibling vessels with their own tones. The quiet pad stays deliberately fourth: it's the one most likely to force a packaging decision (yjs peering), so it goes after the release structure has settled and shipped once.)

## What makes a vessel a good citizen

A short constitution, so external repos inherit the culture without inheriting the repo:

1. **npm-only consumption.** `"spools": "^0.x"` from the registry; a lockfile; upgrades deliberate. Never a git dependency, never a fork.
2. **Reserved kinds documented.** Whatever kinds/`data` conventions the vessel writes, its README states them the way the room's docs state `room:*` — so any other client rendering the same spool degrades sanely (the unknown-kind fallback is a protocol right).
3. **The honesty sentences ship in the UI.** The link's total power, the relay's role, the closed-tab truth, whatever the vessel's own limits are. The room's fine print is the register to copy.
4. **A TESTING.md torture checklist.** Multi-device, offline/reunion, midnight (pocket), refresh — the house tradition travels.
5. **Export is visible, not buried.** Every vessel ends in a file; the file is the point.
6. **Nothing that phones home.** No analytics, no accounts, no server code beyond static hosting. If a vessel needs a backend, it has left the project's lane — that's allowed, elsewhere.
7. **Friction flows back as evidence.** SDK papercuts get filed against the loom with reproduction, not worked around silently — they are the promotion pipeline's raw material.

**Naming:** repos under the personal `osfasofa` account (T-002's call: no org), named for the vessel, not the protocol (`lore`, `quiet-pad`, …); subdomains of `spools.lol` per vessel as they earn a deploy (`chat.` is taken; `lore.`, `chess.`, `pad.` follow the pattern). The protocol's name stays on the loom.

## Forks of purpose (out-of-lane explorations)

A **vessel** is in the lane: people sharing something living. A **fork of purpose** is an exploration the protocol's shape invites but §1's lane excludes — it gets built *beside* the project, never inside it. The rules:

- Own repo, **own name, own identity** — deliberately not spool-branded, so the brands never blur and the white paper's refusals stay exactly true. The loom links to it as a cousin, not a child.
- Consumes the published packages like any stranger (npm-only, same T-130 gate) and keeps the honesty-clause culture — but is *not* bound by §1's human-intimacy lane. That's the whole point of forking purpose instead of bending it.
- Never merges back. Its learnings feed the loom only as evidence through the parked-with-evidence gate, ranked no higher than any stranger's.

**First fork: agent workspaces** (owner-directed, Aug 2026). A shared spool between a person and a long-running software agent: the agent winds `finding` / `question` / `decision` entries as it works; the human steers by threading replies from a phone; `rewind` is the audit trail; the link is a per-task capability with zero account setup; export is the mission record. The quietly remarkable part: the room's conventions already cover it — *a seat is a device, not a person* was written without agents in mind and accommodates them without a word changing, and the §6 seat ladder (seat id → signing key, additive `sig`) would give agent attribution the same way it would give anyone attribution. Expected protocol pressure: **zero** — and if any appears, it queues at the gate like everything else. **Named by the owner (Aug 2026): `familiar`** — the companion bound to one person, which is the fork's whole thesis in a word. The record here briefly read `pfam`; the owner reversed that call in favor of `familiar` (the original first candidate), and the correction is recorded here and in T-145's notes as an owner-directed supersession, not a silent rewrite (the T-144 rule). Repo `osfasofa/familiar`, born after T-130 per the gate — **satisfied: T-130 shipped 16 Aug 2026, registry-verified** — and the charter beyond this paragraph lives there, warm-started by [forks/familiar-riff.md](forks/familiar-riff.md) (the agents riff, which migrates with the repo at birth; its §8 gate-flags stay in the loom). Candidates passed over, for the record: `pfam` (named, then unnamed — its faint Pfam protein-families collision was noted and dismissed both times), `scribe`, `logbook`. Name diligence, T-002 style (knowing, not buying): npm `familiar` is a squatted 2022 package — irrelevant by this section's own reasoning (the fork is an app, not a package); the name that matters is the repo's.

## Sequencing with the release (hard dependency)

No vessel repo starts until **T-130 ships** (SDK 0.1.0, relay 0.2.0, keeper 0.1.0 on npm) — and the same gate holds for forks of purpose. Today `spools@0.0.1` on the registry predates encryption, rewind, export, and the pocket — a repo started against it would immediately vendor workarounds and poison the "npm-only" rule. The first external install is, deliberately, the release's first external test. With lore and the agent fork both queued behind it, T-130's "whenever the mood strikes" now has two reasons for the mood to strike. *(It struck: shipped 16 Aug 2026 — `spools@0.1.0`, `spools-relay@0.2.0`, `spools-keeper@0.1.0`, tags pushed, registry-verified in T-130's notes. The gate is open.)*

## Open questions parked here (no ticket until one is real)

- Does a `create-spool-vessel` scaffold ever earn its keep, or is "copy the room's `vite.config` + the constitution above" always enough? (Lean: the latter — a scaffold is a growth loop wearing a toolbelt.)
- Do vessel repos share a CI recipe? (They inherit the loom's answer for now: none — a laptop and a checklist.)
- When a vessel is *finished* — the memorial model — what does "archived, still works from a USB stick" look like as a repo state? First finished vessel decides.
