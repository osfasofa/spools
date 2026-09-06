# off-grid kit — the vessel brief

*Riff → brief, from the M13 brainstorm (fourth session, Aug 2026). Build-order slot #2. Working name **off-grid kit**; the vessel repo owns its final name (candidates riffed in §7). Everything below runs on SPEC v1.1 and the shipped packages as-is — this vessel is mostly packaging and prose, which is exactly its point.*

## 1. The claim

Almost nothing in collaborative software works where there is no internet. Not the docs app, not the chat app, not the "offline-first" app that still needs a login server before it will draw a screen. And yet the places without internet — the classroom with no budget, the field station, the cabin, the shelter after the storm, the boat — are full of small groups who need exactly one thing: a shared living document among the people in this room.

Spool already works there, **by accident of discipline**. The relay is one command on any laptop. The reference client is static files that ship on a USB stick. The link carries its own relay address, so `ws://192.168.1.7:4444/yjs` is as legitimate a home for a spool as any cloud — the spec's own sentence: *the link, not the client, decides where a spool lives.* The off-grid kit is that accident, promoted to a promise: one box that turns any laptop into the place where a disconnected group collaborates.

## 2. Why Spool fits — mechanism by mechanism

- **The relay was built to be carried.** No database, no yjs import, node ≥18, files-on-disk pocket, runs before the coffee's ready. A teacher's aging laptop or a Raspberry Pi on the wall is a complete rendezvous.
- **You can see your relay.** The honesty clause — "a relay sees IPs, room codes, sizes and timing, never content" — becomes physical off-grid: the relay is *the laptop on the desk*, run by someone in the room. Trust-by-proximity is the honesty clause made touchable. And E2E still matters here: the teacher's laptop relays ciphertext, so running the room's infrastructure grants no right to read the rooms — keyed spools keep their secrets even from the host. (Plain `ws://` on a LAN is fine for the same reason: spools carry their own sealing; TLS was never the privacy layer. Keyless spools *are* plaintext on the wire — the kit's README says: use keys.)\* \*Fine for the *wire*. The page is another matter (T-176, Sep 2026): a client served from `http://192.168.x.x` is not a secure context, and browsers withhold `crypto.randomUUID` and `navigator.clipboard` there — before T-176 the first wind threw. The SDK now mints ids from `getRandomValues` when `randomUUID` is missing, and the room and mixtape copy buttons fall back to select-and-`execCommand`; the static reference client never used the clipboard API. `getRandomValues`, IndexedDB, WebRTC, `ws://` and the pocket's `fetch` to an `http://` laptop all work on plain http. The other half of the asterisk cuts the opposite way: an `https://` page (the deployed clients) can *never* open a `ws://` LAN relay — mixed content, blocked silently — so the kit's client **must** be served over http, and the cloud clients are not a way into a LAN room. The two-device row is `apps/client/TESTING.md` scenario 8.
- **The pocket becomes the village archive.** `POCKET_DIR` on the kit laptop holds the sealed deposits for everyone whose device is asleep; touch-on-read and refresh-if-stale work identically at LAN scale. And when the laptop itself is off, nothing is lost — every device is a complete copy; the relay was only ever the meeting point.
- **The third transport is a person walking.** `export()` writes the whole spool to a file; `importSpool` merges it — a real CRDT merge, no clobber path, and it contacts no relay unless asked. So a USB stick isn't just how the client travels; **it's a transport**: two disconnected sites can each keep winding for weeks, walk a file across, and reconcile perfectly. Websocket, WebRTC, sneakernet — the protocol never knew the difference.
- **Offline-first was never a mode.** Local persistence is the ground truth everywhere in the SDK; "the internet is down" is not an error state Spool can even perceive. The kit doesn't enable anything — it removes the assumption that anyone else's computer is involved.

## 3. The shape (packaging, not software)

The kit is deliberately the smallest vessel: a repo that produces **one archive** (the stick image) plus **one README that treats no-internet as the first-class scenario** instead of the degraded one.

- **On the stick:** the static reference client (no build step — the discipline pays off here), a copy of the kit README, and a tiny run script.
- **On the laptop:** node (installed once, at home, before you leave — stated plainly as the one prerequisite), then `npx spools-relay` with `POCKET_DIR` set, and one static file server for the client. The run script does both; the README explains both, because scripts die and prose doesn't.
- **The link ceremony on a LAN:** links must carry the LAN relay address (`relay=ws://<laptop>:<port>/yjs`) — the kit's client defaults its links to the host that served it (the reference client does not: its "new spool" pins the cloud default, which is why TESTING.md scenario 8 mints the link by hand — the kit's one real client change), and the README teaches the QR gesture: one screen shows the link, the next phone scans it. Handing the link stays social; a QR code is just the link's LAN-native handshake. **No discovery, even here** — mDNS browsing, network scanning, "rooms near you" are all refused. The room is found the way rooms have always been found off-grid: someone tells you.
- **Address honesty:** DHCP moves; links rot when the laptop's address changes. The README owns this instead of engineering around it — pin a static IP or use the hostname, and when the address changes, re-hand the links. (A relay URL is a *place*; off-grid places move. Say it, don't hide it.)
- **Clocks drift where NTP can't reach.** The room's contract carries: annotate skew, never repair it.

## 4. The register

A tool register, not a lifestyle brand: closer to a field manual than an app. The README is the product as much as the archive is — calm, numbered, tested prose that a stressed person can follow in a shelter, printed as well as it reads on screen. No survivalist cosplay, no crypto-prepper voice; the tone is a good camping checklist.

## 5. What it must refuse

Everything the white paper refuses, plus its own lines: **no discovery on the LAN** (no scanning, no broadcast, no "join nearby"), **no bundled cloud fallback** (the kit never phones home when the internet reappears; spools sync onward only if their links say so), and **no pretending the laptop is a server product** — it's a lantern someone lit for the evening, not infrastructure. If the kit ever grows accounts, dashboards, or a fleet manager, it has died and become an MDM.

## 6. What it proves for the constellation

- The most differentiated true sentence available: *this works with no internet at all* — now demonstrated, documented, and handed to people who need it rather than left as an accident.
- That the "no build step / USB stick" discipline (decided at §1-time, long before this vessel) was load-bearing, not nostalgia.
- Sneakernet as a working transport — export/import reconciliation between disconnected sites, exercised in anger.
- The relay's coffee-time promise on minimal hardware, and the honesty clause in its most legible form: the operator is in the room.

## 7. Open riff threads (parked here, decided in the vessel repo)

- The name. Working name **off-grid kit**; candidates riffed: **lantern** (the light you bring where there's no power; people gather to it — and it sits beautifully beside lore's campfire), **matchbox** (the smallest thing that starts a fire), **waystation**. Owner picks; the sentence test applies.
- Whether the kit bundles a portable node runtime or keeps "install node at home first" as the honest prerequisite (lean: honest prerequisite — bundling runtimes is a maintenance tax the kit's whole ethos refuses).
- Whether the relay should serve the static client itself and delete the second command (costs the relay's "aggressively boring" purity — probably the kit serves, the relay relays; revisit only if the two-command reality measurably loses people).
- A printed one-pager in the archive: the whole setup on one sheet, because the place with no internet is also the place with no docs site.
