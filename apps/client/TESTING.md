# Sync torture checklist (T-021)

The local-first promises under test (DESIGN_DOC §1): copies sync live when
people are online together, reconcile automatically on reconnect, and persist
locally forever. Run this before every release; every scenario must pass
against the current code.

## Ground rules (or the test lies to you)

- **Two tabs on the same origin cheat.** They share BroadcastChannel and
  IndexedDB, so they "converge" even with the network unplugged. Always put
  the second device on a different origin (second port, second browser
  profile, or another machine): `python3 -m http.server 8765` and `…8766` in
  `apps/client/` gives you two honest devices on one laptop.
- **DevTools "offline" does not sever established WebSockets.** To take the
  network away for real, kill the relay process. Scenarios 1–5 run against a
  local relay you control: `PORT=9401 HOST=127.0.0.1 node packages/spools-relay/server.js`
  (the real spools-relay since T-040). Craft the link by hand:
  `http://localhost:8765/#spool=<code>&relay=ws%3A%2F%2Flocalhost%3A9401%2Fyjs`
  (any `adjective-noun-NNN` code works; the `/yjs` suffix matters — it's the
  one-URL convention that also derives signaling).
- **WebRTC must be OFF for the offline scenarios (1–5).** Because the one-URL
  convention gives even a local relay working signaling, two devices form a
  WebRTC mesh — and an established mesh keeps syncing straight through a
  relay kill, faking a pass. The harness deletes `RTCPeerConnection` before
  page load for those scenarios; manually, run a browser/profile with WebRTC
  disabled. Scenario 6 is where that redundancy is the thing being proven.
- Winding/editing beyond what the UI offers uses the console escape hatch:
  the page exposes `window.spool`.

## Automated run

`node scratch/torture-t021/torture.mjs` executes this entire checklist
headlessly (three origins, killable relay child, CDP) and prints a ✔/✘ table.
The manual steps below are the same scenarios for human hands.

`node scratch/torture-t051/torture.mjs` is the **encrypted** variant (T-051):
the same checklist with `k=` in every link, plus S7 — rtc-only sync with the
websocket path dead from birth. Rebuild the vendor bundle first if the SDK
changed. Run both when touching sync or crypto.

`node scratch/torture-t104/midnight.mjs` is the **pocket** variant (M10):
scenario 7 below, automated — midnight cold-open from deposits alone, the
old-relay 200-trap in vivo, and the quiet empty-pocket path. Run it when
touching the pocket on either side.

## Scenarios

### 1. Refresh — entries come from IndexedDB, not the network

1. Open a spool on the local relay, wind 5 entries.
2. Kill the relay (Ctrl-C). Status leaves `connected`.
3. Hard-refresh the tab.
4. **Expect:** all 5 entries render immediately while status is still
   `connecting`/`offline` — the network cannot have supplied them.

### 2. Offline wind → reconnect converges

1. Relay up; devices A and B on the same spool, converged.
2. Kill the relay. Wind 3 entries on A.
3. **Expect:** A stays responsive, entries render locally.
4. Restart the relay.
5. **Expect:** B converges without any user action, within ~20 s (one resync
   interval — see asterisks).

### 3. Both sides diverge offline — same entry, no lost characters

1. A winds an entry (`the quick brown fox`); wait until B has it.
2. Kill the relay.
3. On A: `spool.entries.at(-1).text.insert(0, 'A> ')` and wind one entry.
   On B: insert ` <B` at the end of the same entry's `text`, wind one entry.
4. Restart the relay.
5. **Expect:** both sides converge to the identical body
   (`A> the quick brown fox <B`) — every character from both edits survives —
   and both offline-wound entries appear everywhere.

### 4. Cold late join — fresh device, peer online

1. A winds 20 entries, stays online.
2. A fresh device (never saw this spool: new profile/origin) opens the link.
3. **Expect:** converges to all 20 within seconds. Through the dumb relay
   this works because *A answers* the newcomer's sync request — see asterisks
   for what changes when nobody is online.

### 5. Nobody home — quiet wait, then a peer arrives

1. Open a link to a spool no one else has open (fresh code), on a fresh device.
2. **Expect:** clean empty state, zero console errors, no reconnect storm.
   Note: status reads `connected` — that means "connected to the relay",
   not "a peer is here" (see asterisks).
3. Later, a peer opens the same link and winds an entry.
4. **Expect:** the waiting device converges (instantly for live winds; within
   one resync interval for state wound before it arrived).

### 6. Relay dies mid-session — WebRTC keeps syncing

1. Two devices on the local relay (WebRTC on — signaling derives from the
   `/yjs` URL), converged, and left alone ~10 s so the WebRTC mesh forms.
2. Kill the relay process — sync **and** signaling die together, the honest
   single-host outage.
3. Wind an entry on A.
4. **Expect:** B receives it — the established WebRTC data channel carries
   sync without the relay; status stays `connected` on the surviving path.

### 7. Midnight mixtape — the pocket carries the gap (M10)

1. Device A opens a **keyed** link on the local relay (the pocket is
   keyed-only — no `k=`, no pocket), winds 3 entries, and leaves: close the
   tab *via* the page (`await window.spool.leave()` from the console, or
   just navigate away after ~15 s so the deposit debounce fires).
2. Confirm the relay holds sealed copies:
   `curl http://127.0.0.1:9401/` → `pocket.deposits ≥ 1`.
3. Device B — **fresh profile/origin that has never seen this spool** —
   opens the link while A is fully gone.
4. **Expect:** "checking the pocket…" for a breath, then all 3 entries
   render within seconds, then "N sealed copies from the pocket" fades out.
   Status still says `connected`-to-an-empty-room; the *entries* are the
   proof the pocket answered.
5. Point the same link's `relay=` at a pre-M10 relay (or any web server):
   **expect** silence — no beat, no errors, plain v1 behavior.
6. When A returns later, live sync proceeds as always — the pocket only
   ever adds.

## Results — 2026-08-15, pocket variant (M10, T-104), automated: 3/3

| # | Scenario | Result | Measured |
|---|---|---|---|
| 7a | Midnight cold-open from deposits alone | ✔ | 3/3 tracks from an empty room; `pocket.phase=applied`; beat present; 0 page errors |
| 7b | Old relay (200-trap in vivo) | ✔ | `phase=unavailable`, beat silent, winding works, 0 page errors |
| 7c | Empty pocket | ✔ | `phase=empty`, beat silent, 0 page errors |

## Results — 2026-08-11, against **spools-relay** (T-040), automated, 2× consecutive, 6/6

| # | Scenario | Result | Measured |
|---|---|---|---|
| 1 | Refresh is IndexedDB | ✔ | 5/5 entries, status `connecting`, relay dead |
| 2 | Offline wind → reconnect | ✔ | B caught up 19 s after relay restart |
| 3 | Diverge offline, merge | ✔ | `A> the quick brown fox <B` on both sides |
| 4 | Cold late join (peer online) | ✔ | 20/20 on first poll (<0.5 s) — the peer answers, not the relay |
| 5 | Nobody home | ✔ | 10 s alone: 0 entries, 0 errors; converged instantly on peer wind |
| 6 | Relay outage → WebRTC | ✔ | relay process SIGKILLed (sync + signaling); entry crossed <0.5 s, status stayed `connected` |

*(The earlier same-day run against fosho's stateful relay also passed 6/6 —
recorded in T-021's Notes; superseded by this run against the dumb relay.)*

## Honest asterisks

- **Reconnect convergence costs up to one resync interval (20 s).** A dumb
  relay can't answer a waiting peer, so peers re-ask each other periodically
  (DESIGN_DOC §5, T-003). Live winds while connected are instant; *catching
  up* after a gap is bounded by the interval.
- **Cold late join needs a peer online — retested and confirmed against the
  dumb relay (T-040).** spools-relay holds no doc, so a newcomer converges
  because a *peer* answers (scenario 4: instant with A online) and waits
  calmly when nobody's home (scenario 5). That's the v1 contract: "syncs when
  we're together" — and since T-041 deployed the dumb relay as the default
  (`relay.spools.lol`; the first links carry `spools-relay-production.up.railway.app`, which stays enabled), it's the live behavior too.
- **`status: 'connected'` means "relay reachable", not "peer present".**
  Scenario 5 shows `connected` with nobody home. Truthful but easy to
  misread; a peer-presence signal (awareness) is unexposed SDK surface today.
- **WebRTC redundancy only covers outages that start after peers met.** The
  default host serves both sync relay and WebRTC signaling, so "relay down"
  also takes down rendezvous: two devices that haven't met can't find each
  other during an outage; devices already connected keep syncing (scenario 6).
- **Same-origin tabs and DevTools offline both produce fake test passes** —
  see ground rules. This is why the automated harness exists.
