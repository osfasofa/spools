# correspondence chess — the vessel brief

*Riff → brief, from the M13 brainstorm (fourth session, Aug 2026). Build-order slot #3. Working name **correspondence chess**; the vessel repo owns its final name (candidates in §7). Chess first, deliberately — the genus is correspondence games, and chess is its type specimen. Everything below runs on SPEC v1.1 as-is.*

## 1. The claim

Chess by post is older than every platform that currently hosts chess. Moves traveled on postcards for a century and a half — small, patient, surviving wars and censors — between two people who trusted each other to keep the rules without a referee. Then the internet made chess instant, account-gated, rating-tracked, anti-cheat-scanned: strangers' chess. Good at what it does; not this.

**correspondence chess** is the postcard, revived: one game, one spool, two people, moves over days. No accounts, no server that knows the position, no clock but courtesy. Wind a move at breakfast; your opponent collects it at midnight from the pocket. The finished game is a file you keep.

And it carries the project's cleanest philosophical demo. Chess is humanity's oldest running proof that **a shared ruleset needs no enforcement at intimate scale** — touch-move is a norm, not cryptography, and it has held for centuries between people who know each other. A vessel where the rules are kept entirely by convention, on a protocol that refuses to pretend it could enforce them, is §1's *trust, not proof* argued by demonstration.

## 2. Why Spool fits — mechanism by mechanism

- **A move is the perfect immutable entry.** `kind: 'move'`, with SAN, the resulting FEN, and the ply number in `data` — written once at wind time, never edited. This is the T-030 structured-`data` verdict exercised exactly as decided: whole-value LWW is honest for facts stamped at creation, and a chess move is the platonic such fact. First vessel where **the body is nothing and the `data` is everything.**
- **Deterministic order settles simultaneity.** The entry sort (createdAt, id tie-break) is identical on every peer — the multiwriter tests' core invariant. If both players somehow wind at once, every device agrees on what happened, and the client renders the situation honestly instead of forking realities.
- **Turn-taking is convention without permission — and that's the demo.** The client never *offers* you a move out of turn; nothing *stops* a rogue client from winding one; and if one appears, it sits visibly in the record as an impossible move, exactly like the room renders what it cannot bless. The rules of chess are kept the way they were kept on postcards: by the two people playing.
- **The pocket is the postal system.** Move in the morning; opponent asleep; deposit sealed; collected at midnight. Correspondence is the pocket's founding story wearing its oldest clothes. Slow games outlive the 60-day courtesy window without drama — both players hold complete copies, and refresh-if-stale re-covers the spool every time either of them so much as looks at the board.
- **Replay is the entry list itself.** Every move is an entry, so stepping through the game is walking `entries` in order — no machinery needed. (`rewind` remains the time machine for the *conversation around* the game — the kibitzing as it stood at move 20 — but replay never depends on moment granularity.)
- **The threading does analysis.** `kind: 'line'` with `parent` = a move: post-mortem variations hang off the exact move they question, the way analysis has always been written in the margins. Kibitz rides as plain `message` — which means the room client can already spectate a game legibly today: moves as labeled fallback lines, trash talk rendered natively.
- **Finally, a vessel the growth budget cannot touch.** A long game is ~80 moves × a few hundred bytes — the 8 MiB ceiling is four orders of magnitude away. The measured numbers exist so vessels know when they matter; this one gets to say *they don't, here*.

## 3. The shape (conventions; the vessel repo owns the final word)

| kind | what it is |
|---|---|
| `move` | SAN + FEN + ply in `data`; body empty. The game is the sequence of these. |
| `offer` | Draw offer, resignation, rematch proposal — the act in `data`; accept/decline by reply (`parent`). |
| `line` | Analysis variation, `parent` = the move it examines. The margins. |
| `message` | Kibitz and trash talk — room-compatible on purpose. |
| `game:*` | Reserved settings, newest-wins: `game:players` (the two player seats), `game:result`, `game:cadence` ("about a move a day" — an expectation, never a clock). |

Seats and profiles carry over from the room verbatim. **Roles are conventions too:** `game:players` names the two playing seats; the client offers the board to those seats and the kibitz composer to everyone else. Spectating = being handed the link — which is *full write capability*, stated plainly per the house rule; a spectator who moves is a rulebreaker made visible, not an intruder made impossible. One game, one spool (the familiar's per-errand hygiene, independently rediscovered); a rematch is a fresh spool, and whether it carries a `relic` pointing at the old game is the vessel's call.

## 4. The register

A wooden board, not a casino. Quiet, patient, tactile; the move is the message. Notation rendered beautifully (SAN is prose to chess players); the cadence line — "about a move a day" — displayed as a courtesy, never a countdown. No ratings, no streaks, no puzzles, no engine bar hovering over the position judging both of you.

## 5. What it must refuse

- **No engine in the loop.** No evaluation bar, no move hints, no "accuracy" post-mortems. Engines are why online chess needs anti-cheat; this vessel's whole thesis is the social contract, and it refuses to import the arms race. (Players can consult books and engines by their own agreement — correspondence chess always allowed the library. That's between the two of them, where it belongs.)
- **No matchmaking.** There is no lobby of strangers; there is a friend and a link. Refusing discovery *is* refusing anti-cheat's necessity.
- **No clocks with teeth.** `game:cadence` is an expectation; nothing forfeits anyone. The mail was never on a shot clock.
- No ratings, no history mining, no "your opponent has seen your move" (receipts stay ephemeral, here as everywhere).

## 6. What it proves for the constellation

- Views-are-skins, proof #3 — the same entries render as a board, a move list, or fallback lines in the room, and the mixtape/list/chat trio gains a genuinely alien sibling.
- The all-`data` vessel — first client where entries have no bodies at all, exercising T-030's verdict downstream.
- Conventions-without-permissions at its purest, with five centuries of prior art as the argument.
- The pocket's correspondence rhythm as the *primary* transport experience rather than a safety net.

## 7. Open riff threads (parked here, decided in the vessel repo)

- The name. Working name **correspondence chess**; candidates riffed: **postcard** (the true lineage, and the sentence test sings — *"a game by postcard"*), **by-post**, **kibitz** (risks naming the app after the spectators). Owner picks.
- The genus beyond chess: go, checkers, and word games fit the same `move`/`game:*` shape — whether the vessel stays chess-only or becomes *postcard, the correspondence game client* with chess as its first board (lean: chess-only until finished; genus later, if ever).
- Legality checking depth: full move validation client-side (a chess library is a heavy friend for a small vessel) vs. FEN-trusting with visible impossibility (lean: validate — a chess client that can't tell legal from not is discourteous to the game, and the library rides the client, never the protocol).
- Whether `move` entries should also carry a tiny human note field in `data` ("sorry this took a week — new baby") or whether that's what `message` is for (lean: that's what `message` is for).
