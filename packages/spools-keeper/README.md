# spools-keeper

A headless always-on peer for a [spool](https://github.com/osfasofa/spools).
Run it on hardware you control — a Raspberry Pi, a NAS, the cheapest VPS —
and your spool is answered even when everyone's laptops are shut.

```sh
npx spools-keeper '#spool=amber-cassette-042&relay=wss%3A%2F%2F…&k=…'
```

(Quote the link — it contains `&`.) That's the whole setup for one spool.

For the handful you actually care about, put the links in a file, one per
line, and hand the keeper the file:

```sh
npx spools-keeper --links ~/pegboard
```

A line starting with `# ` (hash, space) is a comment; a bare `#spool=…` is
a link. Blank lines and duplicates are ignored; a line that isn't a link is
logged by line number and skipped, and the rest stay kept. To hang a new
spool on the wall or take one down, edit the file and restart the keeper —
shutdown saves and leaves every spool cleanly, so a restart costs nothing.

## What it is

A **client**. To every other peer it's just a member who never sleeps: it
answers sync requests the way any spool client must (peers are each other's
server), so someone opening the link at midnight converges from the keeper
even though the person who wound the entries is long offline.

It holds the key because you handed it the link — and the link *is* the key
exchange. Nothing about the protocol, the relay, or the spec changes because
a keeper exists; it was a conformant client before it was written.

A keeper holding a list holds every key on it. That is the same sentence at
a larger size, and it's worth saying plainly: the machine running your
pegboard is your key ring. Whoever walks out the door with it — or with
the links file, or with the export files beside it — has everything on the
wall, exactly as if you'd handed them each link yourself. Run it on
hardware you'd trust with the links, because that's what you're doing.

If this family of software has an animal, it's this one. The keeper is the
hippo: asleep in the river, surfacing to breathe without waking, holding
the reels for everyone whose device is asleep.

## Why you'd run one instead of (or beside) the pocket

- **Keyless spools.** The relay's pocket is keyed-only — ciphertext or
  nothing. A plaintext spool's async story is the keeper.
- **Trust.** With a keeper, not even ciphertext sits on someone else's disk.
  Your data, your always-on device, full stop.
- **No TTL.** A pocket is a courtesy window; a keeper holds as long as you
  run it.

## Durability

The keeper keeps each spool in memory and exports it to a file, debounced on
idle — the same portable format `spool.export()` produces, readable by hand
and re-importable anywhere. On start it restores from that file and lets the
room fill in the rest. `kill -9` loses at most a couple of seconds of
debounce; the peers still hold everything, and the next sync heals it.

Where the files go: with one link, `./<code>.spool.json` (`--file <path>` to
choose). With `--links`, one `<code>.spool.json` per spool *beside the links
file* (`--dir <path>` to choose) — so listing that directory is the
inventory of the wall.

One gap to know about (T-178): the keeper is a memory-only client
(`persist: false`), so the SDK's deposit-if-ahead heal has nothing local to
work from — a final pocket deposit the relay refuses at shutdown (the SDK
names it `depositError: 'rate-limited'`) stays out of the pocket until a
peer syncs or the keeper restarts from its file, which lands before the
pocket check settles and re-deposits what the file holds.

## What it logs

Every line carries an ISO UTC timestamp. Then, per spool: connection state,
entry counts, the spool code, and the key's short fingerprint; for a keyed
spool, what the pocket did on open (`pocket: applied (2 deposits)`,
`pocket: empty`, `pocket: unavailable`) and any deposit the relay refuses;
for a socket that drops and comes back, which reconnect it was and how long
it was down (`relay: connected — reconnect #7 after 3.2 s offline`). Every
ten minutes, one line for the whole wall says it's still up:

```
2026-09-05T03:12:00.412Z [keeper] up 11h07m · jade-echo-236 3 held, 21 reconnects · hidden-echo-280 31 held, 29 reconnects
```

Never content, never the key, never the full link — and with `--links`,
never a line of the file; a bad line is reported by number.

---

Node ≥ 22 — the keeper rides Node's native `WebSocket` (the SDK uses the
global when no polyfill is handed in), so no transport dependency ships.
The relay's `>=18` doesn't apply here; that's a deliberate divergence.
