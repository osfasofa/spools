# Handoff — next session

Written 5 Sep 2026 at the sync-up; rewritten as things landed through the night. The block below is the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 5–6 Sep 2026. Shipped: spools@0.2.1 and
spools-keeper@0.2.0 (T-185); T-180 signed off as recommended; T-186 built
(splice, snapshot, SpoolSpliceError, 13 tests, the recipes, CHANGELOG
0.3.0 unreleased); T-187 built (the room's cut, the tape counter, the
reel length, "full is a cut" — smoke 24/24). Nothing new is published or
deployed: the SDK 0.3.0 publish and the room's gh-pages build are the
owner's.

Next for a session: T-188 (tickets/T-188-splice-docs.md) — re-read
DESIGN_DOC §2 (splice, reel, cut) and §5 "The splice family" against what
T-186 and T-187 actually shipped and fix wording, never intent; SPEC.md
gets at most one non-normative sentence about carried identity, only if
the build found it wanted (T-186's notes say nothing did); a one-line
pointer in docs/spools-of-spools.md and the two riffs; WHITEPAPER §7's
"spools grow and don't slim down" gains the cut as the graceful ending.
T-187's Notes list the decisions the docs should reflect: no `next` on
the old reel, room:home carries code + relay and never the key, the reel
length is in messages, bytes are the document's own update size.

Still the owner's: publish spools@0.3.0 when a client needs it (the room
uses the workspace SDK); deploy the room; T-168's two defaults; T-165's
address-bar call; T-175, T-177, T-179, T-167 and the homepage; the
hardware rows. Lab note waiting on the owner: a relay URL without /yjs
leaves the SDK in `connecting` forever, silently (T-185 Notes).

Rules as usual: Notes are the lab notebook, and the
claude/spools-reactive-programming-092qjz branch is someone else's live
work — don't touch it. If anything turns up protocol-shaping, stop and
surface it with evidence.
```

## The owner's queue (not for a session)

1. ~~T-184 sign-off~~ — done, option 1, 5 Sep.
2. ~~T-185~~ — shipped 5 Sep, late; syrup upgraded itself, manyhands told. Publish `spools@0.2.1` (now carrying T-184 too) and `spools-keeper@0.2.0` at the keyboard, then send the syrup/manyhands note drafted in T-178. Optional after: a night on the wall with the new build to see the metronome gone.
3. ~~T-180 sign-off~~ — done 5 Sep, all five as recommended; T-186 built the same night. Was: the five decisions in docs/M16-splice-brief.md §5 (the primitive, recipes for fork/rejoin, names, the thread rule, the counter ticket). Then T-186–T-188 get drafted.
4. T-168: the two canonical-relay defaults. "Keep the shipped defaults" closes it.
4. T-165: the address-bar A/B/C decision.
5. Move B, the wall: `apps/` reference client or a vessel repo beside `lore`.
6. Hardware rows (T-125, T-176) and T-143's homepage — `spools.lol` is still a parking page.
