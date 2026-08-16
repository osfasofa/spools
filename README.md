# Spool

> An artifact that can change, that's passed around.

Spool is a small protocol, SDK, relay, and reference client for intimate, local-first, peer-to-peer shared documents. Two (or a few) people share a living thing — a mixtape, a chat, a list — with no central server that ever sees their content. Each person holds their own complete copy; copies sync live when people are online together, reconcile when they reconnect, and persist locally forever. Encrypted spools also survive the gap between you: the relay keeps a few **sealed copies in its pocket** — ciphertext it cannot read, under names it cannot guess — so the mixtape is there when your friend opens the link while you're asleep. The only way in is a link handed to you by a person.

**Start here:** [WHITEPAPER.md](WHITEPAPER.md) — the whole story: what this is, what it refuses, and what it can become.

## This repo

| Path | What |
|---|---|
| [`packages/spools`](packages/spools) | The SDK — `openSpool`, `wind`, `rewind`. The actual product. |
| [`packages/spools-relay`](packages/spools-relay) | The relay — a dumb byte broadcaster + the pocket. Never reads your content. |
| [`packages/spools-keeper`](packages/spools-keeper) | A headless always-on peer — your hardware, your key, nobody's server. |
| [`apps/client`](apps/client) | The reference client — pure static files, no build step. |
| [`apps/mixtape`](apps/mixtape) | The mixtape client — the nice one (Vite + React, on the SDK). |
| [`apps/room`](apps/room) | The room — a Messenger-class group chat, live at [chat.spools.lol](https://chat.spools.lol/) (also [osfasofa.github.io/spools/room](https://osfasofa.github.io/spools/room/)). Runs entirely on **SPEC v1.1 as-is**: seats, nicknames, reactions, replies, presence, and read markers are all app conventions — the protocol never moved. |

## Where things are decided

- [`SPEC.md`](SPEC.md) — the protocol, v1.1. The *what*; written last, from working code.
- [`DESIGN_DOC.md`](DESIGN_DOC.md) — philosophy, architecture, vocabulary, decisions log. The *why*.
- [`docs/SDK-API.md`](docs/SDK-API.md) — the SDK surface being built toward.
- [`tickets/INDEX.md`](tickets/INDEX.md) — the working roadmap.
- [`docs/ECOSYSTEM.md`](docs/ECOSYSTEM.md) — how apps get built: vessels in their own repos, on the published packages.
- [`docs/RELEASING.md`](docs/RELEASING.md) — what versions mean; releases happen when npm would otherwise lie.

## Develop

```sh
pnpm install
pnpm -r test
pnpm -r build
```
