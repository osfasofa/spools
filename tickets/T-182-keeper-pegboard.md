---
id: T-182
title: "spools-keeper holds many: the links file (pegboard, move A)"
status: done
milestone: M17
depends: [T-181]
---

## Goal

`npx spools-keeper --links <file>` — one keeper process holding every spool
on a list, one export file per spool, the same member-who-never-sleeps to
each room. Move A of the pegboard riff (`../brand/riffs/pegboard.md`): the
keeper grows a list and nothing else. Zero protocol/relay/spec change; the
wall you look at (move B) is a separate thing and is **not** this ticket.

## Context

The keeper has shipped twice (0.1.0, 0.1.1) and has never been run for
real — seconds inside its own test, a minute in two release preflights,
never a night on a shelf holding a spool anyone cares about. One reason is
shape: one link, one process, one file is right for a proof and wrong for
a life. Nobody cares about one spool; they care about a handful, and not
the same handful forever.

The brand riff already settled the order (`hippo.md` §4, `pegboard.md`
§3–5): behaviour first, face second. This is the behaviour. It is also,
by the riff's reading, the ticket where the keeper gets the animal — a
README sentence, maybe a log line — which is the owner's call and is
marked **sign-off** below.

`keeper.js` today is 118 lines: parse one link → restore-or-open → debounced
export → quiet log → clean `leave()` on signal. Everything below is that
loop, run N times, with the per-spool state that is currently module-level
pulled into a function.

## Decisions to make (trade-offs first, then a lean)

**1. The list's shape.** One link per line, `#` comments and blank lines
ignored. That's it — no petnames, no JSON. Petnames are the wall's
business (move B) and the keeper already names a spool by its code in
every log line. *Costs:* nothing. *Bakes in:* the file is exactly as
sharable as a text file, by hand, which is the point. *Stays flexible:* a
future wall can keep its own petname map keyed by code without the keeper
ever learning the word.

**2. Where the exports go.** Default: `<code>.spool.json` beside the links
file. `--dir <path>` overrides. *Alternative:* keep today's cwd default.
*Lean:* beside the links file — a pegboard and its spools live on one wall,
and `ls` of that directory *is* the inventory. The single-link form keeps
its current default so nothing published breaks.

**3. Picking up changes.** Options, cheapest first:
   - *Restart.* Edit the file, `kill -TERM`, start again. Shutdown already
     saves and `leave()`s (pocket flush included), so it's safe. Zero code.
   - *SIGHUP re-reads.* New links open; links removed get a final save and
     a `leave()`; existing ones are untouched. ~20 lines.
   - *`fs.watch`.* Reacts to the editor's save. Platform-flaky, and reacts
     to half-written files.
   *Lean:* restart for this ticket, SIGHUP as a follow-on if the owner's
   first real run finds restarting annoying. Hanging a spool on the wall is
   an occasional act; it can cost a restart.

**4. One bad peg.** A malformed link, a relay that won't answer, a file
that won't parse: log it under that spool's prefix and keep the rest
running. The process only exits non-zero if *nothing* on the list could be
opened. *Alternative:* fail fast on any bad line. *Lean:* keep the rest
running — a keeper that drops the whole wall because one link rotted is
the opposite of the thing it's for.

**5. The key ring sentence — README, not code.** `pegboard.md` §7: a
machine holding every link you care about is the keeper's honesty sentence
multiplied. The README says, at the new size, what walking out the door
with that machine means, before the flag ships. Needs no sign-off; it's
the existing sentence at scale.

**6. The animal — sign-off.** `hippo.md` §7 asked whether the keeper gets
the hippo formally now or after a season; `pegboard.md` §5 says this is the
ticket where it could. Smallest honest version: one sentence in the README
(*the keeper is the hippo: asleep in the river, surfacing to breathe
without waking, holding the reels*). No emoji in logs, no ASCII art, no
name. Owner decides yes / not yet.

## Tasks

- [x] Refactor `keeper.js`: the parse → restore-or-open → export → narrate
      loop becomes `keep(link, { file })` returning `{ spool, save, close }`;
      module-level state (`timer`, `lastSaveAt`, `saving`) moves inside.
      Behaviour of the single-link form is byte-for-byte unchanged (same
      default file, same log lines).
- [x] `--links <file>`: read, strip comments/blank lines, `keep()` each.
      Mutually exclusive with a positional link (usage error if both).
- [x] `--dir <path>` for the links form; default is the links file's
      directory. `--file` is rejected with the links form (it names one
      file; there are many).
- [x] Per-spool failure isolation (decision 4). One summary line at start:
      `keeping N spools from <file> (M failed)`.
- [x] Shutdown: SIGINT/SIGTERM saves and `leave()`s every spool, in
      parallel, then exits. One spool's shutdown hiccup doesn't skip the
      others.
- [x] Tests (`test/keeper.test.js`, extend the existing harness): two
      keyless spools on one keeper against the real relay; writers wind and
      leave; cold readers converge on both from the keeper alone; kill -9;
      restart from the two files; a third device converges on both. Plus:
      a links file with one garbage line starts, logs the failure, keeps
      the other. Remember the T-107 gotcha — wait for `relay.connections ≥ 1`
      after restart before opening the probe.
- [x] README: the links form, the exports-beside-the-file rule, the
      restart-to-reload rule, and the key ring sentence (decision 5).
- [x] README: the hippo sentence — **sign-off** (decision 6).
- [x] `CHANGELOG.md` + version → `0.2.0` (new CLI surface; publishing is
      its own owner-at-keyboard ticket, T-181 precedent).
- [x] **Owner at keyboard, the actual point:** run it. A links file with
      two or three real spools on a machine that stays on, through at least
      one night. Record in Notes what the logs said in the morning, what
      the export files looked like, and whether anything about the shape
      was wrong. This is the keeper's first real run.

## Acceptance criteria

- `npx spools-keeper '<link>'` behaves exactly as 0.1.1 did.
- `npx spools-keeper --links <file>` holds every spool on the list; a cold
  device converges on any of them from the keeper alone, with no pocket
  involved (keyless spools prove it structurally).
- kill -9 loses at most the debounce window on each spool; restart resumes
  every spool from its file.
- One bad line in the list does not stop the others; the failure is in the
  log under that spool's prefix.
- Logs still carry counts, codes, and fingerprints only — never content,
  never a key, never a full link, and never the links file's contents.
- The owner's overnight run happened and its Notes entry exists. Until it
  does, this ticket is not done, whatever the tests say.

## Out of scope (say it so nobody drifts)

- The wall (move B): any page, port, or stylesheet. Not in this package,
  not in this ticket.
- The list as a spool of spools (`kind: 'spool'` shelf). That is the
  capability-store fork `docs/spools-of-spools.md` prices; it queues at the
  gate with evidence, after the file form has lived a while.
- Petnames, status dots, "last touched." The wall's vocabulary, not the
  keeper's.
- Any change to the SDK, the relay, or SPEC. If one turns out to be needed,
  that's evidence — stop and file it, don't widen here.

## Notes / open questions

- Drafted 4 Sep 2026 from the brand riff, before any code. The refactor is
  the only real risk to the single-link form; the test suite's existing
  midnight scenario is the regression guard.
- Owner signed off on decision 6 the same day: the hippo sentence is in the
  README (one sentence, no name, no emoji, no art). `hippo.md` §7's first
  open thread is answered — the keeper wears the animal.
- Built 4 Sep 2026, same session. `keeper.js` went from 118 to 200 lines;
  the per-spool loop is `keep(link, { file, dir })` and the single-link form
  logs exactly what 0.1.1 logged. Tests: the T-107 scenario unchanged in
  substance (relay moved to a `before` hook), plus the list scenario — two
  keyless spools, a comment, a garbage line, a duplicate, cold readers on
  both, kill -9, restart from both files, third devices converge, SIGTERM
  exits 0 with both files saved. Both green in ~10 s against the real relay.
- **Surprise, the comment rule.** A spool link *starts with `#`*
  (`#spool=…`), so "`#` is a comment" would eat every link. The rule is
  "hash then whitespace or end of line" — `# the wall` is a comment,
  `#spool=…` is a link. Documented in the README and the file header.
- **Surprise, the leak.** The first test run failed its own "logs never
  carry a link" assertion: the SDK's `SpoolLinkError` message echoes up to
  40 characters of the offending text (and 12 of a malformed key). Fine on
  stderr for the single form, where the user typed it — wrong for a list,
  where the log would replay the file. The list form now reports a bad line
  by number only. The acceptance line "never the links file's contents" is
  tested (`doesNotMatch /this is not a link/`).
- Duplicates are skipped by code, not by string — two spellings of the same
  link (with and without a relay, say) count as one peg.
- `relay.connections` on the health endpoint counts one socket per spool, so
  the restart wait uses `≥ 2` for two spools; the T-107 gotcha generalises.
- `pnpm pack` still ships only `keeper.js` + README + LICENSE; version is
  0.2.0, **unreleased** — publishing is an owner-at-keyboard ticket in the
  T-181 mould, after the overnight run.
- **Still open, and the only thing between `doing` and `done`:** the
  owner's overnight run. Suggested shape: a `~/pegboard` file with two or
  three real spools (one keyless, one keyed, so the pocket path is exercised
  too) on a machine that stays on; in the morning, paste the log's shape
  (not its links) and the `ls` of the directory here.
- **The run started, 4 Sep 2026, 03:57 local, on the owner's laptop.**
  `~/pegboard` holds two freshly minted spools on the canonical relay, one
  keyless (`jade-echo-236`) and one keyed (`hidden-echo-280`); the keeper
  runs detached under `caffeinate -i`, logging to `~/pegboard.log`, exports
  beside the list. Two findings before the night even began:
  - *The minted entries were lost, both of them.* The minting script wound
    one entry per spool and `leave()`d before the keeper existed. Keyless:
    expected — no peer, no pocket, that's the gap the keeper closes. Keyed:
    the pocket should have caught it and the keeper's open should have
    applied it, and neither the keeper nor a laptop client opened cold saw
    anything (`before=0`). T-178's shape — `persist: false`, wind, leave
    within seconds. Not chased tonight; filed here as the first real-run
    evidence for T-178.
  - *The keeper doesn't say what the pocket did.* `spool.pocket` reports
    `applied` / `empty` / `unavailable` on open and the keeper logs none of
    it. One log line, counts-only, would have answered the question above
    in the morning. Cheap follow-on; not added mid-run.
  - The keyed spool's socket dropped and reconnected once inside the first
    minute (`offline → connecting → connected`), then held. Watch whether
    that recurs overnight.
  Both spools then took one entry wound from a laptop client, logged
  `1 entries held`, and exported (~790 bytes each) within the debounce.
- **The run, closed 4 Sep 2026, 15:05 local — owner's verdict: "I think
  this worked."** Eleven hours and seven minutes from 03:57, through the
  rest of the night and the whole morning, on the owner's laptop under
  `caffeinate -i`. The owner used both spools from the room client while it
  ran; a fresh cold client at 05:19 converged on the keyless spool in
  317 ms from the keeper alone (no pocket exists for it — the clean proof)
  and on the keyed one in 206 ms (entangled with the pocket on a cold open;
  the test suite is where those two are separated). The morning's shape:

  | | keyless `jade-echo-236` | keyed `hidden-echo-280` |
  |---|---|---|
  | entries held (log) | 3 | 31 |
  | entries in export file | 3 | 31 |
  | export size | 2.1 KB | 23.3 KB |
  | socket drops → reconnects | 21 | 29 |
  | save failures / hiccups / undecryptable | 0 | 0 |

  `ls ~`: `pegboard` (262 B, mode 600), the two `.spool.json` files beside
  it. The log is 191 lines, counts and codes only.
- **Finding: fifty reconnects in eleven hours.** Each spool's socket
  dropped and came back on its own schedule (21 vs 29 — not the network,
  or they'd move together), roughly every 13–20 minutes, always
  `offline → connecting → connected`, never a lost entry. Whether that is
  the canonical relay's proxy closing idle sockets, the relay's own
  ping/pong, or the SDK's resync is not knowable from this log — because
  **the keeper's log has no timestamps** (finding two). Both are cheap
  follow-ons, with the pocket-state line from the night's first note: a
  narration ticket for the keeper — timestamps, `pocket: applied/empty` on
  open, and a reconnect count in a periodic one-liner — would have answered
  every question this run raised without changing what it holds. Not filed
  as a ticket here; the owner picks.
- Nothing about the shape was wrong. Restart-to-reload was never needed in
  eleven hours; the file beside the list was the right default; the key
  ring sentence read true the moment `cat ~/pegboard` showed the keyed link
  with its key on the second line.
- 0.2.0 stays **unreleased** — publishing is its own owner-at-keyboard
  ticket. The keeper is still running as this note is written.
- Open for the owner: whether M17 is the right home or this should sit
  under M15's "before it goes wider" rail instead.
