# the tape deck — a bench rig for `docs/riffs/tape-deck.md`

Two hands on one page, one tape between them, two packet shapes, one
interpreter with a direction knob. Each hand's head lives on the page, never
in the spool: the tape never runs backward, the head does. Each hand is its
own copy of the spool (relayless, memory-only) and the plug in the header is
the rig's whole transport — which is what makes unplugging possible.

## Run it

```
# 1. the bundle (SDK surface + the same yjs instance it uses), from packages/spools
cd packages/spools && corepack pnpm exec tsup --config ../../scratch/riff-tape-deck/tsup.config.ts

# 2. serve the folder (ES modules don't load over file://)
cd ../../scratch/riff-tape-deck && python3 -m http.server 8765

# 3. open http://localhost:8765/
```

Or fold it into one file that opens from a double-click, no server:

```
cd packages/spools && corepack pnpm exec tsup --config ../../scratch/riff-tape-deck/tsup.global.config.ts
node ../../scratch/riff-tape-deck/build-single.mjs      # → scratch/riff-tape-deck/tape-deck.html
```

`spike.mjs` is the measured half of the riff (`node scratch/riff-tape-deck/spike.mjs`
from the repo root, after `pnpm --filter spools build`). `drive.mjs` replays the
script below headless and screenshots each beat (see its header for the env vars).

## The five-minute script

1. **Two hands.** The page opens with two packets already on the tape, one
   from each hand. Wind a color on one hand and watch it land on the other.
2. **Unplug.** Click *plugged in*. The boxes turn amber: from here each hand
   keeps its own worldview. On each hand, wind +1 and then a color — you can
   see both worldviews side by side.
3. **Plug back in.** Both tapes show the same packets in the same order.
   That is the CRDT keeping its one promise: state that agrees.
4. **Step a head back** (◀) until it sits between the two colors that were
   wound apart. The two readings disagree on color and agree on count. That
   is the whole riff §4 in one glance: a set-packet's `from` is its writer's
   memory, not the room's truth; a commuting delta reads the same in any
   order and inverts for free.
5. **Undo mine** soft-deletes that hand's latest packet. Tick *ghosts* to
   see it struck through; click it to restore. The tape only ever grows —
   the byte count in each hand's header says so.
6. **Rewind.** Wait a beat for moments to land, drag a hand's slider back,
   click *put it back to here*. Then scrub again: the earlier moment shows
   the packets alive, the latest shows them as ghosts. The walk left
   footprints — and the other hand converges on the rolled-back view.

## What it is not

Not a vessel, not shipped, not on a relay. The bundle is rebuilt from the
workspace, so it tracks whatever the SDK source is that day.
