---
id: T-175
title: "STUN honesty: the WebRTC path asks Google and Twilio for your address — sign-off"
status: todo
milestone: M15
depends: []
---
## Goal

Either the honesty clause names every host a room open contacts, or the room
stops contacting hosts the clause doesn't name.

## Context

`engine.ts` constructs `WebrtcProvider` without `peerOpts`, so simple-peer's
defaults apply: `stun:stun.l.google.com:19302` and
`stun:global.stun.twilio.com:3478` — confirmed in the room's live y-webrtc
chunk (3 Sep 2026). Every keyed room opened in a browser sends STUN binding
requests (the visitor's address and timing) to Google and Twilio. Nothing in
SPEC §4's honesty clause, the relay README, or the fine print says so. There
is no TURN server, so strict NATs already fall back to the websocket relay,
which is the reliable path by design. Review finding F17.

## Options (owner decides — it touches the transport story)

- **A. Keep the defaults and say so.** One sentence: *"a WebRTC attempt asks a
  STUN server — Google's by default — for your public address."*
- **B. No STUN (`iceServers: []`).** WebRTC then connects only on the same
  network (LAN, off-grid — where it matters most and needs no STUN); internet
  peers always use the relay. Measure the latency cost with the T-111 harness
  before deciding it's acceptable.
- **C. Run our own STUN** (coturn beside the relay; UDP — check the host
  supports it; Fly does).
- **D. Expose `iceServers` in `NewSpoolOptions`/`SpoolEngineOptions`,** room
  defaults to B, vessels choose. Plus A's sentence for whoever keeps STUN.

Recommendation: D. SPEC §3's "WebRTC is the low-latency bonus" stays true
under every option.

## Tasks

- [ ] Measure: internet sync latency with and without RTC (T-111 harness).
- [ ] SDK option; room default; README + fine print sentence.
- [ ] SPEC §4 honesty clause addition (**sign-off**).

## Acceptance criteria

- A keyed room open contacts only the page origin and the link's relay — or
  the honesty clause names every other host, in the room and in the SPEC.
