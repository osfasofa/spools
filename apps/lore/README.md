# lore — the tape

**Folklore is an oral tradition. This is the instrument.** A shared four-track
tape for the stories a group actually keeps: punch your voice in and out, talk
over each other, cut it up, speed it, slow it, pin words to it — then bake it
down to one track and hand it to someone, or pack the whole reel into a file
that opens in 2040. Built on [spools](../../README.md): the reel is a spool;
everyone who holds the link holds the whole thing.

*Design: [DESIGN.md](DESIGN.md) · brief: [docs/vessels/lore.md](../../docs/vessels/lore.md) · torture: [TESTING.md](TESTING.md)*

## What it does

- **Record** — arm a track, hit rec: punch in at the head, punch out when the
  story's told. The other tracks keep playing underneath; that's what makes it
  multitrack. The mic is taken raw (no echo cancellation, no noise
  suppression) — tape character on purpose.
- **The tape trick** — record while the tape runs slow, play it back at speed:
  your voice sits high and quick, exactly like a real 4-track. It's physics
  here, not a filter: a take remembers the speed it was punched at.
- **Transport with feel** — one speed knob (0.5×–2×, pitch locked to speed, a
  detent at 1×), audible scrubbing in both directions, rewind/fast-forward
  that sounds like spooling, a stop that sags instead of cutting.
- **Cut and mend** — cut a take at the head (nothing is copied, nothing is
  destroyed — two windows onto the same sound, the original kept as memory);
  hold a take to lift and move it; every edit is itself an entry.
- **Words on the tape** — sayings pinned to a moment; glosses threaded under
  takes by the people who were there.
- **Two timelines** — the **tape** (where sound sits) and the **telling**
  (when it was told: every punch with its wall-clock stamps, every mend, cut,
  bake, and gloss, in order, forever). Underneath both: **rewind** — scrub the
  reel's own history and *listen to the tape as it was*, before the cut.
- **Bake** — the whole tape rendered to one WAV, offered as a download and
  wound back onto the reel as a `telling` (a bake *is* a retelling, fixed).
- **Pack the reel** — one JSON file carrying the spool **and** the sound;
  unpacking on a bare device brings the whole reel back. No account, no
  server, no company between you and the file.
- **Bring sound in** — pick or drop audio files onto a lane, or **line in**:
  record what's playing in another tab (Chromium desktop). Tapes have always
  taped. There is no downloader and no ripper — lore records what plays and
  stamps where it came from, as testimony.

## How sound is stored (pointers, honestly)

The spool document **never carries audio** — it carries pointers:
`{ sha256, size, mime, dur, url? }`. Bytes live in the device's **reel store**
(IndexedDB, content-addressed by hash). Resolution: local store first, then a
pointer's `url` (fetched and **verified against the hash** — a URL is a
courier, never an authority), else the take renders as a **ghost**: visible,
silent, honest.

So: **the reel syncs; the sound travels by being handed** — a bake, a packed
reel, a link. A relay never holds plaintext audio because a relay never holds
plaintext anything. Future storage stories (a bucket you control, a peer
mesh) are additive resolvers over the same hashes — the doc never changes.

## The kinds this vessel writes (constitution rule 2)

Any other spool client rendering a reel degrades sanely: bodies are human
text, unknown kinds fall back, unknown data fields are ignored.

| kind | meaning | body | data |
|---|---|---|---|
| `take` | sound on the tape | caption | `{ audio, tape: {track, at, offset, dur, gain, rate}, punch?: {in, out, speed}, source?: {type, name?}, origin?: {take}, seat }` |
| `mend` | placement amendment, append-only, newest wins; `parent` = the entry | note | `{ tape, seat }` |
| `saying` | words pinned to a tape moment | the words | `{ tape: {at}, seat }` |
| `gloss` | annotation; `parent` = any entry | the words | `{ seat }` |
| `telling` | a bake — the tape fixed at a moment | liner note | `{ audio, baked: {at, dur, takes}, seat }` |
| `lore:reel` | reel settings, newest-wins | — | `{ title?, epigraph?, seat }` |
| `lore:mix` | shared track mix, newest-wins | — | `{ tracks: [{gain}×4], seat }` |
| `lore:teller` | profile table (room-precedent seats) | — | `{ seat, name }` |

Tape positions are seconds; wall-clock is ms. Four tracks, fixed. `audio.dur`
is source seconds; `tape.rate` is source-seconds per tape-second (the tape
trick lives here: a take punched at speed S carries `rate = 1/S`).

## Run it / deploy it

Pure static files — no build step, no install:

```sh
cd apps/lore && python3 -m http.server 8765   # or any static server
```

Deploy by dropping the folder anywhere static: **Vercel** (project root
`apps/lore`, no build command, output `.`), Netlify, GitHub Pages, a
Raspberry Pi, a USB stick. The subdomain pattern says `lore.spools.lol`.
`vendor/spools.js` is the same IIFE artifact `apps/client` vendors, built by
`packages/spools/tsup.client.config.ts` (one Yjs instance, one file).

Mic capture needs a secure context: `https://`, `localhost`, or `file://`.

## The fine print (shipped in the UI, repeated here)

nobody keeps this but you and the people you hand it to. the reel syncs; the
sound travels by being handed — a bake, a packed reel, a link. anyone with
the link can wind, mend, and name — attribution is testimony, not proof.
lore lives by being retold — hold it with intent, or let it go.

## Where this code lives

Prototyped in the loom by owner direction (room-precedent — see
[DESIGN.md §10](DESIGN.md)). When T-130 ships the npm release, lore graduates
to its own repo consuming `spools` from the registry, and takes its docs with
it. SDK friction found here files back as evidence, per the ecosystem loop.
