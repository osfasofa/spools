# lore — the tape (vessel design doc)

*The vessel's own design record, August 2026. Child of [docs/vessels/lore.md](../../docs/vessels/lore.md) (the brief) after the owner's second redirect — the vocal turn. The brief said "the vessel repo owns its final name and design"; this is that design, prototyped in the loom (see §10 on where this code lives). Everything below runs on SPEC v1.1 as-is: nothing here asks the protocol for anything, and the one rule this app leans on hardest — an asset never lives in the doc — was banked in DESIGN_DOC §6 before this app existed.*

---

## 1. The vocal turn

The brief framed lore as told stories — and then the owner said the quiet part: folklore is an **oral** tradition. Before writing, lore was a voice. So lore v1 leads with the told-aloud version of itself: not a text corpus with an audio feature, but **a tape** — a shared multitrack reel that a few people wind their voices onto, punch in and punch out of, talk over, cut up, and bake down into a keepsake track.

Voice memos are where family stories go to be forgotten one phone at a time. A tape you *share* — that syncs between the people who were there, that remembers every punch and cut, that can be played back as it was at any moment of its life — is a folklore instrument. The register stays the brief's: campfire, not database. Here: **tape, not DAW**.

The sentence test, vocal edition: *"Wind a take onto the reel. Hand someone the lore."*

## 2. The reel (what a lore spool is)

One spool = one **reel**: a four-track tape plus its own telling of how it was made. The spool's entries carry two things at once — *where sound sits on the tape* and *when it was told* — which resolves the owner's "two timelines" instinct precisely (§5).

Four tracks, fixed. A real 4-track's constraint is the right amount of instrument: enough for voice + voice + texture + music, few enough to fit a phone screen and a human head. Track count is an app constant, not schema — a future client could render more; this one refuses to.

Tape positions and durations are **seconds (float)** in entry data; wall-clock is **ms** (`createdAt`, punch stamps), matching the SDK. The reel has no fixed length — it ends where the last sound ends; the counter just keeps counting.

## 3. Kinds and schema (the brief's vocabulary, spoken aloud)

The brief's kinds carry over with their meanings intact — this app just gives some of them a sound. Per the vessel constitution, these conventions are documented here and in the README so any other client degrades sanely (bodies stay human-readable text; unknown kinds fall back).

| kind | what it is | body (human text) | `data` (machine fields, written once at wind) |
|---|---|---|---|
| `take` | Sound wound onto the tape — recorded, imported, or captured. | optional caption/transcript | `{ audio, tape, punch?, source?, origin? }` |
| `mend` | An amendment to a take or saying's placement — move, trim, gain. Append-only; newest wins at render. `parent` = the entry it mends. | optional note ("tightened the intro") | `{ tape }` (full replacement placement block) |
| `saying` | Freestanding words pinned to a tape moment — a title card, a liner note, the phrase itself. | the text (the point) | `{ tape: { at } }` |
| `gloss` | Annotation by someone who was there — context, correction, dispute. `parent` = any entry. No tape position of its own; it hangs off what it glosses. | the annotation | — |
| `telling` | **A bake.** The whole tape mixed down and fixed — a retelling of the reel at a moment, pointer to the rendered audio. | optional liner note | `{ audio, baked: { at, dur, takes } }` |
| `tale` | Reserved from the brief for longform written lore on the reel; not rendered specially in v1 (unknown-kind fallback). | the story | — |
| `lore:reel` | Reserved settings — reel title, epigraph. Newest-wins at render (the `room:*` pattern verbatim). | — | `{ title?, epigraph? }` |
| `lore:teller` | The profile table — display names keyed by seat, anyone can name anyone, retroactively. The room's convention, renamed. | — | `{ seat, name }` |
| `lore:mix` | Shared track mix — per-track gain (and later pan). Newest-wins whole-value. | — | `{ tracks: [{ gain }, …] }` |

The blocks:

```
audio:  { sha256, size, mime, dur, sr?, ch?, url? }     // the pointer — never bytes (§6 asset rule)
tape:   { track, at, offset, dur, gain?, rate? }        // placement: track 0–3, tape-seconds; offset/dur select
                                                        // a window of the source; rate = source-rate multiplier
punch:  { in, out, speed }                              // wall-clock ms punch-in/out + the tape speed it was
                                                        // recorded against — the told-time record of the gesture
source: { type: 'mic' | 'file' | 'line', name? }        // provenance, as testimony
origin: { take }                                        // for takes born of a cut: the parent take's id
```

**Why `mend` instead of editing `data` in place:** entry `data` is whole-value LWW, written once by convention — and the room milestone measured what sustained rewriting does to history (quadratic delete-set growth; DESIGN_DOC §5, T-110). Placement edits are frequent, so they take the sanctioned shape: **append-only newest-wins amendment entries**, the same idiom as profiles and room names. A take's effective placement = its wind-time `tape` block overridden by its newest surviving `mend`. Every nudge is therefore *itself told* — it lands in the log, it rewinds, it syncs, and a naive client ignores it harmlessly. The edit history the owner wanted isn't a feature bolted on; it's the storage model.

**Cut is two winds and a tombstone.** Cutting a take at the playhead soft-deletes it and winds two takes pointing at the *same* `audio` blob with adjacent `offset`/`dur` windows and `origin: { take }`. No audio is copied, nothing is destroyed — the tombstone stays in memory and `rewind`, and restore un-cuts. (UI verb: **cut**. The word `splice` stays reserved to the loom, untouched; a cut here is an app gesture, not a protocol verb.)

## 4. The two timelines

The owner asked for "a timeline that plays through like a tape, but also a timeline that keeps track of the edits." lore has exactly these, and they were both already in the machine:

- **The tape** — *tape-time*. Takes and sayings arranged on four tracks; the playhead runs through them; this is the instrument. Rendered from live entries (winds + mends applied, tombstones hidden).
- **The telling** — *told-time*. The same entries ordered by `createdAt`: every punch (with its wall-clock in/out stamps), every mend, every cut, every bake, every gloss — who did what to the tape, in the order it happened, forever. This is the log view, and it is not editable because it is not a *thing* — it's the reel's own history, made of the entries themselves.
- **And underneath both: `rewind`.** The SDK's memory moments let the reel be reconstructed as it was at any recorded moment — and because takes are pointers, a rewound reel still *plays* (any blob this device holds, plays; the rest render as ghosts). Scrub back a week and listen to the tape before the cut. Memory you can audition. No other recorder has this, and it costs this app nothing — the SDK already keeps it.

## 5. Audio pointers and the reel store (the storage system)

The doc never carries sound. It carries **pointers**: content-addressed, transport-agnostic.

- **Identity is the hash.** `audio.sha256` (hex of the encoded bytes) names the sound forever, independent of where bytes live. Dedup falls out (an imported file re-imported is one blob); cut takes share their parent's blob by construction.
- **The reel store** is the device's blob home: IndexedDB, one database (`lore-blobs`), rows keyed by sha256 holding `{ bytes, mime, size, dur, addedAt }`. Beside it, a peaks cache (waveform min/max buckets) so reopening a reel doesn't re-crunch audio.
- **Resolution order**, per pointer: (1) the reel store; (2) `audio.url`, if the pointer carries one — fetched, hashed, **verified against `sha256`**, then adopted into the store (a URL is a courier, never an authority); (3) nothing → the take renders as a **ghost**: visible, silent, honest ("a take you don't hold yet").
- **What syncs and what doesn't, said plainly:** the reel (entries, placements, history) syncs like any spool — live, encrypted, pocketed. **Sound travels by being handed**, like everything else in this project: a baked telling, a packed reel file (§7), or a URL somebody chose to put in a pointer. A relay never holds plaintext audio because a relay never holds plaintext anything.
- **The future storage story is additive by construction** (this is why the §6 asset rule was banked): a BYO bucket is just `url` on the pointer; a P2P blob mesh is just another resolver in front of the ghost; nothing about the doc changes either way. v1 ships resolvers (1)–(3) and the honesty sentence; buckets and mesh stay parked until a real reel demands them.

Local storage is asked to persist (`navigator.storage.persist()`) and usage is shown in the app — voice at opus rates is ~15 MB/hour, said out loud in the UI rather than discovered at eviction time.

## 6. The engine (Web Audio, boring on purpose)

*Informed by a full read of the owner's tape-vibes experiment (OP-1-inspired 4-track). What it proved out: the one-pole speed slew, tape-honest mic constraints, the WAV writer, peak bucketing, the visual language. What it warned against, adopted as refusals here: the flat 254 MB tape-in-worklet model, audio-thread peak scans, hardcoded sample rates, mouse-only input, an export path that doesn't match monitoring.*

- **Model:** takes are clips; the tape is a projection of entries. Decoded `AudioBuffer`s live in a main-thread cache keyed by sha256; the graph is `source → takeGain → trackGain[0–3] → master → destination`. No AudioWorklet in v1 — nothing v1 does needs one, and classic-script simplicity wins (§8).
- **Scheduling is just-in-time:** each frame, takes whose tape-window falls within the next ~200 ms are started at the precise context time; passed sources are stopped; seek = stop all, restart at the playhead. No long pre-schedules to un-do.
- **Varispeed is one number with physics.** A target speed (0.5×–2×, detented at 1×) chased by an exponential one-pole: sources glide via `playbackRate.setTargetAtTime(τ ≈ 80 ms)`, and the playhead integrates the *same* one-pole analytically, so what you hear and where the head says it is cannot drift apart. Stop is the same mechanism with target 0 and a longer τ — the tape-stop sag for free. Speed and pitch are locked; there is no time-stretch. That's not a missing feature, that's the medium.
- **The tape trick falls out.** Recording is real-time regardless of tape speed, so a take punched in at speed *S* is placed spanning `dur·S` tape-seconds with `rate = 1/S` — play the tape at *S* and the voice sits exactly as spoken; play at 1× and it's the half-speed chorus / double-speed chipmunk every 4-track kid discovered. Physics, not a feature flag. (The speed knob locks while recording; changing it mid-punch would need calculus nobody asked for.)
- **Scrub is audible or it isn't scrubbing.** Dragging the tape plays short grains (~40–60 ms) from under the head at a rate proportional to drag velocity — both directions (reverse grains via lazily-reversed buffer copies, cached small). Rewind/FF are the same primitive at a held ±8× — you hear the spooling, like you're supposed to.
- **Record:** `getUserMedia` with `echoCancellation/noiseSuppression/autoGainControl` all **false** (tape character; the one tape-vibes decision adopted verbatim), captured through `MediaRecorder` (opus where available, AAC on Safari), decoded at punch-out for waveform + duration. Punch-in stamps the playhead and wall-clock; other tracks keep playing — that's what makes it multitrack. Known v1 asterisk, stated not hidden: capture start latency (~tens of ms) lands in the take's placement; a `mend` nudges it if it bothers anyone.
- **Bake = the same tape, offline.** The identical scheduling code runs against an `OfflineAudioContext` at unity speed — mixdown matches monitoring *by construction* (the tape-vibes export bug, inverted into a design rule). Output: 16-bit stereo WAV, offered as a visible download **and** wound back as a `telling` whose blob enters the reel store — the bake is both the keepsake and an entry in the lore.

## 7. Ceremonies (arrive, hand, keep)

- **Arrival:** the room's beat, in this register — three quiet mono lines, then the reel. First-run asks for a name only when you first do something worth signing.
- **Handing the reel:** `share()` — the link is the key, same honest sentence as everywhere in this project. New here: the receiver gets the reel's *story* instantly and its *sound* as it's handed to them (bakes and packs), and the UI says exactly that instead of pretending blobs teleport.
- **Pack the reel:** the keepsake with the audio in it — one JSON file: `{ format: 'lore-reel', version: 1, spool: <spool export>, blobs: { sha256: { mime, b64 } } }`. The spool half is the SDK's own export (readable + lossless); the blobs half carries the sound. Import = `importSpool` + adopt blobs. Big and honest about it (size shown before writing). A packed reel opens in 2040 with no relay, no server, no company.
- **Bake** is the lighter gesture: one WAV anyone can play anywhere, no lore required.

## 8. Shape of the code (no build step, deliberately)

Pure static files: `index.html` + classic scripts + `vendor/spools.js` (the same IIFE vendor bundle pattern as `apps/client`, built by `tsup.client.config.ts` — one Yjs instance, one file). No bundler, no framework, no npm install. It deploys by dropping the folder on Vercel/Pages/a USB stick, which is precisely the deliverable asked for — and it keeps the vessel honest about the loom's own claim that the client layer can be this simple. (`file://` note: mic, Web Audio, and IndexedDB all work from `file://` in Chromium — secure-context rules treat it as trustworthy; the sync relay needs the network it always needed.)

Modules-in-all-but-name: each script owns a namespace (`LoreStore`, `LoreEngine`, `LoreTape`, …), state flows through one tiny store, render is diff-driven off `spool.on('entry')` with the naive-client guarantee (rerender from `spool.entries`) as the fallback that can't drift.

## 9. The look (field-unit spools)

The room's token system carries over verbatim — 8 custom properties + radius, skins change tokens never layout — with a lore-native default skin: **field** (near-black `#0A0A0A`, TE-orange accent `#FF6A2B` — already the second color of the house seat palette). The room's blackout/terminal/daylight/paper remain as alternates. Track colors are the seat palette's first four (orange, green, blue, pink) at machine dimness.

Hardware honesty, software humility: chunky physical controls (LED'd REC, travel on press), one big knob (speed), mono type for machine-ish things (counters, hashes, punch stamps), lowercase everywhere, generous silence. Waveforms drawn the cheap right way (bucketed peaks, mirrored closed path, DPR-correct, off the audio thread). Mobile first: Pointer Events with capture everywhere (no mouse-only anything), 44 px targets, `100dvh`, safe-area insets, ≥16 px inputs. The machine should feel like a well-made object that happens to be a web page — Teenage Engineering is the register: play as seriousness.

The honesty sentence, shipped in the UI:

> *"nobody keeps this but you and the people you hand it to. the reel syncs; the sound travels by being handed — a bake, a packed reel, a link. lore lives by being retold — hold it with intent, or let it go."*

## 10. Where this code lives (the gate, honored out loud)

The ecosystem plan gates vessel *repos* on T-130 (npm-only consumption; the first `npm i spools` in anger is a milestone reserved for the release). The owner directed lore to be built **now, in this workspace, on a branch** — so lore is prototyped in the loom exactly the way the room was: `apps/lore`, workspace SDK, house ticket culture (M14, T-150…T-160). Recorded here so it's a decision, not a drift: **when T-130 ships, lore graduates to `osfasofa/lore` consuming `spools` from npm, taking this document, its README, and its TESTING.md with it** — and the loom keeps a pointer, not an app. Anything lore teaches the SDK files back as evidence through the parked-with-evidence gate, same as any stranger.

## 11. Refusals (the brief's, plus the tape's own)

Everything the white paper refuses, everything the brief refuses (no wiki-ness), and:

- **No DAW-ness.** No grid, no snap, no quantize, no plugin rack, no project settings. Four tracks, a knob, a blade. When in doubt, fewer controls.
- **No time-stretch, no pitch-correction.** Speed is pitch. The tape is the tape.
- **No YouTube ripper.** lore won't strip-mine platforms — no server to do it with, and it's not the culture. The honest underground move ships instead: **line-in** (capture a tab / system audio via `getDisplayMedia`, where the platform allows) — record what's *playing*, the way tapes always did, provenance stamped as testimony (`source: 'line'`).
- **No cloud bucket by default.** The pointer schema admits URLs; lore ships no uploader and signs no deals. Bytes move person-to-person until a real reel demands more, and then the answer still starts with the hash.
- **No lo-fi cosplay by default.** The medium's physics (speed/pitch, punch seams, honest silence) — yes. Wow/flutter/saturation as a mandatory aesthetic filter — no. (A subtle, optional tape-color toggle may earn its way in later; parked.)
- **No editable history.** The telling appends. Tombstones and mends are memory, not mess to sweep.

## 12. What v1 proves (for the constellation)

- The §6 asset rule worn in anger: a media-heavy app whose doc stays feather-light (pointers + text), pocket-friendly, 8 MiB ceiling never threatened.
- The append-only amendment idiom (`mend`) as the mutable-state answer for high-frequency edits — the measured alternative to body-rewrite, exercised harder than profiles ever did.
- `rewind` with *playable* history — the scrubber as an audition, the strongest demo of the memory feature any client has produced.
- Views-are-skins at app scale: tape and telling are two renders of one entry set.
- A second app-convention set (`lore:*`, seats, mends) built without touching SPEC — the M11 thesis, replicated.
- The keepsake economy with weight to it: bakes and packed reels are files people will actually keep.

## 13. Open threads (parked, owner's call when they're real)

- **Blob hand-off between live peers** — the mesh already moves doc bytes; a side protocol for reel-store blobs (offer/accept over awareness or data channels) would make "the sound arrives when you're both here" true. Wants a design pass against the two-transport crypto rules; not v1.
- **Bucket courier** — a "put this reel's audio somewhere I control" flow writing `url`s into pointers (mend-shaped amendment? new pointer kind?). Evidence-gated.
- **Reverse *playback*** (not just scrub/rewind) as a transport mode; reversed-buffer cache makes it cheap; restraint makes it later.
- **Track names / per-take pan**; **seasonal reels** (the brief's seasons lean) — export the year's tape, start the winter reel; **side-by-side tellings** (two bakes A/B'd — the folklorist's dream, audio edition).
- **Latency-calibrated punch** (measured output→input round trip, auto-nudge takes) if the v1 asterisk bothers real use.

---

*Working doc, vessel-owned. Revise when the tape teaches us something.*
