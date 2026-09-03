# room — torture checklist (T-126)

Ground rules inherited from T-021: **distinct origins** (same-origin tabs
cheat via BroadcastChannel + shared IndexedDB), **kill the relay process**
(DevTools offline lies), **WebRTC off** for offline scenarios (a surviving
RTC mesh keeps syncing after the relay dies).

## Automated set

Run from the repo root after `pnpm build` in `apps/room`. All commands are
zero-dep Node + headless Chrome (`CHROME_BIN` overrides the binary).

| suite | command | covers |
|---|---|---|
| smoke (19 scenarios) | `mise x -- node scratch/spike-room/room-smoke.mjs` | convergence, composer focus, kinds, mobile layout, retroactive renames + concurrent-rename race + "renamed by" resolving to a person (T-172: the renamer's seat rides `data.by`; old entries fall back to the author), reactions (toggle/normalize/dedupe), replies + orphan stubs, presence + typing + zero-doc-bytes, edit/hide-for-everyone/restore + cross-writer honesty (T-162: the tombstone reads "hidden · anyone can restore"), ephemeral seen markers, arrival (pocket + truly-empty), room name + themes, unread + badge + opt-in, keepsake (T-163: export round-trips through `importSpool` in Node with the key absent; forget removes the database + stash row + `room-seen`, keeps the seat, lands in a fresh room on the same relay), start a new room (T-164: one tap → fresh keyed room on the same relay, link copied verbatim, arrival notice, the old room still opens), the key-travels sentence on the link-copied toast + fine print + link caption (T-165), zero third-party requests on a fresh load — every request is the page origin or the relay, the font comes from `./fonts` (T-166), notifications carry "<name> said something" unless the device opts into the text (T-173) |
| torture (3 rows) | `mise x -- node scratch/torture-room/torture.mjs` | **T1** reaction toggle race (concurrent react + concurrent un-react, two devices), **T2** offline divergence (relay killed mid-chat, both write, relay reborn → union, zero lost), **T3** 5-seat midnight against `DEFAULT_RELAY` with the **deployed client** cold-opening the union from the production pocket |
| scale | `mise x -- node scratch/spike-room/room-scale.mjs` | 5 000 messages: getter cost, windowed DOM, no-yank + pill, clock-skew annotation, show-earlier anchoring |
| ring | `mise x -- node scratch/spike-room/ring.mjs` | pocket ring at stock knobs (K=8): 5 divergent seats whole, the 9-seat bound, the evicted-writer heal, converged safety |
| awareness | `mise x -- node scratch/spike-room/awareness.mjs` | 7-seat presence, **sealing proof** (frame capture + keyless control), ghost timing, typing traffic, the 64-conn wall |

### Results — 15 Aug 2026, two consecutive runs, all green

| suite | run 1 | run 2 |
|---|---|---|
| smoke | 15/15 ✔ | 15/15 ✔ |
| torture | 3/3 ✔ (T3: 15/15 from the production pocket, deployed client) | 3/3 ✔ |
| scale | ✔ (getter 3.7 ms @5k; 150 DOM rows; 14 ms/event; 0 px yank) | ✔ |
| ring | 4/4 ✔ | 4/4 ✔ |
| awareness | ✔ (112/112 frames sealed; ghost 31 s; leave 51 ms) | — (T-111 record) |

## Human rows (owner, real hardware — the part headless can't reach)

| # | scenario | expectation |
|---|---|---|
| H1 | Three **real devices**, ≥2 on different networks, hold a conversation with reactions + inline replies (milestone #1) | everything converges; no device ever looks wrong |
| H2 | Phone: background the app mid-typing (`visibilitychange` flush), then kill it | the draft's message state deposits; presence drops ≤30 s |
| H3 | Phone on **cellular** joins a laptop's link cold (T-115's remaining row) | arrival narrates, content lands |
| H4 | VoiceOver / TalkBack: follow a conversation, react, reply, send (T-125) | batched announcements, labeled controls |
| H5 | iOS Safari + Android Chrome layout audit (T-125 checklist in that ticket) | keyboard, rotation, safe areas, momentum scroll |
| H6 | Phone: settings → keepsake → **export this room**, then **forget this room on this device** (confirm twice, typed code) (T-163) | the download lands as `<code>.spool.json` (iOS Safari may route a blob download through its share sheet or a preview tab — note where it goes); after forget, the room is gone from the device, the seat is kept, the bare URL opens a fresh room, and the old link reopens from the others / the pocket |

Record outcomes in T-126's Notes when run.
