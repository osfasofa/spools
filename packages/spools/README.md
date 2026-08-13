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
```

- **Encrypted end-to-end.** The key rides in the link's URL fragment (never sent to servers); the relay forwards ciphertext it cannot read — and that's tested, not asserted.
- **No discovery, no accounts, no feed.** The only way into a spool is a link handed to you by a person. That remaining friction is the point.
- **Built on [Yjs](https://docs.yjs.dev)** — stock sync protocol, every Yjs editor binding works. The protocol is small enough to read: [SPEC.md](https://github.com/osfasofa/spools/blob/main/SPEC.md).
- **Bring your own relay** with [`spools-relay`](https://www.npmjs.com/package/spools-relay) (`npx spools-relay`) — or use the default. Honesty clause: a relay is a rendezvous point that sees IPs and room codes, never content.

**Status: 0.0.x** — young but real: the full surface above works and is tested (multi-writer convergence, encrypted transport, history, export round-trips). API may still shift before 1.0.

MIT · <https://github.com/osfasofa/spools>
