# Handoff — next session

Written 5 Sep 2026 at the sync-up; rewritten as things landed through the night of the 5th–6th. The block below is the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 6 Sep 2026. M16 is complete: T-180 signed off, T-186
(splice in the SDK), T-187 (the cut in the room, the tape counter, the
reel length, "full is a cut"), T-188 (docs; SPEC gained one non-normative
sentence). T-185 shipped spools@0.2.1 and spools-keeper@0.2.0. Nothing
newer is published or deployed: spools@0.3.0 (splice) waits for a client
that needs it from the registry, and the room's gh-pages build is the
owner's word.

Later on the 6th: T-165 closed on option C (the bar drops k= once the
stash holds the link; smoke 25/25), and T-168's defaults were decided —
creation cap 60 on, first-deposit cap off — with one keyboard step left
(the owner sets the Railway variable; the command is in T-168's Notes).

Nothing on the board is unblocked for a headless session. Every open row
is the owner's: publish 0.3.0 when wanted; deploy the room and the
mixtape (both carry T-165 now); T-168's Railway step; T-175, T-177,
T-179; T-167 and the homepage (T-143, T-174); the hardware rows (T-125,
T-176, the room's H1–H6, the two-device run of the cut). One lab note waiting on the owner: a
relay URL without /yjs leaves the SDK in `connecting` forever, silently
(T-185 Notes) — a one-line check or a doc sentence, owner's call.

If a vessel repo asks for the cut, the recipe is docs/SDK-API.md under
"splice()"; the room's conventions (reel length in messages, room:home
without the key, no `next`) are T-187's Notes, prose to copy.

Rules as usual: Notes are the lab notebook, and the
claude/spools-reactive-programming-092qjz branch is someone else's live
work — don't touch it. If anything turns up protocol-shaping, stop and
surface it with evidence.
```

## The owner's queue (not for a session)

1. ~~T-184 sign-off~~ — done, option 1, 5 Sep.
2. ~~T-185~~ — shipped 5 Sep, late; syrup upgraded itself, manyhands told. Publish `spools@0.2.1` (now carrying T-184 too) and `spools-keeper@0.2.0` at the keyboard, then send the syrup/manyhands note drafted in T-178. Optional after: a night on the wall with the new build to see the metronome gone.
3. ~~T-180 sign-off~~ — done 5 Sep, all five as recommended; T-186 built the same night. Was: the five decisions in docs/M16-splice-brief.md §5 (the primitive, recipes for fork/rejoin, names, the thread rule, the counter ticket). Then T-186–T-188 get drafted.
4. T-168: decided 6 Sep (creation cap 60 on, first-deposit cap off). Left: `railway variables --set POCKET_NEW_NAMESPACES_PER_HOUR=60` + `railway redeploy --json` from packages/spools-relay, then note it in the ticket and close it.
4. ~~T-165~~ — option C, shipped 6 Sep.
5. Move B, the wall: `apps/` reference client or a vessel repo beside `lore`.
6. Hardware rows (T-125, T-176) and T-143's homepage — `spools.lol` is still a parking page.
