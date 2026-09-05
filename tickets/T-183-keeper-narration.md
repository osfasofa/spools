---
id: T-183
title: "spools-keeper narration: timestamps, the pocket's verdict, a heartbeat"
status: done
milestone: M17
depends: [T-182]
---

## Goal

The keeper's log answers, from the log alone, the three questions T-182's
first real run could not: *when* did that happen, *what did the pocket do*
on open, and *is it still alive*. Still counts-only — never content, never
a key, never a link, never a line of the list. Then one more night on the
wall, read with the new log, and a verdict on the fifty reconnects.

## Context

T-182 ran the keeper for eleven hours holding two spools. Zero entries were
lost. But the log could not say:

- **When.** The keeper's lines carry no timestamps. Fifty socket drops were
  counted (21 on one spool, 29 on the other) and their cadence could only
  be guessed at — "roughly every 13–20 minutes" — from file mtimes and the
  line count.
- **What the pocket did.** The keyed spool's first minted entry vanished
  before the keeper existed. The SDK knows whether the pocket was `applied`,
  `empty`, or `unavailable` on open; the keeper never asks. A Spool emits
  five events — `entry`, `status`, `undecryptable`, `pocket`, `full`
  (`packages/spools/src/spool.ts:180-206`) — and the keeper subscribes to
  three. `pocket` and `full` are the gap.
- **Is it alive.** Between events the log is silent. Eleven hours with no
  entries would look identical to a hung process.

What the source says, so the ticket doesn't guess:

- `SpoolStatus` is `'offline' | 'connecting' | 'connected'`
  (`engine.ts:10`); `status` fires only on change. Reconnection is
  y-websocket's own backoff; the SDK narrows it and adds the room-full
  stand-back (`engine.ts:109-118`). The resync re-ask is 20 s
  (`engine.ts:110`), not tunable from `openSpool`.
- `PocketState = { phase, applied?, dropped?, depositError? }` with `phase`
  one of `checking | applied | empty | unavailable` and `depositError` one
  of `too-big | budget | rate-limited` (`pocket.ts:34-51`). `spool.pocket`
  is `null` for keyless spools. `on('pocket')` hands the listener the whole
  state and does **not** replay on subscribe — read `spool.pocket` once,
  then subscribe. `leave()` returns `void`; a refused final deposit is only
  visible on the `pocket` event (`spool.ts:256-270`, T-178).
- The relay pings every 30 s and terminates on a missed pong; it never
  closes an idle-but-answering socket (`server.js:40,152-172`). No proxy
  idle timeout is documented anywhere in the repo. The canonical relay is
  on Railway (T-161).
- **The observed cadence matches none of the known timers.** Relay ping
  30 s, SDK resync 20 s, documented proxy timeout none — nothing here is
  13–20 minutes. And the two spools dropped on their own schedules, so it
  isn't the network. That is the question decision 5 exists to close.

## Decisions (trade-offs first, then a lean)

**1. Timestamp format.** ISO 8601 UTC (`new Date().toISOString()`), one
shared `stamp()` that every line goes through — including the four
list-level `console.log`s (`keeper.js:167,172,179,183`) that bypass `log`
today. *Alternative:* local time — reads better at 3 a.m., but logs get
pasted into tickets and read across zones, and Node has no boring
local-with-offset formatter. *Lean:* UTC; whoever tails it does the math.
Shape: `2026-09-04T22:05:26.123Z [keeper jade-echo-236] 3 entries held`.

**2. The pocket's verdict.** After open, read `spool.pocket`; if its phase
is already past `checking`, log it; otherwise subscribe and log the first
transition out of `checking`. Line shapes, the SDK's own words:
`pocket: applied (2 deposits)` · `pocket: empty` · `pocket: empty, 1 dropped`
· `pocket: unavailable`. Keep the subscription live through `close()` so a
refused final deposit is narrated after `leave()` resolves:
`pocket: deposit refused (rate-limited)` — the T-178 case, finally visible
from the keeper's side. Keyless spools get no pocket line; the open line
already says `(keyless)`. *Costs:* one subscription. *Bakes in:* nothing.

**3. Reconnects, counted and timed.** Per spool: count transitions to
`connecting` after the first `connected`; remember when the socket went
down; on `connected` after a drop log
`relay: connected — reconnect #7 after 3.2 s offline`. *Alternative:* a
single global counter — rejected; T-182 showed the drops are per-socket
(21 vs 29), so the count has to be too. The `full` event gets a line as
well (`room full: <reason>`; the reason is the relay's close string, not
content).

**4. The heartbeat.** One wall-level line every 10 minutes:
`[keeper] up 11h07m · jade-echo-236 3 held, 21 reconnects · hidden-echo-280 31 held, 29 reconnects`.
*Alternative:* a line per spool per interval — clearer per spool, but a
wall of ten spools writes 1,440 lines a day for nothing. *Alternative:* a
`--heartbeat <minutes>` flag — surface for a knob nobody has asked for.
*Lean:* fixed 10 min, one line, no flag, `unref()`'d so it never keeps a
dying process alive; the single-link form gets the same line with one
spool. The flag is the first thing to add if a real wall finds 10 min
wrong. Test-only override `KEEPER_HEARTBEAT_MS` (env, undocumented) so the
test doesn't wait ten minutes.

**5. Reading the night — the actual point.** With timestamps in hand, one
more ~12 h run on the owner's wall. Compute the inter-drop intervals per
spool from the log; compare to the 30 s ping, the 20 s resync, and whatever
Railway's edge does to long-lived websockets; write the verdict in Notes.
Zero entries were lost in T-182, so this is curiosity — but a keeper that
reconnects fifty times a night should be able to say why, and if the answer
is relay-side it becomes evidence for a relay ticket, not a fix here.

## Tasks

- [x] `stamp()` helper in `keeper.js`; every `console.log` goes through it,
      the list-level sites included (decision 1).
- [x] Pocket verdict on open; deposit refusal narrated after `leave()`
      (decision 2).
- [x] Per-spool reconnect counter and offline duration on the `status`
      line; `full` subscription (decision 3).
- [x] Wall-level heartbeat, 10 min, `unref()`'d, `KEEPER_HEARTBEAT_MS`
      override for tests (decision 4).
- [x] Tests, extending `test/keeper.test.js`: every stdout line matches
      `^\d{4}-\d\d-\d\dT\S+Z \[keeper`; a keyed spool on the local relay logs
      `pocket: empty` on open; stopping and restarting the local relay yields
      `reconnect #1 after … offline` on each spool; a heartbeat line appears
      with `KEEPER_HEARTBEAT_MS=500`. The two existing scenarios stay green.
- [x] README "What it logs": timestamps, the pocket's verdict, reconnect
      counts, the heartbeat — and the standing rule, unchanged: never
      content, never the key, never the full link, never a line of the list.
- [x] `CHANGELOG.md`: fold into the **unreleased 0.2.0** entry. No bump.
- [x] **Owner at keyboard:** stop the running wall
      (`pkill -TERM -f "keeper.js --links"` — shutdown saves and leaves),
      restart on the new build under `caffeinate -i`, read the next ~12 h.
      Record in Notes: the per-spool inter-drop intervals (min / median /
      max), what the pocket said on open for the keyed spool, whether the
      heartbeat ever missed, and the verdict on the cadence.

## Acceptance criteria

- Every log line carries an ISO UTC timestamp.
- A keyed spool's open logs the pocket's phase within the SDK's settle
  window; a keyless spool's does not.
- A reconnect logs its per-spool ordinal and the seconds offline.
- A heartbeat line appears at least every 10 minutes while running, and
  never after shutdown begins.
- Nothing new in the log is content, a key, a link, or a line of the list
  (tested: `doesNotMatch /spool=/`, and the garbage line's text).
- The second night's cadence and a verdict are in Notes. Until they are,
  this ticket is not done.

## Out of scope (say it so nobody drifts)

- Any change to the SDK, the relay, or SPEC. If the cadence turns out to
  be relay-side or proxy-side, that is evidence — file it against the relay,
  don't widen here.
- A `--heartbeat` flag, per-spool heartbeat lines, log levels, log files,
  rotation. stdout, as before; the OS owns the rest.
- The wall (move B, `../brand/riffs/pegboard.md` §3).

## Notes / open questions

- Built 4 Sep 2026, same afternoon as the draft. `keeper.js` is 262 lines;
  the narration is all inside `keep()` except the heartbeat, which is
  wall-level by design. Three tests green in ~15 s: the two T-182 scenarios
  now also assert every line is stamped and that keyless spools say nothing
  about the pocket; the new one runs a keyed spool on the local relay, sees
  `pocket: empty` on open, kills and restarts the relay, sees
  `reconnect #1 after N.N s offline`, sees the heartbeat count it, and
  checks no heartbeat fires after SIGTERM begins.
- First real line from the canonical relay, on the T-182 wall's keyed spool
  (a second keeper beside the running one, for five seconds):
  `pocket: applied (8 deposits)`. So the pocket *is* holding that spool —
  eight deposits' worth — which makes the vanished first entry from T-182's
  first minute more interesting, not less: the pocket was working; that one
  deposit didn't land. Still T-178's shape.
- **Gotcha, recorded for the owner's restart:** `kill -TERM` aimed at a
  `mise x -- node …` wrapper does not reach node — the wrapper exits 143
  and the keeper keeps running. The start command in T-182 already
  sidesteps this by resolving node's path first
  (`"$(mise x -- which node)" keeper.js …`); `pkill -TERM -f "keeper.js --links"`
  matches the node process itself, so it's fine.
- Also confirmed in passing: outside the repo, `mise x -- node` resolves an
  older Node with no global `WebSocket`, and the keeper dies with
  `WebSocket is not defined`. The `engines >= 22` line is load-bearing;
  run the keeper from a directory where Node 24 is pinned, or with the
  full path.
- **Second night started 2026-09-04T22:39:19Z** (15:39 PDT) by the owner,
  on the new build, same `~/pegboard`, under `caffeinate -i`. Both spools
  restored from their files (3 and 31 entries), both connected within
  ~120 ms, the keyed one's first stamped line from the pocket:
  `pocket: applied (8 deposits)`. The old keeper's SIGTERM save and leave
  went cleanly (the files it left were the ones restored). Read from here.
- **The second night, read 5 Sep 2026 16:20 PDT — verdict: y-websocket's
  `messageReconnectTimeout`, and the keeper was alone.** 24.6 h on the new
  build, both spools restored, 147 heartbeats (one every 10 min, none
  missed), the keyed spool's open line `pocket: applied (8 deposits)`.
  And then this:

  | | keyless `jade-echo-236` | keyed `hidden-echo-280` |
  |---|---|---|
  | reconnects | 2,664 | 2,662 |
  | gap between reconnects | median **33.0 s**, p90 33.1 s, max 35.6 s | median **33.0 s**, p90 33.1 s, max 33.9 s |
  | offline per reconnect | median 2.6 s (0.3–2.9) | median 2.6 s (0.3–2.9) |
  | per hour, every hour | 109 | 109 |
  | first reconnect | 22:53:53Z, 14.5 min after start | 22:53:59Z |
  | entries lost | 0 | 0 |

  A metronome. Not the network (both spools, independently, to the tenth of
  a second), not the relay's ping (30 s interval, terminate on a *missed*
  pong — a silent peer would churn at 60 s, not 33), not a proxy.

  **The experiment (23:18–23:20Z):** a second Node client sat in the keyless
  spool's room for 120 s. That spool: **0 reconnects**. The keyed spool,
  still alone: 4, on the beat. Cause found:
  `y-websocket/src/y-websocket.js:99` — `const messageReconnectTimeout = 30000`,
  a module constant, not an option — closes the socket when no *message* has
  arrived in 30 s (`:444`). A dumb relay never answers a lone peer's
  SyncStep1 (peers are each other's server, DESIGN_DOC §5), and the relay's
  ping frames are control frames the provider never sees. So a keeper alone
  in a room reconnects every 30 s + backoff (`maxBackoffTime` 2 500 ms → the
  2.6 s), forever. 33.0 s exactly.

  **Why the first night showed 50, not 2,600:** the owner had the room open
  in a browser most of that night — a peer answering the 20 s resync keeps
  `wsLastMessageReceived` fresh. The 13–20 min gaps were that tab's screen
  going dark or the phone sleeping. And the 14.5 quiet minutes at the start
  of night two were the owner's room still open after the restart; the
  storm began the moment it closed. T-182's "fifty reconnects" and T-183's
  five thousand are one mechanism seen with and without company.

  **What it costs:** a TCP+TLS handshake and a fresh room join every 33 s
  per spool, ~2,600 a day per peg, against the canonical relay, for as long
  as nobody else is in the room — which is exactly the keeper's job
  description. Zero entries lost; the export files stayed right. Wasteful
  and noisy, not broken. A wall of ten spools would be 26,000 connections
  a day from one household IP, which is a number the relay's per-address
  caps (T-169) and Railway's edge may eventually have opinions about.

  **Options, for the owner (SDK-shaping, not protocol; sign-off wanted):**
  1. *Feed the provider.* The SDK bumps `provider.wsLastMessageReceived`
     on its own resync tick (the field is public). Neuters y-websocket's
     client-side dead-socket detection — but our relay already terminates a
     peer that misses a pong (server.js `keepAlive`, 30–60 s), and the
     client sees that close and reconnects, so liveness is still covered
     from the other end. Cheapest; a few lines in `engine.ts`; every client
     benefits, not just the keeper. Bakes in: trusting the relay's ping for
     liveness. A half-open socket where the server's terminate never
     arrives would linger until the client's next write errors.
  2. *The relay answers.* Any application message from the relay would do,
     but the relay is opaque bytes by design and a keyed client would count
     an unencrypted frame as `undecryptable`. Rejected on the spot: it
     un-dumbs the relay.
  3. *Fork the constant.* Patch or vendor y-websocket to make the timeout an
     option. A dependency fork for one constant; no.
  4. *Accept and document.* "A keeper alone reconnects every 33 s." Honest,
     free, and the relay pays for it.
  Lean: option 1, as its own ticket, with a test that a lone peer on the
  workspace relay holds one socket for > 60 s.
- **Unrelated but seen in the same log:** the keeper's SIGTERM at the
  night-one handover saved and left cleanly; the night-two export files
  never changed size (no writes all day), which is also correct.
- Drafted 4 Sep 2026 from T-182's follow-ons #1 and #2, with the SDK and
  relay facts above verified in source the same afternoon. The keeper from
  T-182's run was still up (PID 2668, eleven hours and counting) when this
  was written; it stays up until the owner restarts it on the new build.
- The 13–20 minute cadence not matching any known timer is the most
  interesting fact in this ticket. Candidates nobody has checked: Railway's
  edge proxy (undocumented in this repo), the laptop's Wi-Fi power
  management (would hit both sockets together — but they dropped
  independently), y-websocket's own behaviour on a missed relay ping.
