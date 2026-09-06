# Spool

> **An artifact that can change, that's passed around.**
> Ad hoc side channels between people — not a place you go, a thing you hold.

*The white paper: what Spool is, why it is shaped this way, what it refuses to become, and what it can grow into. Written from working code, August 2026. The protocol lives in [SPEC.md](SPEC.md) (v1.1, normative); the reasoning lives in [DESIGN_DOC.md](DESIGN_DOC.md). Nothing below is aspiration: where a number appears, it was measured; where a promise appears, there is a test.*

---

## 1. The claim

The internet is extraordinary at connecting strangers and strangely bad at holding one small, private, living thing between people who already know each other. Everything is a platform; every platform wants an account; every account is a relationship with a company before it is a relationship with a person. The chat with your siblings about your mother's medication lives on a server you will never see. The mixtape you made for a friend is a playlist inside someone's ad inventory.

Spool is a protocol, an SDK, a relay, and a handful of small clients for the other thing: **intimate, local-first, peer-to-peer shared documents**. Two — or a few — people share one living artifact: a mixtape, a chat, a list, a story told in both directions. Each person holds their own complete copy. Copies sync live when you're online together, reconcile automatically when you reconnect, wait sealed in the relay's pocket while you're apart, and persist on your own device forever even if they never sync again.

The whole ceremony is one link:

```
https://anyhost.example/#spool=amber-cassette-042&relay=wss://…&k=…
```

Room name, rendezvous point, and encryption key — all in the URL fragment, which browsers never transmit to any server, including the one hosting the page. **Handing someone the link is the key exchange.** There is no signup, no invite flow, no directory where a spool can be found. The only way in is that a person gave it to you, and that is not a missing feature. A spool means something *because* someone gave it to you.

## 2. What a spool is

A **spool** is the shared artifact: one document, one sync boundary, one shareable link. What goes on it is **entries** — plain, kind-agnostic units of content. You **wind** entries on. You **rewind** to see the spool as it was at any earlier moment. The whole vocabulary fits in a sentence, and the sentence was the design test:

> *"Every spool is a list of entries. Wind new ones on, rewind to see how it grew."*

Under the words, the shape is deliberately small:

- Every entry has an `id`, an `author`, a `kind`, a timestamp, an optional `parent`, an optional structured `data` field, and an optional text body that merges character-by-character when two people edit at once.
- `parent` gives threading for free — comments, reactions, replies, sub-entries are all the same recursive mechanism.
- `kind` is app-level flavor: a mixtape client renders `kind: 'track'`, a chat client renders `kind: 'message'`. **Clients ignore kinds they don't understand** — that one rule is the entire forward-compatibility story.
- Deletes are soft. History is always on. The past is part of the artifact.

Everything else — who's online, who's typing, who has read what — is ephemeral by design and never becomes part of the document.

## 3. What exists today

This is not a proposal. As of August 2026 the roadmap that defined v1 is complete, and the two milestones after it are too.

**The pieces:**

| Piece | What it is |
|---|---|
| [`spools`](packages/spools) | The SDK — `newSpool`, `openSpool`, `wind`, `rewind`, `export`. TypeScript, framework-agnostic, the actual product. |
| [`spools-relay`](packages/spools-relay) | The relay — a dumb byte broadcaster plus the pocket. Small enough to read in a sitting; no database; imports neither `yjs` nor `y-websocket`, and a test enforces that absence. |
| [`spools-keeper`](packages/spools-keeper) | A headless always-on peer. Your hardware, your key, nobody's server. |
| Clients | A no-build static reference client, a mixtape client ([osfasofa.github.io/spools](https://osfasofa.github.io/spools/)), and **the room** — a Messenger-class group chat, live at [chat.spools.lol](https://chat.spools.lol/). |

**The arc so far:**

- **v1** built the core: links and codes, the entry layer, multi-writer convergence, end-to-end encryption over both transports, `rewind`, export/stash, the dumb relay, and a spec written *last*, from the working system.
- **The pocket** closed the async gap. v1 synced only when people overlapped online — but intimacy is asynchronous; the flagship story ("I made you a mixtape, here's the link") failed at midnight. Now clients holding a spool's key periodically deposit the whole spool, sealed, into the relay's pocket; whoever opens the link later collects, decrypts, and merges. The relay stores **ciphertext or nothing**, under names it cannot invert and does not verify. The friend who opens your link at 3 a.m., while you sleep, sees the mixtape.
- **The room** was the stress test for the whole thesis: a real group chat — nicknames, reactions, replies, presence, typing, read indicators, editing, unread dividers — built to discover which of those needs would force the protocol to grow. The finding: **none of them did.** Seats, profiles, room names, and edit markers are all app conventions over the same entry model; presence and "seen" ride sealed ephemeral state. SPEC v1.1 never moved. (The precise asterisk, because precision is the house style: the SDK gained one additive getter, and two relay *defaults* were retuned for group scale, with sign-off.)

**The evidence culture** is the part that doesn't show in a feature list. Relay-blindness is an automated test — an instrumented relay with a marker-leak control — not a claim. Presence sealing was proven by capturing 112 frames at the relay and checking every one was ciphertext. The pocket survived a deliberate relay restart and a cold open on a device whose local storage had been deleted outright, with nobody else online. The spec got three adversarial clean-room reads before it shipped. When an estimate and a measurement disagreed, the measurement won — and is quoted in the docs in place of the estimate.

**Ten lines is the adoption story:**

```js
import { newSpool, openSpool } from 'spools'

const spool = await newSpool()                // fresh, encrypted by default
spool.wind({ kind: 'note', body: 'made you a thing' })
const link = spool.share()                    // hand this to someone

// on their side, tonight or in a month
const same = await openSpool(link)
same.on('entry', () => render(same.entries))
same.rewind(ts)                               // the spool as it was
same.export()                                 // a file, readable in 2040, yours
```

## 4. How it works

Four decisions carry the whole design.

**Don't invent a CRDT or a wire format.** A spool is a [Yjs](https://docs.yjs.dev) document with an agreed shape, synced with stock Yjs messages over websocket and WebRTC. This looks like cheating; it is the biggest strategic advantage in the repo. Every Yjs editor binding — ProseMirror, CodeMirror, tldraw — already works with a spool. Nobody adopts a spec; they adopt a library, and the library stands on the most battle-tested CRDT ecosystem there is.

**Make the relay too dumb to betray you.** A Spool relay broadcasts opaque bytes per room and MUST NOT parse, transform, filter, or persist frames. This is not a privacy *policy* — it's an inability. (Stock y-websocket servers are explicitly *not* compliant relays: they materialize a plaintext copy of the document server-side, and they silently cannot carry encrypted frames at all — discovered the hard way, auditing Spool's own ancestor.) The honesty clause is precise, because "no central server" is usually a lie by omission: pure serverless P2P discovery doesn't exist on the modern internet, so **"no central server" here means exactly "no server that ever sees your content."** A relay sees IP addresses, room codes, frame sizes and timing — and the docs say so, out loud.

**Seal everything, with the key that lives only in the link.** The link's `k=` parameter is 32 random bytes — no passwords, no key-derivation ceremony, no accounts to recover. Websocket frames, at-rest storage, and pocket deposits are all sealed with the same key under a family of tagged envelopes; anything that fails to authenticate is dropped and counted, never handed to the document. Wrong key fails loud. And because the pocket's namespace is a one-way hash *of the key*, a relay can't even be tricked into storing content for spools that never opted into a key: **keyed-only — ciphertext or nothing** is structural, not policed. The spec's instruction to relay operators ends: *"Do not claim more than this."*

**Keep the past.** Every spool runs with garbage collection off and keeps a log of moments; `rewind(ts)` rebuilds the spool as it stood at any of them. The cost was measured — about a third more storage on a realistic spool — and accepted, because for a keepsake the growth *is* the point. `export()` writes one JSON file containing both a human-readable entry list and the full document: readable by a person in 2040, and re-importable as a true CRDT merge even if every relay on earth is gone.

And for the household that trusts no one's disk but its own: `npx spools-keeper <link>` runs a headless peer on your own hardware. It's not a service — it's a *member* who never sleeps, conformant to the same spec as every other client, and it is the async answer for spools that chose to have no key at all.

## 5. What it's for

The protocol doesn't care what a spool holds; the `kind` field and the renderer decide. Three renderers already share one spool — the same entries as a chat, a list, and a mixtape — because **views are skins over the same weave**. What's shipped so far are the proofs: the mixtape (a gift), the room (a group), the list (a tool). What the shape is *for* is wider:

- **A mixtape for someone.** Wound over weeks, opened at midnight, kept forever. The founding gesture.
- **A room for a few.** The family chat that isn't on anyone's platform; the group of five that doesn't want to be a "workspace."
- **A body of lore.** The stories, sayings, and in-jokes a group actually keeps — told in variants, argued over by the people who were there, traded hand to hand as links, and held with intent or honestly lost. Folklore has always had exactly two fates; this is the rare software that agrees.
- **A baby book** between parents and far-away grandparents — `rewind` is literally *watch them grow*, and the export is the artifact you hand your kid at eighteen.
- **A memorial spool** — a family winds memories and stories for someone who died; the export is the keepsake. No feed, no likes, no company between you and grief.
- **A care circle** — three siblings coordinating a parent's medications, visits, observations. Exactly the data nobody wants in a SaaS; the relay never sees a word of it.
- **A trip, a handoff, a season** — the pet-sitter briefing, the expedition journal, the plan that lives offline on the plane and reconciles at hotel wifi. Spools that are *supposed to end*, and end as a file.
- **An interview across weeks** — hand the link to a grandparent; both of you wind; the export is the oral history.
- **A correspondence game** — chess as `kind: 'move'`, `rewind` as replay.
- **A pad that no server can read** — bind a text editor to `spool.doc` and you have collaborative writing where the infrastructure is structurally unable to look.
- **Anywhere the internet isn't.** A relay on one laptop plus the static client from a USB stick is a complete collaborative system with no internet at all — classrooms, field research, a cabin. This falls out of the discipline for free, and almost nothing else in the collaborative-software world can do it.

Which of these get built, and in what order, is the ecosystem plan ([docs/ECOSYSTEM.md](docs/ECOSYSTEM.md)) — new apps live in their own repos, on the published packages, so the protocol home stays small.

## 6. What it refuses

Every refusal below is load-bearing. They are why the promises above can be short.

- **No accounts, no identity layer.** `author` is a self-declared string; at intimate scale, **trust, not proof, is the mechanism** — you know who you handed the link to. (The door to cryptographic attribution is deliberately ajar — an additive signature field, never a migration — but it opens only if a real client demands it, and it would buy *attribution*, never enforcement.)
- **No permissions.** In an end-to-end-encrypted P2P system the relay *cannot* enforce rules (it reads nothing) and clients *cannot be forced* to obey them (any key-holder writes valid updates). So Spool refuses to pantomime access control it cannot deliver: everyone with the link can edit everything, and the shipped clients say so in plain words instead of drawing locks they can't close.
- **No discovery, no feed, no search, no growth loops.** Nothing trends. Nothing is recommended. **Adoption is optional: this exists to be good, not to be big** — chasing scale is the disease this project is the antidote to.
- **No federation.** Relays never talk to each other; a spool lives at whichever relay its link names, and anyone can run one in the time it takes to make coffee. Zero relay-to-relay coordination is a philosophical commitment, not a TODO.
- **No plaintext in the pocket.** Unkeyed spools stay live-only (or run a keeper). The alternative — a relay durably storing readable content — would cost the one-sentence honesty clause, and the sentence is worth more than the feature.
- **No ghost presence.** Who's here, who's typing, who has seen what: ephemeral, sealed, dead with the tab. **Ephemera must never persist.** Nobody learns what you read while they were away.
- **No key rotation, no key recovery.** The link is the key. Rotation is a new spool. Losing the link *is* losing the spool, the way losing a paper letter is losing the letter — the design accepts the physics of objects rather than reintroducing an authority who could also be compelled.
- **No assets in the document.** A spool carries at most a URL and a content hash; the artifact stays small enough to hold.
- **Not an agent workbench.** The shape happens to fit machine tenants — the SDK runs in Node, a link is a perfect per-task capability, `rewind` is an audit log — and someone will eventually notice. But this project's lane is people. Software agents in spools are a fork of *purpose* — if that gets explored, it happens under another name, in another repo, on its own conscience; this roadmap stays people.

The competitive line is one sentence: Matrix, ActivityPub, and Nostr federate strangers; **Spool connects friends.**

## 7. The honest limits

A white paper that only advertises is a brochure. These are the edges, stated the way the docs state them to users.

- **The link is total, irrevocable capability.** Anyone holding it reads everything and writes anything — including editing others' entries and the whole past. There is no partial history and no read-only. One paste into the wrong chat is one paste too many — and the paste is not the only way the key travels. "Never sent to a server" is true of *this project's* servers: a browser syncs history, open tabs, and bookmarks to its maker, and whichever messenger carries the link holds it in plaintext unless that messenger is end-to-end encrypted. The room says so at every "link copied" moment, and every client should: *"your browser may sync this address to its maker; send the link over something end-to-end encrypted, or in person."* The clients say the capability part before first wind; it is the price of no accounts, and you should decide it's worth it *before* you start.
- **Spools grow and don't slim down.** History-always-on means a busy room's document only gets bigger, and the measured budget is public: ~317 bytes per message, comfortable for **years at intimate scale, one heavy summer for a big room** (~26,500 messages to the pocket's 8 MiB deposit ceiling). Compaction is deliberately unbuilt until a real spool approaches the number. The graceful ending is the intended one: finish the spool, export the file, start the next — keepsakes have lifespans.
- **The pocket is a courtesy, not an archive.** Deposits expire (~60 days untouched on the canonical relay), a cold reader sees the state as of the last deposit (worst case about a minute behind a live session), and nine-plus people all writing in isolation can outrun the deposit ring. Devices remain the spool's home; the pocket bridges gaps, it doesn't replace anybody's copy.
- **A full room says so, and stays full until someone leaves.** The relay guards at 64 connections per room (tabs, not people) and refuses the 65th with a close code; the SDK reports it as `roomFull` and tries again about every half minute, and the room client shows the line. There is no queue and no priority: the seat goes to whoever asks first after one frees. Room codes are public, so a relay behind a proxy can also cap connections per address, which the same line reports with its own reason.
- **"Seen" is genuinely lossy, deletion is anonymous, closed tabs are unreachable.** Read indicators die with the tab by design. A tombstone says "removed," never by whom (v1 truth, on the record). And the room's own fine print is the model for every future client: *"this room can only reach you while it's open somewhere — there is no server to call you back."*
- **Clocks are annotated, not repaired.** Ordering trusts the writer's wall clock with a deterministic tie-break; a device running fast gets a label, not a correction.

None of these are apologies. Each is the visible half of a trade whose other half is a promise this project actually keeps.

## 8. What it can become

The one-repo era is ending on purpose. The protocol home — SDK, relay, keeper, reference clients, spec — stays small and boring. Growth, if it comes, happens as **vessels**: small, opinionated apps in their own repos, consuming the published packages like any stranger would, each one proving a different corner of the design. A baby book proves `rewind` as an emotional instrument. An off-grid kit proves the USB-stick discipline. A chess skin proves that structured `data` and deterministic ordering are enough for turn-taking without permissions. A quiet pad proves the editor-binding escape hatch.

The vessels aren't just consumers — they are the SDK's governor. The API grows **only** when a second client independently wants what the first one built by convention; that rule ("parked with evidence") is already written down and already has its first four candidates waiting, recorded from the room's construction. This is how the protocol stays small while the constellation around it grows: apps race ahead on conventions, and the SDK promotes only what recurs.

And the win condition stays what §1 of the design doc says it is. No growth loops, no fundraising story, no land grab. The realistic ceiling — a small devoted audience, a handful of lovingly made vessels, artifacts that outlive their infrastructure — **is the target, not the consolation prize**. This is not infrastructure-in-waiting; it is a finely made instrument. A letterpress, not a printing press. The way it spreads, if it spreads, is that someone receives a spool that moves them, and asks how to make one.

## 9. The ethos, distilled

1. **The spec is written last.** Describe what works; never promise what doesn't. When the spec and the code disagreed, the code was already right five times out of five.
2. **Smaller, more boring, fewer sentences.** Every spec sentence is a tax on every future implementer. The metaphor budget is real and spent deliberately: one vivid noun, two vivid verbs, everything else boring on purpose.
3. **Honesty is a feature.** The honesty clause enumerates exactly what a relay observes. The clients ship their own disclaimers in plain language. Claims are tests; limits are sentences shown to users, not footnotes hidden from them.
4. **Measure, then decide — and let measurement overturn sign-off.** A signed-off design for persistent read receipts was measured quadratic and rejected *after* approval, in favor of ephemeral ones. The decision log records both the reversal and the numbers, so nothing gets relitigated without new evidence.
5. **Social friction is the point; technical friction sinks.** CRDTs, NAT traversal, key handling — invisible. Handing someone a link — deliberate, human, kept.
6. **Refuse what you cannot make true.** No permissions that can't be enforced, no "delete" that doesn't delete, no privacy claim without a test pinning it down.
7. **Power to the person.** Whole copies on your own device, export as a first-class act, one hard delete that actually means it. A spool is a keepsake, not an account.

## 10. Hold one

The mixtape client is at [osfasofa.github.io/spools](https://osfasofa.github.io/spools/); the room is at [chat.spools.lol](https://chat.spools.lol/) — open either, wind something, and hand the link to one person you like.

```sh
npx spools-relay        # your own rendezvous point, before the coffee's ready
npm i spools            # the SDK — ten lines to a living document
npx spools-keeper <link>  # an always-on peer on hardware you own
```

The protocol is small enough to actually read: [SPEC.md](SPEC.md). The reasoning is public: [DESIGN_DOC.md](DESIGN_DOC.md). The standing release rule is that **what's on npm matches what's true** ([docs/RELEASING.md](docs/RELEASING.md)); if the registry and this paper ever disagree, the repo wins.

MIT · built by [osfasofa](https://github.com/osfasofa/spools) · *this paper describes the shipped system as of August 2026 — SPEC v1.1.*
