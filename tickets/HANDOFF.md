# Handoff — next session

Written 5 Sep 2026 at the sync-up; rewritten the same evening after T-184, T-169, and the splice brief landed. Paste the block below
as the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 5 Sep 2026. T-184 (the lone-peer socket), T-169 (the
room-full line), and T-180's brief (docs/M16-splice-brief.md) all landed
the same day. The big items wait on the owner — T-185 (the publish),
T-180's sign-off, T-168's two defaults, T-165's address-bar call. Do not
publish, and do not implement splice() before the sign-off.

Three small things are unblocked and need nobody. Take them in order,
one ticket at a time, commit per ticket:

1. T-185 prep (the ticket's first task): date the two CHANGELOG headings
   (spools 0.2.1, spools-keeper 0.2.0), run `pnpm pack` dry-runs in both
   packages and eyeball the tarballs (the keeper's dependency should read
   "spools": "^0.2.1"), and do the fresh-dir tarball smoke from the
   ticket — a keeper from its tarball holding two spools with timestamped
   lines under Node 24. Tick the task, leave the ticket todo; the publish
   is the owner's.

2. T-165's docs half: the key-travels sentence (the one the room already
   shows — see KEY_TRAVELS in apps/room/src/App.tsx) into WHITEPAPER §7
   and the SDK README's honesty bullet. Leave the address-bar A/B/C
   decision and the §5 row alone; those are the owner's. Ticket stays
   doing.

3. T-176's two doc items: a LAN row in apps/client/TESTING.md (two
   devices on one Wi-Fi, a relay on the laptop, plain http — the
   secure-context landmines the ticket's Notes list) and the asterisk in
   docs/vessels/off-grid.md where it says plain ws:// on a LAN is fine.
   The hardware run stays the owner's; ticket stays doing.

If the owner has signed off T-180 (check its Notes and INDEX) before you
get here, T-186 from the brief's §8 outranks all three: draft it from §6
(the sketch) and §9 (acceptance), then build it — splice(records) on
Spool, Entry.snapshot(), SpoolSpliceError, the reel-spike fixture as
tests, the three recipes in SDK-API.

Rules as usual: Notes are the lab notebook, and the
claude/spools-reactive-programming-092qjz branch is someone else's live
work — don't touch it. If anything turns up protocol-shaping, stop and
surface it with evidence.
```

## The owner's queue (not for a session)

1. ~~T-184 sign-off~~ — done, option 1, 5 Sep.
2. T-185: publish `spools@0.2.1` (now carrying T-184 too) and `spools-keeper@0.2.0` at the keyboard, then send the syrup/manyhands note drafted in T-178. Optional after: a night on the wall with the new build to see the metronome gone.
3. T-180 sign-off: the five decisions in docs/M16-splice-brief.md §5 (the primitive, recipes for fork/rejoin, names, the thread rule, the counter ticket). Then T-186–T-188 get drafted.
4. T-168: the two canonical-relay defaults. "Keep the shipped defaults" closes it.
4. T-165: the address-bar A/B/C decision.
5. Move B, the wall: `apps/` reference client or a vessel repo beside `lore`.
6. Hardware rows (T-125, T-176) and T-143's homepage — `spools.lol` is still a parking page.
