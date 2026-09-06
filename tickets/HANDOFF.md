# Handoff — next session

Written 5 Sep 2026 at the sync-up; `main` at 3b61dea. Paste the block below
as the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 5 Sep 2026. T-184 (the lone-peer socket), T-169 (the
room-full line), and T-180's brief (docs/M16-splice-brief.md) all landed
the same day. Everything left on the board waits on the owner: T-185 (the
publish), T-180's sign-off, T-168's two defaults, T-165's address-bar
call. Do not publish, and do not implement splice() before the sign-off.

If the owner has signed off T-180 (check its Notes and INDEX), the next
code ticket is T-186 from the brief's §8: draft it from §6 (the sketch)
and §9 (acceptance), then build it — splice(records) on Spool,
Entry.snapshot(), SpoolSpliceError, the reel-spike fixture as tests, the
three recipes in SDK-API. Otherwise there is nothing code-shaped to pick
up; say so and stop.

Rules as usual: one ticket at a time, Notes are the lab notebook, commit
per ticket, and the claude/spools-reactive-programming-092qjz branch is
someone else's live work — don't touch it. If anything turns up
protocol-shaping, stop and surface it with evidence.
```

## The owner's queue (not for a session)

1. ~~T-184 sign-off~~ — done, option 1, 5 Sep.
2. T-185: publish `spools@0.2.1` (now carrying T-184 too) and `spools-keeper@0.2.0` at the keyboard, then send the syrup/manyhands note drafted in T-178. Optional after: a night on the wall with the new build to see the metronome gone.
3. T-180 sign-off: the five decisions in docs/M16-splice-brief.md §5 (the primitive, recipes for fork/rejoin, names, the thread rule, the counter ticket). Then T-186–T-188 get drafted.
4. T-168: the two canonical-relay defaults. "Keep the shipped defaults" closes it.
4. T-165: the address-bar A/B/C decision.
5. Move B, the wall: `apps/` reference client or a vessel repo beside `lore`.
6. Hardware rows (T-125, T-176) and T-143's homepage — `spools.lol` is still a parking page.
