# Spool — Ticket Index

Session-sized chunks of the build order (DESIGN_DOC §4). Each ticket is one file, one working session. Statuses: `todo` / `doing` / `done`. Update this table and the ticket's frontmatter together.

**Workflow:** pick the top unblocked `todo`, set it `doing`, work it, meet its acceptance criteria, set it `done`. Tickets record decisions made along the way in their Notes section; anything protocol-shaping also gets a row in DESIGN_DOC §5.

## M0 — Groundwork

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-001](T-001-monorepo-scaffold.md) | Monorepo scaffold | — | done |
| [T-002](T-002-claim-names.md) | Claim the name (npm, GitHub, domains) | — | done |
| [T-003](T-003-spike-dumb-relay.md) | **Spike:** dumb-relay feasibility | — | done |

## M1 — SDK core

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-010](T-010-engine-extraction.md) | Engine extraction from fosho | T-001 | done |
| [T-011](T-011-links-and-codes.md) | Links, codes, `newSpool`/`openSpool`/`share` | T-001 | done |
| [T-012](T-012-entry-layer.md) | Entry layer: `wind`, entries, events, soft delete | T-010, T-011 | done |
| [T-013](T-013-sdk-tests.md) | SDK tests incl. multi-writer verification | T-012 | done |

## M2 — Reference client v0

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-020](T-020-ugly-list-client.md) | Ugliest possible list client | T-012 | done |
| [T-021](T-021-sync-torture-checklist.md) | Sync torture checklist (refresh, offline, reconnect) | T-020 | done |

## M3 — Mixtape renderer

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-030](T-030-mixtape-renderer.md) | `track`/`reaction` kinds + view switcher (views-are-skins) | T-021 | done |

## M4 — Relay packaging

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-040](T-040-spools-relay.md) | `spools-relay`: dumb broadcaster + signaling | T-003 | done |
| [T-041](T-041-relay-shipping.md) | `npx spools-relay` + deploy button + honesty clause | T-040 | done |

## M5 — Encryption

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-050](T-050-encryption-primitives.md) | Lift primitives + encrypted IndexedDB | T-012 | done |
| [T-051](T-051-encrypted-transport.md) | Encrypted transport over the dumb relay | T-050, T-040 | done |

## M6 — rewind()

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-060](T-060-rewind-api.md) | `rewind(ts)` via Yjs snapshots (+ `gc:false` investigation) | T-013 | done |
| [T-061](T-061-history-scrubber.md) | History scrubber in the reference client | T-060 | done |

## M7 — Spec

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-070](T-070-spec.md) | Write SPEC.md from the working system | T-041, T-051 | done |

## M8 — Export / stash

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-080](T-080-export-stash.md) | `export()` portable file + stash | T-013 | done |

## M9 — Clients (post-v1)

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-090](T-090-mixtape-client.md) | Mixtape client — the nice one (Vite + React) | T-080 | done |

## M10 — Async sync (the pocket)

Signed off Aug 2026 (all four decisions + two review-round hardenings); design record: [docs/M10-async-brief.md](../docs/M10-async-brief.md). The relay gains an optional capability: it holds the last few sealed full-state deposits per key-derived namespace — ciphertext or nothing — so the spool is there when a friend opens the link while the writer sleeps. T-100 gates everything; T-106 (SPEC) goes last, per the constitution. **M10 complete (Aug 2026)** — the pocket is live on the canonical relay, volume-backed, 60-day courtesy TTL.

**Complete, 15 Aug 2026.** The canonical relay runs the pocket volume-backed (60-day TTL, stock knobs); deposits survive restarts, and a cold reader collects them with nobody online. A test client is deployed at <https://osfasofa.github.io/spools/> (mixtape `dist/` on the `gh-pages` branch). **M10 closed — and with it the v1 roadmap: every ticket T-001…T-107 is done.**

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-100](T-100-spike-pocket.md) | **Spike:** pocket feasibility (midnight loop, per-tag ring, 200-trap, frame-log numbers) | — | done |
| [T-101](T-101-relay-pocket.md) | Relay: pocket endpoints, per-tag ring, TTL + touch-on-read, caps, `POCKET_DIR` | T-100 | done |
| [T-102](T-102-sdk-fetch-on-open.md) | SDK: token derivation, capability probe, fetch-merge on open, `pocket` event | T-100 | done |
| [T-103](T-103-sdk-deposit-scheduler.md) | SDK: deposit scheduler, `leave()` flush, deposit-if-ahead + refresh-if-stale | T-102 | done |
| [T-104](T-104-clients-pocket-beat.md) | Clients: "checking the pocket…" beat + midnight torture row | T-102 | done |
| [T-105](T-105-canonical-deploy.md) | Canonical relay deploy: Railway volume (+ Fly mounts) — **owner at keyboard** | T-101 | done |
| [T-106](T-106-spec-amendment.md) | SPEC v1.1: optional pocket capability + honesty clause; SDK-API; docs | T-101, T-103 | done |
| [T-107](T-107-keeper.md) | `spools-keeper`: headless always-on peer (optional) | T-100 | done |

## M11 — the room (group chat)

Signed off Aug 2026 (decisions D1–D5); design record: [docs/M11-room-brief.md](../docs/M11-room-brief.md). A Messenger-class group chat as the next SDK testbed — the first client demanding mutable shared state, ephemeral presence, and stable pseudonymous identity, all as **app conventions with zero protocol change** (that SPEC doesn't move is the thesis; if it must, that evidence goes to the owner). T-110 gates the read-receipt design (the D4 pricing question) and the growth story; T-127 (docs/SPEC) goes last, per the constitution. Tickets below the *MVP line* are follow-on, not launch-blocking.

**Closed, 15 Aug 2026 — the thesis held: SPEC v1.1 never moved.** The room is live at <https://osfasofa.github.io/spools/room/> on `DEFAULT_RELAY`, torture-verified twice over (`apps/room/TESTING.md`), with D4 resolved ephemeral-only on T-110's quadratic measurement and the relay's group knobs raised with sign-off (T-124: K=8, 24 PUTs/min). The brief's close-out block records every deviation. Remaining with the owner: the real-hardware rows (T-125's checklist + TESTING.md H1–H5 — three real devices, cellular, VoiceOver/TalkBack); T-125 stays `doing` until that pass reports.

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-110](T-110-spike-chat-budget.md) | **Spike:** the chat-hour budget (doc growth, cursor cost, ring at group scale) | — | done |
| [T-111](T-111-spike-awareness.md) | **Spike:** awareness at group scale (ghosts, traffic, 64-conn wall, sealing proof) | — | done |
| [T-112](T-112-sdk-awareness-passthrough.md) | SDK: `get awareness()` passthrough (the one SDK change) | — | done |
| [T-113](T-113-room-scaffold.md) | `apps/room` scaffold + message feed (mobile constraints in AC) | — | done |
| [T-114](T-114-seats-profiles.md) | Seats + the profile table (nicknames anyone can edit) | T-113 | done |
| [T-115](T-115-deploy-early.md) | Deploy early to gh-pages (every later ticket becomes multi-device) | T-113 | done |
| [T-116](T-116-scroll-ordering.md) | Scroll, windowing, ordering (clock skew, reply-before-parent) | T-113 | done |
| [T-117](T-117-arrival.md) | Arrival: first run + the empty-room trap | T-113, T-114 | done |
| [T-118](T-118-reactions-replies.md) | Reactions (any emoji, toggle, normalize) + inline replies | T-114 | done |
| [T-119](T-119-presence.md) | Presence: online dots (+ typing, gated on T-111's numbers) | T-111, T-112, T-114 | done |
| — | *— MVP line — below is follow-on —* | | |
| [T-120](T-120-edit-delete.md) | Edit, delete, and the honest write contract | T-113, T-114 | done |
| [T-121](T-121-read-receipts.md) | Read receipts: ephemeral awareness-only (D4 decided in T-110) | T-110, T-111, T-112, T-114 | done |
| [T-122](T-122-room-name-theme.md) | Room name (shared) + themes (per-device) | T-114 | done |
| [T-123](T-123-unread-notifications.md) | Unread divider + in-tab notifications (and the honest closed-tab sentence) | T-119 or T-121 | done |
| [T-124](T-124-relay-group-knobs.md) | Relay knobs at group scale (`POCKET_K` — **sign-off required**) | T-110, T-111 | done |
| [T-125](T-125-phone-a11y.md) | Phone + accessibility polish pass | T-116…T-119 | doing |
| [T-126](T-126-room-torture.md) | Room torture checklist (3+ devices, races, midnight, scale) | MVP set | done |
| [T-127](T-127-m11-docs.md) | Brief/§5/SPEC amendment — **last**, from working code | everything | done |

## M12 — Release

Pure execution, no open design questions. Drafted at M11 close (what's on npm no longer matches what's true); **owner at keyboard for the publish itself**, everything else preppable. Not urgent by standing decision (T-002's "don't treat the squatting clock as pressure").

**Shipped 16 Aug 2026** (registry-verified 18 Aug: `spools@0.1.0` · `spools-relay@0.2.0` · `spools-keeper@0.1.0`, tags at f4db17e). The record lagged the keyboard by two days — the publish was owner-at-keyboard and no session ran after it; T-130's Notes hold the correction and the lesson (for "did it ship," the registry outranks this table). **M12 closed; the ECOSYSTEM vessel/fork gate is open.**

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-130](T-130-npm-release.md) | npm release: real SDK 0.1.0, relay 0.2.0 (T-124 knobs), keeper first publish | — | done |

## M13 — the telling (white paper + ecosystem plan)

Drafted at a brainstorm session, Aug 2026: the shipped system's public story boiled into WHITEPAPER.md; the standing plan for vessels (apps in their own repos, on the published packages — docs/ECOSYSTEM.md); the release policy T-130 executes (docs/RELEASING.md). Nothing here is protocol-shaping — the two decisions that smell protocol-adjacent (yjs peering, the export-surface line) are parked in docs/RELEASING.md for **sign-off at T-130**, and vessel repos are hard-gated on T-130 shipping. T-143 is owner-gated and sequenced after T-130 so the paper's quick-start is honest.

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-140](T-140-whitepaper.md) | WHITEPAPER.md — the public story, from working code | — | done |
| [T-141](T-141-ecosystem-plan.md) | docs/ECOSYSTEM.md — vessels in their own repos | T-140 | done |
| [T-142](T-142-release-structure.md) | docs/RELEASING.md — release policy + T-130 amendments | — | done |
| [T-143](T-143-homepage.md) | Publish the white paper to a homepage — **owner at keyboard** | T-140, T-130 | todo |
| [T-144](T-144-lore-vessel.md) | lore leads the constellation — riff → brief, build order redirected | T-141 | done |
| [T-145](T-145-forks-of-purpose.md) | Forks of purpose — the agent-workspace track, chartered beside the lane | T-141 | done |
| [T-146](T-146-familiar-charter.md) | familiar riffed → the fork charter (docs/forks/familiar.md) | T-145 | done |
| [T-147](T-147-offgrid-brief.md) | off-grid kit riffed → the vessel brief (docs/vessels/off-grid.md) | T-144 | done |
| [T-148](T-148-chess-brief.md) | correspondence chess riffed → the vessel brief (docs/vessels/chess.md) | T-144 | done |

**Shelved, 16 Aug 2026 — pick up here.** The brainstorm phase rests with the shelf full: [WHITEPAPER.md](../WHITEPAPER.md) (owner-liked; publishing is T-143), the standing policies ([docs/ECOSYSTEM.md](../docs/ECOSYSTEM.md), [docs/RELEASING.md](../docs/RELEASING.md)), and four charters ready to become repos — [lore](../docs/vessels/lore.md), [familiar](../docs/forks/familiar.md), [off-grid](../docs/vessels/off-grid.md), [chess](../docs/vessels/chess.md). T-130 was running in a parallel instance when this was written; once it lands, the unblocked moves are: birth `osfasofa/lore` from its brief and `osfasofa/familiar` from its charter (parallel by design; familiar's v0 is a ~100-line Node script watched from the room client), then T-143 puts the white paper at a homepage. Bench riffs queued for the next brainstorm, sketches folded into the ECOSYSTEM portfolio rows: **wake** (memorial — the ending done well), **carbon** (quiet pad — the copy exists by the act of writing), and the **care circle** (the keeper as the family's continuity). T-143 remains this milestone's one open ticket.

## M14 — familiar (the fork is born)

Kicked off Aug 2026 from the two research riffs ([docs/spools-of-spools.md](../docs/spools-of-spools.md) and [docs/forks/familiar-riff.md](../docs/forks/familiar-riff.md) — collections, splice physics, machine seats; both measured, `scratch/riff-spools-of-spools/`). The agent-workspace fork chartered at T-145 gets its body: repo `osfasofa/familiar` (the owner corrected the name from `pfam` — supersession recorded in ECOSYSTEM.md and T-145's notes), consuming the T-130 packages like a stranger. One kickoff ticket lives here; per the fork rules, everything after it lives in the fork's own repo and feeds back only as evidence at the gate.

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-150](T-150-familiar-kickoff.md) | familiar is born — repo, charter, the desk walking skeleton | T-130 | done |

**Where it stands, 18 Aug 2026.** Built and run: the riff migrated, its §8 folded into ECOSYSTEM.md as the standing evidence-expected note, and `familiar` is a working repo — charter, desk skeleton, static surface, offline tests, torture round 1 against the canonical relay (two agents racing one task, wake-from-pocket, `kill -9`, the human renaming the agent). Three evidence items filed at stranger's rank in the ticket's notes; **zero SDK asks — the published packages sufficed.** The repo was created by the owner and pushed the same session (`osfasofa/familiar`, private, `main`), which closes the ticket — **and closes the loom's involvement: familiar's work is its own from here, and reaches this repo only as evidence at the gate.**

## M15 — the hardening (ship review)

Drafted 3 Sep 2026 from the ship review — design record: [docs/M15-ship-review.md](../docs/M15-ship-review.md). The review answered "how do we hand this to more people without lying to any of them": keep it public, don't promote it, one room at a time, and close a short list first. Nothing here is protocol-shaping; the **sign-off** items are conventions and canonical-relay defaults, each with trade-offs in its ticket. Two rails: *before the next handful* (T-160…T-166, the 404s in T-167, the UUID fallback in T-176) and *before it goes wider* (the rest, plus T-143 and T-125's hardware pass). **T-160 goes first** — until the relay has a hostname we own, every link handed out pins Railway's.

**Pick up here (any session, no owner needed):** the code-only tickets run in three lanes that don't share files — *SDK* (T-176's UUID fallback, T-178, T-169's SDK half), *relay* (T-161, T-170, T-169's relay half, T-168 without changing canonical defaults), *room* (T-162, T-163, T-164, T-166, T-172, T-173, T-176's clipboard fallback, T-165's sentence). Take the top unblocked `todo` in a lane, set it `doing` here and in the ticket, meet its acceptance criteria, set it `done`. Leave every **sign-off** and **owner at keyboard** row alone; the owner works those from the handoff room.

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-160](T-160-relay-hostname.md) | Own the relay hostname (`relay.spools.lol`) — **owner at keyboard** | — | doing |
| [T-161](T-161-proxy-aware-rate-limit.md) | Proxy-aware rate limit: the per-IP bucket is global behind Railway | — | done |
| [T-162](T-162-hide-not-remove.md) | Hide, not remove — the delete affordance says what it does | — | done |
| [T-163](T-163-room-export-forget.md) | Export and forget in the room | — | done |
| [T-164](T-164-start-a-new-room.md) | Start a new room — the way out when someone turns bad | — | done |
| [T-165](T-165-key-travels.md) | Where the key actually goes: the sentence + the address-bar decision — **sign-off** | — | doing |
| [T-166](T-166-self-host-font.md) | Self-host the font — zero third-party requests | — | done |
| [T-167](T-167-static-hosting.md) | Static hosting: leave Vercel, fix the gh-pages 404 — **sign-off, owner at keyboard** | T-160 | todo |
| [T-168](T-168-pocket-eviction.md) | Pocket eviction order + namespace creation cap — **sign-off** | T-161 | doing |
| [T-169](T-169-room-full.md) | Room-full lockout: per-IP room cap; the SDK says "full" | T-161 | doing |
| [T-170](T-170-relay-backpressure.md) | Backpressure and frame budget on the broadcast path | — | done |
| [T-171](T-171-security-headers.md) | Security headers on the room | T-166, T-167 | todo |
| [T-172](T-172-renamed-by.md) | "renamed by" resolves to a person | — | done |
| [T-173](T-173-notification-text.md) | Notification text stays out of the OS | — | done |
| [T-174](T-174-honesty-page.md) | The honesty page + abuse contact | T-143 | todo |
| [T-175](T-175-stun-honesty.md) | STUN honesty: the WebRTC path asks Google and Twilio — **sign-off** | — | todo |
| [T-176](T-176-off-grid-readiness.md) | Off-grid readiness: the secure-context landmines | — | doing |
| [T-177](T-177-link-shape.md) | Link shape: shorter and prettier without lying — **sign-off** | T-160 | todo |
| [T-181](T-181-npm-release-2.md) | npm release: SDK 0.2.0, relay 0.3.0, keeper 0.1.1 — **owner at keyboard** | T-160 | done |

## M16 — the gate (evidence from the vessels)

Opened 3 Sep 2026. Seven repos now consume `spools` from the registry, and two of them had filed SDK evidence in their own notes instead of here — syrup's HANDOFF and familiar/manyhands' evidence #8. ECOSYSTEM's rule 7 says friction flows back as evidence; this rail is that filing. One bug, two gate reviews; the reviews are **sign-off** and the splice one waits on the owner's forgetting riff.

| Ticket | Title | Depends | Status |
|---|---|---|---|
| [T-178](T-178-pocket-deposit-loss.md) | Pocket deposits can be lost at leave — syrup + manyhands evidence | T-161 | doing |
| [T-179](T-179-stash-remember.md) | `stash.remember` — a vessel mirrors the stash's private format — **sign-off** | — | todo |
| [T-180](T-180-splice-gate.md) | `splice()` — the gate review — **sign-off** | — | todo |

## Parked (no ticket until evidence demands one)

- Structured `data` field for immutable kinds — T-030 records the verdict.
- Permissions / signed authorship — DESIGN_DOC §6 has the banked sentence.
- `splice`, more renderers (board, blog).
- Pocket follow-ons deliberately out of M10: deposit DELETE (needs standing → identity ladder), plaintext deposits, in-session pocket polling, compression/delta deposits, multi-relay.
