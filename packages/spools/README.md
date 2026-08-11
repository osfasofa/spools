# spools

> An artifact that can change, that's passed around.

The SDK for **Spool** — intimate, local-first, peer-to-peer shared documents. Two (or a few) people share a living thing — a mixtape, a chat, a list — with no central server that ever sees their content.

**Status: pre-release name claim.** The API is under active construction; nothing here is stable yet. Watch the repo: <https://github.com/osfasofa/spools>

```js
// the shape of what's coming
import { newSpool, openSpool } from 'spools'

const spool = await newSpool()
spool.wind({ kind: 'track', body: '...' })
spool.share() // → a link you hand to someone
```
