# Handoff — next session

Written 5 Sep 2026 at the sync-up; rewritten the same evening after T-184, T-169, and the splice brief landed; rewritten again later that night after the three headless items below were done. Paste the block as the opening prompt. Delete or rewrite this file when it's been used.

```
Sync-up context: 5 Sep 2026, late. Everything a headless session could do
is done and committed: T-185's prep (changelogs dated, tarballs eyeballed,
the keeper smoked from its tarball under Node 24), T-165's docs half
(the key-travels sentence in WHITEPAPER §7 and the SDK README), T-176's
two doc items (TESTING.md scenario 8, the off-grid asterisk). Nothing is
left on the board that doesn't need the owner. Do not publish, and do not
implement splice() before the sign-off.

If the owner has signed off T-180 (check its Notes and INDEX), T-186 from
the brief's §8 is the next ticket: draft it from §6 (the sketch) and §9
(acceptance), then build it — splice(records) on Spool, Entry.snapshot(),
SpoolSpliceError, the reel-spike fixture as tests, the three recipes in
SDK-API. If T-185 has shipped, its last task — the note to syrup and
manyhands, drafted verbatim in T-178 — is a session's to send only if the
owner says where.

One lab note from the T-185 smoke, filed in that ticket's Notes and not
yet a ticket: a relay URL without the /yjs path leaves the SDK in
`connecting` forever, silently, while the pocket still works. Owner's
call whether a one-line check or a doc sentence earns a ticket.

Rules as usual: Notes are the lab notebook, and the
claude/spools-reactive-programming-092qjz branch is someone else's live
work — don't touch it. If anything turns up protocol-shaping, stop and
surface it with evidence.
```

## The owner's queue (not for a session)

1. ~~T-184 sign-off~~ — done, option 1, 5 Sep.
2. T-185: prep is done (5 Sep, late). Publish `spools@0.2.1` (now carrying T-184 too) and `spools-keeper@0.2.0` at the keyboard, then send the syrup/manyhands note drafted in T-178. Optional after: a night on the wall with the new build to see the metronome gone.
3. T-180 sign-off: the five decisions in docs/M16-splice-brief.md §5 (the primitive, recipes for fork/rejoin, names, the thread rule, the counter ticket). Then T-186–T-188 get drafted.
4. T-168: the two canonical-relay defaults. "Keep the shipped defaults" closes it.
4. T-165: the address-bar A/B/C decision.
5. Move B, the wall: `apps/` reference client or a vessel repo beside `lore`.
6. Hardware rows (T-125, T-176) and T-143's homepage — `spools.lol` is still a parking page.
