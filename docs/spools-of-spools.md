# Spools of spools — the collections riff

*Research riff, August 2026. The founding prompt is the owner's: collections of spools, lists of links of spools, spools that refer to each other and form a network — splices, meshes, routing, relays, "spools of spools of spools." This document explores that space to its edges and prices what it finds. **It decides nothing.** Nothing here amends SPEC, touches §5, or promises surface; every thread that wants to become real queues at the usual gates (owner sign-off for anything protocol-shaping, parked-with-evidence for SDK surface). Numbers below are measured, not guessed: `scratch/riff-spools-of-spools/spike.mjs`, run on the shipped `spools@0.1.0` build.*

---

## 0. The noticing

Nothing in the shipped system prevents a spool from holding spools. A link is a string (SPEC §1); an entry's `data` holds plain JSON (§2); clients MUST ignore and preserve kinds they don't understand (§2, the forward-compatibility rule). So this is already legal, today, in every shipped client:

```js
shelf.wind({
  kind: 'spool',
  body: 'the mixtape for the drive',        // your name for it — a petname
  data: { link: mixtape.share() },
})
```

The room, the mixtape client, and the no-build client all already render that entry sanely via the unknown-kind fallback. The riff isn't proposing a feature — the feature shipped at T-011/T-030, the way directories could always hold directories. What hasn't shipped is the *noticing*: that one convention turns the flat world of disconnected spools into a space with **shape** — shelves, chains, trees, webs — and that every hard question it raises (capability, sync cost, metadata, routing, splicing) has a Spool-flavored answer that mostly costs zero spec sentences.

That's the thesis to test, the same one M11 tested and won: **conventions don't need protocol.** Everything below sorts into (a) already true, (b) pure convention, (c) SDK sugar someday at the gate, (d) the two places genuine protocol pressure could appear, and (e) fork-of-purpose territory. The far end gets as weird as the prompt asked for; the pricing stays honest throughout.

## 1. What a link inside a spool *is*

A link is not a pointer. A pointer names; a spool link **empowers** — whoever reads it gets the full honest v1 contract of the spool it names: read everything, write anything, forever, unrevocably. Winding a link into a spool makes that spool a **capability store**, and syncing it *is* key exchange. This one fact governs the whole design space, so it goes first.

The existing grammar already expresses three grades of reference, no new syntax (spike-verified: `buildSpoolLink`/`parseSpoolLink` round-trip the middle grade today):

| grade | shape | what the holder can do | exists for |
|---|---|---|---|
| **full link** | `#spool=code&relay=…&k=…` | open, read, write — everything | sharing. The gift. |
| **sealed reference** | `#spool=code&relay=…` (no `k`) | know it exists, know where it rendezvous, join the room and see only ciphertext, *not* derive the pocket token (it needs the key) | mentioning without sharing. "There's a tale about that night — ask ana." |
| **mention** | `code` alone | almost nothing (a code is a rendezvous name, not a secret) | prose. Provenance color. |

Three consequences worth staring at:

**Transitive closure is the blast radius.** Handing someone a collection of full links hands them everything reachable from it — the whole connected subgraph, transitively, at the moment they first sync it *and forever after* (new links wound into a collection they hold arrive by ordinary sync). That's the feature: one handoff, then a world that grows in-band. It's also the threat model: the unit of compromise stops being a spool and becomes a *component of the graph*. A device that leaks your shelf leaks your everything.

**Sealed references keep the friction social — which is the point.** The philosophy keeps exactly one friction: a link comes from a person. A collection of full links quietly deletes that friction for every spool it contains. Sealed references restore it: the collection shows the *shape* of the world (there are seven tales from that summer) while every door still needs a person to open it. This is lore's pointing-home question ("sometimes that's the gift, sometimes it must not be — the ceremony has to ask") generalized: **every wind of a link is a small ceremony, and clients should make the grade a visible choice, never a default silently taken.** Honest asterisk: sealed references exist only for keyed spools — a plaintext spool's code *is* its full capability, so in collections-world plaintext spools are strictly more dangerous, and a client that seals references should say so when the target is keyless.

**Revocation inverts the arrows.** You can't un-give a key; rotation is already the answer ("a new key is a new spool," §5) and collections make rotation *deployable* for the first time: wind the successor's link into every collection that pointed at the old spool, soft-delete the stale entry, and everyone downstream heals by ordinary sync — link rot, cured by CRDT. But notice who heals: **everyone holding those collections, including whoever you rotated to escape.** To actually exclude a person you must rotate every collection they hold too, redistributing *those* out-of-band — revocation cascades **up** the graph, opposite to how capability flowed down. The design pressure this creates is real and it points somewhere good: keep hubs tiny and intimate (a two-person us-spool re-keys over one text message), let breadth live at the leaves. The physics agrees with the lane: **intimacy at the root, abundance at the edges.**

## 2. The convention (the whole proposal, such as it is)

One kind, one `data` field, everything else is the client's taste:

- `kind: 'spool'` — an entry that refers to another spool.
- `data.link` — the reference, as one opaque string in the existing grammar (any grade above). One field, not decomposed parts: `parseSpoolLink` is the single parser, drift is impossible, and the grade is expressed by what the string carries. Write-once, like all `data` — *updating* a reference is a new entry + soft-delete of the old (the entry model's honest idiom, and it keeps rewind meaningful: the shelf's history is the history of what it pointed to).
- `body` — the petname: what *this spool's people* call the linked spool. Bodies are `Y.Text`, so even the name of the thing is collaboratively editable, which is exactly right — naming things together is half of intimacy.
- `parent` — free structure inside the collection (sections of a shelf, a tale's trades threaded under it), the same one mechanism as everywhere.
- optional `data.role` — a small open vocabulary when the edge means something: `'home'` (points at where this spool was broken off from), `'next'` / `'prev'` (seasons), nothing at all for a plain shelf entry. Unknown roles: ignored, preserved, obviously.

No new noun. The metaphor budget stays sealed: this is **a spool of spools** — the phrase is already the design, spends zero vocabulary, and passes the sentence test on the first try: *"Wind a spool onto a spool. Hand someone the whole shelf."* (If a noun is ever truly earned, *skein* — a wound bundle of thread — is noted and shelved. Lean hard toward never needing it.)

Petnames deserve one more sentence, because they're load-bearing: there is no global namespace here and there must never be one. Every name for a spool is *somebody's* name for it, attached to the edge, not the node — which is the petname-system architecture, arrived at not by importing theory but by having nowhere else to put a name. "No discovery" holds because the map is never anyone's but yours.

## 3. The shapes (what the convention unlocks, priced)

```
  the shelf              the us-spool                seasons                  the campfire
  (one person,           (two people,                (one story,              (a web with a hearth)
   many devices)          one door)                   many volumes)
      ┌─────┐              ┌────┐                                              ┌────────┐
      │shelf│              │ us │                 ┌──┐   ┌──┐   ┌──┐           │campfire│──tale
      └──┬──┘              └─┬──┘                 │s1│⇄──│s2│⇄──│s3│           └───┬────┘──tale
    ┌──┬─┴─┬──┐          ┌──┬┴──┬──┐              └──┘   └──┘   └──┘             tale──────traded
    ▽  ▽   ▽  ▽          ▽  ▽   ▽  ▽              next/prev links               (sealed ref home)
   every spool you      everything we
   care about, synced   share, invited in-band
```

**The shelf** — a personal collection, one person's spools. This solves a real, current, unglamorous gap: the stash is localStorage + IndexedDB, so *your own phone and laptop don't agree on what spools you have*. A shelf spool synced between your own devices is multi-device stash, built from nothing — the registry becomes just a cache of the shelf. Costs: your shelf is now a spool like any other (relay sees its code and traffic timing; it deposits to the pocket sealed). Bakes in: nothing — it's private, it's yours, delete it and the stash idiom still works. This is the pattern to try *first* because it needs nobody's buy-in but one person's two devices.

**The us-spool** — the two-person hub. Today every new spool between the same two people repeats the out-of-band ceremony (text the link again). With one hub wound between you: make the new mixtape, wind its link into *us*, done — the other side's client sees a new `spool` entry arrive like any other entry. **The N+1st handoff moves in-band; only the first one is ever ceremony again.** This is the single biggest lived-experience change in the whole riff, and it's pure convention. Costs: the hub is the crown jewel (blast radius §1) — but it's also two people, trivially re-keyable, which is exactly the hub the revocation physics says to have.

**Seasons** — the growth ceiling answered by narrative instead of surgery. §6's chat-scale question measured the crossing at ~26,500 messages and parked "pruning/compaction/splice" until a real room approaches it. Collections give the boring, human answer: the room winds `{kind:'spool', data:{link: next.share(), role:'next'}}` as its last meaningful entry; the new season opens with a `role:'prev'` link back. The old spool stays whole (a keepsake, rewindable forever), the new one starts light, and "the chat" becomes a *chain of volumes* — which is what long friendships actually produce anyway. No compaction algorithm, no tombstone surgery, no spec sentence. Cost: clients that want seamless scrollback across the seam have to open two spools and stitch at render time (or honestly not stitch — "season two starts here" is a fine sentence to show humans).

**The campfire and the traded tale** — lore's two roles become graph roles. Break off a tale: fork or retell (see §4), wind the traded spool's link into the campfire (`role` free-form, the trade recorded as lore), and give the traded tale a **sealed reference home** by default — it knows where it came from, it can prove provenance socially, but holding the tale does not open the campfire. Full-link-home only when the ceremony asks. The lore brief's open question gets its mechanics for free from §1's grades.

**Living routing tables** — the healing loop, stated generally: *a collection is the channel through which every spool it references can announce its own succession.* Relay moved? Key rotated? Season ended? The fix is one wind + one soft-delete in each collection that points there, and everyone holding those collections converges on the new route by sync. Dead links don't rot silently; they get *retold*. (Limit honestly: a link handed out raw — pasted in a text message, printed on paper — heals nothing. Only referenced spools heal. Collections make links *living* precisely because a CRDT is the one place a string can change after you gave it away.)

## 4. Splice, measured (the reserved verb meets the physics)

`splice` has been reserved since §2 of the design doc with no design. The spike put the physics on the table, using only the shipped surface (`spool.doc` escape hatch + `Y.applyUpdate`):

```
fork      = newSpool()                                  // new code, new key, new rooms, new pocket
Y.applyUpdate(fork.doc, Y.encodeStateAsUpdate(orig.doc)) // the whole corpus crosses, lineage intact
```

Measured results (`spike.mjs`, all assertions green):

- **The fork carries everything** — entries, bodies, *and the history array*: `fork.rewind(preForkTs)` reconstructs the pre-fork corpus from inside the fork. A fork remembers who it was before it was born. (Sizes: 0.7 KB corpus → 1.3 KB after fork-and-reunion, both sides identical.)
- **The seam doesn't show.** After divergence — new entries on both sides, plus *concurrent character edits to the same pre-fork body* — one exchange of updates converged both spools: identical entry sets, identical order, and the shared body merged character-level: `"as ana tells it: the night the canoe sank — and the paddle was never found"`. CRDT kinship survives the identity change; reunion is just sync with extra steps.
- **Fork is all-or-nothing.** You cannot splice out *one tale* and keep CRDT lineage — subsetting a Yjs doc breaks item identity (and a filtered doc that later reunites would resurrect everything anyway). So the space has exactly two operators, and they're complementary: **splice** (whole-spool fork, lineage kept, reunion possible forever) and **retelling** (lore's v1: wind fresh entries into a new spool — subset, clean break, reunion is another retelling). Retelling is the subset operator. This deserves to be *the* sentence in any future splice design.

What the escape-hatch version doesn't give, and a `splice()` surface someday would have to price:

- **Keys.** Post-fork, the two spools have different keys; reunion means one client holding *both* links open at once, pumping updates across locally (never through either relay — each relay sees only its own spool's sealed frames; the reunion happens inside the one device that was trusted with both). That's the right physics — a splice-and-reunion is a *human* act, performed by someone both sides trust — but it means splice can't be "fire and forget."
- **Branch-from-a-moment.** Forking the *present* is `encodeStateAsUpdate`; forking a past moment (`Y.createDocFromSnapshot` off a rewind moment) would give "splice from who we were in June" — untested in the spike, plausible per Yjs docs, needs its own spike before anyone says it out loud.
- **Provenance.** Pure convention, already priced in §3: the fork winds a `role:'home'` reference (sealed by default), the origin winds a `role:'offshoot'` one. Family trees of spools emerge from two entry conventions, and rewind across generations is archaeology.

The gate note, restated so this riff can't be miscited: lore's reunion case is the *first* real evidence at splice's gate (T-144). This spike is *feasibility*, not demand. The verb stays reserved and promised nowhere.

## 5. Networks — graph physics under the honest contract

Let people wind links freely and you get a graph. What kind?

- **Edges are one-way, and the target never knows.** A backlink requires write access to the target — possible when the linker holds both keys, impossible otherwise. The web made the same choice (one-way links, no permission from the linked) and it's the choice that ships; here it's also the private one: with different keys on different relays, *no party anywhere* — not even a relay — can see that spool A references spool B. The reference exists only inside A's ciphertext.
- **Cycles are content, not hazards.** A ↔ B, rings of shelves, a spool that winds its own `share()` as its own title page (the fixed point; harmless; someone will do it in the first week and it should just render). The only rule is for *traversers*: carry a visited set. That's a client checklist line, not protocol.
- **There is no global graph — structurally, not by policy.** Every edge lives sealed inside some spool; the graph you can see is exactly the transitive closure of what people have handed you. Nobody — client, relay, crawler, us — can enumerate, index, or search a web of spools they weren't given, and no future feature can change that without breaking encryption. What collections build is **private hypertext: a web with no public URLs**, where every link was a gift from a person. Set beside the refusals (`no discovery, no feed, no search`), the line lands cleanly: *discovery* is finding strangers' things; a collection is *navigation* among things already given to you. The friction that matters — a person hands you the way in — is untouched at every hop that stays sealed; §1's grades are what keep clients from silently spending it.

## 6. Sync economics — cheap to hold, costly to open

The spike's numbers, then the consequences:

- **At rest, links are nearly free.** 425 B per full-link entry (167-char canonical link + petname body + metadata): 100 links = 41 KB, 1,000 = 415 KB, ~20k links fit under the 8 MiB deposit cap. Collections will never be a storage problem; a lifetime shelf is a rounding error.
- **Dereferencing is where the costs live.** Each *opened* child is its own websocket (+ webrtc mesh + resync tick + deposit schedule), and phones don't hold fifty sockets. Each *cold* child is a pocket GET of up to K≈8 full-state sealed deposits — a 20-spool constellation of 100 KB docs cold-opens at ~2 MB typical and ~16 MB worst-case, real money on cellular.

So the traversal posture writes itself, and it's all client-side:

- **Lazy by default, always.** Opening a collection opens *nothing else*. A link entry renders from its petname and its `data` — zero network. Auto-traversal (open-everything-on-open) should not exist even as an option in reference clients; beyond cost, it's the metadata firehose (below) and the bandwidth-bomb vector (§8).
- **Peek before open.** There's a natural read-only primitive hiding in the pocket: fetch a keyed spool's deposits over one HTTP GET, decrypt, materialize in memory, render a preview — *no socket, no presence, no deposit, no persistence*. "What's behind this door" for one roundtrip. And it composes with the lore thesis perfectly: pocket reads are touch-on-read, so **peeking keeps the pocket warm — browsing the shelf literally keeps the constellation alive.** (SDK sugar candidate at the gate: `peekSpool(link)`. It's assembled from shipped parts — pocket fetch + apply into a throwaway doc — so a vessel can prototype it as a convention first, which is exactly the promotion path.)
- **The porch light, not the switchboard.** Live presence across a whole constellation (open every child to see who's around) is the connection budget's worst case. The convention-shaped alternative: people present *at the hub* carry a tiny app-defined awareness payload — "lights on in: mixtape, campfire" — so the shelf shows warmth without opening a single child room. Ephemeral by construction (awareness dies ~30 s after the tab), zero doc writes, zero ghost presence. One room's cost buys the whole house's porch light.

## 7. Metadata honesty — the relay watches constellations form

The honesty clause (SPEC §4) already grants that a relay observes IPs, room codes, frame sizes and timing. Collections sharpen that: open a shelf and then three children *on the same relay* within seconds, repeatedly, and the relay can infer co-membership — the graph's *shape* precipitates out of timing correlation, content sealed the whole time. Pocket GETs correlate the same way. There's no pretending otherwise, so the riff prices three honest postures:

1. **Say it.** Extend the honesty clause by one sentence when collections become a documented convention: *a relay can watch which rooms travel together.* Cheapest, and the floor regardless.
2. **Scatter.** Links carry their own relays; nothing says a family of spools shares one. A shelf on relay A whose children live on B, C, D fragments the observer — no single vantage sees the constellation. Zero protocol cost (the grammar always allowed it), real UX cost (more relays to trust for uptime, more pockets to feed), and it composes with self-hosting: *your* relay for *your* hubs, the canonical one for leaves.
3. **Drift.** Lazy traversal already helps (humans open things minutes apart; auto-traversal is what makes timing attacks trivial — one more reason it shouldn't exist). Deliberate jitter beyond that is theater at intimate scale; skip it.

The lane's answer is 1 always, 2 available, 3 no. Worth saying explicitly: mixnet-grade unlinkability is *out of lane* — a fork of purpose can chase it (below); Spool's promise stays "no server ever sees content," never "no server sees shape."

## 8. Threat-model deltas (what collections change, honestly)

| delta | what it is | the honest answer |
|---|---|---|
| **Blast radius** | one leaked device/collection leaks a transitive world | §1's grades as visible ceremony; intimate hubs (small, re-keyable); sealed references for anything that would hurt; the §7 honesty sentence |
| **Graph inference** | relays correlate co-opened rooms (§7) | say it; scatter if it matters |
| **Aggregated griefing** | a collection holder can join every referenced room, spam undecryptable frames, burn pocket rate limits across the family | nothing new per-spool (any link holder could always do each of these); collections only bundle the capability. Same social contract, bigger surface — a UI sentence, not a mechanism |
| **Bandwidth bombs** | a malicious collection references 500 spools with 8 MiB pockets; an auto-traversing client eats it | lazy-by-default is the fix and the norm; peek is bounded (per-spool caps already exist); traversal beyond one hop is always a human gesture |
| **Lying petnames** | the body says "photos from the lake", the link opens something else | trust, not proof — unchanged from v1's whole contract; the person who wound the lie is *in the room with you*. Clients can show the target's code/fingerprint beside the petname, which is all the truth that exists |
| **Rotation lag** | a rotated-away key keeps working for holders of stale links until every collection heals | rotation was already best-effort social revocation; collections *narrow* the lag (healing propagates by sync instead of by remembering to text everyone) but can't close it. Say so |

Nothing in the table needs a mechanism the system doesn't have. Every row resolves to ceremony, honesty sentences, or defaults — which is the M11 pattern repeating, and mildly reassuring about the whole direction.

## 9. Mesh and routing — the far end, priced anyway

The prompt asked for mesh and routing, so here's the honest shape of both under Spool physics:

**There is nothing to route.** Routing exists to *find* content; here, location travels inside the capability (`relay=` in the link) and the finding already happened — a person handed it to you. The DHT-shaped hole other P2P systems fill with infrastructure, Spool fills with people. When content needs to reach someone three hops away, the mechanism is a human winding a retelling into a spool the next person holds. **The routers are people; the packets are retellings; the routing table is which spools you share with whom.** That's not a poetic evasion — it's a real store-and-forward network with human-latency links (fidonet with feelings), and it's the *only* router this project should ever bless, because every alternative is a machine deciding where private things flow.

That said, three infrastructure-adjacent what-ifs survive contact with the philosophy:

- **Multi-relay redundancy without federation.** §5's "zero relay-to-relay coordination" stands untouched — but nothing stops a *spool* from naming fallback rendezvous inside itself (a reserved-kind entry listing alternate relay URLs, the room's `room:*` pattern shape) and nothing stops a client from connecting to two relays for one spool. Two clients connected to different relays never meet; but any single client connected to *both* is a bridge — peers-are-each-other's-server does the rest, no relay ever learning the other exists. Relay dies → clients converge on the fallback by the healing loop (§3). Emergent bridging, zero new relay behavior, zero spec change to the relay. (The one wrinkle: a *cold* joiner only knows the link's relay — in-doc fallbacks help the already-arrived. The full answer is the healing loop upstream: the collection that pointed at the spool re-points it.)
- **Keeper constellations.** `spools-keeper` already holds one link, forever, on hardware you control. A keeper handed a *collection* link could traverse (depth-limited, per-link consent — never silently transitive, per everything above) and keep the whole reachable world: deposits fed, pockets warm, an always-on peer for every room in the family. That's a pinning service in shape — but capability-scoped and friend-run: **the mesh is your friends' always-on machines, not strangers' DHT nodes.** A cousin runs the constellation-keeper the way a cousin keeps the shoebox of photos; the lorekeeper role, scaled to the whole mythology. Pure client work; a weekend fork of the keeper; genuinely wanted the day any real constellation exists.
- **What stays refused, by name.** Relay federation (relays gossiping frames or deposits); any relay-side awareness of links, graphs, or "related rooms"; a well-known directory spool of relays or of anything (a directory is a feed wearing a trenchcoat); crawlers, even consensual ones. Every one of these either makes the relay smart, makes strangers findable, or makes the graph public — three different walls of the lane.

And past the lane's edge, marked as **fork-of-purpose territory** (own repo, own name, learnings queue at the gate at stranger's rank, per ECOSYSTEM.md): onion-routed or mixnet transport for shape-hiding (§7's ceiling); gossip meshes where keepers replicate spools for strangers (a different trust universe); and agent swarms using spool graphs as shared working memory — familiar's chartered lane one storey up, where a mission is a spool of task-spools, each subagent winds `finding`s into its own leaf, and the human steers the whole tree from the hub. That last one is the same convention as the us-spool wearing overalls, which is either a sign the convention is deep or a warning it's a hammer looking for thumbs; the fork gets to find out. *(That storey now has its own riff, written here and migrated to the fork at its birth: [forks/familiar-riff.md](forks/familiar-riff.md) is the pointer.)*

## 10. What this asks of the loom (fit, sorted)

| rung | what | when |
|---|---|---|
| **already true** | the `kind:'spool'` + `data.link` + petname convention; sealed references via the existing grammar; splice-by-hand via the escape hatch; seasons/shelf/us-spool as app behavior | today, in any vessel, zero changes anywhere |
| **docs only (this repo, cheap)** | this riff; a paragraph in ECOSYSTEM.md's conventions list *if and when* a vessel ships the convention (stated as prose to copy, never a helper to import — the copying-keeps-it-honest rule) | when a vessel does it |
| **SDK sugar (parked-with-evidence gate)** | `windLink()` / `openSpool(entry)` niceties; `peekSpool(link)`; a traversal helper with the visited set built in | second independent client wants it |
| **`splice()` surface (gate + sign-off)** | the verb, designed from lore's reunion evidence + this spike's physics; branch-from-a-moment needs its own spike first | lore demands it in anger |
| **link grammar, additive (sign-off someday)** | the one place genuine protocol pressure could appear: a deep link *into* a spool (`…&entry=<id>`) — cross-spool addressing, the stripped fourth thing knocking on the front door. SPEC §1 already MUST-ignores unknown fragment params, so old clients would degrade to opening the spool — additive by construction, still a spec sentence, still gated | a real client needs to point at an entry, not a spool |
| **vessel territory** | a shelf client; lore's campfire-and-tales web (already chartered) | per the ecosystem build order |
| **fork of purpose** | constellation-keeper-for-strangers, mixnet transport, agent swarm memory | own repos, own names, gate at stranger's rank |

Read the table's spine: **the entire concept through "networks" costs zero spec sentences and zero SDK lines** — it's the M11 thesis holding a third time, at a scale (between-spools) the thesis was never aimed at. The two genuinely protocol-flavored items (deep links; anything splice bakes into the doc shape) are additive-by-construction *and* gated. Subdocuments and addressing were stripped from fosho deliberately; it's worth saying plainly that links-in-entries is **not** subdocs returning — no lifecycle coupling, no shared transaction boundary, separate keys, separate sync boundaries, separate pockets; one spool = one doc = one link stays inviolate. What returns is the *want* those features served, re-expressed as content — which is where this project has always put wants that other stacks put in protocol.

## 11. Open questions parked here (with what would decide each)

- **Does the reference client ship the convention, or does a vessel prove it first?** Lean: vessel-first (the shelf is one person's two devices — the cheapest real test in the whole portfolio), loom docs after. Decider: whoever builds first.
- **Sealed-reference UX** — what does "ask ana for the key" look like as a gesture? (Show the code + fingerprint, offer a prewritten ask-message?) Decider: the first client that winds one.
- **Peek's exact contract** — memory-only? does it stamp the stash? does it *deposit-if-ahead* (no — reads must never write; but say it out loud)? Decider: prototype in a vessel, then the gate.
- **The porch-light payload shape** — which children may be named in hub awareness, and who consents to being a lit window? Decider: the first constellation client; it's the room's presence conversation one level up.
- **Seasons at the client** — stitch scrollback across the seam or show the seam proudly? Lean: show the seam (volumes are human; seamlessness is a feed habit). Decider: the room, whenever a real room nears the number.
- **Branch-from-a-moment** — does `createDocFromSnapshot` off a rewind moment keep reunion-grade lineage? Decider: a spike, before anyone repeats the phrase.
- **Does the us-spool eat the stash registry?** (If the shelf is a spool, is localStorage just a bootstrap cache?) Decider: the shelf experiment; touch nothing until it runs.

---

*The riff's one-sentence residue, if only one survives: a link is a string, a body is a string, and therefore spools have contained spools since the day links existed — the protocol already holds its own reflection, and every deliberate thing left to do is ceremony, honesty, and restraint about which doors get keys wound into them.*
