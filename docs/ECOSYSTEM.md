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
| **Baby book** | Parents + far-away grandparents wind milestones, photos-as-links, first words. `rewind` is *watch them grow*; the export is the artifact you hand the kid at eighteen. | `rewind` as the emotional centerpiece (the scrubber has never been the hero of an app); long-lived, low-frequency spools; the asset-pointer discipline (URL + hash, never bytes in the doc). | weekend-plus |
| **Off-grid kit** | One laptop runs the relay; everyone else joins over LAN from a USB-stick client. Classrooms, field research, cabins, disaster response. | The most differentiated capability in the repo — collaboration with **no internet at all** — currently true only by accident of discipline. Mostly packaging + a README that treats it as a first-class scenario. | weekend |
| **Correspondence game (chess first)** | Two people, one game, moves over days. `kind: 'move'`, SAN + FEN in `data`, `rewind` = replay. | Views-are-skins proof #3; structured-`data`-only vessels (no bodies at all); turn-taking as *convention without permission* — the client refuses to render an illegal move, and honesty about the fact that nothing stops one being wound. | weekend |
| **Memorial spool** | A family winds memories and stories for someone who died; when it's done, the export is the keepsake. | Spools that **end** — the finish → export → keep ceremony as a designed arc, not an afterthought. The gravest test of tone a client will ever face. | weekend-plus, mostly design |
| **Quiet pad** | Two or three people write in one ProseMirror/CodeMirror surface; the infrastructure structurally cannot read it. | The `spool.doc` escape hatch and the "every Yjs binding already works" claim, in anger. **Deliberately surfaces the yjs peer-dependency question** (first vessel that imports `yjs` itself — see RELEASING.md). | weekend-plus |
| **Care circle** | Siblings coordinate a parent's meds, visits, observations. | List+log hybrid views; E2E as the *point* rather than a feature (health data no one wants on a SaaS). Needs its own honesty sentence: a spool has no alarms and no guarantees — it is a shared notebook, never a medical device. | room-class (deserves real care) |
| **Oral history** | Hand a link to a grandparent; both wind for months; export is the deliverable. | The two-author long-interval rhythm; the pocket as the load-bearing transport rather than a bonus. | weekend |
| **Trip / handoff spool** | The pet-sitter briefing; the trip plan that's offline on the plane and reconciles at the hotel. | Natural-lifespan spools at their most casual; the export-as-souvenir habit. | weekend |

## Proposed build order (proposal — owner picks)

1. **Baby book** — the strongest emotional demo of the thing only Spool has (`rewind` + export-as-keepsake + pocket-async between visits). If one vessel is ever the reason someone asks "what is this built on?", it's this one.
2. **Off-grid kit** — cheapest differentiation available; almost pure packaging; makes a second true sentence no competitor can say.
3. **Correspondence chess** — small, joyful, and the third skin proof; also the first all-`data` vessel, which exercises the `T-030` verdict downstream.

Rationale for the order: each is small, each proves a *different* axis (emotion, environment, structure), and none needs SDK changes on paper — which is exactly the claim we're trying to falsify with real repos. The quiet pad is deliberately fourth: it's the one most likely to force a packaging decision (yjs peering), so it goes after the release structure has settled and shipped once.

## What makes a vessel a good citizen

A short constitution, so external repos inherit the culture without inheriting the repo:

1. **npm-only consumption.** `"spools": "^0.x"` from the registry; a lockfile; upgrades deliberate. Never a git dependency, never a fork.
2. **Reserved kinds documented.** Whatever kinds/`data` conventions the vessel writes, its README states them the way the room's docs state `room:*` — so any other client rendering the same spool degrades sanely (the unknown-kind fallback is a protocol right).
3. **The honesty sentences ship in the UI.** The link's total power, the relay's role, the closed-tab truth, whatever the vessel's own limits are. The room's fine print is the register to copy.
4. **A TESTING.md torture checklist.** Multi-device, offline/reunion, midnight (pocket), refresh — the house tradition travels.
5. **Export is visible, not buried.** Every vessel ends in a file; the file is the point.
6. **Nothing that phones home.** No analytics, no accounts, no server code beyond static hosting. If a vessel needs a backend, it has left the project's lane — that's allowed, elsewhere.
7. **Friction flows back as evidence.** SDK papercuts get filed against the loom with reproduction, not worked around silently — they are the promotion pipeline's raw material.

**Naming:** repos under the personal `osfasofa` account (T-002's call: no org), named for the vessel, not the protocol (`babybook`, `quiet-pad`, …); subdomains of `spools.lol` per vessel as they earn a deploy (`chat.` is taken; `book.`, `chess.`, `pad.` follow the pattern). The protocol's name stays on the loom.

## Sequencing with the release (hard dependency)

No vessel repo starts until **T-130 ships** (SDK 0.1.0, relay 0.2.0, keeper 0.1.0 on npm). Today `spools@0.0.1` on the registry predates encryption, rewind, export, and the pocket — a vessel started against it would immediately vendor workarounds and poison the "npm-only" rule. The first vessel's first install is, deliberately, the release's first external test.

## Open questions parked here (no ticket until one is real)

- Does a `create-spool-vessel` scaffold ever earn its keep, or is "copy the room's `vite.config` + the constitution above" always enough? (Lean: the latter — a scaffold is a growth loop wearing a toolbelt.)
- Do vessel repos share a CI recipe? (They inherit the loom's answer for now: none — a laptop and a checklist.)
- When a vessel is *finished* — the memorial model — what does "archived, still works from a USB stick" look like as a repo state? First finished vessel decides.
