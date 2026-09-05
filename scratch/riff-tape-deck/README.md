# the tape deck — a bench rig for `docs/riffs/tape-deck.md`

One spool, two hands, two packet shapes, one interpreter with a direction
knob. The head lives in your tab, never in the spool: the tape never runs
backward, the head does. Memory-only, relayless; tabs on this machine sync
over a BroadcastChannel the rig owns, which is what makes the plug possible.

## Run it

```
# 1. the bundle (SDK surface + the same yjs instance it uses), from packages/spools
cd packages/spools && corepack pnpm exec tsup --config ../../scratch/riff-tape-deck/tsup.config.ts

# 2. serve the folder (ES modules don't load over file://)
cd ../../scratch/riff-tape-deck && python3 -m http.server 8765

# 3. open http://localhost:8765/ — then click "open this same tape in another tab"
```

`spike.mjs` is the measured half of the riff (`node scratch/riff-tape-deck/spike.mjs`
from the repo root, after `pnpm --filter spools build`). `drive.mjs` replays
the script below in two headless tabs and takes the screenshots.

## The five-minute script

1. **Two hands.** Tab one is a name; the link in the first box opens tab two as
   the other hand. Wind a color in one tab and watch it land in the other.
2. **Unplug one hand.** In tab two, click *plugged in*. The box turns amber:
   whatever you wind now stays on this side. Now, concurrently: tab one winds
   +1 and then green; tab two winds +1 and then pink.
3. **Plug back in.** Both tapes show the same five packets in the same order.
   That is the CRDT keeping its one promise: state that agrees.
4. **Step the head back** (◀ or ←) until it sits between the two colors that
   were wound apart. The two readings disagree on color and agree on count. That is the whole riff §4 in one glance: a set-packet's
   `from` is its writer's memory, not the room's truth; a commuting delta
   reads the same in any order and inverts for free.
5. **Undo mine** soft-deletes your latest packet. Tick *show ghosts* to see it
   struck through; click it to restore. The tape only ever grows — the byte
   count in the first box says so.
6. **Rewind.** Wait a beat for moments to land, drag the slider back, click
   *put it back to here*. Then scrub again: the earlier moment shows the
   packets alive, the latest shows them as ghosts. The walk left footprints.

## What it is not

Not a vessel, not shipped, not on a relay. The bundle is rebuilt from the
workspace, so it tracks whatever the SDK source is that day.
