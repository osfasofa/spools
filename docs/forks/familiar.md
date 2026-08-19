# familiar — the fork charter

*Riff → charter, from the M13 brainstorm (third session, Aug 2026). **familiar is a fork of purpose, not a vessel** — it lives outside §1's human-intimacy lane on purpose, keeps the honesty culture on purpose, and feeds the loom nothing except evidence at a stranger's rank (ECOSYSTEM.md, "Forks of purpose"). This document lives in the loom until `osfasofa/familiar` is born (after T-130), then migrates with it. Everything below runs on SPEC v1.1 as-is; the thesis, like the room's, is that it never needs more.*

## 1. The claim

In the old trial records, a familiar is a small spirit bound to one person: it fetches, it carries, it reports back, it is fed by its keeper, and it answers — through them — for everything it does. The records even left us their names: Pyewacket, Vinegar Tom, Grizzel Greedigut.

Every agent product today gets the *work* half of this and loses the *bond* half. The agent works for you, but the record of the work — the log, the findings, the conversation — lives on the vendor's servers, in the vendor's format, under the vendor's account, for exactly as long as the vendor exists. You are the customer of your own memory.

**familiar** is the other arrangement: one person, one working agent, one shared spool between them. The agent winds what it finds; the person steers by winding back; `rewind` is an audit trail nobody can quietly rewrite; `export` is a mission record that outlives the agent, the container it ran in, and the company that trained it. The familiar is temporary. **The record is yours, sealed end to end, forever.**

## 2. Why Spool fits — mechanism by mechanism

- **The link is the pact.** Binding an agent means handing it a link — room, relay, key, one gesture, the same key exchange SPEC defines for people. No OAuth dance, no service account, no API-key vault *for the relationship itself*. And because a spool is cheap, the pact is naturally scoped: **one errand, one spool** — the capability is exactly the size of the task.
- **The pocket is the owl.** The pocket was built for "your friend opens the link while you're asleep." familiar inverts it: *the work finishes while you're asleep.* The agent's container dies at 3 a.m.; `leave()` flushes the final sealed deposit on the way down; you wake, open the link, and the results are waiting — delivered with **zero results-backend, zero webhooks, zero notification service**, through a relay that cannot read them. Every agent product on earth needs delivery infrastructure; familiar needs a courtesy pocket on a dumb relay.
- **"A seat is a device, not a person" — written before agents, true for agents.** The room's D1 convention accommodates a machine writer without changing a word. The familiar takes a seat; its name goes in the profile table like anyone's. Naming your familiar is the arrival ceremony — the seventeenth century already showed us the register.
- **`leave()` is the dying act.** The spirit is ephemeral by design — reclaimed containers, finished sessions, spent budgets. What survives is exactly what it deliberately wound. Which is also the privacy posture: **no exhaust.** Presence dies with the process (gone means *gone*, not "last seen 3:04 a.m."), "seen" is never recorded, and ephemera never persist — the familiar leaves no tracks except its report.
- **`rewind` makes vandalism visible, not impossible.** Any key-holder — agent included — can edit the past; that's the protocol's honest contract. But history-always-on means the edit is *in* the record. For agent accountability that's the right shape: not a lock (unenforceable), a ledger (undeniable).
- **The keeper remembers; the familiar does.** `spools-keeper` proved the SDK as a headless Node client that never sleeps. familiar is the keeper's restless sibling — same surface, same conformance, plus hands.
- **Sealed from every server in between.** The relay holds ciphertext or nothing, the pocket is keyed-only, transport is sealed — the *infrastructure* is blind. Stated precisely, per the honesty culture: what the model provider saw while doing the work is the runner's business and the charter says so out loud; what the record's transport and storage see is **nothing**.

## 3. The shape (conventions; the fork repo owns the final word)

**Per-errand spools.** A fresh spool per task is the default hygiene: the blast radius of a leaked or misused link is one errand's record. Long-running familiars (a research companion, a monitor) may keep a standing hearth-spool — a deliberate, documented exception, never the default.

**Kinds:**

| kind | what it is |
|---|---|
| `pact` | The founding entry: the errand's charter, wound by the human. What the familiar was asked to do, on the record before any work. |
| `finding` | The familiar reports something learned. The body is the report. |
| `question` | The familiar is blocked or unsure; the human answers by reply (`parent`) — threading is the steering wheel. |
| `decision` | The human's call, wound so the record shows *who chose*, not just what happened. |
| `relic` | A pointer to anything big — URL + content hash in `data`, never bytes in the doc. Shared shape with lore's `relic`, deliberately. |
| `fam:*` | Reserved settings kinds, room-precedent, newest-wins. |

Seats and profiles carry over from the room verbatim. `message` stays `message` — which yields the v0 trick below.

**"A familiar reports; it does not narrate."** The register rule is also the budget rule: the measured growth numbers (~317 B/entry, the 8 MiB deposit ceiling) punish stdout-firehose logging. The spool is the *report*; big artifacts travel as `relic` pointers; the working noise stays in the container that dies.

**v0 costs almost nothing.** The familiar's first body is a ~100-line Node script on the public SDK (the keeper is the proof of size). And the human side needs *no new client at all*: the room already renders unknown kinds as labeled fallback lines, already renders `message` natively, already shows presence — so you watch your familiar work, see its dot by the fire, and talk back to it **from the room client, today**. The unknown-kind fallback rule was written for a future nobody had met yet; this is it arriving.

## 4. The register

Hearth, not dashboard. The familiar has a name and a seat, not a job ID; you **dismiss** it, you don't terminate it; the pact is read back at arrival. Presence is its body: the dot is the cat by the fire, typing is ears twitching. Warm, small, and slightly uncanny — never corporate, never "your AI assistant."

The fork's own honesty sentence, shipped in any UI it ever grows, and the sharpest line in this charter:

> *"a familiar holds whatever link you hand it — and a link is the power to read everything and rewrite anything, forever. never hand your familiar a spool you wouldn't let it rewrite. one errand, one spool."*

## 5. What it refuses

- **No swarm, no marketplace, no agent-to-agent economy.** One person and the work they delegate. Intimate scale survives this fork even though the human-only lane doesn't — that's the part of §1 the fork *keeps*.
- **No hosted service, no accounts.** BYO spirit: the familiar runs where you run it. A "familiar cloud" would be the vendor-owned memory problem wearing a robe.
- **No ambient capability.** A familiar never discovers, scans, or inherits spools. It is handed links, or it has nothing — the protocol's no-discovery refusal, applied to machines with teeth.
- **No exhaust.** No telemetry, no analytics, no reading-habit reporting. The record is what was deliberately wound, full stop.
- **The human answers for the familiar.** The old records were clear on this and so is the charter: attribution by seat is testimony (the §6 `sig` ladder could someday make it cryptographic — attribution, never enforcement), and responsibility is the keeper's. What a familiar may *do* out in the world — tools, actions, judgment — is agent safety, owned by whoever runs the spirit, out of scope here and said so.

## 6. Honest limits

- **The pact cannot be un-handed.** No key rotation means dismissal is social + structural: stop using that spool, start the next errand fresh. The folklore agrees — you don't unmeet a spirit; you close the circle and draw a new one.
- **A buggy or hostile familiar can vandalize its spool.** Visible in `rewind`, recoverable never. Per-errand spools are the containment; there is no other, and the charter refuses to imply one.
- **Chatty agents hit real walls.** The deposit ceiling, the ring (an agent restarting often takes fresh ring slots — the parked tag-persistence issue, now with a second face), the 24 PUTs/min per IP (an agent fleet on one NAT is exactly the case the relay README warns about). The numbers are published; the familiar respects them by reporting, not narrating.
- **Delivery is a courtesy window.** An errand's results wait ~60 days in the pocket, forever on any device that opened them. A familiar's report nobody ever reads ages out of the relay like anything else — attention is the preservative here too.

## 7. What flows back to the loom (evidence only, stranger's rank)

- The SDK as a headless Node client *in anger* — beyond the keeper's hold-and-answer.
- **A second wanter for `relic`** — lore and familiar independently need the URL+hash pointer kind. That's the parked-with-evidence gate's first live test from two directions at once.
- **A second face for pocket ring-tag persistence** — the room found reload churn; familiar finds restart churn. Same parked item, new witness.
- The zero-protocol thesis, room-style: if machine tenants ever genuinely need spec surface, that evidence goes to the owner — and probably means the fork is holding the instrument wrong, not that the instrument is missing a string.

## 8. Open threads (decided in the fork repo)

- The dismissal ceremony: archive the errand-spool (stash), export-and-forget, or let the pocket's dust take it — what does "closing the circle" feel like?
- Many familiars at one hearth (several agents, one spool, seats apiece) vs one each — the 64-conn and ring bounds say small either way; the register says *very* small.
- Whether the human side ever earns its own client, or stays a room skin indefinitely (lean: room skin until it hurts — a new UI is the expensive way to learn what v0 teaches free).
- Instance-naming: the app is familiar; *yours* is Pyewacket, or Vinegar Tom, or whatever the profile table says it is. Whether the arrival ceremony suggests names from the old records, and how hard it leans on the uncanny.
