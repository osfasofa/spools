# Spool

> An artifact that can change, that's passed around.

Spool is a small protocol, SDK, relay, and reference client for intimate, local-first, peer-to-peer shared documents. Two (or a few) people share a living thing — a mixtape, a chat, a list — with no central server that ever sees their content. Each person holds their own complete copy; copies sync live when people are online together, reconcile when they reconnect, and persist locally forever. The only way in is a link handed to you by a person.

## This repo

| Path | What |
|---|---|
| [`packages/spools`](packages/spools) | The SDK — `openSpool`, `wind`, `rewind`. The actual product. |
| [`packages/spools-relay`](packages/spools-relay) | The relay — a dumb byte broadcaster. Never parses a frame. |
| [`apps/client`](apps/client) | The reference client — pure static files, no build step. |

## Where things are decided

- [`DESIGN_DOC.md`](DESIGN_DOC.md) — philosophy, architecture, vocabulary, decisions log.
- [`docs/SDK-API.md`](docs/SDK-API.md) — the SDK surface being built toward.
- [`tickets/INDEX.md`](tickets/INDEX.md) — the working roadmap.

## Develop

```sh
pnpm install
pnpm -r test
pnpm -r build
```
