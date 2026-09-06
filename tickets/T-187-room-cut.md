---
id: T-187
title: "Room: the cut — start a new reel from here; the tape counter; full is a cut, not a wall"
status: done
milestone: M16
depends: [T-186]
---

## Goal

In the room, a person points at an entry and cuts: a new keyed reel opens
on the same relay with everything from there on, in order, replies-to-the-
cut flattened and said so; the old reel is untouched and still opens; the
new reel's `rewind()` starts at the cut. A second device cold-opens the new
link from the pocket and sees the same reel. (Brief §9.1.)

## Context

T-180's decisions 4 and 5 (DESIGN_DOC §5 "The splice family"): the thread
rule is **flatten**, stated on the button ("replies to what you cut become
plain entries"); the seam is **by entry**, never by time (the reel spike's
`createdAt` ties); identity is preserved, no knob. T-164's "start a new
room" is the whole cut already shipped — this ticket gives it a from-here
gesture and a reel to splice onto. The reel riff (`docs/riffs/the-reel.md`
§4, §7) supplies the counter and the reserved length kind.

## Tasks

- [x] The cut: an entry's menu gains "start a new reel from here" —
      select by the SDK's own order from that entry on, flatten parents not
      in the selection, `newSpool` on the old link's relay, `splice`, wind
      the sealed `home` link into the new reel; the button's sentence carries
      the flatten rule and "the new reel has no past".
- [x] `next` on the old reel: sealed by default if the first real cut wants
      it (the brief left this to the first cut — decide here, note it).
- [x] The tape counter: bytes and entries against the link's relay's
      advertised `pocket.maxBytes` (from its health JSON; never a constant);
      "full is a cut, not a wall" near the T-104 warning line.
- [x] The reserved reel-length kind (advisory, newest-wins, like the room
      name): the maker's soft length inside the relay's hard cap; the counter
      reads it when present.
- [x] Smoke scenarios for each; the two-device cold-open of the new reel.
- [ ] The mixtape: the same cut if it wants one (apps copy prose). *(Left open — see Notes.)*

## Acceptance criteria

- Brief §9.1 and §9.2, in the room, in the smoke suite.

## Notes / open questions

- **Built, 5 Sep 2026, the same night as T-186.** `apps/room/src/reel.ts`
  holds the room's convention over the SDK's one primitive: `selectCut()`
  (the seam by entry in the SDK's own order; every `room:*` entry carries
  regardless of position because names, the room name, and the reel length
  are newest-wins settings, not conversation; `room:home` never carries; a
  message whose parent stayed behind is **flattened**, a reaction or edit
  marker whose parent stayed behind is **dropped** — alone it is noise);
  `fetchRelayCap()` (the link's relay's health JSON → `pocket.maxBytes`,
  never a constant; `null` when not advertised); `reelLength()` (newest
  `room:reel` wins, an empty body clears); the sentences. The gesture: a
  message's action sheet → "✂ start a new reel from here" → a confirm line
  carrying the sentence (*replies to what you cut become plain entries;
  hidden messages stay behind; the new reel has no past — rewind starts
  here; the old reel stays whole on every device that keeps it*) plus the
  key-travels sentence → **cut**: the link is minted and copied inside the
  tap (T-164's Safari lesson), then the reel is opened *in this page* with
  persistence, spliced, given its `room:home`, and left — the database
  stays, `leave()` deposits to the pocket — and the fragment change opens
  it as any room. Arrival: "a new reel: N messages came along, M replies
  became plain entries; rewind starts here. your old room is still on this
  device. the new link is copied…". Settings gained "the reel": bytes of
  cap · messages of custom, a bar, the cap sentence, "cut from <code>", the
  reel-length input with its advisory, and *full is a cut, not a wall*
  wherever the too-big line shows.
- **Decisions taken here, on the record.** (1) **No `next` on the old
  reel.** The cut writes nothing to the old spool — "the old reel stays
  whole" is then literally true — and neither sealing works: `next` sealed
  under the new key is unreadable to the old reel's people, and sealed
  under the old key it hands the new key to exactly the person the cut may
  be leaving out. A `next` can come back when a vessel wants a chain that
  isn't about leaving someone. (2) **`room:home` carries the code and the
  relay, never the key** — the pointer must not hand the key, and the old
  reel's people already hold it; sealing it (the brief's "sealed by
  default") would add nothing but a crypto helper the SDK deliberately
  doesn't export (per-entry provenance helpers are parked). The one thing
  a new-only member learns is the old room's *code*, which the relay
  already treats as public (T-169). (3) **The reel length is in messages**,
  not bytes — the human unit — and the bar reads whichever fraction is
  larger, the custom or the physics. (4) **Bytes are the document's own
  update size** (`encodeStateAsUpdate(spool.doc)`, the size every transport
  pays), measured on a 2 s debounce because a 5 000-message room costs
  milliseconds to encode; the room declares `yjs` for that one call, and
  pnpm resolves it to the SDK's copy (checked: one store path).
- **One deviation from T-164's note** ("no second Spool ever lives in this
  page"): a second one lives for about a second during the cut, and is
  left before navigation. The alternative — stash the records for the next
  page to splice — would put a whole reel through `sessionStorage`.
- **Smoke 22–24** (`scratch/spike-room/room-smoke.mjs`; `ONLY=22,23,24`
  runs just those): the cut end to end with a cold peer from the pocket;
  the counter against the local relay's advertised 8 MiB and the custom
  set by a named seat, over at one past, cleared newest-wins; a relay
  spawned with `POCKET_MAX_BYTES=1500` — the counter reads 1.5 KB, the bar
  goes over, and the too-big line offers the cut ~10 s in (the deposit
  debounce). Fixture lessons: entries wound in one millisecond sort by id,
  so the fixture puts a beat between winds; a `blur()` on an unfocused
  input fires nothing, so the harness types with real keystrokes and
  Enter, like the composer. Build green (tsc + vite); the full suite
  24/24, exit 0 (apps/room/TESTING.md, results 5 Sep 2026). Not deployed —
  the gh-pages build is the owner's word, as always.
- **Left open:** the mixtape's cut — it has no threads, so its cut is
  T-164-shaped; it copies the prose when it wants one. Brief §9.1 in the
  room is met headless; the two-*device* run is the owner's hardware row.
