# lore — the vessel brief

*Riff → brief, from the M13 brainstorm (second session, Aug 2026). The founding phrase is the owner's: spools as "pieces of lore, vehicles for lore, storage for lore — easily lost and never found again, or cherished and held on to with lots of intent." This document lives in the loom until the vessel repo is born, then migrates with it. Everything below runs on SPEC v1.1 as-is; nothing here asks the protocol for anything.*

## 1. The claim

Every close group has a mythology. The story of the nickname. The night that became a legend. The saying nobody outside the group would understand. The way grandma actually told it, which is not how your cousin tells it. This is **lore** — the stories a group actually keeps — and today it lives in scrollback, where it dies. Group chats generate lore constantly and preserve none of it; platforms archive everything and cherish nothing. A wiki is where lore goes to become paperwork.

**lore** is a vessel for the stories a group means to keep: told in variants, annotated by the people who were there, traded hand to hand as links, and — this is the part no other software will say out loud — *capable of being lost*. That is not a bug to engineer away. Folklore has always had exactly two fates: cherished and retold, or gone. lore is the first app whose infrastructure agrees.

## 2. Why Spool is weirdly, precisely right for this

These aren't marketing parallels; each one maps to a shipped mechanism.

- **Lore survives by being retold — mechanically.** The relay's pocket refreshes its TTL when a spool is read (touch-on-read), and clients re-deposit when the newest sealed copy is aging (refresh-if-stale). The repo's own sentence — *"a spool that keeps being opened keeps being covered"* — is a folklore engine: **attention literally keeps the lore alive**, and sixty days of nobody caring lets the relay's copy return to dust while the devices that cherish it keep it forever.
- **Transmission is by telling, not by access.** There is no browse, no search, no discovery. The only way to receive lore is that a person hands you the link — which is how lore has moved between humans for the whole history of humans. The protocol's social friction *is* the folklore transmission model.
- **The keeper is the lorekeeper.** Every tradition has one: the elder, the bard, the cousin with the shoebox of photos. `npx spools-keeper <link>` makes it a literal role — whoever runs the always-on peer is, in plain fact, the keeper of the lore. The package name was waiting for this app.
- **rewind is the variant record.** Folklorists call different tellings of one tale *variants*; `rewind` shows how the group's telling grew and mutated, without ever making the past editable. Memory, not moderation: there is no "edit history" bureaucracy, just the spool as it was.
- **Multi-writer merge is collective retelling.** Two people patching the same story at once, offline, on planes — and the merged result is everyone's. The CRDT is doing what a campfire does.
- **Export is the chapbook.** A finished tale as one file, readable in 2040, handed to the next generation with the same gesture as the link.
- **Even forgetting is honest.** `stash.forget()` is the system's one hard delete, owed confirm-twice ceremony — and deliberately letting a story go is also a folklore act. Some lore is released, not lost.

## 3. The shape (app conventions, room-precedent, zero protocol)

**Two spool roles, one protocol.** A **campfire** is a group's living corpus — many tales, ongoing. A **traded tale** is a single story broken off to hand to someone outside the circle. Both are ordinary spools; the difference is convention and ceremony, not schema.

**Kinds** (the vessel's own vocabulary — app-level, never protocol vocabulary; the loom's §2 metaphor budget is untouched):

| kind | what it is |
|---|---|
| `tale` | A story. The body is the telling. |
| `telling` | A variant or retelling — `parent` = the tale. Threading does variants; this uses `parent` harder than chat ever did. |
| `gloss` | Annotation by someone who was there — context, correction, dispute. `parent` = tale or telling. |
| `saying` | Freestanding lore: the phrase, the toast, the rule of the house. |
| `relic` | A pointer to an artifact — URL + content hash in `data`, never bytes in the doc (the §6 asset rule, obeyed from birth). |
| `lore:*` | Reserved kinds for shared settings (corpus title, epigraph), newest-wins at render — the `room:*` pattern verbatim. |

**Seats and tellers.** The room's seat/profile conventions carry over unchanged — a seat is a device, tellers are named in a profile table, anyone can name anyone, retroactively. Attribution is testimony, not cryptography; that is intimate scale, stated in the UI.

**Canon is social, not enforced.** There are no permissions, so "canon" cannot be a lock — it's a `gloss` anyone can wind, and the argument about what's canon is *itself lore*, threaded under the tale where it belongs. The room's honest write contract travels: the app never pantomimes an authority the protocol can't deliver.

**Trading without `splice` — v1 is retelling.** Breaking a tale off a campfire needs no new verb: the app starts a fresh spool and winds a `telling` of the tale into it, with a `gloss` crediting where it came from. Provenance as lore, not as cryptography — which is exactly how oral tradition does provenance ("as my mother told it"). A traded tale is a *retelling, not a transfer*, and that's the honest physics of the medium anyway. **The reunion case — a retold tale's spool wanting to rejoin the campfire it came from — is the first real-world demand the reserved verb `splice` has ever had.** It arrives through the parked-with-evidence gate like everything else: noted here as evidence, promised nowhere.

## 4. The register (notes for the vessel repo, which owns its design)

Campfire, not database. Codex, not wiki. A tale reads like a told story — one column, generous type, the variants folded beneath it like sediment. The rewind scrubber presents as *earlier tellings*, not "version history." Loss language is warm and unblinking; the app's honesty sentence, shipped in the UI like the room ships its:

> *"nobody keeps this but you and the people you hand it to. lore lives by being retold — hold it with intent, or let it go."*

## 5. What it must refuse

Everything the white paper refuses, plus the vessel's own line: **no wiki-ness**. No accounts, no public lore, no search across spools, no categories imposed from outside, no edit-war machinery, no "contributors" — a lore corpus has *people who were there*. Not Fandom, not Notion, not a knowledge base: lore is told, not filed.

## 6. What it proves for the constellation

- `parent` threading used in anger (variants + glosses — deeper trees than chat's one-level replies).
- Mixed-kind rendering as the *point* of a view, not an edge case.
- The trade/export ceremony as a first-class UX gesture (the keepsake economy, live).
- The keeper as a named human role, not just a daemon.
- First genuine `splice` evidence, delivered through the gate.
- And the emotional thesis itself: that software can treat loss as a form of meaning — which, if it lands, is the sharpest proof of §1 any vessel could offer. It also quietly generalizes the portfolio: a baby book is a child's lore; a memorial is lore held after someone; an interview across weeks is lore in the making. Those stay worthy sibling vessels — different tones deserve their own doors — but lore is the genus.

## 6.5 The vocal turn (owner-directed, Aug 2026 — second redirect)

The owner's follow-up riff, recorded before it cooled: folklore is an **oral** tradition — lore v1 leads with sound. Not a text corpus with attachments: **a shared four-track tape**. Takes are wound onto a reel as pointers (the §6 asset rule, obeyed from birth: hash + optional URL in `data`, never bytes); punches in and out are stamped as told-time history; text rides the tape as sayings and glosses; the whole reel bakes down to a fixed track — and a bake is wound back as a `telling`, which is what a bake *is*. Two timelines, both already in the machine: the tape (where sound sits) and the telling (when it was told), with `rewind` underneath making the reel's past *playable*. Everything in §§1–6 stands — same claim, same refusals (plus the tape's own: no DAW-ness, no time-stretch), same register, spoken aloud.

The full design lives with the vessel: [apps/lore/DESIGN.md](../../apps/lore/DESIGN.md) (prototyped in the loom by owner direction, room-precedent; graduates to its own repo when T-130 ships — the gate holds, recorded there in §10). Build record: M14, tickets T-150…T-160.

## 7. Open riff threads (parked here, decided in the vessel repo)

- The app's name: working name **lore**; deploy pattern says `lore.spools.lol`. Sentence test, current champion: *"Wind a tale onto the spool. Hand someone the lore."*
- Campfire-vs-tale ceremony details: what "break off a tale" feels like; whether a traded tale carries a `relic` pointing home (a link *is* a capability — pointing home shares the campfire; sometimes that's the gift, sometimes it must not be — the ceremony has to ask).
- Whether `telling` variants ever get side-by-side view (two tellings of one tale on one screen — the folklorist's dream, cheap with two renders of the same entries).
- Seasonal lore: does a campfire end (export the year's chapbook, start the winter spool), or run forever into the growth budget? Lean: seasons — it's the keepsake-lifespan framing with a fireside name.
