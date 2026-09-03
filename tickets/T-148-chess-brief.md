---
id: T-148
title: "correspondence chess riffed → the vessel brief (docs/vessels/chess.md)"
status: done
milestone: M13
depends: [T-144]
---

## Goal

Build-order slot #3 gets the lore treatment: chess by post revived on the
protocol, riffed until the philosophy is load-bearing, landed as a brief.

## Context

Fourth M13 session (Aug 2026). The riff's spine: chess is humanity's
oldest running proof that a shared ruleset needs no referee at intimate
scale — touch-move is a norm, not cryptography — so a vessel keeping the
rules purely by convention, on a protocol that refuses to pretend it
could enforce them, is §1's "trust, not proof" argued by demonstration.
Mechanical fits: a move is the platonic immutable `data` entry (T-030
exercised); deterministic entry order settles simultaneity; the pocket is
the postal system (the founding midnight story in its oldest clothes);
replay walks the entry list itself (never dependent on moment
granularity — recorded so nobody designs replay against `rewind` and
inherits its debounce); analysis `line`s hang off moves by `parent`;
kibitz is room-compatible `message`. And the growth budget finally meets
a vessel it cannot touch (~80 moves ≈ tens of KB).

## Tasks

- [x] docs/vessels/chess.md — claim, mechanism map, kinds
      (`move`/`offer`/`line`/`message` + `game:*` settings incl. players/
      result/cadence-as-courtesy), roles-as-conventions (spectator = full
      write capability, stated plainly), register (a wooden board, not a
      casino), refusals (no engine in the loop, no matchmaking, no clocks
      with teeth, no ratings), what it proves, open threads (name
      candidates: postcard / by-post; genus question; legality-checking
      lean: validate client-side).
- [x] ECOSYSTEM.md — row + build-order link the brief; row prose
      corrected ("never offers an illegal move, renders a rogue one
      visibly" — the earlier "refuses to render" overstated).

## Acceptance criteria

- The brief stands alone on SPEC v1.1 as-is; nothing is asked of SDK,
  relay, or spec; the one heavy dependency (a chess-rules library) is
  explicitly client-side freight.

## Notes / open questions

- "One game, one spool" independently rediscovers familiar's per-errand
  hygiene — the same capability-scoping instinct arriving from a third
  direction. Pattern worth watching; not yet gate evidence for anything.
- The no-engine refusal is the vessel's identity: refusing discovery is
  what makes refusing anti-cheat coherent.
