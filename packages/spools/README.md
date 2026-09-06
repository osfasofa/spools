# spools

> An artifact that can change, that's passed around.

The SDK for **Spool** — intimate, local-first, peer-to-peer shared documents. Two (or a few) people share a living thing — a mixtape, a chat, a list — with no central server that ever sees their content. Each person holds their own complete copy: it syncs live when you're online together, reconciles when you reconnect, and persists on your device forever even if you never sync again.

```js
import { newSpool, openSpool } from 'spools'

const spool = await newSpool()               // fresh, encrypted by default
spool.wind({ kind: 'note', body: 'made you a thing' })
const link = spool.share()                    // hand this to someone —
                                              // the link IS the key exchange

// on their side
const same = await openSpool(link)
same.on('entry', () => render(same.entries))

spool.rewind(ts)    // the spool as it was — read-only time travel
spool.export()      // a portable JSON file, readable in 2040, yours forever
spool.splice(recs)  // carry entries into a new spool as themselves — the cut
```

- **Encrypted end-to-end.** The key rides in the link's URL fragment (never sent to servers); the relay forwards ciphertext it cannot read — and that's tested, not asserted.
- **No discovery, no accounts, no feed.** The only way into a spool is a link handed to you by a person. That remaining friction is the point.
- **Built on [Yjs](https://docs.yjs.dev)** — stock sync protocol, every Yjs editor binding works. The protocol is small enough to read: [SPEC.md](https://github.com/osfasofa/spools/blob/main/SPEC.md).
- **Bring your own relay** with [`spools-relay`](https://www.npmjs.com/package/spools-relay) (`npx spools-relay`) — or use the default. Honesty clause: a relay is a rendezvous point that sees IPs and room codes, never content. "Never sent to servers" means *ours* — the key still travels wherever the link does: your browser may sync this address to its maker; send the link over something end-to-end encrypted, or in person.

**Status: 0.2.0** — young but real: the full surface above works and is tested (multi-writer convergence, encrypted transport, history, export round-trips). Pre-1.0 semantics, stated plainly: **minor bumps may break the API** (`0.1 → 0.2` is the breaking lane), patches are fixes and docs only — pin `^0.2.0` plus a lockfile and upgrade deliberately. The [SPEC](https://github.com/osfasofa/spools/blob/main/SPEC.md) is the stable thing; spools on different SDK versions interoperate. The surface documented in [SDK-API.md](https://github.com/osfasofa/spools/blob/main/docs/SDK-API.md) is the contract — everything else this package exports is scaffolding and may move in any 0.x.

`yjs` and `y-protocols` are peer dependencies, so your app and the SDK always share one Yjs instance (this matters if you bind an editor). npm ≥ 7 and pnpm install peers automatically — `npm i spools` stays the whole setup.

MIT · <https://github.com/osfasofa/spools>
