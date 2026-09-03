# spools-keeper

A headless always-on peer for a [spool](https://github.com/osfasofa/spools).
Run it on hardware you control — a Raspberry Pi, a NAS, the cheapest VPS —
and your spool is answered even when everyone's laptops are shut.

```sh
npx spools-keeper '#spool=amber-cassette-042&relay=wss%3A%2F%2F…&k=…'
```

(Quote the link — it contains `&`.) That's the whole setup.

## What it is

A **client**. To every other peer it's just a member who never sleeps: it
answers sync requests the way any spool client must (peers are each other's
server), so someone opening the link at midnight converges from the keeper
even though the person who wound the entries is long offline.

It holds the key because you handed it the link — and the link *is* the key
exchange. Nothing about the protocol, the relay, or the spec changes because
a keeper exists; it was a conformant client before it was written.

## Why you'd run one instead of (or beside) the pocket

- **Keyless spools.** The relay's pocket is keyed-only — ciphertext or
  nothing. A plaintext spool's async story is the keeper.
- **Trust.** With a keeper, not even ciphertext sits on someone else's disk.
  Your data, your always-on device, full stop.
- **No TTL.** A pocket is a courtesy window; a keeper holds as long as you
  run it.

## Durability

The keeper keeps the spool in memory and exports it to a file
(`./<code>.spool.json` by default, `--file <path>` to choose), debounced on
idle — the same portable format `spool.export()` produces, readable by hand
and re-importable anywhere. On start it restores from that file and lets the
room fill in the rest. `kill -9` loses at most a couple of seconds of
debounce; the peers still hold everything, and the next sync heals it.

One gap to know about (T-178): the keeper is a memory-only client
(`persist: false`), so the SDK's deposit-if-ahead heal has nothing local to
work from — a final pocket deposit the relay refuses at shutdown (the SDK
names it `depositError: 'rate-limited'`) stays out of the pocket until a
peer syncs or the keeper restarts from its file, which lands before the
pocket check settles and re-deposits what the file holds.

## What it logs

Connection state, entry counts, the spool code, and the key's short
fingerprint. Never content, never the key, never the full link.

---

Node ≥ 22 — the keeper rides Node's native `WebSocket` (the SDK uses the
global when no polyfill is handed in), so no transport dependency ships.
The relay's `>=18` doesn't apply here; that's a deliberate divergence.
