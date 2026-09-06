# Handoff — next session

Written 5 Sep 2026 at the sync-up; `main` at 3b61dea. Paste the block below
as the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 5 Sep 2026. T-184 (the lone-peer socket) was signed off
and landed the same day; T-185 (the release that carries it, plus keeper
0.2.0) waits on the owner — do not publish anything. Two things are
unblocked and need nobody:

1. T-169, the room-full notice (room lane). The relay and SDK halves are
   done; the room has zero references to spool.roomFull or on('full').
   Set T-169 to doing (frontmatter + INDEX), then: subscribe once to
   on('full') in the room's spool hook, render a visible "room full" line
   from the spool.roomFull getter (the ticket's Notes warn about flicker —
   read them first), retire the two stale sentences that still describe
   the old spin (packages/spools-relay/README.md ~188-189, WHITEPAPER.md
   ~131), and script the 65-connection acceptance run against a local
   relay with RELAY_CONNS_PER_IP_PER_ROOM set. Redeploy the room with
   scratch/deploy-room.sh when green. Mark done in both places.

2. T-180 task 2, the splice brief. Write docs/M16-splice-brief.md from
   the six evidence sources the ticket lists (spools-of-spools, syrup's
   HANDOFF, lore's brief, the reel riff, the tape-deck riff, familiar).
   Model it on docs/M10-async-brief.md: what each operator costs, what it
   bakes in, what stays flexible; the owner decides after, so the brief
   ends in options with a lean, not a decision. Preserved-vs-fresh ids,
   the thread rule, provenance, and cut-by-entry are the questions the
   riffs left for it. Tick task 2 in T-180; leave it todo — the sign-off
   is the owner's.

Rules as usual: one ticket at a time, Notes are the lab notebook, commit
per ticket, and the claude/spools-reactive-programming-092qjz branch is
someone else's live work — don't touch it. If either task turns up
something protocol-shaping, stop and surface it with evidence.
```

## The owner's queue (not for a session)

1. ~~T-184 sign-off~~ — done, option 1, 5 Sep.
2. T-185: publish `spools@0.2.1` (now carrying T-184 too) and `spools-keeper@0.2.0` at the keyboard, then send the syrup/manyhands note drafted in T-178. Optional after: a night on the wall with the new build to see the metronome gone.
3. T-168: the two canonical-relay defaults. "Keep the shipped defaults" closes it.
4. T-165: the address-bar A/B/C decision.
5. Move B, the wall: `apps/` reference client or a vessel repo beside `lore`.
6. Hardware rows (T-125, T-176) and T-143's homepage — `spools.lol` is still a parking page.
