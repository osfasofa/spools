# Handoff — next session

Written 5 Sep 2026 at the sync-up; rewritten three times that day as things landed. The block below is the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 5 Sep 2026, late. Shipped tonight: spools@0.2.1 and
spools-keeper@0.2.0 (T-185, closed); T-180 signed off as recommended;
T-186 built — splice(records), Entry.snapshot(), SpoolSpliceError, 13
tests, the three recipes in SDK-API, CHANGELOG 0.3.0 unreleased (not
published — the publish is the owner's, RELEASING's "npm would lie"
trigger isn't met until a client needs it).

Next for a session, room lane: T-187 (tickets/T-187-room-cut.md) — the
cut in the room ("start a new reel from here"), the tape counter reading
the link's relay's pocket.maxBytes, "full is a cut, not a wall", the
reserved reel-length kind, sealed home/next. The recipe to copy is in
docs/SDK-API.md under "splice()"; the decisions are DESIGN_DOC §5 "The
splice family" (flatten, by entry, identity preserved). Use the workspace
SDK (the room already does). Smoke scenarios for each piece; the two-
device cold-open of the new reel. One open call inside T-187: whether the
old reel gets a sealed `next` pointer — decide from the first real cut
and note it.

T-188 (docs, SPEC's one non-normative sentence if wanted) goes last,
after T-187.

Still the owner's: T-168's two defaults, T-165's address-bar call, T-175,
T-177, T-179, T-167 and the homepage, the hardware rows. One lab note
waiting on the owner: a relay URL without /yjs leaves the SDK in
`connecting` forever, silently (T-185 Notes).

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
