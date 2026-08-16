# lore — torture checklist

The house tradition travels (constitution rule 4). Rows marked ✅ were run in
this workspace with scripted Chromium (fake mic/display, isolated browser
contexts as "devices", a local `spools-relay`); rows marked **[hardware]**
need real phones, real mics, and the owner's hands — they stay unchecked
until that pass reports. Test drivers referenced live in the session scratch;
re-runnable with any Playwright + `python3 -m http.server` + `PORT=9876 node
packages/spools-relay/server.js`.

## The reel (single device)

- [x] Fresh open mints a reel; the link lands in the URL bar; refresh reopens the same reel with takes, words, mix, and title intact. ✅
- [x] Record: punch in on the armed track, talk, punch out → a `take` with pointer + placement + wall-clock punch stamps; end-anchored (capture latency shortens the head, never smears the tail). ✅
- [x] Two takes on two tracks play mixed and aligned from any seek point; playhead tracks the wall clock with exactly the one-pole's constant lag, no accumulating drift. ✅
- [x] The doc stays feather-light: export with two recorded takes ≈ 3 KB while audio sits in the reel store — no audio bytes in the doc, ever. ✅
- [x] Varispeed glides without restarts or zipper; detent returns exactly 1×; stop sags; scrub is audible both directions; rew/ff spool audibly at ±8×; clamped at zero. ✅
- [x] Cut at head → two takes sharing one blob, exact seam windows, original tombstoned (restorable), caption carried. ✅
- [x] Hold-lift-drag moves a take (lane + time) as one append-only `mend`; the original wind stays legible underneath. ✅
- [x] Words: sayings pin at the head and render as flags; glosses thread under takes/sayings via the sheet. ✅
- [x] Import: picker lands at head on the armed track with provenance; drop places by lane/time; multi-file stacks head-to-tail; non-audio fails with a sentence. ✅
- [x] Bake: offline render matches placements exactly (RMS in the windows, silence in the gaps), ghosts stay out and are counted; WAV downloads; `telling` wound; deterministic bakes dedup by hash. ✅
- [x] Pack → wipe (fresh context) → unpack: takes, words, tellings, history, and sound return whole; blob keys are hash-verified on the way in. ✅
- [x] The telling narrates told-time: punches with stamps, mends, cuts ("born of a cut"), unwinds struck through, day dividers, seat-colored tellers. ✅
- [x] Memory: rewind to before the cut shows — and **plays** — the uncut take; transport chrome hides; writes refuse with a sentence; back-to-now returns the present untouched. ✅

## The campfire (multi-device)

- [x] Device B opens the handed link cold on a local relay: reel arrives live (`connected` both ends), takes render as honest ghosts (∅, silent), words arrive whole. ✅
- [x] B glosses; A hears it within ~2 s. Both ways, sealed frames, dumb relay. ✅
- [x] The naive reference client (`apps/client`) opens the same reel: `take`/`saying` degrade to kind chips + body text + data JSON — the forward-compatibility rule, watched live. ✅
- [ ] Mend races: two devices move the same take while partitioned; on reunion all peers agree (newest-wins converges — multiwriter is SDK-tested; the app-level race wants a live two-device pass). **[hardware]**
- [ ] Midnight row: A winds and closes; B opens hours later with nobody else on — the pocket delivers the doc; ghosts say what's missing. *(The pocket path was exercised by accident in this workspace when the proxy ate websockets — B received the reel over HTTP deposits alone. A deliberate row still belongs to hardware.)* **[hardware]**
- [ ] Offline/reunion: airplane-mode a device, wind takes, reconnect, watch both heal. **[hardware]**

## Phones (real hardware, owner at keyboard)

- [ ] iOS Safari: mic permission flow, AAC capture path, punch while monitoring through the speaker, idb persistence across app-switch. **[hardware]**
- [ ] Android Chrome: the same, opus path. **[hardware]**
- [ ] Touch feel: knob drag, tape scrub, hold-lift-drag on a 390 px screen with a thumb, 44 px targets honest. **[hardware]**
- [ ] 60 fps on a mid phone while rolling with 8+ takes visible. **[hardware]**
- [ ] Line-in on desktop Chromium: share a tab with audio, tape what plays, provenance stamped `line`. *(punch path ran headless under the fake display UI; the real gesture needs a human.)* **[hardware]**
- [ ] VoiceOver/TalkBack over the transport (labels are wired; the walkthrough is owed). **[hardware]**

## Environment notes from this workspace

- This container's egress proxy refuses WebSocket CONNECT: the canonical
  relay is unreachable from here and even `ws://localhost` dies unless
  Chromium runs `--no-proxy-server`. Not an app property — recorded so the
  next session doesn't chase it.
- A test-link footgun worth remembering: the relay URL in a link carries its
  **path** (`…/yjs`). Rewriting a link to a bare host aims the SDK at the
  signaling endpoint and everything sits at `connecting` forever.
